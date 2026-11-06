/**
 * The courses taught **live, in a classroom** — the "Kursevi po kategorijama"
 * section of the home page and the application form beneath it.
 *
 * ## Not the platform's courses
 *
 * These are not rows in `courses`. Those are the *online* courses: modules,
 * quizzes, purchases, a certificate issued by the app. A live course has none
 * of that — a person applies, the centre gets an email, and everything after
 * happens offline. So there is nothing to store and no table to put it in; a
 * typed list is the honest representation, the same call the blog made before
 * it had an editor.
 *
 * If live courses ever need to be edited by an admin without a deploy, this is
 * what becomes a table (and the route's `z.enum` becomes a lookup).
 *
 * ## Shared by three readers
 *
 * The cards, the form's course picker, and `POST /api/contact/course-application`
 * — which accepts only an `id` from this list and writes the *title* into the
 * email itself. A visitor therefore cannot put arbitrary text into the subject
 * line of a message the centre receives.
 *
 * Plain data, no imports, so the API route can use it without pulling in UI.
 * Copy is Serbian (ijekavian), addressed formally ("vi") — the client's own
 * wording, see docs/project-context.md.
 */

export type LiveCourseCategory = {
  id: string;
  name: string;
};

export type LiveCourse = {
  /** Stable, URL-safe. Sent by the form; never shown. */
  id: string;
  title: string;
  categoryId: LiveCourseCategory['id'];
  description: string;
  /**
   * Duration and rhythm, as the description states them — never inferred.
   * Empty when the client gave none.
   */
  facts: string[];
};

export const LIVE_COURSE_CATEGORIES = [
  { id: 'racunovodstvo', name: 'Računovodstvo' },
  { id: 'softver', name: 'Softverske vještine' },
  { id: 'projekti', name: 'Projekti i EU fondovi' },
  { id: 'dizajn-web', name: 'Dizajn i web razvoj' },
  { id: 'pregovaranje', name: 'Pregovaranje i planiranje' },
] as const satisfies readonly LiveCourseCategory[];

