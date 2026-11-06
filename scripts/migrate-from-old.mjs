/**
 * One-off import from the old platform into this one.
 *
 *   npm run migrate:old                # dry run: reads both projects, writes nothing
 *   npm run migrate:old -- --apply     # writes
 *
 * Copies course content (courses, modules, PDF materials, quizzes), student
 * accounts with their existing passwords, purchases, module progress and
 * certificates. The old project is only ever read.
 *
 * **Re-runnable, and that is the point.** The old app stays live until cutover,
 * so this is run once to test and again at the switch. Every row keeps its old
 * uuid, so a second run finds what the first one wrote and only inserts what is
 * new or updates what changed. A dry run after an apply should report
 * everything as unchanged — that is the verification.
 *
 * What it deliberately does not do:
 *   - delete anything in the new project, even if it was deleted in the old one;
 *   - migrate the old admin account (the new project has its own admin);
 *   - migrate course duration, ratings, or storage objects no row references;
 *   - send anything. No notification row is written and creating a user with
 *     `email_confirm: true` sends no email.
 *
 * Env (.env.local):
 *   OLD_SUPABASE_DB_URL              old project URL (https://<ref>.supabase.co)
 *   OLD_SUPABASE_SERVICE_ROLE_KEY    old service-role key — reads tables and storage
 *   OLD_SUPABASE_CONNECTION_STRING   old Postgres, session pooler — only for password
 *                                    hashes, which no API returns
 *   NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY   the new project
 *
 * Without a working connection string the dry run still runs and warns; an
 * apply refuses unless `--without-passwords` is passed, in which case every
 * student has to reset their password.
 */
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const APPLY = process.argv.includes('--apply');
const WITHOUT_PASSWORDS = process.argv.includes('--without-passwords');

/** For the summary lines; declared up here because the top-level run below uses it. */
const PAST = {
  create: 'created',
  insert: 'inserted',
  update: 'updated',
  mark: 'marked',
  copy: 'copied',
};

const OLD_URL = required('OLD_SUPABASE_DB_URL').replace(/\/$/, '');
const OLD_KEY = required('OLD_SUPABASE_SERVICE_ROLE_KEY');
const OLD_HEADERS = { apikey: OLD_KEY, Authorization: `Bearer ${OLD_KEY}` };

const supabase = createClient(
  required('NEXT_PUBLIC_SUPABASE_URL'),
  required('SUPABASE_SERVICE_ROLE_KEY'),
  { auth: { autoRefreshToken: false, persistSession: false } },
);

/* -------------------------------------------------------------------------- */
/* Decisions about the old data                                                */
/* -------------------------------------------------------------------------- */

/** Old purchase statuses → ours. Anything else aborts the run. */
const PURCHASE_STATUS = { pending: 'requested', approved: 'approved', rejected: 'denied' };

/** Two old quizzes have no pass mark; the rest of the catalogue uses 70%. */
const DEFAULT_PASSING_SCORE = 70;

/** Old free-text course tags become categories; this fixes a typo in one. */
const CATEGORY_NAME_FIXES = {
  'Pisanje poslobnih/biznis planova': 'Pisanje poslovnih/biznis planova',
};

/** Old upload names lost a diacritic as `_`; these restore the readable name. */
const FILE_NAME_FIXES = { 'po etni': 'početni' };

/** Bucket names differ between the two projects (underscore vs hyphen). */
const OLD_BUCKET = { thumbnails: 'course_thumbnails', files: 'module_files' };
const NEW_BUCKET = { thumbnails: 'course-thumbnails', files: 'module-files' };

/** Mirrors the bucket limits in migration 0036, so a bad file fails here, early. */
const LIMITS = {
  thumbnails: {
    maxBytes: 1024 * 1024,
    types: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  },
  files: { maxBytes: 25 * 1024 * 1024, types: ['application/pdf'] },
};

/* -------------------------------------------------------------------------- */
/* Main                                                                        */
/* -------------------------------------------------------------------------- */

const warnings = [];
const warn = (message) => warnings.push(message);
const log = (...args) => console.log(...args);

log(APPLY ? '== APPLY: writing to the new project ==' : '== DRY RUN: nothing is written ==');

const old = await readOldProject();
const plan = buildPlan(old);
validate(plan, old);

const hashes = await readPasswordHashes();
if (APPLY && !hashes && !WITHOUT_PASSWORDS) {
  fail(
    'Password hashes could not be read, so students would lose their passwords.\n' +
      'Fix OLD_SUPABASE_CONNECTION_STRING, or pass --without-passwords to import anyway.',
  );
}

