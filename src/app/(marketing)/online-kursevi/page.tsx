import Hero from '@/components/landing/Hero';
import StatsBar from '@/components/landing/StatsBar';
import FeaturedCourses from '@/components/landing/FeaturedCourses';
import HowItWorks from '@/components/landing/HowItWorks';
import WhyUs from '@/components/landing/WhyUs';
import Faq from '@/components/landing/Faq';
import CtaBanner from '@/components/landing/CtaBanner';
import { SITE } from '@/lib/siteConfig';
import { pageMetadata } from '@/lib/seo';

/*
 * `<StatsBar>` and `<FeaturedCourses>` read from the database. Without this the
 * page is prerendered once at build and both would freeze at deploy time.
 */
export const revalidate = 3600;

export const metadata = pageMetadata({
  title: 'Online kursevi',
  // Opens with the brand: for a search on the name, Google skips a description
  // that does not contain it and quotes the footer instead.
  description: `${SITE.name} online kursevi — video lekcije, materijali i zadaci koje pregleda predavač. Učite svojim tempom i dobijte sertifikat po završetku.`,
  path: '/online-kursevi',
});

/**
 * The online-learning platform's landing page — `/online-kursevi`.
 *
 * ## It used to be `/`
 *
 * This was the home page while the site *was* the platform. The client's site
 * is now a whole education and services centre (courses in a classroom,
 * accounting, consulting, room rental — see `(marketing)/page.tsx`), and the
 * online platform is one of the things it offers, so its pitch moved here and
 * the home page links to it. Nothing about the sections changed; only the
 * address did. `/#kako-funkcionise` links therefore point at
 * `/online-kursevi#kako-funkcionise` now.
 *
 * The `WebSite` structured data stayed on `/` — it describes the site, not this
 * page.
 *
 * ## The sections are bands, not a column
 *
 * Every section is a full-width `<Section>` with a surface of its own, and the
 * tones alternate — plain, tint, paper, plain, paper, plain, brand. That
 * alternation is what gives the page a vertical rhythm; there are no dividers
 * between sections, because the edge of a band already separates it from the
 * next one. Add a section in the middle and pick the tone its neighbours do not
 * have.
 *
 * A Server Component: apart from `<FeaturedCourses>`, which needs a query, and
 * the reveal-on-scroll wrappers inside each section, the page is static and
 * fully crawlable.
 */
export default function OnlineCoursesLandingPage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <FeaturedCourses />
      <HowItWorks />
      <WhyUs />
      <Faq />
      <CtaBanner />
    </>
  );
}
