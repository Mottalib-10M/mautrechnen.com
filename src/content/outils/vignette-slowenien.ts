import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Vignette Slowenien : E-Vignette der DARS, Klassen 1, 2A und 2B, Karawankentunnel extra. */
function D(h: Helpers) {
  const V = h.P.vignetten.SI;
  const p = (k: '1' | '2A' | '2B') => Object.fromEntries(V.produkte[k].map((x) => [x.id, x.preis])) as Record<string, number>;
  const a = p('2A'), b = p('2B'), m = p('1');
  const ab = h.M.addDays(h.today, 7);
  const lang = h.M.vignette('SI', 'pkw', h.M.fahrtage(ab, 14, true, false));
  const kurz = h.M.vignette('SI', 'pkw', h.M.fahrtage(ab, 6, true, false));
  const camper = h.M.vignette('SI', 'wohnmobil', h.M.fahrtage(ab, 14, true, false));
  const kar = h.P.streckenmaut.karawanken.preis.pkw;
  return { V, a, b, m, ab, lang, kurz, camper, kar };
}
type W = ReturnType<Helpers['M']['vignette']>;
/** Bezeichnung der Wahl (« eine Monatsvignette », « zwei 7-Tages-Vignetten »). */
const wahl = (h: Helpers, v: W) => {
  const ids = v.wahl.map((w) => w.id);
  if (ids.length === 2 && ids.every((x) => x === '7t')) return h.T('zwei 7-Tages-Vignetten', 'two 7-day vignettes', 'twee weekvignetten');
  const n: Record<string, [string, string, string]> = { '7t': ['eine 7-Tages-Vignette', 'one 7-day vignette', 'één weekvignet'], '1m': ['eine Monatsvignette', 'one monthly vignette', 'één maandvignet'], '6m': ['eine Halbjahresvignette', 'one 6-month vignette', 'één halfjaarvignet'], jahr: ['die Jahresvignette', 'the annual vignette', 'het jaarvignet'] };
  return h.T(...(n[ids[0]] ?? n['7t']));
};

