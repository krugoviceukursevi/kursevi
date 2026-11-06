'use client';

import Box from '@mui/material/Box';
import { keyframes } from '@mui/material/styles';

/**
 * The decorative background behind the auth card: a pale brand wash with
 * soft, slowly drifting circles over it.
 *
 * Circles because the brand is *Krugovi* ("circles") and its logo is a disc —
 * the same motif as the home page hero. Some are filled and slightly out of
 * focus, some are only an outline, so the field has depth without turning into
 * a pattern.
 *
 * CSS only — no image to download, nothing that shifts layout while it
 * arrives. `position: fixed`, so on a page tall enough to scroll (register on
 * a short screen) the shapes stay put instead of stretching with the document.
 *
 * The large **glows** underneath are radial gradients fading to transparent,
 * so they are already soft and need no `filter: blur()` — on an element that
 * size the blur would be the expensive part of every animation frame. The
 * circles are small, so blurring them is cheap.
 *
 * Colours come from the palette tokens, so a brand change moves them too —
 * `brand` (the fill colour) rather than `primary` (the text-safe one), since
 * this is paint, not writing; see "Two brand colours" in `theme.ts`. Motion is
 * a slow drift for the circles and a slow brighten/dim for the glows, and all
 * of it is switched off under `prefers-reduced-motion`.
 */

// A circle looks the same at any rotation, so the drift is translation only.
const drift = keyframes`
  from { transform: translate3d(0, 0, 0); }
  to   { transform: translate3d(var(--dx), var(--dy), 0); }
`;

// The glows only brighten and dim — no movement — so the page "breathes"
// without anything large shifting in the corner of the eye. Opacity alone is
// also the cheapest thing a browser can animate on an element this size.
const breathe = keyframes`
  from { opacity: 0.55; }
  to   { opacity: 1; }
`;

const BRAND = 'var(--mui-palette-brand-main)';
const SECONDARY = 'var(--mui-palette-secondary-main)';

/** `color` at `percent` opacity, as a CSS value. */
const tint = (color: string, percent: number) =>
  `color-mix(in srgb, ${color} ${percent}%, transparent)`;

type Glow = { size: string; top: string; left: string; color: string; strength: number };

const GLOWS: Glow[] = [
  { size: '62vmax', top: '-22%', left: '-18%', color: BRAND, strength: 26 },
  { size: '56vmax', top: '48%', left: '62%', color: SECONDARY, strength: 22 },
  { size: '40vmax', top: '58%', left: '-12%', color: SECONDARY, strength: 14 },
  { size: '36vmax', top: '-14%', left: '68%', color: BRAND, strength: 16 },
];

type Circle = {
  size: number;
  top: string;
  left: string;
  color: string;
  /** Opacity of the colour, 0–100. */
  strength: number;
  /** `fill` is a soft disc, `outline` a thin ring. */
  kind: 'fill' | 'outline';
  /** Blur in px — the larger, the further "out of focus". */
  blur: number;
  dx: string;
  dy: string;
  seconds: number;
};

// Kept to the edges of the viewport, so none sits behind the card's text.
const CIRCLES: Circle[] = [
  {
    size: 180,
    top: '10%',
    left: '9%',
    color: BRAND,
    strength: 22,
    kind: 'fill',
    blur: 6,
    dx: '24px',
    dy: '-18px',
    seconds: 22,
  },
  {
    size: 96,
    top: '22%',
    left: '80%',
    color: SECONDARY,
    strength: 30,
    kind: 'fill',
    blur: 2,
    dx: '-16px',
    dy: '22px',
    seconds: 18,
  },
  {
    size: 140,
    top: '68%',
    left: '83%',
    color: BRAND,
    strength: 45,
    kind: 'outline',
    blur: 0,
    dx: '-20px',
    dy: '-14px',
    seconds: 26,
  },
  {
    size: 64,
    top: '80%',
    left: '20%',
    color: SECONDARY,
    strength: 34,
    kind: 'fill',
    blur: 1,
    dx: '18px',
    dy: '-20px',
    seconds: 16,
  },
  {
    size: 240,
    top: '72%',
    left: '1%',
    color: BRAND,
    strength: 14,
    kind: 'fill',
    blur: 12,
    dx: '30px',
    dy: '-10px',
    seconds: 30,
  },
  {
    size: 48,
    top: '7%',
    left: '60%',
    color: BRAND,
    strength: 55,
    kind: 'outline',
    blur: 0,
    dx: '-12px',
    dy: '14px',
    seconds: 14,
  },
  {
    size: 120,
    top: '42%',
    left: '4%',
    color: SECONDARY,
    strength: 40,
    kind: 'outline',
    blur: 0,
    dx: '14px',
    dy: '18px',
    seconds: 24,
  },
  {
    size: 76,
    top: '50%',
    left: '90%',
    color: SECONDARY,
    strength: 26,
    kind: 'fill',
    blur: 3,
    dx: '-18px',
    dy: '-12px',
    seconds: 19,
  },
  {
    size: 200,
    top: '-6%',
    left: '74%',
    color: SECONDARY,
    strength: 12,
    kind: 'fill',
    blur: 10,
    dx: '-14px',
    dy: '20px',
    seconds: 28,
  },
  {
    size: 36,
    top: '88%',
    left: '64%',
    color: BRAND,
    strength: 40,
    kind: 'fill',
    blur: 0.5,
    dx: '16px',
    dy: '-16px',
    seconds: 13,
  },
];

export default function AuthBackdrop() {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        bgcolor: 'background.default',
        // The wash underneath: a diagonal from a hint of primary to a hint of
        // secondary, so the gaps between the shapes are not flat grey.
        backgroundImage: `linear-gradient(135deg, ${tint(BRAND, 10)}, transparent 45%, ${tint(SECONDARY, 10)})`,
      }}
    >
      {GLOWS.map((glow, i) => (
        <Box
          key={`glow-${i}`}
          sx={{
            position: 'absolute',
            top: glow.top,
            left: glow.left,
            width: glow.size,
            aspectRatio: '1',
            backgroundImage: `radial-gradient(closest-side, ${tint(glow.color, glow.strength)}, transparent)`,
            // 20–38s per breath, offset so no two glows peak together.
            animation: `${breathe} ${20 + i * 6}s ease-in-out ${-i * 7}s infinite alternate`,
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}
        />
      ))}

      {CIRCLES.map((circle, i) => (
        <Box
          key={`circle-${i}`}
          style={{ '--dx': circle.dx, '--dy': circle.dy } as React.CSSProperties}
          sx={{
            position: 'absolute',
            top: circle.top,
            left: circle.left,
            width: circle.size,
            height: circle.size,
            borderRadius: '50%',
            ...(circle.kind === 'fill'
              ? {
                  // Brighter on one side, the way light catches a sphere.
                  backgroundImage: `linear-gradient(135deg, ${tint(circle.color, circle.strength)}, ${tint(circle.color, Math.round(circle.strength * 0.4))})`,
                }
              : { border: `1.5px solid ${tint(circle.color, circle.strength)}` }),
            filter: circle.blur ? `blur(${circle.blur}px)` : undefined,
            willChange: 'transform',
            animation: `${drift} ${circle.seconds}s ease-in-out ${-i * 3}s infinite alternate`,
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}
        />
      ))}
    </Box>
  );
}