const users = await syncUsers(plan.students, hashes);
await syncProfiles(plan.students);
const categoryIds = await syncCategories(plan.categoryNames);
await copyFiles('thumbnails', plan.thumbnails);
await sync('courses', plan.courses(categoryIds));
await sync('modules', plan.modules);
await copyFiles('files', plan.files);
await sync('module_files', plan.moduleFiles);
await sync('quizzes', plan.quizzes);
await sync('questions', plan.questions);
await sync('answers', plan.answers);
await syncAnswerKeys(plan.correctAnswerIds, plan.answers);
// Purchases, progress and certificates point at students, so in a dry run
// against an empty project they are planned without the users existing yet.
await sync('purchases', plan.purchases, { requireUsers: users });
// After quizzes: `module_progress.completed` is derived from whether the
// module has a quiz, so the quizzes must exist before the rows are written.
await sync('module_progress', plan.progress, { requireUsers: users });
await syncCertificates(plan.certificates, users);

log('\n== Warnings ==');
log(warnings.length ? warnings.map((w) => `  - ${w}`).join('\n') : '  none');
log(
  APPLY
    ? '\nDone. Run the dry run again: every line should read "unchanged".'
    : '\nDry run complete. Re-run with --apply to write.',
);

/* -------------------------------------------------------------------------- */
/* Reading the old project                                                     */
/* -------------------------------------------------------------------------- */

async function readOldProject() {
  const tables = [
    'profiles',
    'courses',
    'modules',
    'module_files',
    'module_videos',
    'tasks',
    'quizzes',
    'questions',
    'answers',
    'purchase_requests',
    'module_progress',
    'certificates',
  ];
  const data = {};
  for (const table of tables) {
    // No `order`: questions and answers have no position column in either
    // project, so the order they come back in is the only order they have, and
    // inserting in that order is what keeps it.
    const response = await fetch(`${OLD_URL}/rest/v1/${table}?select=*&limit=10000`, {
      headers: OLD_HEADERS,
    });
    if (!response.ok) fail(`Reading old ${table}: ${response.status} ${await response.text()}`);
    data[table] = await response.json();
  }
  data.storage = {};
  for (const [kind, bucket] of Object.entries(OLD_BUCKET)) {
    data.storage[kind] = await listOldBucket(bucket);
  }
  log(
    `Old project: ${data.courses.length} courses, ${data.modules.length} modules, ` +
      `${data.questions.length} questions, ${data.profiles.length} profiles, ` +
      `${data.purchase_requests.length} purchases, ${data.certificates.length} certificates`,
  );
  return data;
}

/** Storage lists one folder level at a time; folders come back with `id: null`. */
async function listOldBucket(bucket, prefix = '') {
  const response = await fetch(`${OLD_URL}/storage/v1/object/list/${bucket}`, {
    method: 'POST',
    headers: { ...OLD_HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix, limit: 1000 }),
  });
  if (!response.ok) fail(`Listing old ${bucket}: ${response.status}`);
  const objects = new Map();
  for (const entry of await response.json()) {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.id === null) {
      for (const [p, o] of await listOldBucket(bucket, path)) objects.set(p, o);
    } else {
      objects.set(path, { size: entry.metadata?.size ?? 0, type: entry.metadata?.mimetype });
    }
  }
  return objects;
}

/**
 * Password hashes live in `auth.users.encrypted_password`, which no Supabase
 * API returns — this is the only reason the script needs a Postgres connection.
 * Returns null (and warns) rather than throwing, so a dry run still works.
 */
async function readPasswordHashes() {
  const connectionString = process.env.OLD_SUPABASE_CONNECTION_STRING;
  if (!connectionString) {
    warn('OLD_SUPABASE_CONNECTION_STRING is not set — passwords would not be copied.');
    return null;
  }
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });
  try {
    await client.connect();
    const { rows } = await client.query('select id, encrypted_password from auth.users');
    return new Map(rows.map((r) => [r.id, r.encrypted_password || null]));
  } catch (error) {
    warn(`Could not read password hashes from the old database: ${error.message}`);
    return null;
  } finally {
    await client.end().catch(() => {});
  }
}

/* -------------------------------------------------------------------------- */
/* Mapping old rows to new ones                                                */
/* -------------------------------------------------------------------------- */

