import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

/**
 * Overline + heading + one sentence: how every section of the home page opens.
 *
 * Written once because the home page has six of them, and the overline/heading
 * pair is what a visitor scanning the page actually reads. The `<h2>` is real —
 * the page's outline (one `<h1>` in the hero, an `<h2>` per section, `<h3>` per
 * card) is what a crawler and a screen reader navigate by.
 *
 * `align="center"` for sections whose content is a symmetrical grid; leave it
 * left-aligned when the heading sits beside content.
 */
export default function SectionHeading({
  overline,
  title,
  subtitle,
  align = 'left',
  id,
}: {
  overline: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  /** Id for the `<h2>`, so the section can be `aria-labelledby` it. */
  id?: string;
}) {
  const centered = align === 'center';

  return (
    <Stack
      spacing={1.5}
      sx={{
        maxWidth: 680,
        textAlign: align,
        alignItems: centered ? 'center' : 'flex-start',
        mx: centered ? 'auto' : 0,
      }}
    >
      <Typography variant="overline" color="primary" sx={{ letterSpacing: 1.2 }}>
        {overline}
      </Typography>
      <Typography id={id} variant="h2" sx={{ fontSize: { xs: 28, md: 38 } }}>
        {title}
      </Typography>
      {subtitle ? (
        <Typography variant="h6" component="p" color="text.secondary" sx={{ fontWeight: 400 }}>
          {subtitle}
        </Typography>
      ) : null}
    </Stack>
  );
}
