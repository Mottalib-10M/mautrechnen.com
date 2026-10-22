import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Vignette Ungarn : E-Matrica D1 und D1M, Anhänger in D1 enthalten, Jahresvignette bis 31. Januar. */
function D(h: Helpers) {
  const V = h.P.vignetten.HU;
  const d1 = Object.fromEntries(V.produkte.D1.map((p) => [p.id, p.preis])) as Record<string, number>;
  const m = Object.fromEntries(V.produkte.D1M.map((p) => [p.id, p.preis])) as Record<string, number>;
  const e = (n: number) => h.M.inEuro(n, 'HUF');
  const ab = h.M.addDays(h.today, 7);
  const lang = h.M.vignette('HU', 'pkw', h.M.fahrtage(ab, 14, true, false));
  const kurz = h.M.vignette('HU', 'pkw', h.M.fahrtage(ab, 7, true, false));
  const urlaub = h.M.vignette('HU', 'gespann', h.M.fahrtage(ab, 14, true, true));
  const jahr = V.produkte.D1.find((p) => p.id === 'jahr') as { von?: string; bis?: string };
  return { V, d1, m, e, ab, lang, kurz, urlaub, jahrBis: jahr.bis ?? '', stand: h.M.KURSE.stand, strafe: V.strafe.betrag };
}
type W = ReturnType<Helpers['M']['vignette']>;
const wahl = (h: Helpers, v: W) => {
  const ids = v.wahl.map((w) => w.id);
  if (ids.length === 2 && ids.every((x) => x === '1t')) return h.T('zwei Tagesvignetten', 'two daily vignettes', 'twee dagvignetten');
  const n: Record<string, [string, string, string]> = { '1t': ['eine Tagesvignette', 'one daily vignette', 'één dagvignet'], '10t': ['eine 10-Tages-Vignette', 'one 10-day vignette', 'één 10-dagenvignet'], '1m': ['eine Monatsvignette', 'one monthly vignette', 'één maandvignet'], jahr: ['die Jahresvignette', 'the annual vignette', 'het jaarvignet'] };
  return h.T(...(n[ids[0]] ?? n['1t']));
};

