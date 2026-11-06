'use client';

import LaptopMacOutlinedIcon from '@mui/icons-material/LaptopMacOutlined';
import Typography from '@mui/material/Typography';
import Logo from '@/components/layout/Logo';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import AppHeader from '@/components/layout/AppHeader';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * Top bar for the public-facing pages.
 *
 * ## A signed-in visitor gets the ordinary app bar
 *
 * The public pages are reachable while signed in — the catalogue, a course, the
 * blog — and there is no reason the chrome should change just because the page
 * underneath happens to be public. So once the session resolves, this hands
 * over to `<AppHeader />`, the same bar used everywhere else.
 *
 * What is left here is the genuinely different case: a **stranger**. They have
 * no name, no role and nothing to sign out of, and what they need instead is a
 * way in. That is the only reason this component still exists.
 *
 * While the session is resolving it renders a skeleton rather than the
 * signed-out state, or a signed-in visitor would watch the header flip from
 * "Prijavi se" to their own name on every page load.
 *
 * ## The links
 *
 * The home page is the centre's (services, live courses), the platform's pitch
 * is `/online-kursevi`, so the bar offers both halves. The logo is the way
 * home, which is why there is no "Početna". Shown from `md` up: five links
 * plus two buttons do not fit a tablet's width, and the footer repeats them.
 *
 * "Online kursevi" is set apart as a brand-tinted pill — the client's request:
 * it is the one link that leads out of the centre's site into the platform,
 * and the one the site most wants clicked. Because it carries the most weight
 * it also stays visible from `sm` up, where the plain links are hidden.
 */
const NAV_LINKS = [
  { label: 'Usluge', href: '/#usluge' },
  { label: 'Kursevi', href: '/#kursevi' },
  { label: 'Online kursevi', href: '/online-kursevi', highlight: true },
  { label: 'Blog', href: '/blog' },
  { label: 'Kontakt', href: '/kontakt' },
];

/** The brand colour as a CSS colour at `alpha` — see "Gradients are written as literal CSS variables". */
const brandAlpha = (alpha: number) => `rgb(var(--mui-palette-brand-mainChannel) / ${alpha})`;

export default function PublicHeader() {
  const profile = useAuthStore((s) => s.profile);
  const loading = useAuthStore((s) => s.loading);

  // App links, not the marketing ones below — see "Public pages do not mix in"
  // on `<AppHeader>`.
  if (profile) return <AppHeader />;

  return (
    <AppBar position="sticky" color="inherit" sx={{ bgcolor: 'background.paper' }}>
      <Toolbar sx={{ gap: 2, minHeight: { xs: 64, sm: 64 } }}>
        <Typography variant="h5" color="text.primary">
          <Logo />
        </Typography>

        <Stack
          component="nav"
          aria-label="Glavna navigacija"
          direction="row"
          useFlexGap
          spacing={2.5}
          sx={{ ml: 2, display: { xs: 'none', sm: 'flex' }, alignItems: 'center' }}
        >
          {NAV_LINKS.map((link) =>
            link.highlight ? (
              <Link
                key={link.href}
                href={link.href}
                variant="body2"
                underline="none"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.5,
                  py: 0.625,
                  borderRadius: 999,
                  fontWeight: 600,
                  color: 'text.primary',
                  bgcolor: brandAlpha(0.22),
                  border: 1,
                  borderColor: brandAlpha(0.7),
                  transition: 'background-color 120ms ease',
                  '&:hover': { bgcolor: brandAlpha(0.42) },
                  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                }}
              >
                <LaptopMacOutlinedIcon sx={{ fontSize: 16 }} />
                {link.label}
              </Link>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                variant="body2"
                underline="hover"
                color="text.secondary"
                sx={{ display: { xs: 'none', md: 'inline' } }}
              >
                {link.label}
              </Link>
            ),
          )}
        </Stack>

        <Box sx={{ flex: 1 }} />

        {loading ? (
          <Skeleton variant="rounded" width={160} height={36} />
        ) : (
          <Stack direction="row" spacing={1}>
            <Button href="/login" size="small">
              Prijavi se
            </Button>
            <Button href="/register" variant="contained" size="small">
              Registruj se
            </Button>
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  );
}
