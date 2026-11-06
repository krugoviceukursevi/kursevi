import { z } from '@/lib/openapi/zod';
import { LIVE_COURSE_IDS } from '@/lib/liveCourses';

/**
 * POST /api/contact/course-application — applying for a **live** course from
 * the home page (see `src/lib/liveCourses.ts`).
 *
 * Like `/api/contact`, this only ever becomes one email; nothing is stored.
 * The course travels as an id from the fixed list, not as free text, so the
 * subject line of the email the centre receives is always one of its own
 * course titles.
 *
 * The browser's form schema is `course-application-form.schema.ts`, with the
 * Serbian messages; this one is the boundary.
 */
export const courseApplicationRequestSchema = z
  .object({
    courseId: z.enum(LIVE_COURSE_IDS).openapi({ example: 'excel-osnovni' }),
    name: z.string().trim().min(1).max(200).openapi({ example: 'Milica Petrović' }),
    email: z.email().max(320).openapi({ example: 'milica@primjer.ba' }),
    // Digits plus the usual separators; the centre calls this number back.
    phone: z
      .string()
      .trim()
      .regex(/^\+?[\d\s/()-]{6,30}$/)
      .openapi({ example: '+387 65 123 456' }),
    /** Set when someone applies on behalf of a company. */
    company: z.string().trim().max(200).optional(),
    participants: z.number().int().min(1).max(100).openapi({ example: 1 }),
    message: z.string().trim().max(3000).optional(),
  })
  .openapi('CourseApplicationRequest');

export type CourseApplicationRequest = z.infer<typeof courseApplicationRequestSchema>;

export const courseApplicationResponseSchema = z
  .object({ data: z.object({ status: z.literal('sent') }) })
  .openapi('CourseApplicationResponse');
