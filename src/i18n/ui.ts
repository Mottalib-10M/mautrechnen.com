import type { Locale } from './routes';
const de = {
  updatedOn: 'Aktualisiert am', editorialPolicy: 'Redaktionelle Grundsätze', contactLabel: 'Kontakt', reviewedBy: 'Geprüft von',
  skipToContent: 'Zum Inhalt', mainNav: 'Hauptnavigation', breadcrumbLabel: 'Brotkrumen', breadcrumbHome: 'Startseite', menuOpen: 'Menü öffnen',
  faqTitle: 'Häufige Fragen', relatedCalculators: 'Verwandte Seiten und Rechner', sourcesTitle: 'Quellen', writtenBy: 'Geschrieben von',
  asOf: 'Tarife', lastUpdated: 'gelesen am', footerValidated: 'Quellen: Tarifblätter der Betreiber, Weekly Oil Bulletin der EU-Kommission', footerBrowser: 'Rechnet in Ihrem Browser · keine Anmeldung, keine E-Mail · kostenlos',
  footerDisclaimer: 'Unabhängige Seite von Radif Partners, ohne Verbindung zur ASFINAG, zum BAZG, zur DARS, zu einem anderen Autobahnbetreiber oder einem Vignettenhändler. Die Preise stammen aus den Tarifblättern der Betreiber, die Spritpreise aus dem Weekly Oil Bulletin der Europäischen Kommission. Die Maut in Italien ist eine Schätzung und als solche gekennzeichnet; Abschnitte ohne verifizierten Preis gehen in keine Summe ein. Maßgeblich ist der Preis an der Mautstelle oder im Shop des Betreibers. Keine Daten gespeichert, keine Vermittlung.', footerPopular: '', notFound: 'Diese Seite gibt es nicht.',
  readMore: 'Weiterlesen',
};
const en: typeof de = {
  updatedOn: 'Updated on', editorialPolicy: 'Editorial policy', contactLabel: 'Contact', reviewedBy: 'Checked by',
  skipToContent: 'Skip to content', mainNav: 'Main navigation', breadcrumbLabel: 'Breadcrumb', breadcrumbHome: 'Home', menuOpen: 'Open menu',
  faqTitle: 'Frequently asked questions', relatedCalculators: 'Related pages and calculators', sourcesTitle: 'Sources', writtenBy: 'Written by',
  asOf: 'Rates', lastUpdated: 'read on', footerValidated: 'Sources: operators’ rate sheets, European Commission Weekly Oil Bulletin', footerBrowser: 'Runs in your browser · no sign-up, no email · free',
  footerDisclaimer: 'Independent site published by Radif Partners, with no link to ASFINAG, the Swiss customs (FOCBS), DARS, any other motorway operator or any vignette reseller. Prices come from the operators’ rate sheets, fuel prices from the European Commission’s Weekly Oil Bulletin. Italian tolls are an indicative estimate and labelled as such; sections without a verified price are left out of every total. The price at the toll plaza or in the operator’s shop is what counts. No data stored, no referrals.', footerPopular: '', notFound: 'This page does not exist.',
  readMore: 'Read more',
};
const nl: typeof de = {
  updatedOn: 'Bijgewerkt op', editorialPolicy: 'Redactiestatuut', contactLabel: 'Contact', reviewedBy: 'Nagekeken door',
  skipToContent: 'Naar de inhoud', mainNav: 'Hoofdnavigatie', breadcrumbLabel: 'Kruimelpad', breadcrumbHome: 'Home', menuOpen: 'Menu openen',
  faqTitle: 'Veelgestelde vragen', relatedCalculators: 'Verwante pagina’s en rekenhulpen', sourcesTitle: 'Bronnen', writtenBy: 'Geschreven door',
  asOf: 'Tarieven', lastUpdated: 'gelezen op', footerValidated: 'Bronnen: tariefbladen van de wegbeheerders, Weekly Oil Bulletin van de Europese Commissie', footerBrowser: 'Rekent in uw browser · geen registratie, geen e-mail · gratis',
  footerDisclaimer: 'Onafhankelijke site van Radif Partners, zonder band met ASFINAG, de Zwitserse douane (BAZG), DARS, een andere wegbeheerder of een vignetverkoper. De prijzen komen uit de tariefbladen van de beheerders, de brandstofprijzen uit de Weekly Oil Bulletin van de Europese Commissie. De tol in Italië is een schatting en zo aangeduid; trajecten zonder geverifieerde prijs tellen in geen enkel totaal mee. Bepalend is de prijs aan de tolpost of in de webwinkel van de beheerder. Geen gegevens bewaard, geen bemiddeling.', footerPopular: '', notFound: 'Deze pagina bestaat niet.',
  readMore: 'Lees verder',
};
export function t(lang: Locale) { return lang === 'en' ? en : lang === 'nl' ? nl : de; }
