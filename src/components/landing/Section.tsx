import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import type { SxProps, Theme } from '@mui/material/styles';
import { MARKETING_BLEED } from '@/components/layout/marketingGutter';

/**
 * One band of the landing page.
 *
 * ## What it is for
 *
 * The landing page used to be a single column of `<Container>`s separated by
 * hairline `<Divider>`s. Every section therefore sat on the same background at
 * the same width with the same weight, so the page read as one long document
 * rather than as a sequence of distinct things — and a visitor scrolling it had
 * nothing to orient by.
 *
 * `<Section>` gives a section two things a divider cannot: a **surface of its
 * own**, and the full width of the viewport to put it on. Alternating tones is
 * what creates the vertical rhythm; the dividers between sections are gone
 * because the edge of a band already separates it from the next one.
 *
 * ## The bleed
 *
 * `(marketing)/layout.tsx` pads `<main>` so ordinary public pages keep clear of
 * the viewport edge. A band must undo exactly that padding, which is why the
 * two values live together in `marketingGutter.ts` — see the note there.
 *
 * `flushTop` / `flushBottom` additionally cancel the *vertical* padding, for
 * the two sections that touch the chrome: the hero sits directly under the app
 * bar, and the closing banner runs straight into the footer.
 *
 * A Server Component — it is layout and nothing else.
 */
export type SectionTone =
  /** The page background shows through. No border, no surface. */
  | 'plain'
  /** A white panel, hairline-bordered against the page background. */
  | 'paper'
  /** A faint wash of the brand colour. */
  | 'tint'
  /** Solid brand gradient; text takes `brand.contrastText`. The closing CTA. */
  | 'brand';

const TONES: Record<SectionTone, SxProps<Theme>> = {
  plain: {},
  paper: {
    bgcolor: 'background.paper',
    borderTop: 1,
    borderBottom: 1,
    borderColor: 'divider',
  },
  tint: {
    /*
     * Written as literal CSS variables, the way `theme.ts` writes
     * `var(--mui-palette-divider)`. With `cssVariables` on,
     * `theme.palette.primary.main` is itself a `var(--…)` reference, so
     * `alpha()` cannot parse it; the `…Channel` tokens exist for exactly this,
     * and reading them directly keeps the value a plain string.
     */
    backgroundImage:
      'linear-gradient(180deg, rgb(var(--mui-palette-brand-mainChannel) / 0.16), rgb(var(--mui-palette-brand-mainChannel) / 0.05))',
    borderBottom: 1,
    borderColor: 'divider',
  },
  brand: {
    /*
     * Painted with `brand`, the fill colour, not `primary` (the text-safe
     * one) — see "Two brand colours" in `theme.ts`. Text follows
     * `brand.contrastText`, which is near-black on a pale brand and white on a
     * dark one.
     *
     * One hue, deepening towards the far corner. A second colour in the
     * gradient stops the band reading as *this product's* colour and starts it
     * reading as a stock gradient.
     */
    color: 'brand.contrastText',
    backgroundImage:
      'linear-gradient(110deg, var(--mui-palette-brand-main) 0%, var(--mui-palette-brand-main) 50%, var(--mui-palette-brand-dark) 135%)',
  },
};

export default function Section({
  children,
  id,
  tone = 'plain',
  flushTop = false,
  flushBottom = false,
  py = { xs: 7, md: 10 },
  sx,
}: {
  children: React.ReactNode;
  id?: string;
  tone?: SectionTone;
  flushTop?: boolean;
  flushBottom?: boolean;
  /** Vertical padding inside the band, in MUI spacing units. */
  py?: number | Record<string, number>;
  sx?: SxProps<Theme>;
}) {
  return (
    <Box
      id={id}
      sx={[
        {
          mx: MARKETING_BLEED,
          ...(flushTop ? { mt: MARKETING_BLEED } : null),
          ...(flushBottom ? { mb: MARKETING_BLEED } : null),
        },
        TONES[tone],
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Container maxWidth="lg" sx={{ py }}>
        {children}
      </Container>
    </Box>
  );
}