function buildPlan(old) {
  const courseById = new Map(old.courses.map((c) => [c.id, c]));
  const moduleById = new Map(old.modules.map((m) => [m.id, m]));
  const quizByModule = new Map(old.quizzes.map((q) => [q.module_id, q]));

  const students = old.profiles.filter((p) => p.role !== 'admin');
  const studentIds = new Set(students.map((s) => s.id));
  const skipped = old.profiles.filter((p) => p.role === 'admin');
  for (const p of skipped) log(`Skipping old ${p.role} account ${p.id} (${p.full_name})`);

  /** Rows that belong to a skipped account are dropped, and counted. */
  const ownedByStudent = (rows, label) => {
    const kept = rows.filter((r) => studentIds.has(r.user_id));
    if (kept.length < rows.length) {
      warn(
        `${rows.length - kept.length} ${label} belong to a skipped account and are not imported.`,
      );
    }
    return kept;
  };

  const categoryName = (tag) => {
    const trimmed = tag?.trim();
    return trimmed ? (CATEGORY_NAME_FIXES[trimmed] ?? trimmed) : null;
  };

  const thumbnails = old.courses
    .filter((c) => c.thumbnail_path)
    .map((c) => ({ from: c.thumbnail_path, to: c.thumbnail_path, owner: c.name }));

  // Old: `{module_id}/{timestamp}_{name}`. Ours: `{course_id}/{module_id}/{timestamp}-{name}`,
  // because the storage policy reads the course id out of the first folder
  // (see "The module-file folder order is silently unforgiving" in project-context).
  const files = old.module_files.map((f) => {
    const currentModule = moduleById.get(f.module_id);
    const stored = f.file_path.split('/').pop();
    const match = stored.match(/^(\d+)_(.+)$/);
    const timestamp = match ? match[1] : String(Date.parse(f.created_at));
    const original = match ? match[2] : stored;
    return {
      id: f.id,
      module_id: f.module_id,
      from: f.file_path,
      to: `${currentModule.course_id}/${f.module_id}/${timestamp}-${safeName(original)}`,
      file_name: readableFileName(original),
      created_at: f.created_at,
      owner: currentModule.title,
    };
  });

  return {
    students,
    categoryNames: [...new Set(old.courses.map((c) => categoryName(c.tag)).filter(Boolean))],
    thumbnails,
    files,

    courses: (categoryIds) =>
      old.courses.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        price: c.price ?? 0,
        category_id: categoryName(c.tag) ? (categoryIds.get(categoryName(c.tag)) ?? null) : null,
        thumbnail_path: c.thumbnail_path,
        // The old platform has no drafts: every course it had was on sale.
        published: true,
        // No teachers on the old platform; ownerless courses are managed by admins.
        owner_id: null,
        created_at: c.created_at,
      })),

    modules: old.modules.map((m) => ({
      id: m.id,
      course_id: m.course_id,
      title: m.title,
      description: m.description,
      order: m.position,
      created_at: m.created_at,
    })),

    moduleFiles: files.map((f) => ({
      id: f.id,
      module_id: f.module_id,
      file_path: f.to,
      file_name: f.file_name,
      created_at: f.created_at,
    })),

    quizzes: old.quizzes.map((q) => ({
      id: q.id,
      module_id: q.module_id,
      passing_score: q.required_score ?? DEFAULT_PASSING_SCORE,
    })),

    questions: old.questions.map((q) => ({ id: q.id, quiz_id: q.quiz_id, text: q.text })),
    answers: old.answers.map((a) => ({ id: a.id, question_id: a.question_id, text: a.text })),
    correctAnswerIds: new Set(old.answers.filter((a) => a.correct).map((a) => a.id)),

    purchases: ownedByStudent(old.purchase_requests, 'purchases').map((p) => {
      if (!PURCHASE_STATUS[p.status]) fail(`Unknown purchase status "${p.status}" on ${p.id}`);
      return {
        id: p.id,
        student_id: p.user_id,
        course_id: p.course_id,
        // The old table stored no price; the course's price is what was asked.
        price: courseById.get(p.course_id)?.price ?? 0,
        status: PURCHASE_STATUS[p.status],
        // Kept rather than re-issued: a student with a pending request may
        // already have quoted this reference on a bank transfer.
        readable_id: p.unique_id,
        created_at: p.created_at,
        updated_at: p.updated_at,
      };
    }),

    progress: ownedByStudent(old.module_progress, 'progress rows').flatMap((p) => {
      const hasQuiz = quizByModule.has(p.module_id);
      // Our `completed` is derived by a trigger: (no quiz OR quiz_done) AND
      // (no task OR task_done). On a module with no quiz, merely having a row
      // makes it complete — so an unfinished row there would hand the student
      // a module they never finished. Those rows are left out; the student
      // clicks "Završi modul" as they would have.
      if (!p.module_completed && !hasQuiz) return [];
      return [
        {
          id: p.id,
          module_id: p.module_id,
          student_id: p.user_id,
          quiz_done: hasQuiz && Boolean(p.quiz_completed),
          // There are no tasks on the old platform.
          task_done: false,
          created_at: p.created_at,
        },
      ];
    }),

    // Oldest first, so the new CERT-YYYY-NNNN numbers follow issue order.
    certificates: ownedByStudent(old.certificates, 'certificates')
      .filter((c) => c.issued !== false)
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((c) => ({
        id: c.id,
        student_id: c.user_id,
        course_id: c.course_id,
        // The PDF prints this as the issue date.
        created_at: c.created_at,
        requested_delivery: false,
      })),
  };
}

