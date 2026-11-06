import type { SvgIconComponent } from '@mui/icons-material';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Reveal from '@/components/landing/Reveal';
import Section from '@/components/landing/Section';
import { SITE } from '@/lib/siteConfig';

/**
 * The closing band: how to reach the centre, on the brand colour.
 *
 * A local business is chosen by people who want to call or walk in, so the
 * last thing on the page is the phone number, the address and the hours as
 * plain text — not only a button that leads to another page. The buttons
 * invert the band the same way `<CtaBanner>` does, so they work on any brand
 * colour.
 *
 * `flushBottom`, like the online page's banner: it runs into the footer.
 */
export default function ContactBand() {
  const facts: { icon: SvgIconComponent; label: string; href?: string }[] = [
    {
      icon: PhoneOutlinedIcon,
      label: SITE.contact.phone.display,
      href: `tel:${SITE.contact.phone.tel}`,
    },
    { icon: MailOutlinedIcon, label: SITE.contact.email, href: `mailto:${SITE.contact.email}` },
    { icon: PlaceOutlinedIcon, label: SITE.company.address },
    { icon: ScheduleOutlinedIcon, label: SITE.contact.hours },
  ];

  return (
    <Section tone="brand" flushBottom py={{ xs: 7, md: 9 }} sx={{ position: 'relative' }}>
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage:
            'radial-gradient(55% 120% at 88% 0%, rgba(255,255,255,0.28), rgba(255,255,255,0) 60%)',
        }}
      />

      <Grid container spacing={{ xs: 5, md: 8 }} sx={{ position: 'relative' }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Reveal>
            <Stack spacing={3}>
              <Stack spacing={1.5}>
                <Typography variant="h2" sx={{ fontSize: { xs: 30, md: 42 }, fontWeight: 700 }}>
                  Imate pitanje ili želite ponudu?
                </Typography>
                <Typography variant="h6" component="p" sx={{ fontWeight: 400, opacity: 0.88 }}>
                  Pozovite nas, pišite nam ili svratite — rado ćemo vam pomoći da izaberete kurs ili
                  uslugu koja vam odgovara.
                </Typography>
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button
                  href={`tel:${SITE.contact.phone.tel}`}
                  variant="contained"
                  size="large"
                  startIcon={<PhoneOutlinedIcon />}
                  sx={{
                    bgcolor: 'brand.contrastText',
                    color: 'brand.main',
                    '&:hover': { bgcolor: 'brand.contrastText', filter: 'brightness(0.94)' },
                  }}
                >
                  Pozovite nas
                </Button>
                <Button
                  href="/kontakt"
                  variant="outlined"
                  size="large"
                  sx={{
                    color: 'inherit',
                    borderColor: 'rgb(var(--mui-palette-brand-contrastTextChannel) / 0.55)',
                    '&:hover': {
                      borderColor: 'brand.contrastText',
                      bgcolor: 'rgb(var(--mui-palette-brand-contrastTextChannel) / 0.08)',
                    },
                  }}
                >
                  Pišite nam
                </Button>
              </Stack>
            </Stack>
          </Reveal>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Reveal delay={100}>
            <Stack
              component="address"
              spacing={2}
              sx={{
                fontStyle: 'normal',
                p: 3,
                borderRadius: 3,
                bgcolor: 'rgb(255 255 255 / 0.35)',
                border: 1,
                borderColor: 'rgb(var(--mui-palette-brand-contrastTextChannel) / 0.12)',
              }}
            >
              {facts.map((fact) => (
                <Stack key={fact.label} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <fact.icon sx={{ fontSize: 20, opacity: 0.8 }} />
                  {fact.href ? (
                    <Link
                      href={fact.href}
                      color="inherit"
                      underline="hover"
                      sx={{ fontWeight: 600, wordBreak: 'break-word' }}
                    >
                      {fact.label}
                    </Link>
                  ) : (
                    <Typography sx={{ fontWeight: 600 }}>{fact.label}</Typography>
                  )}
                </Stack>
              ))}
            </Stack>
          </Reveal>
        </Grid>
      </Grid>
    </Section>
  );
}
