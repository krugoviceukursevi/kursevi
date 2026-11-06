import { NextResponse } from 'next/server';
import { badRequest, parseBody, withRoute } from '@/lib/api/errors';
import { sendInquiry } from '@/lib/email/inquiry';
import { contactRequestSchema } from '@/lib/schemas/contact.schema';

export const dynamic = 'force-dynamic';

/**
 * Post /api/contact - the public contact form.
 *
 * No auth guard: this is meant to be reachable by a signed-out visitor.
 * Not tied to any table - this only ever becomes one outbound email, through
 * `sendInquiry()`, which also decides the recipient (CONTACT_EMAIL_TO, falling
 * back to SITE.contact.email) and escapes the visitor's text. The live-course
 * application (`/api/contact/course-application`) goes through the same
 * function, so the two forms always reach the same inbox.
 *
 * sendEmail() never throws (see src/lib/email/client.ts) - it returns a
 * status instead. 'sent' is the only success case reported to the
 * visitor as 200; 'skipped' (no RESEND_API_KEY configured yet) and
 * 'failed' both come back as a non-2xx response on purpose, so
 * <ContactForm> falls back to its "Pošalji email direktno" mailto link
 * instead of claiming a message went out that didn't.
 */
export const POST = withRoute(async (req) => {
  const body = await parseBody(req, contactRequestSchema);

  const result = await sendInquiry({
    subject: `Kontakt upit: ${body.subject}`,
    heading: 'Novi upit s kontakt forme',
    rows: [
      { label: 'Od', value: `${body.name} (${body.email})` },
      { label: 'Tema', value: body.subject },
    ],
    message: { label: 'Poruka', text: body.message },
    replyTo: body.email,
  });

  if (result.status !== 'sent') {
    throw badRequest('Trenutno ne primamo poruke ovim putem.', { emailStatus: result.status });
  }

  return NextResponse.json({ data: { status: 'sent' } }, { status: 200 });
});