/** Stops the run before anything is written if the old data breaks a rule of ours. */
function validate(plan, old) {
  const problems = [];

  if (old.module_videos.length)
    problems.push(`${old.module_videos.length} module videos are not handled`);
  if (old.tasks.length) problems.push(`${old.tasks.length} tasks are not handled`);

  // Our database allows exactly one correct answer per question.
  for (const q of old.questions) {
    const correct = old.answers.filter((a) => a.question_id === q.id && a.correct).length;
    if (correct !== 1) problems.push(`Question ${q.id} has ${correct} correct answers`);
  }

  for (const [kind, list] of [
    ['thumbnails', plan.thumbnails],
    ['files', plan.files],
  ]) {
    for (const f of list) {
      const object = old.storage[kind].get(f.from);
      if (!object) problems.push(`Missing in old storage: ${f.from} (${f.owner})`);
      else if (object.size > LIMITS[kind].maxBytes) problems.push(`Too large: ${f.from}`);
      else if (!LIMITS[kind].types.includes(object.type)) {
        problems.push(`Type ${object.type} not allowed: ${f.from}`);
      }
    }
  }

  const referenced = new Set([...plan.thumbnails, ...plan.files].map((f) => f.from));
  const unreferenced = [...old.storage.thumbnails.keys(), ...old.storage.files.keys()].filter(
    (p) => !referenced.has(p),
  ).length;
  if (unreferenced)
    warn(`${unreferenced} old storage objects are referenced by no row and are not copied.`);

  const missingRef = plan.purchases.filter((p) => !p.readable_id).length;
  if (missingRef) warn(`${missingRef} purchases had no old reference and get a new UPL- number.`);

  if (problems.length)
    fail(`The old data cannot be imported as is:\n  - ${problems.join('\n  - ')}`);
  log('Validation passed.');
}

/* -------------------------------------------------------------------------- */
/* Writing to the new project                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Creates each student through the Auth admin API with their old id and
 * password hash. The `on_auth_user_created` trigger then creates the profile.
 * Returns the set of student ids that exist (or would exist) afterwards.
 */
async function syncUsers(students, hashes) {
  const existing = await listNewUsers();
  const byEmail = new Map([...existing.values()].map((u) => [u.email?.toLowerCase(), u]));
  const result = new Set();
  let created = 0;
  let present = 0;

  for (const s of students) {
    const oldUser = await getOldUser(s.id);
    const email = oldUser.email.toLowerCase();

    if (existing.has(s.id)) {
      present++;
      result.add(s.id);
      continue;
    }
    // Same address, different account: somebody registered on the new site
    // already. Merging two accounts is a decision, not something to guess.
    if (byEmail.has(email)) {
      warn(
        `${email} already has a different account in the new project — not imported, nor is anything of theirs.`,
      );
      continue;
    }

    const hash = hashes?.get(s.id) ?? null;
    if (hashes && !hash) warn(`${email} has no password in the old project and must reset it.`);
    created++;
    result.add(s.id);
    if (!APPLY) continue;

    const { error } = await supabase.auth.admin.createUser({
      id: s.id,
      email,
      email_confirm: Boolean(oldUser.email_confirmed_at),
      ...(hash ? { password_hash: hash } : {}),
      user_metadata: {
        full_name: s.full_name,
        // The old register form required the terms box too; this is the field
        // our own sign-up records it in.
        ...(s.accepted_tnc ? { terms_accepted_at: s.created_at } : {}),
      },
    });
    if (error) fail(`createUser ${email}: ${error.message}`);
  }

  log(`users: ${verb('create')} ${created}, unchanged ${present}`);
  return result;
}

