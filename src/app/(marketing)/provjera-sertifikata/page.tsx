import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CertificateVerifier from '@/components/certificates/CertificateVerifier';
import { VERIFICATION_PATH } from '@/lib/certificateVerification';
import { pageMetadata } from '@/lib/seo';
import { SITE } from '@/lib/siteConfig';

export const metadata = pageMetadata({
  title: 'Provjera sertifikata',
  description: `Provjeri da li je sertifikat platforme ${SITE.name} izdat: unesi broj sertifikata i prezime vlasnika i odmah vidi kurs i datum završetka.`,
  path: VERIFICATION_PATH,
});

/** A query value as a single bounded string; anything else is ignored. */
function param(value: string | string[] | undefined): string {
  return typeof value === 'string' ? value.slice(0, 100) : '';
}

/**
 * Public certificate check — for an employer, or anyone else, holding a
 * certificate number and the name of the person who claims it.
 *
 * A Server Component around `<CertificateVerifier>`, so it can own metadata.
 * `?broj=…&prezime=…` prefills both fields and runs the check: that is the link
 * a student shares from their certificate page. The rules — and why the number
 * alone is not enough — are in `src/lib/certificateVerification.ts`.
 */
export default async function CertificateVerificationPage(
  props: PageProps<'/provjera-sertifikata'>,
) {
  const searchParams = await props.searchParams;

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 6, md: 8 } }}>
      <Stack spacing={1} sx={{ mb: 5 }}>
        <Typography variant="overline" color="primary" sx={{ letterSpacing: 1.2 }}>
          Provjera sertifikata
        </Typography>
        <Typography variant="h3" component="h1" sx={{ fontSize: { xs: 28, md: 36 } }}>
          Je li sertifikat pravi?
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Unesi broj sertifikata i prezime osobe na koju glasi. Ako se oba podatka podudaraju,
          prikazaćemo kurs i datum završetka.
        </Typography>
      </Stack>

      <CertificateVerifier
        initialNumber={param(searchParams.broj)}
        initialSurname={param(searchParams.prezime)}
      />
    </Container>
  );
}