export default defineGuide({
  id: 'vignette-slowenien',
  group: 'vignette',
  order: 13,
  tool: 'vignette',
  land: 'SI',
  related: ['karawankentunnel', 'maut-kroatien', 'vignette-oesterreich', 'spritpreise-slowenien', 'maut-nach-kroatien'],
  sources: ['darsVignette', 'darsValidity', 'darsKarawanken'],
  de: {
    slug: 'vignette-slowenien',
    nav: 'Vignette Slowenien',
    card: 'E-Vignette der DARS: Klassen 2A und 2B, Preise 2026, Karawankentunnel extra.',
    title: 'Vignette Slowenien 2026: Klassen 2A, 2B und Preise',
    description: 'Vignette Slowenien 2026: 7 Tage, Monat oder Jahr, Klasse 2A für Pkw, 2B für die meisten Wohnmobile. Was frei ist und warum der Karawankentunnel extra kostet.',
    h1: 'Vignette Slowenien 2026: welche Klasse, welche Laufzeit?',
    intro: 'Slowenien erhebt die Autobahnmaut über die E-Vignette: der Rechner wählt Klasse und Laufzeit für Ihre Fahrtage.',
    resume: (h) => {
      const { a, b, m, lang, kurz, kar } = D(h);
      return `Slowenien erhebt die Autobahnmaut für Fahrzeuge bis 3,5 Tonnen über die E-Vignette der DARS, die an das Kennzeichen gebunden ist. Für den Pkw gilt die Klasse 2A: ${h.eur(a['7t'], 2)} für sieben Tage, ${h.eur(a['1m'], 2)} für einen Monat und ${h.eur(a.jahr, 2)} für ein Jahr. Fahrzeuge, die an der Vorderachse höher als 1,30 Meter sind, also die meisten Wohnmobile und Kastenwagen, fallen in die Klasse 2B und zahlen ${h.eur(b['7t'], 2)}, ${h.eur(b['1m'], 2)} und ${h.eur(b.jahr, 2)}. Motorräder (Klasse 1) zahlen ${h.eur(m['7t'], 2)} für sieben Tage, ${h.eur(m['6m'], 2)} für ein halbes Jahr und ${h.eur(m.jahr, 2)} für ein Jahr. Für eine Durchreise nach Kroatien mit zwei Wochen Urlaub reicht ${wahl(h, lang)} für ${h.eur(lang.summeEur, 2)}; liegen nur sechs Tage zwischen Hin- und Rückfahrt, genügt ${wahl(h, kurz)} für ${h.eur(kurz.summeEur, 2)}. Nicht enthalten ist der Karawankentunnel: Dort zahlt man ${h.eur(kar)} Tunnelmaut je Durchfahrt. Seit dem 1. Januar 2026 sind die Küstenschnellstraßen H5 und H6 vignettenfrei.`;
    },
    faqs: (h) => {
      const { V, b, a } = D(h);
      return [
        { q: 'Woran erkenne ich, ob mein Wohnmobil in Klasse 2A oder 2B fällt?', a: `Maßgeblich ist laut DARS die Höhe des Fahrzeugs über der Vorderachse: bis 1,30 Meter Klasse 2A, darüber Klasse 2B, jeweils bis 3,5 Tonnen. Die meisten Wohnmobile und hohen Kastenwagen liegen darüber und zahlen ${h.eur(b['7t'], 2)} statt ${h.eur(a['7t'], 2)} für sieben Tage. Der Rechner setzt das Wohnmobil vorsichtshalber in Klasse 2B.` },
        { q: 'Braucht ein Wohnwagen in Slowenien eine eigene Vignette?', a: 'Das konnten wir auf den Seiten der DARS nicht verifizieren: Eine ausdrückliche Regel für Anhänger und Wohnwagen haben wir dort nicht gefunden. Der Rechner zählt für das Gespann deshalb nur die Vignette des Zugfahrzeugs in Klasse 2A; dieser Punkt bleibt offen, bis die DARS ihn klar regelt. Prüfen Sie vor der Fahrt beim Kauf im E-Vignetten-Portal, welche Klasse für Ihr Gespann verlangt wird.' },
        { q: 'Wie lange gilt die slowenische Monatsvignette genau?', a: `Die Monatsvignette gilt laut DARS bis zum selben Kalendertag des Folgemonats, die Jahresvignette von Datum zu Datum, also zwölf Monate ab dem ersten Gültigkeitstag und nicht bis Jahresende. Die 7-Tages-Vignette umfasst sieben aufeinanderfolgende Tage. Die Halbjahresvignette gibt es nur für Motorräder. Wer ohne gültige E-Vignette fährt, riskiert eine Geldbuße von ${h.eur(V.strafe.betrag)}.` },
        { q: 'Welche Strecken in Slowenien sind ohne Vignette befahrbar?', a: 'Seit dem 1. Januar 2026 die Küstenschnellstraßen H5 und H6 bei Koper und Portorož. Außerdem die H2 zwischen Pesnica und Tezno bei Maribor sowie die A2 zwischen der österreichischen Grenze und Hrušica, die mit der Tunnelmaut des Karawankentunnels abgegolten ist. Wer nach Kroatien weiterfährt, braucht auf der A1 oder A2 trotzdem eine Vignette.' },
      ];
    },
    body: (h) => {
      const { a, b, m, ab, camper, kar } = D(h);
      const rows = [
        ['7 Tage', h.eur(a['7t'], 2), h.eur(b['7t'], 2), h.eur(m['7t'], 2)],
        ['1 Monat', h.eur(a['1m'], 2), h.eur(b['1m'], 2), '–'],
        ['6 Monate', '–', '–', h.eur(m['6m'], 2)],
        ['1 Jahr', h.eur(a.jahr, 2), h.eur(b.jahr, 2), h.eur(m.jahr, 2)],
      ];
      return `<h2>Preise der E-Vignette</h2>
${h.table(['Laufzeit', 'Klasse 2A (Pkw)', 'Klasse 2B (Wohnmobil)', 'Klasse 1 (Motorrad)'], rows, undefined, ['l', 'r', 'r', 'r'])}
<p>Quelle: ${h.src('darsVignette')}, gelesen am ${h.date(h.P.retrieved_at)}. Die DARS nennt auf dieser Seite kein Datum des Inkrafttretens; Preise für 2027 haben wir nicht gefunden.</p>
<h2>Durchreise nach Kroatien: was der Rechner wählt</h2>
<p>Anders als in Österreich gibt es in Slowenien keine 1-Tages-Vignette. Wer am ${h.date(ab)} durchfährt und zwei Wochen später zurückkommt, kann zwei 7-Tages-Vignetten oder eine Monatsvignette kaufen; bei gleichem Preis nimmt der Rechner die Lösung mit weniger Vignetten. Für ein Wohnmobil der Klasse 2B kostet dieselbe Reise ${h.eur(camper.summeEur, 2)}. Wer länger als einen Monat bleibt oder mehrmals im Jahr fährt, vergleicht mit der Jahresvignette, die von Datum zu Datum gilt (${h.src('darsValidity')}).</p>
<h2>Karawankentunnel: Vignette gilt nicht</h2>
<p>Im Karawankentunnel zwischen Villach und Jesenice gilt die E-Vignette nicht. Die DARS erhebt in Richtung Österreich an der Mautstelle Hrušica eine Tunnelmaut von ${h.eur(kar)} (${h.src('darsKarawanken')}); in der Gegenrichtung kassiert die ASFINAG denselben Betrag. Einzelheiten auf der Seite ${h.a('karawankentunnel', 'Karawankentunnel')}. Wer über Spielfeld und Maribor fährt, umgeht den Tunnel und braucht nur die Vignette.</p>
<h2>Kontrolle und Wohnwagen</h2>
<p>Kontrolliert wird über das Kennzeichen; ohne gültige E-Vignette droht eine Geldbuße. Ob ein Wohnwagen oder Anhänger eine eigene Vignette braucht, haben wir bei der DARS nicht verifiziert: Der Rechner rechnet das Gespann ohne Zuschlag, der Betrag für ein Gespann ist deshalb ein Mindestwert. Für die Weiterfahrt nach Kroatien kommt dort die Maut je Abschnitt hinzu, siehe ${h.a('maut-kroatien', 'Maut Kroatien')}.</p>`;
    },
  },
  en: {
    slug: 'slovenia-vignette',
    nav: 'Slovenia vignette',
    card: 'DARS e-vignette: classes 2A and 2B, 2026 prices, Karawanken tunnel extra.',
    title: 'Slovenian vignette 2026: classes 2A, 2B and prices',
    description: 'Slovenian vignette 2026: 7 days, a month or a year, class 2A for cars, 2B for most motorhomes. Which roads are free and why the Karawanken tunnel costs extra.',
    h1: 'Slovenian vignette 2026: which class, which duration?',
    intro: 'Slovenia charges motorway tolls through the e-vignette: the calculator picks the class and duration for your travel days.',
    resume: (h) => {
      const { a, b, m, lang, kurz, kar } = D(h);
      return `Slovenia charges motorway tolls for vehicles up to 3.5 tonnes through the DARS e-vignette, which is linked to the number plate. Cars fall into class 2A: ${h.eur(a['7t'], 2)} for seven days, ${h.eur(a['1m'], 2)} for a month and ${h.eur(a.jahr, 2)} for a year. Vehicles more than 1.30 metres high at the front axle, which means most motorhomes and panel vans, are class 2B and pay ${h.eur(b['7t'], 2)}, ${h.eur(b['1m'], 2)} and ${h.eur(b.jahr, 2)}. Motorcycles (class 1) pay ${h.eur(m['7t'], 2)} for seven days, ${h.eur(m['6m'], 2)} for six months and ${h.eur(m.jahr, 2)} for a year. For a transit to Croatia with a two-week holiday, ${wahl(h, lang)} at ${h.eur(lang.summeEur, 2)} is enough; with only six days between the drive out and back, ${wahl(h, kurz)} at ${h.eur(kurz.summeEur, 2)} will do. The Karawanken tunnel is not included: it costs a tunnel toll of ${h.eur(kar)} per passage. Since 1 January 2026 the coastal expressways H5 and H6 no longer need a vignette.`;
    },
    faqs: (h) => {
      const { V, b, a } = D(h);
      return [
        { q: 'How do I know whether my motorhome is class 2A or 2B?', a: `According to DARS, what counts is the vehicle’s height above the front axle: up to 1.30 metres is class 2A, above that class 2B, in both cases up to 3.5 tonnes. Most motorhomes and high vans are above the limit and pay ${h.eur(b['7t'], 2)} instead of ${h.eur(a['7t'], 2)} for seven days. The calculator puts motorhomes in class 2B to be safe.` },
        { q: 'Does a caravan need its own vignette in Slovenia?', a: 'We could not verify this on the DARS website: we found no explicit rule there for trailers and caravans. The calculator therefore counts only the towing vehicle’s class 2A vignette for a car with caravan; this point stays open until DARS states a clear rule. Before you travel, check in the e-vignette portal which class is required for your combination when you buy.' },
        { q: 'How long exactly is the Slovenian monthly vignette valid?', a: `According to DARS the monthly vignette runs to the same calendar day of the following month, and the annual vignette from date to date, so twelve months from its first day rather than to the end of the calendar year. The 7-day vignette covers seven consecutive days. The 6-month vignette exists only for motorcycles. Driving without a valid e-vignette risks a fine of ${h.eur(V.strafe.betrag)}.` },
        { q: 'Which Slovenian roads can be used without a vignette?', a: 'Since 1 January 2026 the H5 and H6 coastal expressways near Koper and Portorož. Also the H2 between Pesnica and Tezno near Maribor, and the A2 between the Austrian border and Hrušica, which is covered by the Karawanken tunnel toll. If you carry on to Croatia, you still need a vignette on the A1 or A2.' },
      ];
    },
    body: (h) => {
      const { a, b, m, ab, camper, kar } = D(h);
      const rows = [
        ['7 days', h.eur(a['7t'], 2), h.eur(b['7t'], 2), h.eur(m['7t'], 2)],
        ['1 month', h.eur(a['1m'], 2), h.eur(b['1m'], 2), '–'],
        ['6 months', '–', '–', h.eur(m['6m'], 2)],
        ['1 year', h.eur(a.jahr, 2), h.eur(b.jahr, 2), h.eur(m.jahr, 2)],
      ];
      return `<h2>E-vignette prices</h2>
${h.table(['Duration', 'Class 2A (car)', 'Class 2B (motorhome)', 'Class 1 (motorcycle)'], rows, undefined, ['l', 'r', 'r', 'r'])}
<p>Source: ${h.src('darsVignette')}, read on ${h.date(h.P.retrieved_at)}. DARS gives no start date for these prices on that page, and we found no 2027 prices.</p>
<h2>Transit to Croatia: what the calculator chooses</h2>
<p>Unlike Austria, Slovenia has no 1-day vignette. If you drive through on ${h.date(ab)} and come back two weeks later, you can buy two 7-day vignettes or one monthly vignette; at equal cost the calculator picks the option with fewer vignettes. For a class 2B motorhome the same trip costs ${h.eur(camper.summeEur, 2)}. If you stay longer than a month or travel several times a year, compare with the annual vignette, which runs from date to date (${h.src('darsValidity')}).</p>
<h2>Karawanken tunnel: the vignette does not apply</h2>
<p>The e-vignette is not valid in the Karawanken tunnel between Villach and Jesenice. Towards Austria, DARS collects a tunnel toll of ${h.eur(kar)} at the Hrušica toll plaza (${h.src('darsKarawanken')}); in the other direction ASFINAG charges the same amount. Details are on the ${h.a('karawankentunnel', 'Karawanken tunnel')} page. Driving via Spielfeld and Maribor avoids the tunnel, and then only the vignette is needed.</p>
<h2>Checks and caravans</h2>
<p>Checks are made on the number plate; driving without a valid e-vignette can lead to a fine. Whether a caravan or trailer needs its own vignette is not verified with DARS: the calculator adds nothing for it, so its figure for a car with caravan is a minimum. If you continue into Croatia, tolls per section are charged there; see ${h.a('maut-kroatien', 'Croatian tolls')}.</p>`;
    },
  },
  nl: {
    slug: 'vignet-slovenie',
    nav: 'Vignet Slovenië',
    card: 'E-vignet van DARS: klassen 2A en 2B, prijzen 2026, Karawankentunnel apart.',
    title: 'Vignet Slovenië 2026: klasse 2A, 2B en alle prijzen',
    description: 'Vignet Slovenië 2026: week, maand of jaar, klasse 2A voor de auto, 2B voor de meeste campers. Welke wegen vrij zijn en waarom de Karawankentunnel extra kost.',
    h1: 'Vignet Slovenië 2026: welke klasse, welke duur?',
    intro: 'Slovenië heft de snelwegtol via het e-vignet: de rekenhulp kiest klasse en duur voor uw rijdagen.',
    resume: (h) => {
      const { a, b, m, lang, kurz, kar } = D(h);
      return `Slovenië heft de snelwegtol voor voertuigen tot 3,5 ton via het e-vignet van DARS, dat aan de nummerplaat gekoppeld is. Voor de auto geldt klasse 2A: ${h.eur(a['7t'], 2)} voor zeven dagen, ${h.eur(a['1m'], 2)} voor een maand en ${h.eur(a.jahr, 2)} voor een jaar. Voertuigen die boven de vooras hoger zijn dan 1,30 meter, dus de meeste campers en bestelbussen, vallen in klasse 2B en betalen ${h.eur(b['7t'], 2)}, ${h.eur(b['1m'], 2)} en ${h.eur(b.jahr, 2)}. Motoren (klasse 1) betalen ${h.eur(m['7t'], 2)} voor zeven dagen, ${h.eur(m['6m'], 2)} voor een half jaar en ${h.eur(m.jahr, 2)} voor een jaar. Voor een doorreis naar Kroatië met twee weken vakantie volstaat ${wahl(h, lang)} voor ${h.eur(lang.summeEur, 2)}; liggen er maar zes dagen tussen heen- en terugreis, dan is ${wahl(h, kurz)} van ${h.eur(kurz.summeEur, 2)} genoeg. Niet inbegrepen is de Karawankentunnel: daar betaalt u ${h.eur(kar)} tunneltol per doorrit. Sinds 1 januari 2026 zijn de kustwegen H5 en H6 vignetvrij.`;
    },
    faqs: (h) => {
      const { V, b, a } = D(h);
      return [
        { q: 'Hoe weet ik of mijn camper in klasse 2A of 2B valt?', a: `Volgens DARS telt de hoogte van het voertuig boven de vooras: tot 1,30 meter is het klasse 2A, daarboven klasse 2B, telkens tot 3,5 ton. De meeste campers en hoge bestelbussen zitten daarboven en betalen ${h.eur(b['7t'], 2)} in plaats van ${h.eur(a['7t'], 2)} voor zeven dagen. De rekenhulp zet een camper voor de zekerheid in klasse 2B.` },
        { q: 'Heeft een caravan in Slovenië een eigen vignet nodig?', a: 'Dat konden wij op de website van DARS niet verifiëren: een uitdrukkelijke regel voor aanhangers en caravans vonden we daar niet. De rekenhulp telt voor een auto met caravan daarom alleen het vignet van de trekkende auto in klasse 2A; dit punt blijft open tot DARS er een duidelijke regel over geeft. Kijk vóór vertrek bij de aankoop in het e-vignetportaal welke klasse voor uw combinatie gevraagd wordt.' },
        { q: 'Hoe lang geldt het Sloveense maandvignet precies?', a: `Volgens DARS loopt het maandvignet tot dezelfde kalenderdag van de volgende maand, en het jaarvignet van datum tot datum, dus twaalf maanden vanaf de eerste dag en niet tot het einde van het kalenderjaar. Het weekvignet dekt zeven opeenvolgende dagen. Het halfjaarvignet bestaat alleen voor motoren. Wie zonder geldig e-vignet rijdt, riskeert een boete van ${h.eur(V.strafe.betrag)}.` },
        { q: 'Welke Sloveense wegen mag je zonder vignet gebruiken?', a: 'Sinds 1 januari 2026 de kustwegen H5 en H6 bij Koper en Portorož. Daarnaast de H2 tussen Pesnica en Tezno bij Maribor, en de A2 tussen de Oostenrijkse grens en Hrušica, die onder de tunneltol van de Karawankentunnel valt. Wie doorrijdt naar Kroatië, heeft op de A1 of A2 toch een vignet nodig.' },
      ];
    },
    body: (h) => {
      const { a, b, m, ab, camper, kar } = D(h);
      const rows = [
        ['7 dagen', h.eur(a['7t'], 2), h.eur(b['7t'], 2), h.eur(m['7t'], 2)],
        ['1 maand', h.eur(a['1m'], 2), h.eur(b['1m'], 2), '–'],
        ['6 maanden', '–', '–', h.eur(m['6m'], 2)],
        ['1 jaar', h.eur(a.jahr, 2), h.eur(b.jahr, 2), h.eur(m.jahr, 2)],
      ];
      return `<h2>Prijzen van het e-vignet</h2>
${h.table(['Duur', 'Klasse 2A (auto)', 'Klasse 2B (camper)', 'Klasse 1 (motor)'], rows, undefined, ['l', 'r', 'r', 'r'])}
<p>Bron: ${h.src('darsVignette')}, gelezen op ${h.date(h.P.retrieved_at)}. DARS vermeldt op die pagina geen ingangsdatum, en prijzen voor 2027 vonden we niet.</p>
<h2>Doorreis naar Kroatië: wat de rekenhulp kiest</h2>
<p>Anders dan Oostenrijk heeft Slovenië geen dagvignet. Wie op ${h.date(ab)} doorrijdt en twee weken later terugkomt, kan twee weekvignetten of één maandvignet kopen; bij gelijke prijs kiest de rekenhulp de oplossing met minder vignetten. Voor een camper in klasse 2B kost dezelfde reis ${h.eur(camper.summeEur, 2)}. Wie langer dan een maand blijft of meerdere keren per jaar rijdt, vergelijkt met het jaarvignet, dat van datum tot datum geldt (${h.src('darsValidity')}).</p>
<h2>Karawankentunnel: het vignet geldt niet</h2>
<p>In de Karawankentunnel tussen Villach en Jesenice is het e-vignet niet geldig. Richting Oostenrijk int DARS bij de tolpost Hrušica een tunneltol van ${h.eur(kar)} (${h.src('darsKarawanken')}); in de andere richting rekent ASFINAG hetzelfde bedrag. Meer op de pagina ${h.a('karawankentunnel', 'Karawankentunnel')}. Wie via Spielfeld en Maribor rijdt, vermijdt de tunnel en heeft alleen het vignet nodig.</p>
<h2>Controle en caravan</h2>
<p>De controle gebeurt op de nummerplaat; zonder geldig e-vignet volgt een boete. Of een caravan of aanhanger een eigen vignet nodig heeft, is bij DARS niet geverifieerd: de rekenhulp rekent er niets voor, het bedrag voor een auto met caravan is dus een minimum. Wie doorrijdt naar Kroatië, betaalt daar tol per traject; zie ${h.a('maut-kroatien', 'tol Kroatië')}.</p>`;
    },
  },
});