/** The trigger-created profile gets the old name and sign-up date. */
async function syncProfiles(students) {
  if (!APPLY) return;
  for (const s of students) {
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: s.full_name, created_at: s.created_at })
      .eq('id', s.id);
    if (error) fail(`profile ${s.id}: ${error.message}`);
  }
}

/** Categories have no old id, so they are matched by name. */
async function syncCategories(names) {
  const { data, error } = await supabase.from('categories').select('id, name');
  if (error) fail(`categories: ${error.message}`);
  const ids = new Map(data.map((c) => [c.name, c.id]));
  const missing = names.filter((n) => !ids.has(n));
  if (APPLY && missing.length) {
    const { data: inserted, error: insertError } = await supabase
      .from('categories')
      .insert(missing.map((name) => ({ name })))
      .select('id, name');
    if (insertError) fail(`insert categories: ${insertError.message}`);
    for (const c of inserted) ids.set(c.name, c.id);
  }
  log(
    `categories: ${verb('insert')} ${missing.length}, unchanged ${names.length - missing.length}`,
  );
  return ids;
}

/**
 * Inserts rows whose id is new and updates rows whose fields differ.
 * Unchanged rows are not touched at all — re-writing every question would
 * shuffle them, since physical order is the only order they have.
 *
 * Inserted in one call per table, which keeps array order. Every object
 * carries the same keys (see "Bulk inserts send NULL, not DEFAULT").
 */
async function sync(table, rows, { requireUsers } = {}) {
  let candidates = rows;
  if (requireUsers) {
    candidates = rows.filter((r) => requireUsers.has(r.student_id));
    if (candidates.length < rows.length) {
      warn(
        `${table}: ${rows.length - candidates.length} rows skipped because their student was not imported.`,
      );
    }
  }

  const existing = await selectByIds(
    table,
    candidates.map((r) => r.id),
  );
  const toInsert = candidates.filter((r) => !existing.has(r.id));
  const toUpdate = candidates.filter((r) => existing.has(r.id) && differs(r, existing.get(r.id)));

  if (APPLY) {
    if (toInsert.length) {
      const { error } = await supabase.from(table).insert(toInsert);
      if (error) fail(`insert ${table}: ${error.message}`);
    }
    for (const row of toUpdate) {
      const { id, ...fields } = row;
      const { error } = await supabase.from(table).update(fields).eq('id', id);
      if (error) fail(`update ${table} ${id}: ${error.message}`);
    }
  }
  log(
    `${table}: ${verb('insert')} ${toInsert.length}, ${verb('update')} ${toUpdate.length}, ` +
      `unchanged ${candidates.length - toInsert.length - toUpdate.length}`,
  );
}

/**
 * `answers_ensure_answer_key` creates a key row (`is_correct = false`) for
 * every answer, so the import only flips flags. False first, then true: the
 * one-correct-answer index would reject a second `true` in between.
 */
async function syncAnswerKeys(correctIds, answers) {
  const ids = answers.map((a) => a.id);
  const keys = new Map();
  for (const chunk of chunks(ids, 100)) {
    const { data, error } = await supabase
      .from('answer_keys')
      .select('answer_id, is_correct')
      .in('answer_id', chunk);
    if (error) fail(`answer_keys: ${error.message}`);
    for (const k of data) keys.set(k.answer_id, k.is_correct);
  }
  const wrong = ids.filter((id) => keys.has(id) && keys.get(id) !== correctIds.has(id));
  // In a dry run against a fresh project the answers (and so their keys) do not exist yet.
  const pending = ids.filter((id) => !keys.has(id)).filter((id) => correctIds.has(id));

  if (APPLY) {
    for (const value of [false, true]) {
      const batch = wrong.filter((id) => correctIds.has(id) === value);
      if (!batch.length) continue;
      const { error } = await supabase
        .from('answer_keys')
        .update({ is_correct: value })
        .in('answer_id', batch);
      if (error) fail(`answer_keys ${value}: ${error.message}`);
    }
  }
  log(
    `answer_keys: ${verb('mark')} ${wrong.length + pending.length}, unchanged ${ids.length - wrong.length - pending.length}`,
  );
}

