'use client';

import * as React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Form from '@/components/form/Form';
import FormNumberField from '@/components/form/FormNumberField';
import FormSelect, { type SelectOption } from '@/components/form/FormSelect';
import FormTextField from '@/components/form/FormTextField';
import { apiPost } from '@/lib/api/client';
import { LIVE_COURSES, liveCourseCategoryName } from '@/lib/liveCourses';
import {
  toCourseApplicationPayload,
  type CourseApplicationFormInput,
  type CourseApplicationFormValues,
} from '@/lib/schemas/course-application-form.schema';
import { SITE } from '@/lib/siteConfig';
import { toast } from '@/store/useToastStore';

/** Grouped by category, in the order the section shows them. */
const COURSE_OPTIONS: SelectOption[] = LIVE_COURSES.map((course) => ({
  value: course.id,
  label: course.title,
  group: liveCourseCategoryName(course.categoryId),
}));

export const APPLICATION_ANCHOR = 'prijava';

/**
 * The application form for a live course — "under it all", as the client put
 * it: one form beneath every course card, rather than a form per course.
 *
 * The form instance is owned by `<LiveCoursesSection>` and passed in, because
 * the cards' "Prijavite se" buttons need to set the course here before
 * scrolling down to it.
 *
 * Sending goes to `POST /api/contact/course-application`, which formats the
 * application and delivers it to the same inbox as the contact form.
 *
 * Consent is local state that gates the button, not a schema field — the same
 * pattern as `<ContactForm>` and the register page. The contact details stay on
 * screen next to the form at all times, so a visitor whose application cannot
 * be sent (email not configured, a failed send) already has the other way in.
 */
export default function CourseApplicationForm({
  form,
}: {
  form: UseFormReturn<CourseApplicationFormInput, unknown, CourseApplicationFormValues>;
}) {
  const [consent, setConsent] = React.useState(false);
  const isSubmitting = form.formState.isSubmitting;

  async function handleSubmit(values: CourseApplicationFormValues) {
    await apiPost('/api/contact/course-application', toCourseApplicationPayload(values));
    toast.success('Prijava je poslata. Javićemo vam se uskoro s detaljima o kursu.');
    form.reset();
    setConsent(false);
  }

  return (
    <Box
      id={APPLICATION_ANCHOR}
      component="section"
      aria-labelledby="prijava-title"
      sx={{
        // Clears the sticky app bar when the page scrolls to the anchor.
        scrollMarginTop: 88,
        borderRadius: 4,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <Grid container>
        <Grid
          size={{ xs: 12, md: 4 }}
          sx={{
            p: { xs: 3, md: 4 },
            color: 'brand.contrastText',
            backgroundImage:
              'linear-gradient(160deg, var(--mui-palette-brand-main), var(--mui-palette-brand-main) 55%, var(--mui-palette-brand-dark) 140%)',
          }}
        >
          <Stack spacing={2.5} sx={{ height: '100%' }}>
            <Typography
              variant="overline"
              sx={{ letterSpacing: 1.2, color: 'inherit', opacity: 0.8 }}
            >
              Prijava na kurs
            </Typography>
            <Typography id="prijava-title" variant="h3" component="h2">
              Prijavite se na kurs
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.88 }}>
              Izaberite kurs i ostavite kontakt — javićemo vam se s informacijama o narednom
              terminu. Prijavljujete li polaznike ispred kompanije, navedite i njen naziv.
            </Typography>

            <Box sx={{ flex: 1 }} />

            <Stack spacing={1}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                Prijave primamo i direktno:
              </Typography>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <PhoneOutlinedIcon sx={{ fontSize: 18 }} />
                <Link
                  href={`tel:${SITE.contact.phone.tel}`}
                  color="inherit"
                  underline="always"
                  sx={{ fontWeight: 600 }}
                >
                  {SITE.contact.phone.display}
                </Link>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <MailOutlinedIcon sx={{ fontSize: 18 }} />
                <Link
                  href={`mailto:${SITE.contact.email}`}
                  color="inherit"
                  underline="always"
                  sx={{ fontWeight: 600, wordBreak: 'break-all' }}
                >
                  {SITE.contact.email}
                </Link>
              </Stack>
            </Stack>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }} sx={{ p: { xs: 3, md: 4 } }}>
          <Form form={form} onSubmit={handleSubmit} pendingLabel="Slanje…">
            <FormSelect<CourseApplicationFormInput>
              name="courseId"
              label="Kurs"
              options={COURSE_OPTIONS}
              required
            />

            <Grid container columnSpacing={2} rowSpacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField<CourseApplicationFormInput>
                  name="name"
                  label="Ime i prezime"
                  placeholder="Milica Petrović"
                  autoComplete="name"
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField<CourseApplicationFormInput>
                  name="email"
                  label="Email adresa"
                  type="email"
                  placeholder="milica@primjer.ba"
                  autoComplete="email"
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField<CourseApplicationFormInput>
                  name="phone"
                  label="Broj telefona"
                  placeholder="+387 65 123 456"
                  autoComplete="tel"
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormNumberField<CourseApplicationFormInput>
                  name="participants"
                  label="Broj polaznika"
                  min={1}
                  max={100}
                  step={1}
                  required
                />
              </Grid>
            </Grid>

            <FormTextField<CourseApplicationFormInput>
              name="company"
              label="Kompanija (nije obavezno)"
              helperText="Ako prijavljujete polaznike ispred firme."
              autoComplete="organization"
            />

            <FormTextField<CourseApplicationFormInput>
              name="message"
              label="Napomena (nije obavezno)"
              placeholder="Npr. željeni termin ili pitanje o kursu."
              multiline
              rows={3}
            />

            <FormControlLabel
              control={
                <Checkbox checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              }
              label={
                <Typography variant="body2">
                  Pročitao/la sam <Link href="/politika-privatnosti">politiku privatnosti</Link> i
                  saglasan/na sam s obradom podataka radi prijave na kurs.
                </Typography>
              }
            />

            <Box>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={!consent || isSubmitting}
              >
                {isSubmitting ? 'Slanje…' : 'Pošaljite prijavu'}
              </Button>
            </Box>
          </Form>
        </Grid>
      </Grid>
    </Box>
  );
}
