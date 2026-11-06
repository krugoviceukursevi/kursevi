import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import LaptopMacOutlinedIcon from '@mui/icons-material/LaptopMacOutlined';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconDisc from '@/components/home/IconDisc';
import SectionHeading from '@/components/home/SectionHeading';
import Reveal from '@/components/landing/Reveal';
import Section from '@/components/landing/Section';

/**
 * The bridge from the centre's site to its online platform (`/online-kursevi`).
 *
 * Every promise here is one the platform keeps — see "Marketing copy may only
 * promise what the product does" in docs/project-context.md: lessons and
 * materials per module, tasks reviewed by the course's teacher, and a
 * certificate once the last module is done.
 */
const POINTS = [
  'Video lekcije i materijali, dostupni kad vama odgovara',
  'Zadatke pregleda predavač i daje povratnu informaciju',
  'Sertifikat po završetku posljednjeg modula',
];

export default function OnlineCoursesBand() {
  return (
    <Section tone="tint">
      <Grid container spacing={{ xs: 4, md: 8 }} sx={{ alignItems: 'center' }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Reveal>
            <SectionHeading
              overline="Online kursevi"
              title="Učite online, svojim tempom"
              subtitle="Pored nastave u učionici, nudimo i online kurseve na našoj platformi za učenje."
            />
          </Reveal>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Reveal delay={100}>
            <Stack spacing={2.5}>
              <Stack component="ul" spacing={1.5} sx={{ listStyle: 'none', p: 0, m: 0 }}>
                {POINTS.map((point) => (
                  <Stack
                    key={point}
                    component="li"
                    direction="row"
                    spacing={1.5}
                    sx={{ alignItems: 'center' }}
                  >
                    <IconDisc icon={LaptopMacOutlinedIcon} size={32} />
                    <Typography variant="body1">{point}</Typography>
                  </Stack>
                ))}
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button
                  href="/online-kursevi"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardRoundedIcon />}
                >
                  Saznajte više
                </Button>
                <Button
                  href="/courses"
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'divider',
                    color: 'text.primary',
                    bgcolor: 'background.paper',
                  }}
                >
                  Katalog online kurseva
                </Button>
              </Stack>
            </Stack>
          </Reveal>
        </Grid>
      </Grid>
    </Section>
  );
}
