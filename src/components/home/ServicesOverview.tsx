import type { SvgIconComponent } from '@mui/icons-material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import FolderCopyOutlinedIcon from '@mui/icons-material/FolderCopyOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconDisc from '@/components/home/IconDisc';
import SectionHeading from '@/components/home/SectionHeading';
import Reveal from '@/components/landing/Reveal';
import Section from '@/components/landing/Section';

/**
 * "Šta nudimo" — the four lines of business, each with the one link that moves
 * a visitor forward on it.
 *
 * The links are the point of the tiles. Courses lead into the two course
 * sections (live on this page, online on `/online-kursevi`); the three services
 * have no page of their own, so they lead to the contact page — a service is
 * bought by talking to someone, and pretending otherwise with a "Saznajte više"
 * that leads nowhere new would waste the click.
 *
 * `id="usluge"` is the target of the header's "Usluge" link.
 */
type Offer = {
  icon: SvgIconComponent;
  title: string;
  description: string;
  links: { label: string; href: string }[];
};

const OFFERS: Offer[] = [
  {
    icon: SchoolOutlinedIcon,
    title: 'Kursevi i online kursevi',
    description:
      'Interaktivni kursevi i radionice za pojedince i kompanije. Od obrazovanja u oblasti računovodstva do poslovnog upravljanja i digitalnih vještina.',
    links: [
      { label: 'Kursevi uživo', href: '#kursevi' },
      { label: 'Online kursevi', href: '/online-kursevi' },
    ],
  },
  {
    icon: FolderCopyOutlinedIcon,
    title: 'Administrativne usluge',
    description:
      'Kompletna administrativna podrška za vaše poslovanje: evidencija, korespondencija, arhiva i organizacija dokumenata.',
    links: [{ label: 'Zatražite ponudu', href: '/kontakt' }],
  },
  {
    icon: MeetingRoomOutlinedIcon,
    title: 'Iznajmljivanje učionica',
    description:
      'Moderne učionice za obuke, sastanke i radionice. Opremljene prostorije na pogodnoj lokaciji.',
    links: [{ label: 'Pitajte za termin', href: '/kontakt' }],
  },
  {
    icon: InsightsOutlinedIcon,
    title: 'Poslovno savjetovanje',
    description:
      'Stručno savjetovanje za poslovno planiranje, projekte i unapređenje poslovnih procesa.',
    links: [{ label: 'Javite nam se', href: '/kontakt' }],
  },
];

export default function ServicesOverview() {
  return (
    <Section id="usluge" tone="plain">
      <Stack spacing={{ xs: 5, md: 7 }}>
        <Reveal>
          <SectionHeading
            align="center"
            overline="Ponuda"
            title="Šta nudimo"
            subtitle="Obrazovanje, kursevi i poslovne usluge prilagođene vašim potrebama."
          />
        </Reveal>

        <Grid container spacing={2.5}>
          {OFFERS.map((offer, index) => (
            <Grid key={offer.title} size={{ xs: 12, sm: 6, md: 3 }}>
              <Reveal delay={index * 70} sx={{ height: '100%' }}>
                <Stack
                  spacing={2}
                  sx={{
                    height: '100%',
                    p: 3,
                    borderRadius: 3,
                    border: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    transition: 'border-color 160ms ease, transform 160ms ease',
                    '&:hover': { borderColor: 'brand.main', transform: 'translateY(-2px)' },
                    '@media (prefers-reduced-motion: reduce)': {
                      transition: 'none',
                      '&:hover': { transform: 'none' },
                    },
                  }}
                >
                  <IconDisc icon={offer.icon} size={52} />

                  <Typography variant="h5" component="h3">
                    {offer.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                    {offer.description}
                  </Typography>

                  <Stack spacing={0.75}>
                    {offer.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        underline="hover"
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}
                      >
                        {link.label}
                        <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />
                      </Link>
                    ))}
                  </Stack>
                </Stack>
              </Reveal>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Section>
  );
}