export const LIVE_COURSES = [
  {
    id: 'knjigovodstvo-1',
    title: 'Kurs knjigovodstva nivo 1',
    categoryId: 'racunovodstvo',
    description:
      'Kurs obuhvata osnove knjigovodstva, zakonski okvir, evidenciju poslovanja, obračun zarada, upravljanje kupcima i dobavljačima, te ostale ključne aspekte finansijskog knjigovodstva. Nudi se kroz pet sedmica, s tri nastave sedmično, pružajući sveobuhvatno znanje kroz ukupno 35 časova.',
    facts: ['5 sedmica', '3 nastave sedmično', '35 časova'],
  },
  {
    id: 'knjigovodstvo-2',
    title: 'Kurs knjigovodstva nivo 2',
    categoryId: 'racunovodstvo',
    description:
      'Kroz pet sedmica, kurs obuhvata rad u knjigovodstvenom programu, zaključna knjiženja, izvještaje, poreske prijave, amortizaciju, godišnji popis, završni račun i analizu finansijskih izvještaja. Ukupno trajanje je 35 časova, s tri časa sedmično.',
    facts: ['5 sedmica', '3 časa sedmično', '35 časova'],
  },
  {
    id: 'preduzetnici',
    title: 'Kurs za preduzetnike i vođenje poslovnih knjiga preduzetnika',
    categoryId: 'racunovodstvo',
    description:
      'Tokom četiri sedmice, kurs obuhvata ključne aspekte poslovanja, uključujući početak rada, vođenje izvoda, blagajničko poslovanje, evidenciju radnika, knjigovodstvo malih i velikih preduzetnika, kao i poreske prijave. Ukupno trajanje je 20 časova, s dva časa sedmično.',
    facts: ['4 sedmice', '2 časa sedmično', '20 časova'],
  },
  {
    id: 'excel-osnovni',
    title: 'MS Excel – osnovni nivo',
    categoryId: 'softver',
    description:
      'Sadržaj kursa obuhvata osnove korišćenja aplikacije, manipulaciju ćelijama, uređivanje podataka, pretragu, sortiranje, upravljanje radnim listovima, korišćenje formula i funkcija, rad s brojevima i datumima, formatiranje prikaza, izradu grafikona, kao i generisanje izvještaja i štampanje. Kroz 16 časova, s dva časa dvaput nedjeljno, stičete temeljno razumijevanje Excela i efikasno korišćenje alata za rad s podacima.',
    facts: ['16 časova', '2 časa dvaput nedjeljno'],
  },
  {
    id: 'excel-napredni',
    title: 'MS Excel – napredni nivo',
    categoryId: 'softver',
    description:
      'Sadržaj kursa obuhvata napredne tehnike rada u programu Excel, uključujući podjelu prozora, rad s više dokumenata, zamrzavanje redova i kolona, štampanje zaglavlja, adresiranje ćelija, davanje imena opsezima, grupisanje, validaciju, uslovno formatiranje, prilagođene liste, razdvajanje složenih podataka, konsolidaciju, međuzbirove i slično. Kurs sadrži 12 časova, s dva časa dvaput nedjeljno.',
    facts: ['12 časova', '2 časa dvaput nedjeljno'],
  },
  {
    id: 'eu-projekti',
    title: 'Obuka za pisanje projekata prema fondovima EU i drugim međunarodnim donatorima',
    categoryId: 'projekti',
    description:
      'Obuka za pisanje projekata pruža praktično iskustvo u analizi ključnih aktera, razvoju logičke matrice i planiranju budžeta. Namijenjena je studentima, konsultantima, računovođama i nezaposlenima, i podržava sticanje znanja za pisanje prijedloga projekata korisnih u zapošljavanju ili pružanju usluga preduzećima.',
    facts: [],
  },
  {
    id: 'ui-ux',
    title: 'UI / UX dizajn',
    categoryId: 'dizajn-web',
    description:
      'Ovaj kurs pruža osnove principa dizajna i korisničkog iskustva (UX) kroz praktičnu primjenu alata poput Figme, uz fokus na kreiranje intuitivnih i privlačnih korisničkih interfejsa.',
    facts: [],
  },
  {
    id: 'wordpress',
    title: 'Web dizajn i WordPress',
    categoryId: 'dizajn-web',
    description:
      'Uvod u osnove web tehnologija kroz praktičnu upotrebu WordPress platforme za izradu web stranica. Kurs pokriva osnovne koncepte HTML-a, CSS-a i JavaScript-a, kao i njihovu primjenu u izradi responzivnih i funkcionalnih web sajtova.',
    facts: [],
  },
  {
    id: 'react',
    title: 'React frontend kurs',
    categoryId: 'dizajn-web',
    description:
      'Detaljno upoznavanje s React-om, jednim od najpopularnijih JavaScript okvira za izradu korisničkih interfejsa. Kroz praktične projekte, polaznici će savladati koncepte komponenti, stanja, rute i mnoge druge napredne tehnike koje su ključne za izgradnju modernih web aplikacija.',
    facts: [],
  },
  {
    id: 'medjunarodno-pregovaranje',
    title: 'Međunarodno poslovno pregovaranje',
    categoryId: 'pregovaranje',
    description:
      'Međunarodni pregovori zahtijevaju pažljivu pripremu, obuhvatajući organizacione aspekte, strategije i faze pregovaranja. Pregovarači se suočavaju s preprekama pri sklapanju poslova, uz uticaj kulturnih razlika. Timski rad, kontrolne liste i profili uspješnih pregovarača čine praktične alate.',
    facts: [],
  },
  {
    id: 'poslovno-planiranje',
    title: 'Poslovno planiranje',
    categoryId: 'pregovaranje',
    description:
      'Biznis plan je ključan za pokretanje i vođenje poslovanja. Obuka za studente, nezaposlene i preduzetnike pruža znanja o njegovoj strukturi i izradi, koristeći konkretne primjere. Polaznici se bave definisanjem poslovne ideje, analizom tržišta, marketingom i finansijskom analizom. Obuka traje tri sedmice, dva puta nedjeljno, a uključuje sertifikat, priručnik, popuste na dalje obuke i informacije o finansiranju.',
    facts: ['3 sedmice', 'dva puta nedjeljno', 'sertifikat'],
  },
  {
    id: 'poslovno-pregovaranje',
    title: 'Poslovno pregovaranje',
    categoryId: 'pregovaranje',
    description:
      'Poslovno pregovaranje, ključan poslovni proces, obuhvata elemente, faze, strategije i taktike pregovaranja. Teme uključuju tipove pregovarača, upravljanje odnosima, etičnost, prepreke, neverbalnu komunikaciju te bonton. Posebna pažnja posvećena je pregovaranju u timskom okruženju.',
    facts: [],
  },
] as const satisfies readonly LiveCourse[];

export type LiveCourseId = (typeof LIVE_COURSES)[number]['id'];

/** Every id, as a non-empty tuple — what `z.enum` needs. */
export const LIVE_COURSE_IDS = LIVE_COURSES.map((course) => course.id) as [
  LiveCourseId,
  ...LiveCourseId[],
];

export function findLiveCourse(id: string): LiveCourse | undefined {
  return LIVE_COURSES.find((course) => course.id === id);
}

export function liveCourseCategoryName(id: string): string {
  return LIVE_COURSE_CATEGORIES.find((category) => category.id === id)?.name ?? '';
}
