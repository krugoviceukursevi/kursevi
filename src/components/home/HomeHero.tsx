import type { SvgIconComponent } from '@mui/icons-material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import LaptopMacOutlinedIcon from '@mui/icons-material/LaptopMacOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconDisc from '@/components/home/IconDisc';
import Reveal from '@/components/landing/Reveal';
import { MARKETING_BLEED } from '@/components/layout/marketingGutter';
import { SITE } from '@/lib/siteConfig';

/**
 * The top of the home page — who the centre is and the two ways in.
 *
 * ## The heading carries the name and the promise together
 *
 * The `<h1>` is "Krugovi – centar za edukaciju i usluge" *and* the tagline, set
 * as one element with the name as a smaller first line. A search engine reads
 * the brand and what it offers as the page's main heading; a visitor sees the
 * offer at display size and the name above it, which is the order they care
 * about. Both come from the client's own copy.
 *
 * ## Circles instead of a photo
 *
 * The online-courses page has a photograph. This one has the brand's own shape:
 * *krugovi* are circles and the logo is a disc, so the illustration is a
 * cluster of them with the four things the centre does pinned around it. It is
 * decorative (`aria-hidden`) — every label repeats a section further down — and
 * hidden below `md`, where it would only push the copy under the fold.
 *
 * The highlighted phrase uses a marker stroke behind the text rather than
 * coloured text: the brand yellow is too pale to be read *as* text on white
 * (see "Two brand colours" in `theme.ts`), but is fine *under* it.
 */
const ORBIT: { label: string; icon: SvgIconComponent; top: string; left: string }[] = [
  { label: 'Kursevi uživo', icon: SchoolOutlinedIcon, top: '6%', left: '2%' },
  { label: 'Online kursevi', icon: LaptopMacOutlinedIcon, top: '22%', left: '58%' },
  { label: 'Računovodstvo', icon: CalculateOutlinedIcon, top: '62%', left: '-4%' },
  { label: 'Poslovno savjetovanje', icon: TipsAndUpdatesOutlinedIcon, top: '80%', left: '40%' },
];

export default function HomeHero() {
  return (
    <Box
      component="section"
      aria-labelledby="home-hero-title"
      sx={{
        position: 'relative',
        mx: MARKETING_BLEED,
        mt: MARKETING_BLEED,
        overflow: 'hidden',
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        // A warm glow from the top-right corner, where the circles sit. Faint
        // enough that the copy on the left reads on plain paper.
        backgroundImage:
          'radial-gradient(70% 90% at 92% 8%, rgb(var(--mui-palette-brand-mainChannel) / 0.22), rgb(var(--mui-palette-brand-mainChannel) / 0) 70%)',
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 7, md: 11 } }}>
        <Grid container spacing={{ xs: 6, md: 4 }} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Reveal distance={18}>
              <Stack spacing={3.5}>
                <Typography
                  id="home-hero-title"
                  variant="h1"
                  sx={{ fontSize: { xs: 34, md: 52 }, lineHeight: 1.08, letterSpacing: '-0.025em' }}
                >
                  <Box
                    component="span"
                    sx={{
                      display: 'block',
                      mb: 2,
                      fontSize: { xs: 15, md: 17 },
                      fontWeight: 700,
                      letterSpacing: '0.01em',
                      lineHeight: 1.4,
                      color: 'primary.main',
                    }}
                  >
                    {SITE.name} – {SITE.tagline}
                  </Box>
                  Interaktivni kursevi, radionice i{' '}
                  <Box
                    component="span"
                    sx={{
                      // A highlighter stroke across the lower half of the words.
                      // `clone` repeats it on every line when the phrase wraps.
                      backgroundImage:
                        'linear-gradient(transparent 58%, rgb(var(--mui-palette-brand-mainChannel) / 0.75) 58%, rgb(var(--mui-palette-brand-mainChannel) / 0.75) 92%, transparent 92%)',
                      boxDecorationBreak: 'clone',
                      WebkitBoxDecorationBreak: 'clone',
                      px: 0.25,
                    }}
                  >
                    savremene metode učenja
                  </Box>
                </Typography>

                <Typography
                  variant="h6"
                  component="p"
                  color="text.secondary"
                  sx={{ fontWeight: 400, maxWidth: 560, fontSize: { xs: 16, md: 18 } }}
                >
                  Za pojedince i kompanije. Kursevi, administrativne usluge, računovodstvo i
                  poslovno savjetovanje na jednom mjestu.
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <Button
                    href="#kursevi"
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardRoundedIcon />}
                  >
                    Pogledajte kurseve
                  </Button>
                  <Button
                    href="#usluge"
                    variant="outlined"
                    size="large"
                    sx={{ borderColor: 'divider', color: 'text.primary' }}
                  >
                    Naše usluge
                  </Button>
                </Stack>

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={{ xs: 1, sm: 3 }}
                  sx={{ color: 'text.secondary' }}
                >
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <PhoneOutlinedIcon sx={{ fontSize: 18 }} />
                    <Link
                      href={`tel:${SITE.contact.phone.tel}`}
                      variant="body2"
                      underline="hover"
                      color="text.primary"
                      sx={{ fontWeight: 600 }}
                    >
                      {SITE.contact.phone.display}
                    </Link>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <PlaceOutlinedIcon sx={{ fontSize: 18 }} />
                    <Typography variant="body2">{SITE.company.address}</Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Reveal>
          </Grid>

          <Grid size={{ md: 5 }} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Reveal delay={120} distance={24}>
              <Circles />
            </Reveal>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

/** The illustration: overlapping discs and rings, with the four offers pinned on. */
function Circles() {
  const disc = (sx: object) => (
    <Box aria-hidden sx={{ position: 'absolute', borderRadius: '50%', ...sx }} />
  );

  return (
    <Box aria-hidden sx={{ position: 'relative', width: '100%', maxWidth: 440, mx: 'auto' }}>
      <Box sx={{ position: 'relative', pt: '100%' }}>
        {disc({ inset: '12%', bgcolor: 'brand.main' })}
        {disc({
          top: '2%',
          right: '0%',
          width: '38%',
          height: '38%',
          border: 2,
          borderColor: 'brand.main',
        })}
        {disc({
          bottom: '4%',
          left: '6%',
          width: '22%',
          height: '22%',
          bgcolor: 'rgb(var(--mui-palette-brand-mainChannel) / 0.35)',
        })}
        {disc({ top: '30%', left: '30%', width: '9%', height: '9%', bgcolor: 'secondary.main' })}
        {disc({
          bottom: '18%',
          right: '10%',
          width: '14%',
          height: '14%',
          bgcolor: 'background.paper',
          border: 2,
          borderColor: 'secondary.main',
        })}

        {ORBIT.map((item) => (
          <Stack
            key={item.label}
            direction="row"
            spacing={1.25}
            sx={{
              position: 'absolute',
              top: item.top,
              left: item.left,
              alignItems: 'center',
              py: 0.75,
              pl: 0.75,
              pr: 2,
              borderRadius: 999,
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              boxShadow: 6,
              whiteSpace: 'nowrap',
            }}
          >
            <IconDisc icon={item.icon} size={34} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {item.label}
            </Typography>
          </Stack>
        ))}
      </Box>
    </Box>
  );
}