/**
 * Inserted, never updated: the number is assigned by the database on insert
 * (`next_certificate_readable_id()`), and an upsert would draw a fresh number
 * from the sequence on every run even when it then hit the conflict.
 */
async function syncCertificates(certificates, users) {
  const candidates = certificates.filter((c) => users.has(c.student_id));
  const existing = await selectByIds(
    'certificates',
    candidates.map((c) => c.id),
  );
  const toInsert = candidates.filter((c) => !existing.has(c.id));
  if (APPLY) {
    // One at a time, so the numbers are handed out in issue order.
    for (const c of toInsert) {
      const { error } = await supabase.from('certificates').insert(c);
      if (error) fail(`insert certificate ${c.id}: ${error.message}`);
    }
  }
  log(
    `certificates: ${verb('insert')} ${toInsert.length}, unchanged ${candidates.length - toInsert.length}`,
  );
}

/** Copies storage objects that are not already in the new bucket. */
async function copyFiles(kind, files) {
  const bucket = NEW_BUCKET[kind];
  let copied = 0;
  let bytes = 0;
  for (const f of files) {
    const folder = f.to.split('/').slice(0, -1).join('/');
    const name = f.to.split('/').pop();
    const { data: listed } = await supabase.storage.from(bucket).list(folder, { search: name });
    if (listed?.some((o) => o.name === name)) continue;

    copied++;
    if (!APPLY) continue;
    const response = await fetch(
      `${OLD_URL}/storage/v1/object/${OLD_BUCKET[kind]}/${encodePath(f.from)}`,
      {
        headers: OLD_HEADERS,
      },
    );
    if (!response.ok) fail(`download ${f.from}: ${response.status}`);
    const body = Buffer.from(await response.arrayBuffer());
    bytes += body.length;
    const { error } = await supabase.storage.from(bucket).upload(f.to, body, {
      contentType: response.headers.get('content-type') ?? undefined,
      upsert: true,
    });
    if (error) fail(`upload ${f.to}: ${error.message}`);
  }
  log(
    `storage ${bucket}: ${verb('copy')} ${copied}${APPLY ? ` (${(bytes / 1e6).toFixed(1)} MB)` : ''}, ` +
      `unchanged ${files.length - copied}`,
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

async function selectByIds(table, ids) {
  const found = new Map();
  for (const chunk of chunks(ids, 100)) {
    const { data, error } = await supabase.from(table).select('*').in('id', chunk);
    if (error) fail(`select ${table}: ${error.message}`);
    for (const row of data) found.set(row.id, row);
  }
  return found;
}

async function listNewUsers() {
  const users = new Map();
  for (let page = 1; ; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) fail(`listUsers: ${error.message}`);
    for (const u of data.users) users.set(u.id, u);
    if (data.users.length < 1000) return users;
  }
}

async function getOldUser(id) {
  const response = await fetch(`${OLD_URL}/auth/v1/admin/users/${id}`, { headers: OLD_HEADERS });
  if (!response.ok) fail(`old user ${id}: ${response.status}`);
  return response.json();
}

/**
 * Compares only the fields being written. Timestamps are compared as instants
 * and numbers as numbers, because PostgREST returns `numeric` and `timestamptz`
 * in a different spelling from the one sent.
 */
function differs(row, current) {
  return Object.entries(row).some(([key, value]) => {
    const now = current[key];
    if (value === null || now === null) return value !== now;
    if (/_at$/.test(key)) return Date.parse(value) !== Date.parse(now);
    if (typeof value === 'number') return Number(now) !== value;
    return value !== now;
  });
}

/** Same rule as `safeFileName()` in src/lib/storage.ts, minus the timestamp. */
function safeName(fileName) {
  return fileName
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

/** `Poslovno_pregovaranje-po_etni_nivo.pdf` → `Poslovno pregovaranje-početni nivo.pdf`. */
function readableFileName(fileName) {
  let name = fileName.replace(/_/g, ' ');
  for (const [from, to] of Object.entries(FILE_NAME_FIXES)) name = name.replaceAll(from, to);
  return name;
}

function encodePath(path) {
  return path.split('/').map(encodeURIComponent).join('/');
}

function chunks(list, size) {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

function verb(action) {
  return APPLY ? PAST[action] : `would ${action}`;
}

function required(name) {
  const value = process.env[name];
  if (!value) fail(`${name} is not set in .env.local`);
  return value;
}

function fail(message) {
  console.error(`\nAborted: ${message}`);
  process.exit(1);
}
