/** Configuration centrale du site (générée par new-site.py). */
export const SITE_URL = "https://mautrechnen.com";
export const SITE_NAMES: Record<string, string> = {"de": "Mautrechnen", "en": "Mautrechnen", "nl": "Mautrechnen"};
export const LANG_TAGS: Record<string, string> = {"de": "de-DE", "en": "en-DE", "nl": "nl-NL"};
export const OG_LOCALES: Record<string, string> = {"de": "de_DE", "en": "en_GB", "nl": "nl_NL"};
export const LOCALE_TAG = 'de-DE';
/** Formatierung der Zahlen je Sprache (RECETTE §4.1) : Deutsch 1.234 €, Englisch €1,234, Niederländisch € 1.234. */
export const LOCALE_BY_LANG: Record<string, string> = { de: 'de-DE', en: 'en-IE', nl: 'nl-NL' };
export const CURRENCY = 'EUR';
export const YEAR = 2026;
/** Année de création du site — signal d'ancienneté (RECETTE §8.0). */
export const SITE_FOUNDED = '2026';
export const LAST_UPDATED = '2026-10-22';
export const AUTHOR_NAME = 'Radif Partners';
export const AUTHOR_ROLE: Record<string, string> = {"de": "Herausgeber eines Rechners für die Kosten einer Urlaubsfahrt mit dem Auto: Vignetten, Streckenmaut, Tunnel und Sprit in jedem Transitland", "en": "Publisher of a calculator for the cost of a holiday drive from Germany: vignettes, motorway tolls, tunnels and fuel in every country crossed", "nl": "Uitgever van een rekenhulp voor de kosten van een vakantierit met de auto: vignetten, tol, tunnels en brandstof in elk doorreisland"};
export const AUTHOR_DESC: Record<string, string> = {"de": "Radif Partners liest die Tarifblätter der Autobahnbetreiber selbst nach, von der ASFINAG über die italienischen Konzessionäre bis zur kroatischen HAC, und legt sie Abschnitt für Abschnitt auf die Strecke. Die Spritpreise jedes Landes kommen aus dem wöchentlichen Oil Bulletin der Europäischen Kommission. Wir verkaufen keine Vignetten und vermitteln nichts.", "en": "Radif Partners reads the operators' own tariff sheets, from ASFINAG to the Italian concession holders and Croatia's HAC, and lays them on the route section by section. Fuel prices for every country come from the European Commission's Weekly Oil Bulletin. We sell no vignettes and pass on no enquiries.", "nl": "Radif Partners leest de tarieflijsten van de wegbeheerders zelf, van ASFINAG tot de Italiaanse concessiehouders en het Kroatische HAC, en legt ze per traject op de route. De brandstofprijzen per land komen uit de wekelijkse Oil Bulletin van de Europese Commissie. Wij verkopen geen vignetten en bemiddelen niet."};
/** Sujets sur lesquels l'editeur est competent (schema.org knowsAbout). Ce sont les
 *  themes reellement traites par le site, pas une liste de mots-cles : un sujet
 *  declare ici sans page qui le couvre est une declaration fausse. */
export const KNOWS_ABOUT: Record<string, string[]> = {"de": ["Vignettenpflicht in Österreich, der Schweiz, Slowenien, Tschechien und Ungarn", "Streckenmaut an Brenner, Tauern, Karawanken und Arlberg", "Autobahngebühren in Frankreich, Italien, Kroatien und Spanien", "Kraftstoffpreise in der Europäischen Union"], "en": ["Vignette rules in Austria, Switzerland, Slovenia, Czechia and Hungary", "Section tolls at the Brenner, Tauern, Karawanken and Arlberg", "Motorway tolls in France, Italy, Croatia and Spain", "Fuel prices across the European Union"], "nl": ["Vignetplicht in Oostenrijk, Zwitserland, Slovenië, Tsjechië en Hongarije", "Trajecttol aan de Brenner, Tauern, Karawanken en Arlberg", "Tol in Frankrijk, Italië, Kroatië en Spanje", "Brandstofprijzen in de Europese Unie"]};
export const CONTACT_EMAIL = "kontakt@mautrechnen.com";
export const THEME_COLOR = '#9F1D20';
export const LOGO_SYMBOL = 'M';
export const BING_VERIFY_CODE = '';
export const GOOGLE_VERIFY_CODE = '';
/** Régime : 'none' pour tous les sites (RECETTE §15.6, décision de l'éditeur du 2026-10-06) :
 *  aucun bandeau ; Clarity chargé en mode sans cookie (consentv2 denied) ; GA4 avec cookies si GA4_ID.
 *  'opt-in' / 'notice' ne servent plus qu'aux sites anciens qui les portent encore. */
