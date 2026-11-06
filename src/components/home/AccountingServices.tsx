import type { SvgIconComponent } from '@mui/icons-material';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconDisc from '@/components/home/IconDisc';
import SectionHeading from '@/components/home/SectionHeading';
import Reveal from '@/components/landing/Reveal';
import Section from '@/components/landing/Section';
import { SITE } from '@/lib/siteConfig';

/**
 * "Računovodstvene i poslovne usluge" — the nine accounting and business
 * services, as a list a visitor scans for the one they need.
 *
 * Heading and the two ways to ask on the left, the list on the right: someone
 * looking for "PDV prijava" reads down the list, finds it, and the next thing
 * their eye meets is a phone number. Short labels, each with its own icon,
 * because nine bare lines of text do not scan.
 *
 * A `paper` band between two `plain` ones.
 */
const SERVICES: { label: string; icon: SvgIconComponent }[] = [
  { label: 'Izrada i predaja poreskih prijava', icon: ReceiptLongOutlinedIcon },
  {
    label: 'Priprema i predaja KUF-a i KIF-a, podnošenje PDV prijave',
    icon: RequestQuoteOutlinedIcon,
  },
  { label: 'Izrada završnih računa', icon: AssessmentOutlinedIcon },
  { label: 'Izrada biznis planova', icon: TrendingUpOutlinedIcon },
  { label: 'Registracija preduzetnika', icon: StorefrontOutlinedIcon },
  { label: 'Prijave i odjave radnika', icon: BadgeOutlinedIcon },
  { label: 'Stručni savjeti', icon: TipsAndUpdatesOutlinedIcon },
  { label: 'Usluge virtuelne kancelarije', icon: ApartmentOutlinedIcon },
  { label: 'Plaćanja', icon: PaymentsOutlinedIcon },
];

export default function AccountingServices() {
  return (
    <Section id="racunovodstvo" tone="paper">
      <Grid container spacing={{ xs: 5, md: 8 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Reveal>
            <Stack spacing={3} sx={{ position: { md: 'sticky' }, top: { md: 96 } }}>
              <SectionHeading
                overline="Za vaše poslovanje"
                title="Računovodstvene i poslovne usluge"
                subtitle="Kompletna podrška za vaše poslovanje: od knjigovodstva do registracije i virtuelne kancelarije."
              />
              <Stack direction={{ xs: 'column', sm: 'row', md: 'column' }} spacing={1.5}>
                <Button href="/kontakt" variant="contained" size="large">
                  Zatražite ponudu
                </Button>
                <Button
                  href={`tel:${SITE.contact.phone.tel}`}
                  variant="outlined"
                  size="large"
                  startIcon={<PhoneOutlinedIcon />}
                  sx={{ borderColor: 'divider', color: 'text.primary' }}
                >
                  {SITE.contact.phone.display}
                </Button>
              </Stack>
            </Stack>
          </Reveal>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Grid container spacing={2} component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
            {SERVICES.map((service, index) => (
              <Grid key={service.label} component="li" size={{ xs: 12, sm: 6 }}>
                <Reveal delay={(index % 6) * 50} sx={{ height: '100%' }}>
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                      height: '100%',
                      alignItems: 'center',
                      p: 2,
                      borderRadius: 2,
                      border: 1,
                      borderColor: 'divider',
                      transition: 'border-color 160ms ease, background-color 160ms ease',
                      '&:hover': { borderColor: 'brand.main', bgcolor: 'action.hover' },
                      '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                    }}
                  >
                    <IconDisc icon={service.icon} size={40} />
                    <Typography variant="body1" sx={{ fontWeight: 600, lineHeight: 1.4 }}>
                      {service.label}
                    </Typography>
                  </Stack>
                </Reveal>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Section>
  );
}
