/**
 * Colour arithmetic on `#rrggbb` values, shared by everything that paints the
 * brand without the MUI theme: the theme itself, the email templates (which
 * need literal hex) and `scripts/generate-brand-assets.mjs` (share card,
 * Supabase email).
 *
 * Plain functions with no imports, on purpose: the brand script loads this file
 * under plain Node (type stripping), which cannot resolve `@/` or anything
 * outside the file. Keep it that way.
 */

/** WCAG relative luminance, 0 (black) … 1 (white). */
export function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two colours, 1 … 21. Body text needs 4.5. */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export const WHITE = '#ffffff';
/** The near-black used for text on pale brand colours. */
export const INK = '#0b0d12';

/**
 * White or near-black — whichever contrasts more with `hex`. This is why a
 * pale brand colour gets dark button text without anyone having to ask for it.
 */
export function contrastText(hex: string): string {
  return contrastRatio(hex, WHITE) >= contrastRatio(hex, INK) ? WHITE : INK;
}

/**
 * `hex` moved towards black by `amount` (0 … 1). Used for the hover state of
 * a filled brand surface and the far end of the brand gradients, where a
 * separate configured colour would be one more thing to keep in step.
 */
export function shade(hex: string, amount: number): string {
  const channel = (i: number) =>
    Math.round(parseInt(hex.slice(i, i + 2), 16) * (1 - amount))
      .toString(16)
      .padStart(2, '0');
  return `#${channel(1)}${channel(3)}${channel(5)}`;
}