export const CONSENT_MODE: 'opt-in' | 'notice' | 'none' = 'none';
/** Propriété Google Analytics 4 (décision de l'éditeur du 2026-10-17, RECETTE §15.6) : GA4 normal,
 *  avec cookies _ga / _ga_<ID> (390 jours), sans bandeau, publicité refusée. Créée par
 *  `seo-platform/scripts/create-ga4.ts accounts/372759688` (RECETTE §15.3, étape 15), puis
 *  pages légales régénérées : `python3 scripts/gen-legal-pages.py .`. Vide = pas de GA4. */
export const GA4_ID = '';
/** Projet Microsoft Clarity (compte amradif), chargé sans cookie. Vide = aucune mesure. */
export const CLARITY_ID = 'z25x8v54wf';
export const INDEXNOW_KEY = 'cb299bbc729067aa98a2eed3f34c984e';

/* ------------------------------------------------------------------------- *
 * IDENTITÉ LÉGALE — À COMPLÉTER AVANT LA MISE EN LIGNE
 * Ces champs alimentent la mention légale du pays, la politique de confidentialité,
 * la page contact et le schema Organization. Un champ vide s'affiche en jaune
 * sur le site. Contrôle : `npm run check:legal`.
 * ------------------------------------------------------------------------- */
export interface LegalHosting { name: string; address: string; phone: string; url: string }
export interface LegalIdentity {
  entityName: string; legalForm: string; street: string; postalCode: string; city: string;
  country: string; phone: string; registerLabel: string; registerNumber: string;
  vatLabel: string; vatNumber: string; jurisdiction: string;
  supervisoryAuthority: string; supervisoryAuthorityUrl: string; hosting: LegalHosting;
}
export const LEGAL: LegalIdentity = {
  entityName: 'Radif Partners',
  legalForm: '',  // vide : publication à titre personnel, pas de société
  street: '49 rue du Ressort',
  postalCode: '63000',
  city: 'Clermont-Ferrand',
  country: "Frankreich / France",
  phone: '',
  registerLabel: "SIREN",
  registerNumber: '',
  vatLabel: "USt-IdNr.",
  vatNumber: '',
  jurisdiction: "France",
  supervisoryAuthority: "Commission nationale de l'informatique et des libertés (CNIL)",
  supervisoryAuthorityUrl: "https://www.cnil.fr",
  hosting: { name: 'GitHub, Inc. (GitHub Pages)', address: '88 Colin P Kelly Jr Street, San Francisco, CA 94107, United States', phone: '', url: 'https://pages.github.com' },
};

/** Champs sans lesquels le site ne doit pas être mis en ligne. */
export const LEGAL_REQUIRED: Array<keyof LegalIdentity> = ['entityName', 'street', 'postalCode', 'city'];  // forme juridique non publiée, comme sur les autres sites du portefeuille

/** Profils publics de l'auteur (schema.org sameAs). Laisser vide si aucun. */
export const AUTHOR_SAME_AS: string[] = [];

/** Rythme de revue éditoriale annoncé sur le site, en mois. */
export const REVIEW_CYCLE_MONTHS = 12;