export default defineGuide({
  id: 'vignette-ungarn',
  group: 'vignette',
  order: 15,
  tool: 'vignette',
  land: 'HU',
  related: ['vignette-tschechien', 'vignette-oesterreich', 'vignette-slowenien', 'maut-kroatien', 'digitale-vignette'],
  sources: ['nemzetiutdij', 'ezb'],
  de: {
    slug: 'vignette-ungarn',
    nav: 'Vignette Ungarn',
    card: 'E-Matrica 2026: Klasse D1 mit Anhänger, D1M für Motorräder, Preise in Forint und Euro.',
    title: 'Vignette Ungarn 2026: E-Matrica D1, Preise in Euro',
    description: 'Vignette Ungarn 2026: E-Matrica D1 für Pkw samt Wohnwagen, D1M fürs Motorrad, Preise in Forint und Euro. Mit 60-Minuten-Regel und Zuschlag ohne Vignette.',
    h1: 'Vignette Ungarn 2026: E-Matrica für Pkw und Gespann',
    intro: 'Die ungarische E-Matrica gibt es für einen Tag, zehn Tage, einen Monat oder das Jahr: der Rechner wählt die günstigste für Ihre Fahrtage.',
    resume: (h) => {
      const { d1, m, e, lang, kurz, stand, jahrBis } = D(h);
      return `In Ungarn heißt die Autobahnvignette E-Matrica; sie ist elektronisch und an das Kennzeichen gebunden. Für Pkw bis 3,5 Tonnen mit höchstens sieben Insassen gilt die Klasse D1: ${h.geld(d1['1t'], 'HUF')} für einen Tag, ${h.geld(d1['10t'], 'HUF')} für zehn Tage, ${h.geld(d1['1m'], 'HUF')} für einen Monat und ${h.geld(d1.jahr, 'HUF')} für das Jahr, das bis zum ${h.date(jahrBis)} reicht. Zum EZB-Kurs vom ${h.date(stand)} sind das etwa ${h.eur(e(d1['1t']), 2)}, ${h.eur(e(d1['10t']), 2)}, ${h.eur(e(d1['1m']), 2)} und ${h.eur(e(d1.jahr), 2)}. Der Anhänger eines D1-Fahrzeugs ist in der Vignette enthalten, ein Wohnwagen kostet also nichts extra. Motorräder fahren in der Klasse D1M für ${h.geld(m['1t'], 'HUF')} am Tag oder ${h.geld(m['10t'], 'HUF')} für zehn Tage. Für die Durchreise nach Kroatien oder Rumänien mit zwei Wochen Urlaub reichen ${wahl(h, lang)} für ${h.geld(lang.summe, 'HUF')}; bei sieben Tagen ist ${wahl(h, kurz)} für ${h.geld(kurz.summe, 'HUF')} günstiger. Wer versehentlich ohne Vignette auf die Autobahn fährt, hat 60 Minuten Zeit, sie nachzukaufen.`;
    },
    faqs: (h) => {
      const { strafe, d1 } = D(h);
      return [
        { q: 'Was tun, wenn ich in Ungarn ohne E-Matrica auf die Autobahn gefahren bin?', a: `Der Betreiber räumt eine Frist von höchstens 60 Minuten ein: In dieser Zeit nach der Auffahrt auf das mautpflichtige Netz können Sie die E-Matrica noch kaufen. Danach wird ein Zuschlag fällig, der Grundzuschlag beträgt ${h.geld(strafe, 'HUF')} bei Zahlung innerhalb von 60 Tagen. Wer später zahlt, muss mit einem deutlich höheren Zuschlag rechnen. Am einfachsten ist der Kauf vor der Grenze.` },
        { q: 'Braucht mein Wohnwagen in Ungarn eine zweite E-Matrica?', a: `Nein, solange das Zugfahrzeug in der Klasse D1 fährt: Die Kategorie umfasst laut Tarifblatt den Pkw und den von ihm gezogenen Anhänger. Eine Tagesvignette für ${h.geld(d1['1t'], 'HUF')} deckt also das ganze Gespann. Eine eigene Anhängerklasse U gibt es nur für Anhänger hinter Fahrzeugen der Klasse D2, etwa Kleinbussen oder leichten Lieferwagen.` },
        { q: 'Bis wann gilt die ungarische Jahresvignette 2026?', a: 'Die landesweite Jahresvignette gilt nicht 365 Tage ab Kauf, sondern für das Kalenderjahr und zusätzlich bis zum 31. Januar des Folgejahres. Wer sie im Herbst kauft, bekommt deshalb nur wenige Monate. Für eine einzelne Urlaubsreise ist sie fast nie die beste Wahl. Daneben verkauft Ungarn Jahresvignetten für einzelne Komitate, die nur auf bestimmten Abschnitten gelten.' },
        { q: 'Fällt ein Wohnmobil in Ungarn in die Klasse D1 oder D2?', a: 'Das entscheidet die Zulassungsbescheinigung: Ist das Wohnmobil als Personenkraftwagen (Klasse M1) eingetragen und hat es höchstens sieben Sitzplätze, gilt D1. Ist es als Nutzfahrzeug (N1) eingetragen, gilt die teurere Klasse D2. Der Betreiber bietet dafür eine Auswahlhilfe an. Der Rechner setzt das Wohnmobil in D1, prüfen Sie also Feld J Ihrer Papiere.' },
      ];
    },
    body: (h) => {
      const { d1, m, ab, urlaub, stand } = D(h);
      const rows = [
        ['1 Tag', h.geld(d1['1t'], 'HUF'), h.geld(m['1t'], 'HUF')],
        ['10 Tage', h.geld(d1['10t'], 'HUF'), h.geld(m['10t'], 'HUF')],
        ['1 Monat', h.geld(d1['1m'], 'HUF'), h.geld(m['1m'], 'HUF')],
        ['Jahr (landesweit)', h.geld(d1.jahr, 'HUF'), h.geld(m.jahr, 'HUF')],
      ];
      return `<h2>Preise der E-Matrica ab dem 1. Januar 2026</h2>
${h.table(['Laufzeit', 'D1 (Pkw, auch mit Anhänger)', 'D1M (Motorrad)'], rows, 'Bruttopreise in Forint, Mehrwertsteuer enthalten', ['l', 'r', 'r'])}
<p>Quelle: ${h.src('nemzetiutdij')}, gelesen am ${h.date(h.P.retrieved_at)}. Die Jahresvignetten kaufen Motorradfahrer als D1-Produkt, deshalb ist der Preis gleich. Preise für 2027 sind noch nicht veröffentlicht. Die Umrechnung in Euro im Rechner folgt dem EZB-Kurs vom ${h.date(stand)} (${h.src('ezb')}).</p>
<h2>Wie lange die einzelnen Vignetten gelten</h2>
<p>Die Tagesvignette gilt bis Mitternacht des gewählten Tages. Die Vignette für zehn Tage, auf Ungarisch „heti“ (Woche) genannt, umfasst den ersten Tag und die neun folgenden. Die Monatsvignette läuft bis zum selben Kalendertag des Folgemonats, die Jahresvignette bis zum 31. Januar des nächsten Jahres. Wer am ${h.date(ab)} einreist und zwei Wochen bleibt, dabei aber jeden Tag Autobahn fährt, zahlt mit Wohnwagen ${h.geld(urlaub.summe, 'HUF')}: Der Rechner nimmt dann die Monatsvignette, wenn sie billiger ist als die Summe kürzerer Vignetten.</p>
<h2>Strecken ohne Vignette</h2>
<p>Einige Abschnitte sind mautfrei, darunter die M4 zwischen Vecsés und dem Flughafen Budapest, die M4 zwischen Törökszentmiklós und Kisújszállás, die Südwestumfahrung von Pécs auf der M60, die M8 und die M80 sowie Teile der M9. Für die Hauptrouten der Urlauber, die M1 von Hegyeshalom nach Budapest und die M7 zum Plattensee und weiter nach Kroatien, braucht man die Vignette.</p>
<h2>Durchreise und Nachbarländer</h2>
<p>Wer über Ungarn nach Kroatien fährt, zahlt dort danach Maut je Abschnitt, siehe ${h.a('maut-kroatien', 'Maut Kroatien')}. Kommt man aus Deutschland über Österreich, braucht man zusätzlich die ${h.a('vignette-oesterreich', 'österreichische Vignette')}, über Tschechien die ${h.a('vignette-tschechien', 'tschechische')}. In allen drei Ländern ist der Wohnwagen frei, anders als in der Schweiz.</p>`;
    },
  },
  en: {
    slug: 'hungary-vignette',
    nav: 'Hungary vignette',
    card: 'E-matrica 2026: class D1 with trailer, D1M for motorcycles, prices in forint and euros.',
    title: 'Hungarian vignette 2026: e-matrica D1, prices in euros',
    description: 'Hungarian vignette 2026: e-matrica D1 for a car with its caravan, D1M for motorcycles, prices in forint and euros. Plus the 60-minute rule and the surcharge.',
    h1: 'Hungarian vignette 2026: e-matrica for cars and caravans',
    intro: 'The Hungarian e-matrica comes for one day, ten days, a month or the year: the calculator picks the cheapest for your travel days.',
    resume: (h) => {
      const { d1, m, e, lang, kurz, stand, jahrBis } = D(h);
      return `In Hungary the motorway vignette is called the e-matrica; it is electronic and linked to the number plate. Cars up to 3.5 tonnes carrying at most seven people are class D1: ${h.geld(d1['1t'], 'HUF')} for one day, ${h.geld(d1['10t'], 'HUF')} for ten days, ${h.geld(d1['1m'], 'HUF')} for a month and ${h.geld(d1.jahr, 'HUF')} for the year, which runs until ${h.date(jahrBis)}. At the ECB rate of ${h.date(stand)} that is about ${h.eur(e(d1['1t']), 2)}, ${h.eur(e(d1['10t']), 2)}, ${h.eur(e(d1['1m']), 2)} and ${h.eur(e(d1.jahr), 2)}. A trailer towed by a D1 vehicle is included in the vignette, so a caravan costs nothing extra. Motorcycles use class D1M at ${h.geld(m['1t'], 'HUF')} a day or ${h.geld(m['10t'], 'HUF')} for ten days. For a transit to Croatia or Romania with a two-week holiday, ${wahl(h, lang)} at ${h.geld(lang.summe, 'HUF')} are enough; for seven days, ${wahl(h, kurz)} at ${h.geld(kurz.summe, 'HUF')} is cheaper. If you drive onto the motorway without a vignette by mistake, you have 60 minutes to buy one.`;
    },
    faqs: (h) => {
      const { strafe, d1 } = D(h);
      return [
        { q: 'What should I do if I entered a Hungarian motorway without an e-matrica?', a: `The operator allows a window of up to 60 minutes: within that time after joining the toll network you can still buy the e-matrica. After that a surcharge is due; the basic surcharge is ${h.geld(strafe, 'HUF')} if paid within 60 days. Paying later means a considerably higher surcharge. The simplest option is to buy before the border.` },
        { q: 'Does my caravan need a second e-matrica in Hungary?', a: `No, as long as the towing vehicle is class D1: according to the rate table the category covers the car and the trailer it tows. A daily vignette at ${h.geld(d1['1t'], 'HUF')} therefore covers the whole combination. A separate trailer class U exists only for trailers behind class D2 vehicles, such as minibuses or light vans.` },
        { q: 'Until when is the 2026 Hungarian annual vignette valid?', a: 'The national annual vignette is not valid for 365 days from purchase, but for the calendar year plus January of the following year, ending on 31 January. If you buy it in autumn you therefore get only a few months. For a single holiday trip it is almost never the best choice. Hungary also sells annual vignettes for individual counties, valid only on certain sections.' },
        { q: 'Is a motorhome class D1 or D2 in Hungary?', a: 'The registration certificate decides: if the motorhome is registered as a passenger car (category M1) with at most seven seats, it is D1. If it is registered as a commercial vehicle (N1), the dearer class D2 applies. The operator provides a category guide for this. The calculator treats motorhomes as D1, so check field J of your papers.' },
      ];
    },
    body: (h) => {
      const { d1, m, ab, urlaub, stand } = D(h);
      const rows = [
        ['1 day', h.geld(d1['1t'], 'HUF'), h.geld(m['1t'], 'HUF')],
        ['10 days', h.geld(d1['10t'], 'HUF'), h.geld(m['10t'], 'HUF')],
        ['1 month', h.geld(d1['1m'], 'HUF'), h.geld(m['1m'], 'HUF')],
        ['Year (national)', h.geld(d1.jahr, 'HUF'), h.geld(m.jahr, 'HUF')],
      ];
      return `<h2>E-matrica prices from 1 January 2026</h2>
${h.table(['Duration', 'D1 (car, also with trailer)', 'D1M (motorcycle)'], rows, 'Gross prices in forint, VAT included', ['l', 'r', 'r'])}
<p>Source: ${h.src('nemzetiutdij')}, read on ${h.date(h.P.retrieved_at)}. Motorcyclists buy annual vignettes as a D1 product, which is why the price is the same. No 2027 prices have been published yet. The calculator converts to euros at the ECB rate of ${h.date(stand)} (${h.src('ezb')}).</p>
<h2>How long each vignette lasts</h2>
<p>The daily vignette is valid until midnight on the chosen day. The ten-day vignette, called “heti” (weekly) in Hungarian, covers the first day and the nine following. The monthly vignette runs to the same calendar day of the next month, the annual one to 31 January of the following year. If you enter on ${h.date(ab)} and stay two weeks, using motorways every day, a car with caravan pays ${h.geld(urlaub.summe, 'HUF')}: the calculator takes the monthly vignette whenever it is cheaper than a string of shorter ones.</p>
<h2>Sections without a vignette</h2>
<p>Some sections are toll-free, among them the M4 between Vecsés and Budapest airport, the M4 between Törökszentmiklós and Kisújszállás, the south-western bypass of Pécs on the M60, the M8 and M80 and parts of the M9. On the main holiday routes, the M1 from Hegyeshalom to Budapest and the M7 to Lake Balaton and on to Croatia, you need the vignette.</p>
<h2>Transit and neighbouring countries</h2>
<p>If you drive through Hungary to Croatia, tolls per section follow there; see ${h.a('maut-kroatien', 'Croatian tolls')}. Coming from Germany via Austria you also need the ${h.a('vignette-oesterreich', 'Austrian vignette')}, via Czechia the ${h.a('vignette-tschechien', 'Czech one')}. In all three countries the caravan is free, unlike in Switzerland.</p>`;
    },
  },
  nl: {
    slug: 'vignet-hongarije',
    nav: 'Vignet Hongarije',
    card: 'E-matrica 2026: klasse D1 met aanhanger, D1M voor motoren, prijzen in forint en euro.',
    title: 'Vignet Hongarije 2026: e-matrica D1, prijzen in euro',
    description: 'Vignet Hongarije 2026: e-matrica D1 voor de auto met caravan, D1M voor de motor, prijzen in forint en euro. Met de 60-minutenregel en de toeslag zonder vignet.',
    h1: 'Vignet Hongarije 2026: e-matrica voor auto en caravan',
    intro: 'De Hongaarse e-matrica bestaat voor één dag, tien dagen, een maand of het jaar: de rekenhulp kiest de goedkoopste voor uw rijdagen.',
    resume: (h) => {
      const { d1, m, e, lang, kurz, stand, jahrBis } = D(h);
      return `In Hongarije heet het snelwegvignet e-matrica; het is elektronisch en gekoppeld aan de nummerplaat. Voor auto’s tot 3,5 ton met hoogstens zeven inzittenden geldt klasse D1: ${h.geld(d1['1t'], 'HUF')} voor één dag, ${h.geld(d1['10t'], 'HUF')} voor tien dagen, ${h.geld(d1['1m'], 'HUF')} voor een maand en ${h.geld(d1.jahr, 'HUF')} voor het jaar, dat loopt tot ${h.date(jahrBis)}. Tegen de ECB-koers van ${h.date(stand)} is dat ongeveer ${h.eur(e(d1['1t']), 2)}, ${h.eur(e(d1['10t']), 2)}, ${h.eur(e(d1['1m']), 2)} en ${h.eur(e(d1.jahr), 2)}. De aanhanger van een D1-voertuig zit in het vignet inbegrepen, een caravan kost dus niets extra. Motoren rijden in klasse D1M voor ${h.geld(m['1t'], 'HUF')} per dag of ${h.geld(m['10t'], 'HUF')} voor tien dagen. Voor een doorreis naar Kroatië of Roemenië met twee weken vakantie volstaan ${wahl(h, lang)} voor ${h.geld(lang.summe, 'HUF')}; bij zeven dagen is ${wahl(h, kurz)} van ${h.geld(kurz.summe, 'HUF')} goedkoper. Wie per vergissing zonder vignet de snelweg op rijdt, heeft 60 minuten om het alsnog te kopen.`;
    },
    faqs: (h) => {
      const { strafe, d1 } = D(h);
      return [
        { q: 'Wat moet ik doen als ik in Hongarije zonder e-matrica de snelweg op ben gereden?', a: `De exploitant geeft een termijn van hoogstens 60 minuten: binnen die tijd na het oprijden van het tolnet kunt u de e-matrica nog kopen. Daarna is een toeslag verschuldigd; de basistoeslag bedraagt ${h.geld(strafe, 'HUF')} bij betaling binnen 60 dagen. Wie later betaalt, krijgt een flink hogere toeslag. Het eenvoudigst is kopen vóór de grens.` },
        { q: 'Heeft mijn caravan in Hongarije een tweede e-matrica nodig?', a: `Nee, zolang het trekkende voertuig in klasse D1 valt: volgens de tarieftabel omvat die categorie de auto en de aanhanger die hij trekt. Een dagvignet van ${h.geld(d1['1t'], 'HUF')} dekt dus de hele combinatie. Een aparte aanhangerklasse U bestaat alleen voor aanhangers achter voertuigen van klasse D2, zoals minibusjes of lichte bestelwagens.` },
        { q: 'Tot wanneer geldt het Hongaarse jaarvignet van 2026?', a: 'Het landelijke jaarvignet geldt niet 365 dagen vanaf de aankoop, maar voor het kalenderjaar plus januari van het volgende jaar, tot en met 31 januari. Wie het in de herfst koopt, heeft er dus maar een paar maanden aan. Voor één vakantiereis is het bijna nooit de beste keuze. Daarnaast verkoopt Hongarije jaarvignetten per provincie, die alleen op bepaalde trajecten gelden.' },
        { q: 'Valt een camper in Hongarije in klasse D1 of D2?', a: 'Het kentekenbewijs beslist: staat de camper ingeschreven als personenauto (categorie M1) met hoogstens zeven zitplaatsen, dan geldt D1. Staat hij ingeschreven als bedrijfsvoertuig (N1), dan geldt de duurdere klasse D2. De exploitant biedt daarvoor een keuzehulp aan. De rekenhulp zet een camper in D1; controleer dus veld J van uw papieren.' },
      ];
    },
    body: (h) => {
      const { d1, m, ab, urlaub, stand } = D(h);
      const rows = [
        ['1 dag', h.geld(d1['1t'], 'HUF'), h.geld(m['1t'], 'HUF')],
        ['10 dagen', h.geld(d1['10t'], 'HUF'), h.geld(m['10t'], 'HUF')],
        ['1 maand', h.geld(d1['1m'], 'HUF'), h.geld(m['1m'], 'HUF')],
        ['Jaar (landelijk)', h.geld(d1.jahr, 'HUF'), h.geld(m.jahr, 'HUF')],
      ];
      return `<h2>Prijzen van de e-matrica vanaf 1 januari 2026</h2>
${h.table(['Looptijd', 'D1 (auto, ook met aanhanger)', 'D1M (motor)'], rows, 'Brutoprijzen in forint, btw inbegrepen', ['l', 'r', 'r'])}
<p>Bron: ${h.src('nemzetiutdij')}, gelezen op ${h.date(h.P.retrieved_at)}. Motorrijders kopen jaarvignetten als D1-product, daarom is de prijs gelijk. Prijzen voor 2027 zijn nog niet gepubliceerd. De rekenhulp rekent om naar euro tegen de ECB-koers van ${h.date(stand)} (${h.src('ezb')}).</p>
<h2>Hoe lang elk vignet geldt</h2>
<p>Het dagvignet geldt tot middernacht van de gekozen dag. Het vignet voor tien dagen, in het Hongaars “heti” (week) genoemd, omvat de eerste dag en de negen volgende. Het maandvignet loopt tot dezelfde kalenderdag van de volgende maand, het jaarvignet tot 31 januari van het jaar erna. Wie op ${h.date(ab)} binnenkomt en twee weken blijft, en daarbij elke dag snelweg rijdt, betaalt met caravan ${h.geld(urlaub.summe, 'HUF')}: de rekenhulp neemt het maandvignet zodra dat goedkoper is dan een reeks kortere vignetten.</p>
<h2>Trajecten zonder vignet</h2>
<p>Enkele stukken zijn tolvrij, waaronder de M4 tussen Vecsés en de luchthaven van Boedapest, de M4 tussen Törökszentmiklós en Kisújszállás, de zuidwestelijke rondweg van Pécs op de M60, de M8 en de M80 en delen van de M9. Op de grote vakantieroutes, de M1 van Hegyeshalom naar Boedapest en de M7 naar het Balatonmeer en verder naar Kroatië, hebt u het vignet nodig.</p>
<h2>Doorreis en buurlanden</h2>
<p>Wie via Hongarije naar Kroatië rijdt, betaalt daar vervolgens tol per traject; zie ${h.a('maut-kroatien', 'tol Kroatië')}. Komt u uit Nederland of Duitsland via Oostenrijk, dan hebt u ook het ${h.a('vignette-oesterreich', 'Oostenrijkse vignet')} nodig, via Tsjechië het ${h.a('vignette-tschechien', 'Tsjechische')}. In alle drie de landen is de caravan vrij, anders dan in Zwitserland.</p>`;
    },
  },
});
