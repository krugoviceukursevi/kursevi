import 'server-only';
import { sendEmail, type EmailResult } from '@/lib/email/client';
import { SITE } from '@/lib/siteConfig';

/**
 * A message from a visitor to the people running the site — the contact form
 * (`/api/contact`) and the live-course application (`/api/contact/course-application`).
 *
 * One function so that both forms agree on the three things that matter:
 *
 * - **Where it goes.** `CONTACT_EMAIL_TO`, falling back to the public
 *   `SITE.contact.email`. A course application lands in the same inbox as any
 *   other enquiry; that is the client's request, and keeping the rule here is
 *   what stops the two drifting apart.
 * - **Escaping.** Every value is visitor-supplied and goes into HTML.
 * - **Reply.** `replyTo` is the visitor, so "Reply" in the inbox answers them
 *   rather than the send-only address the message came from.
 *
 * The message is a list of label/value rows plus an optional free-text body,
 * rendered as a simple table. It is an internal notification, read by staff,
 * so it is deliberately plain rather than wrapped in the branded frame
 * `renderEmail` gives messages to students.
 */
export type InquiryRow = { label: string; value: string | number | null | undefined };

export async function sendInquiry({
  subject,
  heading,
  rows,
  message,
  replyTo,
}: {
  subject: string;
  /** First line of the body, e.g. "Nova prijava na kurs". */
  heading: string;
  rows: InquiryRow[];
  /** The visitor's own text, shown under the rows with line breaks kept. */
  message?: { label: string; text: string };
  replyTo: string;
}): Promise<EmailResult> {
  const to = process.env.CONTACT_EMAIL_TO?.trim() || SITE.contact.email;
  const filled = rows.filter(
    (row) => row.value !== undefined && row.value !== null && row.value !== '',
  );

  const htmlRows = filled
    .map(
      (row) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#6b7280;vertical-align:top;white-space:nowrap;">${escapeHtml(row.label)}</td><td style="padding:6px 0;color:#111827;">${escapeHtml(String(row.value))}</td></tr>`,
    )
    .join('');

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:15px;line-height:1.55;color:#111827;">
      <p style="margin:0 0 12px;font-size:17px;font-weight:700;">${escapeHtml(heading)}</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${htmlRows}</table>
      ${
        message?.text
          ? `<p style="margin:18px 0 6px;color:#6b7280;">${escapeHtml(message.label)}</p>
             <p style="margin:0;white-space:normal;">${escapeHtml(message.text).replace(/\n/g, '<br>')}</p>`
          : ''
      }
    </div>`;

  const text = [
    heading,
    '',
    ...filled.map((row) => `${row.label}: ${row.value}`),
    ...(message?.text ? ['', `${message.label}:`, message.text] : []),
  ].join('\n');

  return sendEmail({ to, subject, html, text, replyTo });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
