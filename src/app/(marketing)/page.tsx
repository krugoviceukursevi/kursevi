import AccountingServices from '@/components/home/AccountingServices';
import ContactBand from '@/components/home/ContactBand';
import HomeHero from '@/components/home/HomeHero';
import LiveCoursesSection from '@/components/home/LiveCoursesSection';
import OnlineCoursesBand from '@/components/home/OnlineCoursesBand';
import ServicesOverview from '@/components/home/ServicesOverview';
import JsonLd from '@/components/seo/JsonLd';
import { LIVE_COURSES } from '@/lib/liveCourses';
import { SITE, SITE_DOMAIN } from '@/lib/siteConfig';
import { absoluteUrl, pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: `${SITE.name} – ${SITE.tagline}`,
  absoluteTitle: true,
  // Opens with the brand: for a search on the name, Google skips a description
  // that does not contain it and quotes the footer instead. Names the town, as
  // people look for a course or an accountant near them.
  description: `${SITE.name}, Bijeljina — kursevi uživo i online, knjigovodstvo, računovodstvene i administrativne usluge, poslovno savjetovanje i iznajmljivanje učionica.`,
  path: '/',
});

/*
 * What the site is. Google uses it for the site name shown beside results. The
 * organisation it points at is rendered on every public page by the marketing
 * layout, so it is referenced here by `@id` rather than repeated.
 */
const SITE_JSON_LD = {
  '@type': 'WebSite',
  '@id': absoluteUrl('/#website'),
  name: SITE.name,
  // Google tries `name` first and falls back to these; without them it may
  // settle on the bare domain as the site name.
  alternateName: [`${SITE.name} – ${SITE.tagline}`, SITE_DOMAIN],
  url: absoluteUrl('/'),
  inLanguage: 'sr-Latn',
  publisher: { '@id': absoluteUrl('/#organization') },
};

/*
 * The live courses as schema.org `Course`s, each with an on-site instance at
 * the centre's address — which is what they are. No `offers`: there are no
 * published prices, and an invented one would be worse than a warning in
 * Search Console.
 */
const COURSES_JSON_LD = {
  '@type': 'ItemList',
  name: 'Kursevi po kategorijama',
  itemListElement: LIVE_COURSES.map((course, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': 'Course',
      name: course.title,
      description: course.description,
      inLanguage: 'sr-Latn',
      provider: { '@id': absoluteUrl('/#organization') },
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: 'Onsite',
        location: { '@type': 'Place', name: SITE.name, address: SITE.company.address },
      },
    },
  })),
};

/**
 * The home page — `/`.
 *
 * ## The centre, not the platform
 *
 * Until the Krugovi rebrand `/` was the online platform's pitch. The client is
 * an education *and services* centre — classroom courses, accounting,
 * administration, consulting, room rental — for which the online platform is
 * one offer among several. So the home page is now the centre's, and the
 * platform's pitch lives on at `/online-kursevi`, linked from here, the header
 * and the footer.
 *
 * This page is the client's own content, which makes it the one part of the
 * public site that is genuinely Krugovi-specific rather than driven by
 * `brand/config.ts`. A future client gets `/online-kursevi` for free; this page
 * is what they would rewrite.
 *
 * ## Language
 *
 * Serbian, ijekavian, formal "vi" — the client's copy, at the client's request
 * (see docs/project-context.md), like the rest of the app.
 *
 * ## Bands
 *
 * Same system as `/online-kursevi` (see `<Section>`): hero, plain, paper,
 * plain, tint, brand. Pick the tone the neighbours do not have when adding one.
 *
 * Static apart from the live-course section's filter and form, which are a
 * Client Component that still renders every course on the server.
 */
export default function HomePage() {
  return (
    <>
      <JsonLd data={SITE_JSON_LD} />
      <JsonLd data={COURSES_JSON_LD} />
      <HomeHero />
      <ServicesOverview />
      <AccountingServices />
      <LiveCoursesSection />
      <OnlineCoursesBand />
      <ContactBand />
    </>
  );
}
