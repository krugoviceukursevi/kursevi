/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE CLIENT CONFIG — everything that makes this site one client's site.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Setting the platform up for a new client means editing this file, replacing
 * the two images beside it, running `npm run brand`, and filling in the
 * environment variables. The full checklist (accounts, keys, DNS) is
 * `docs/guides/new-client-setup.md`.
 *
 *   brand/config.ts   ← this file: name, domain, colours, contact, company
 *   brand/logo.svg    ← the logo mark (no text), any aspect ratio
 *   brand/hero.jpg    ← the landing page photo, landscape, ≥ 1600 px wide
 *   brand/og-image.jpg  (optional) a designed 1200×630 share image; without it
 *                       one is generated from the logo, name and colours
 *
 * After changing the logo, the photo, the name, the tagline or the colours, run
 *
 *   npm run brand
 *
 * and commit what it writes. It derives the favicon, app icons, email logo,
 * share image, certificate mark and the Supabase email template from this
 * folder, so none of those is ever edited by hand.
 *
 * ## What belongs here, and what does not
 *
 * The test: **is it public and the same in every environment?** Then it is
 * here. If it is secret, or differs between local / preview / production, it
 * is an environment variable (`.env.example`).
 *
 * Also not here, because an admin must be able to change them without a
 * deploy — they live in the database and are edited in the admin panel:
 * - payment details (`/admin/settings/payment`);
 * - terms and privacy policy (`/admin/settings/legal`) — these quote the
 *   values below through `{{…}}` placeholders, so they follow this file;
 * - course categories, courses, blog posts.
 *
 * Section copy (hero, FAQ answers…) stays in `src/components/landing/`; this
 * file holds the *facts* that copy quotes.
 */
import type { BrandConfig } from '../src/lib/brand/types';

/**
 * Hours within which a submitted task gets feedback. A constant because it can
 * be quoted twice below: the service promise and, optionally, a stat.
 */
const REVIEW_HOURS = 48;

export const BRAND: BrandConfig = {
  // TODO(krugovi): placeholder until the client's domain exists. It is the
  // canonical origin for SEO (sitemap, canonical links, share cards) on a
  // production build without NEXT_PUBLIC_SITE_URL, so it must be real before
  // the site goes live.
  url: 'https://www.krugovi.ba',
  name: 'Krugovi',
  shortName: 'Krugovi',
  tagline: 'centar za edukaciju i usluge',
  description:
    'Kursevi, administrativne usluge, računovodstvo i poslovno savjetovanje na jednom mjestu.',

  /*
   * The brand yellow (#fac64f) is too pale to be read as text on white
   * (1.6:1), so it is the `brand` fill — buttons, bands, the logo — and
   * `primary.light` is a deep gold of the same hue that carries text (5.2:1).
   * On the dark scheme the yellow itself reads fine (12:1), so both are the
   * same there. Navy is the counterweight: the admin tint, accents.
   */
  colors: {
    brand: { light: '#fac64f', dark: '#fac64f' },
    primary: { light: '#946200', dark: '#fac64f' },
    secondary: { light: '#264a7d', dark: '#86a8e0' },
  },

  hero: {
    alt: 'Apstraktna kompozicija žutih i bijelih krugova',
  },

  contact: {
    email: 'krugovi.ceu@gmail.com',
    phone: { display: '+387 65 947 229', tel: '+38765947229' },
    // TODO(krugovi): carried over from the previous client — confirm.
    hours: 'Ponedjeljak – petak, 09:00 – 17:00',
  },

  service: {
    // TODO(krugovi): carried over from the previous client — confirm.
    replyTime: 'u toku istog dana',
    reviewHours: REVIEW_HOURS,
  },

  /*
   * Entries with `live` are floors: the real count from the database replaces
   * them once it is higher. Invented figures are worse than none — use `[]`
   * until the client has real ones.
   */
  stats: [],

  /* Fill in the profile URLs once they exist; empty ones are hidden. */
  social: [
    { label: 'Instagram', href: '' },
    { label: 'LinkedIn', href: '' },
    { label: 'Facebook', href: '' },
  ],

  /* Must match the controller named in the privacy policy and the terms. */
  company: {
    // TODO(krugovi): the registered name of the legal entity (as on the JIB
    // certificate) — it is the data controller in the privacy policy.
    legalName: 'Krugovi',
    address: 'Miloša Obilića 78, 76300 Bijeljina',
    idNumber: '',
  },
};
