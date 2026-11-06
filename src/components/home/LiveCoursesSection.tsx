'use client';

import * as React from 'react';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CourseApplicationForm, { APPLICATION_ANCHOR } from '@/components/home/CourseApplicationForm';
import SectionHeading from '@/components/home/SectionHeading';
import Reveal from '@/components/landing/Reveal';
import Section from '@/components/landing/Section';
import { useZodForm } from '@/lib/forms/useZodForm';
import {
  LIVE_COURSE_CATEGORIES,
  LIVE_COURSES,
  type LiveCourse,
  type LiveCourseId,
} from '@/lib/liveCourses';
import { courseApplicationFormSchema } from '@/lib/schemas/course-application-form.schema';

/**
 * "Kursevi po kategorijama" — the live (classroom) courses, and the application
 * form beneath them. Data: `src/lib/liveCourses.ts`.
 *
 * ## Every course is in the server HTML
 *
 * A Client Component, because the category filter and the "Prijavite se"
 * buttons are interactive — but client components still render on the server,
 * and the filter starts on "Svi", so every course title and description is in
 * the initial HTML. Filtering only ever *hides* groups after hydration. That
 * matters: these descriptions are the most specific text on the site and the
 * likeliest thing for someone to search for ("kurs knjigovodstva Bijeljina").
 *
 * ## One form, owned here
 *
 * The form instance lives in this component and is handed to
 * `<CourseApplicationForm>`, so a card's button can set the course on it before
 * scrolling down. The alternative — a query string read by the form — would make
 * the whole section client-only (`useSearchParams`) and lose the server HTML.
 *
 * `id="kursevi"` is the target of the header's "Kursevi" link and the hero's
 * main button.
 */
type Filter = 'all' | LiveCourse['categoryId'];

export default function LiveCoursesSection() {
  const [filter, setFilter] = React.useState<Filter>('all');

  const form = useZodForm(courseApplicationFormSchema, {
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      participants: 1,
      message: '',
    },
  });

  function apply(courseId: LiveCourseId) {
    form.setValue('courseId', courseId, { shouldValidate: true, shouldDirty: true });
    const target = document.getElementById(APPLICATION_ANCHOR);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  const groups = LIVE_COURSE_CATEGORIES.filter(
    (category) => filter === 'all' || category.id === filter,
  ).map((category) => ({
    ...category,
    courses: LIVE_COURSES.filter((course) => course.categoryId === category.id),
  }));

  return (
    <Section id="kursevi" tone="plain" sx={{ scrollMarginTop: 64 }}>
      <Stack spacing={{ xs: 4, md: 5 }}>
        <Reveal>
          <SectionHeading
            overline="Kursevi uživo"
            title="Kursevi po kategorijama"
            subtitle="Računovodstvo, softverske vještine, biznis, dizajn, programiranje i više."
          />
        </Reveal>

        <Stack
          direction="row"
          useFlexGap
          role="group"
          aria-label="Filtriraj kurseve po kategoriji"
          sx={{ flexWrap: 'wrap', gap: 1 }}
        >
          <FilterChip
            label="Svi kursevi"
            selected={filter === 'all'}
            onClick={() => setFilter('all')}
          />
          {LIVE_COURSE_CATEGORIES.map((category) => (
            <FilterChip
              key={category.id}
              label={category.name}
              selected={filter === category.id}
              onClick={() => setFilter(category.id)}
            />
          ))}
        </Stack>

        <Stack spacing={{ xs: 5, md: 6 }}>
          {groups.map((group) => (
            <Stack key={group.id} spacing={2.5} component="section" aria-label={group.name}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'baseline' }}>
                <Typography variant="h4" component="h3">
                  {group.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {group.courses.length}
                </Typography>
              </Stack>

              <Grid container spacing={2.5}>
                {group.courses.map((course, index) => (
                  <Grid key={course.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Reveal delay={index * 60} sx={{ height: '100%' }}>
                      <CourseCard course={course} onApply={() => apply(course.id)} />
                    </Reveal>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          ))}
        </Stack>

        <Reveal>
          <CourseApplicationForm form={form} />
        </Reveal>
      </Stack>
    </Section>
  );
}

function FilterChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <Chip
      label={label}
      onClick={onClick}
      aria-pressed={selected}
      variant={selected ? 'filled' : 'outlined'}
      sx={{
        height: 34,
        borderRadius: 999,
        fontSize: 14,
        ...(selected
          ? {
              bgcolor: 'brand.main',
              color: 'brand.contrastText',
              '&:hover': { bgcolor: 'brand.main', filter: 'brightness(0.95)' },
            }
          : { bgcolor: 'background.paper' }),
      }}
    />
  );
}

function CourseCard({ course, onApply }: { course: LiveCourse; onApply: () => void }) {
  return (
    <Stack
      component="article"
      spacing={2}
      sx={{
        height: '100%',
        p: 3,
        borderRadius: 3,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        borderTop: 4,
        borderTopColor: 'brand.main',
        transition: 'box-shadow 160ms ease',
        '&:hover': { boxShadow: 8 },
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      }}
    >
      <Typography variant="h5" component="h4" sx={{ lineHeight: 1.3 }}>
        {course.title}
      </Typography>

      {course.facts.length > 0 ? (
        <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 0.75 }}>
          {course.facts.map((fact) => (
            <Chip key={fact} label={fact} size="small" variant="outlined" />
          ))}
        </Stack>
      ) : null}

      <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
        {course.description}
      </Typography>

      {/* A button, not an `#prijava` link: picking the course needs script
          anyway, and Next's hash navigation would jump past the smooth scroll. */}
      <Button
        onClick={onApply}
        variant="outlined"
        endIcon={<ArrowForwardRoundedIcon />}
        sx={{ alignSelf: 'flex-start' }}
        aria-label={`Prijavite se na kurs: ${course.title}`}
      >
        Prijavite se
      </Button>
    </Stack>
  );
}
