import { NextResponse } from 'next/server';
import { ApiError, badRequest, parseBody, withRoute } from '@/lib/api/errors';
import { clientIp, createRateLimiter } from '@/lib/api/rateLimit';
import { sendInquiry } from '@/lib/email/inquiry';
import { findLiveCourse, liveCourseCategoryName } from '@/lib/liveCourses';
import { courseApplicationRequestSchema } from '@/lib/schemas/course-application.schema';

export const dynamic = 'force-dynamic';

/**
 * Five applications per IP per 15 minutes. A person applies for one or two
 * courses; anything beyond that is a script using the centre's inbox as a
 * target. In-memory and therefore best effort — see `rateLimit.ts`.
 */
const applications = createRateLimiter({ limit: 5, windowMs: 15 * 60 * 1000 });

/**
 * POST /api/contact/course-application — someone applies for a **live**
 * course from the home page.
 *
 * Public, unauthenticated, and stores nothing: like `/api/contact` it becomes
 * one email to the same inbox (`sendInquiry` owns that rule), with the
 * applicant as Reply-To, so the centre answers them straight from the inbox.
 *
 * The course arrives as an id from `src/lib/liveCourses.ts` and the schema
 * rejects anything else, so the course title in the subject line is always
 * the centre's own text, never the visitor's.
 *
 * Only `'sent'` is a success. With email unconfigured (`'skipped'`) or a failed
 * send, the visitor gets a 400 and the form tells them to call or write
 * directly — never a confirmation for an application nobody received.
 */
export const POST = withRoute(async (req) => {
  const ip = clientIp(req);
  if (applications.isLimited(ip)) {
    throw new ApiError(429, 'Previše prijava u kratkom roku. Pokušajte ponovo za 15 minuta.');
  }

  const body = await parseBody(req, courseApplicationRequestSchema);
  // The schema already guarantees a known id; this narrows the type.
  const course = findLiveCourse(body.courseId);
  if (!course) throw badRequest('Nepoznat kurs.');

  applications.hit(ip);

  const result = await sendInquiry({
    subject: `Prijava na kurs: ${course.title}`,
    heading: 'Nova prijava na kurs',
    rows: [
      { label: 'Kurs', value: course.title },
      { label: 'Kategorija', value: liveCourseCategoryName(course.categoryId) },
      { label: 'Ime i prezime', value: body.name },
      { label: 'Email', value: body.email },
      { label: 'Telefon', value: body.phone },
      { label: 'Kompanija', value: body.company },
      { label: 'Broj polaznika', value: body.participants },
    ],
    message: body.message ? { label: 'Napomena', text: body.message } : undefined,
    replyTo: body.email,
  });

  if (result.status !== 'sent') {
    throw badRequest('Prijave trenutno ne primamo ovim putem.', { emailStatus: result.status });
  }

  return NextResponse.json({ data: { status: 'sent' } }, { status: 200 });
});
