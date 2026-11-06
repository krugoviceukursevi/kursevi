import type { SvgIconComponent } from '@mui/icons-material';
import Box from '@mui/material/Box';

/**
 * An icon in a filled brand-coloured circle — the home page's one recurring
 * motif. The brand is *Krugovi* ("circles") and its logo is a plain disc, so
 * every icon on the page sits in one.
 *
 * Painted with `brand` (the fill colour) and `brand.contrastText`, never with
 * `primary`: see "Two brand colours" in `theme.ts`. Decorative — the text beside
 * it carries the meaning — so the icon is hidden from assistive technology.
 */
export default function IconDisc({
  icon: Icon,
  size = 48,
}: {
  icon: SvgIconComponent;
  /** Diameter in pixels. The glyph scales with it. */
  size?: number;
}) {
  return (
    <Box
      aria-hidden
      sx={{
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        width: size,
        height: size,
        borderRadius: '50%',
        bgcolor: 'brand.main',
        color: 'brand.contrastText',
      }}
    >
      <Icon sx={{ fontSize: Math.round(size * 0.5) }} />
    </Box>
  );
}
