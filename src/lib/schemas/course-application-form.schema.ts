import { z } from 'zod';
import { LIVE_COURSE_IDS } from '@/lib/liveCourses';
import type { CourseApplicationRequest } from '@/lib/schemas/course-application.schema';

/**
 * The live-course application form on the home page.
 *
 * Separate from the API schema for the usual reasons (see "Forms" in
 * docs/project-context.md): plain `zod` so zod-to-openapi stays out of the
 * browser bundle, and messages in the page's language — Serbian, ijekavian,
 * formal "vi", like the rest of the home page copy.
 *
 * The optional text fields are `''` while empty (an input cannot hold
 * `undefined`); `toCourseApplicationPayload` drops them rather than sending
 * empty strings.
 */
export const courseApplicationFormSchema = z.object({
  courseId: z.enum(LIVE_COURSE_IDS, { error: 'Izaberite kurs.' }),
  name: z.string().trim().min(1, 'Unesite ime i prezime.').max(200),
  email: z.email({ error: 'Unesite ispravnu email adresu.' }).max(320),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s/()-]{6,30}$/, 'Unesite broj telefona, npr. +387 65 123 456.'),
  company: z.string().trim().max(200),
  participants: z
    .number({ error: 'Unesite broj polaznika.' })
    .int('Unesite cio broj.')
    .min(1, 'Najmanje jedan polaznik.')
    .max(100, 'Za više od 100 polaznika javite nam se direktno.'),
  message: z.string().trim().max(3000, 'Napomena je preduga.'),
});

export type CourseApplicationFormInput = z.input<typeof courseApplicationFormSchema>;
export type CourseApplicationFormValues = z.output<typeof courseApplicationFormSchema>;

/** Annotated with the API type so the two schemas cannot drift apart unnoticed. */
export function toCourseApplicationPayload(
  values: CourseApplicationFormValues,
): CourseApplicationRequest {
  return {
    courseId: values.courseId,
    name: values.name,
    email: values.email,
    phone: values.phone,
    company: values.company || undefined,
    participants: values.participants,
    message: values.message || undefined,
  };
}
