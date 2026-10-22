import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Vignette Österreich : Preise 2026 der ASFINAG, günstigste Laufzeit für die Reisedaten, Ende der Klebevignette. */
function D(h: Helpers) {
  const V = h.P.vignetten.AT;
  const kfz = Object.fromEntries(V.produkte.kfz.map((p) => [p.id, p.preis])) as Record<string, number>;
  const moto = Object.fromEntries(V.produkte.moto.map((p) => [p.id, p.preis])) as Record<string, number>;
  // Typische Durchreise : Abfahrt in einer Woche, Rückfahrt 14 Tage später.
  const ab = h.M.addDays(h.today, 7);
  const durch = h.M.vignette('AT', 'pkw', h.M.fahrtage(ab, 14, true, false));
  const kurz = h.M.vignette('AT', 'pkw', h.M.fahrtage(ab, 7, true, false));
  return { V, kfz, moto, ab, durch, kurz };
}
/** Bezeichnung der gewählten Vignetten (« zwei 1-Tages-Vignetten »). */
const wahl = (h: Helpers, v: ReturnType<typeof h.M.vignette>) => {
  if (!v.verfuegbar) return h.T('noch keine Preise (Vignettenjahr 2027)', 'no prices yet (2027 vignette year)', 'nog geen prijzen (vignetjaar 2027)');
  const n = v.wahl.length;
  const id = v.wahl[0]?.id;
  if (n === 2 && id === '1t') return h.T('zwei 1-Tages-Vignetten', 'two 1-day vignettes', 'twee dagvignetten');
  const name: Record<string, [string, string, string]> = { '1t': ['eine 1-Tages-Vignette', 'one 1-day vignette', 'één dagvignet'], '10t': ['eine 10-Tages-Vignette', 'one 10-day vignette', 'één 10-dagenvignet'], '2m': ['eine 2-Monats-Vignette', 'one 2-month vignette', 'één 2-maandenvignet'], jahr: ['die Jahresvignette', 'the annual vignette', 'het jaarvignet'] };
  return h.T(...(name[id] ?? name['1t']));
};

export default defineGuide({
  id: 'vignette-oesterreich',
  group: 'vignette',
  order: 10,
  tool: 'vignette',
  land: 'AT',
  related: ['digitale-vignette', 'maut-oesterreich', 'brennermaut', 'vignette-slowenien', 'vignette-schweiz'],
  sources: ['asfinagVignette', 'asfinagDigital', 'asfinagHelp', 'asfinagMautordnung', 'asfinagPresse'],
  de: {
    slug: 'vignette-oesterreich',
    nav: 'Vignette Österreich',
    card: 'Preise 2026 der ASFINAG, günstigste Laufzeit für Ihre Reisedaten.',
    title: 'Vignette Österreich 2026: Preise und günstigste Laufzeit',
    description: 'Vignette Österreich 2026: 9,60 € für 1 Tag, 12,80 € für 10 Tage, 32 € für 2 Monate. Der Rechner nennt die günstigste Laufzeit für Ihre Hin- und Rückfahrt.',
    h1: 'Vignette Österreich 2026 online kaufen: welche Laufzeit für Ihre Reise?',
    intro: 'Abfahrtstag und Rückfahrt eingeben: der Rechner wählt unter den vier Vignetten der ASFINAG die billigste für Ihre Fahrtage.',
    resume: (h) => {
      const { kfz, moto, durch, kurz } = D(h);
      return `Die Vignette für Österreich kostet 2026 für einen Pkw oder ein Wohnmobil bis 3,5 Tonnen ${h.eur(kfz['1t'], 2)} für einen Tag, ${h.eur(kfz['10t'], 2)} für zehn Tage, ${h.eur(kfz['2m'], 2)} für zwei Monate und ${h.eur(kfz.jahr, 2)} für das ganze Vignettenjahr bis zum 31. Januar 2027; für das Motorrad sind es ${h.eur(moto['1t'], 2)}, ${h.eur(moto['10t'], 2)}, ${h.eur(moto['2m'], 2)} und ${h.eur(moto.jahr, 2)}. Wer Österreich nur auf dem Weg nach Italien, Slowenien oder Kroatien durchquert, braucht die Vignette am Tag der Hinfahrt und am Tag der Rückfahrt, nicht dazwischen. Bei vierzehn Tagen Urlaub reichen deshalb ${wahl(h, durch)} für zusammen ${h.eur(durch.summeEur, 2)}; liegen nur sieben Tage dazwischen, ist ${wahl(h, kurz)} für ${h.eur(kurz.summeEur, 2)} günstiger. Die Klebevignette 2026 ist die letzte: ab dem 1. Februar 2027 gibt es nur noch die digitale Vignette, deren Preise für 2027 die ASFINAG noch nicht veröffentlicht hat.`;
    },
    faqs: (h) => {
      const { kfz, V } = D(h);
      return [
        { q: 'Brauche ich für den Wohnwagen eine eigene Vignette in Österreich?', a: `Nein. Die Mautordnung der ASFINAG sieht für Anhänger keine zeitabhängige Maut vor, solange das Zugfahrzeug höchstens 3,5 Tonnen zulässige Gesamtmasse hat; das Gewicht des Wohnwagens spielt dabei keine Rolle. Sie kaufen also nur die Vignette für das Auto, zum Beispiel die 10-Tages-Vignette für ${h.eur(kfz['10t'], 2)}. Auch auf den Streckenmaut-Abschnitten wie dem Brenner zahlt der Wohnwagen nichts zusätzlich.` },
        { q: 'Was kostet es, ohne Vignette auf der österreichischen Autobahn erwischt zu werden?', a: `Seit dem 1. Januar 2026 verlangt die ASFINAG eine Ersatzmaut von ${h.eur(V.strafe.betrag)} für Pkw und Wohnmobile und von ${h.eur(V.strafe.moto)} für Motorräder, vorher waren es 120 und 65 Euro. Wer sie nicht zahlt, riskiert ein Verwaltungsstrafverfahren mit bis zu 3 000 Euro. Die Kontrolle erfolgt über das Kennzeichen, eine digitale Vignette wird also erkannt, auch wenn nichts an der Scheibe klebt.` },
        { q: 'Ab wann gilt eine online gekaufte 2-Monats- oder Jahresvignette?', a: `Erst ab dem 18. Tag nach dem Kauf, wenn Sie als Verbraucher im Webshop der ASFINAG kaufen: 14 Tage Rücktrittsrecht plus drei Tage für einen möglichen Postweg. Die 1-Tages- und die 10-Tages-Vignette gelten dagegen sofort. Wer kurzfristig fährt und eine lange Laufzeit braucht, kauft sie deshalb an einer Verkaufsstelle oder rechtzeitig vor der Reise.` },
        { q: 'Gibt es in Österreich Autobahnabschnitte ohne Vignettenpflicht?', a: 'Ja, seit dem 15. Dezember 2019 auf vier Abschnitten: A1 Walserberg bis Salzburg Nord, A12 von der Grenze bis Kufstein-Süd, A14 Hörbranz bis Hohenems und die A26 in Linz. Wer also nur nach Salzburg, Kufstein oder Bregenz fährt, braucht keine Vignette. Auf den Streckenmaut-Abschnitten (Brenner, Tauern, Karawanken, Pyhrn, Arlberg) zahlt man dagegen die Streckenmaut statt der Vignette.' },
      ];
    },
    body: (h) => {
      const { kfz, moto, ab } = D(h);
      const rows = h.M.produkte('AT', 'pkw', ab).map((p, i) => [['1 Tag', '10 Tage', '2 Monate', 'Jahr (bis 31.1.2027)'][i], h.eur(p.preis, 2), h.eur(h.P.vignetten.AT.produkte.moto[i].preis, 2), p.bis ? h.date(p.bis) : '–']);
      return `<h2>Preise der Vignette 2026</h2>
<p>Die Preise legt die Vignettenpreisverordnung 2025 fest; sie gelten seit dem 1. Dezember 2025 und enthalten 20 % Umsatzsteuer. Die letzte Spalte zeigt, bis wann eine am ${h.date(ab)} beginnende Vignette gilt.</p>
${h.table(['Laufzeit', 'Pkw, Wohnmobil bis 3,5 t', 'Motorrad', `gültig bis (Beginn ${h.date(ab)})`], rows, undefined, ['l', 'r', 'r', 'r'])}
<p>Quelle: ${h.src('asfinagVignette')} und ${h.src('asfinagHelp')}, gelesen am ${h.date(h.P.retrieved_at)}.</p>
<h2>Durchreise: zwei Tage zählen, nicht der ganze Urlaub</h2>
<p>Der häufigste Fehler auf dem Weg in den Süden ist der Kauf einer langen Vignette für einen Urlaub, in dem man Österreich zweimal durchquert. Die 1-Tages-Vignette für ${h.eur(kfz['1t'], 2)} gilt den ganzen Kalendertag; zwei davon kosten ${h.eur(kfz['1t'] * 2, 2)}, weniger als die 2-Monats-Vignette für ${h.eur(kfz['2m'], 2)}. Erst wenn Hin- und Rückfahrt höchstens zehn Tage auseinanderliegen, ist die 10-Tages-Vignette für ${h.eur(kfz['10t'], 2)} die bessere Wahl. Der Rechner oben vergleicht das für Ihre Daten; mit „Urlaub“ zählt er jeden Tag, für den Fall, dass Sie im Land selbst Autobahn fahren.</p>
<p>Für das Motorrad gilt dieselbe Rechnung zu kleineren Preisen: zwei Tage für ${h.eur(moto['1t'] * 2, 2)} gegen ${h.eur(moto['2m'], 2)} für zwei Monate.</p>
<h2>Digitale Vignette und das Ende des Pickerls</h2>
<p>Die rote Klebevignette 2026 ist die letzte ihrer Art. Die ASFINAG nennt den 31. Januar 2027 als Tag der Umstellung; ab dem 1. Februar 2027 gibt es nur noch digitale Vignetten, die an das Kennzeichen gebunden sind. Die Preise für das Vignettenjahr 2027 sind am ${h.date(h.today)} noch nicht veröffentlicht: der Rechner zeigt für Reisen ab dem 1. Dezember 2026 deshalb keinen Betrag. Mehr dazu, auch zur Frist von 18 Tagen, auf der Seite ${h.a('digitale-vignette', 'digitale Vignette')}.</p>
<h2>Wohnmobil, Gespann, Motorrad</h2>
<p>Ein Wohnmobil bis 3,5 Tonnen zahlt wie ein Pkw. Ein Wohnwagen oder Anhänger hinter einem Fahrzeug bis 3,5 Tonnen braucht keine eigene Vignette (Mautordnung, Teil A). Über 3,5 Tonnen gilt nicht die Vignette, sondern die kilometerabhängige GO-Maut mit Box: diesen Fall rechnet die Seite nicht.</p>
<h2>Zur Vignette kommt die Streckenmaut</h2>
<p>Auf fünf Abschnitten zahlt man statt der Vignette eine Maut je Durchfahrt: Brenner, Tauern, Karawanken, Pyhrn und Arlberg. Davor und dahinter gilt die Vignettenpflicht weiter. Was das für Ihre Strecke heißt, zeigen die Seiten ${h.a('maut-oesterreich', 'Maut Österreich')} und ${h.a('brennermaut', 'Brennermaut')}; die ganze Fahrt mit allen Ländern rechnet die ${h.a('home', 'Startseite')}.</p>
<p>Wo kaufen? Im Webshop der ASFINAG oder an den Verkaufsstellen der ASFINAG und ihrer Partner. Händler im Netz verkaufen dieselbe Vignette oft mit Servicegebühr: der Preis oben ist der amtliche.</p>`;
    },
  },
  en: {
    slug: 'austria-vignette',
    nav: 'Austria vignette',
    card: '2026 ASFINAG prices and the cheapest duration for your dates.',
    title: 'Vignette for Austria 2026: prices and cheapest duration',
    description: 'Austrian vignette 2026: €9.60 for 1 day, €12.80 for 10 days, €32 for 2 months. The calculator picks the cheapest duration for your drive out and back.',
    h1: 'Austria vignette 2026: which duration for your trip?',
    intro: 'Enter the day you drive out and the day you come back: the calculator picks the cheapest of ASFINAG’s four vignettes for those days.',
    resume: (h) => {
      const { kfz, moto, durch, kurz } = D(h);
      return `In 2026 the Austrian motorway vignette for a car or a motorhome up to 3.5 tonnes costs ${h.eur(kfz['1t'], 2)} for one day, ${h.eur(kfz['10t'], 2)} for ten days, ${h.eur(kfz['2m'], 2)} for two months and ${h.eur(kfz.jahr, 2)} for the whole vignette year to 31 January 2027; for a motorcycle the prices are ${h.eur(moto['1t'], 2)}, ${h.eur(moto['10t'], 2)}, ${h.eur(moto['2m'], 2)} and ${h.eur(moto.jahr, 2)}. If you only cross Austria on the way to Italy, Slovenia or Croatia, you need the vignette on the day you drive out and the day you drive back, not in between. For a fourteen-day holiday ${wahl(h, durch)} therefore cover you for ${h.eur(durch.summeEur, 2)} in all; with only seven days in between, ${wahl(h, kurz)} at ${h.eur(kurz.summeEur, 2)} is cheaper. The 2026 sticker is the last one: from 1 February 2027 only the digital vignette exists, and ASFINAG has not yet published its 2027 prices.`;
    },
    faqs: (h) => {
      const { kfz, V } = D(h);
      return [
        { q: 'Does a caravan need its own vignette in Austria?', a: `No. ASFINAG’s toll regulations charge no time-based toll for a trailer as long as the towing vehicle has a permitted total weight of 3.5 tonnes or less; the caravan’s own weight does not matter. You only buy the vignette for the car, for example the 10-day vignette at ${h.eur(kfz['10t'], 2)}. On the section-toll stretches such as the Brenner the caravan pays nothing extra either.` },
        { q: 'What is the fine for driving on an Austrian motorway without a vignette?', a: `Since 1 January 2026 ASFINAG charges a substitute toll of ${h.eur(V.strafe.betrag)} for cars and motorhomes and ${h.eur(V.strafe.moto)} for motorcycles, up from 120 and 65 euros. If you do not pay it, administrative proceedings with fines of up to 3,000 euros can follow. Checks run on the number plate, so a digital vignette is recognised even though nothing is stuck to the windscreen.` },
        { q: 'When does a 2-month or annual vignette bought online become valid?', a: 'Only from the 18th day after purchase if you buy as a consumer in ASFINAG’s web shop: 14 days to withdraw from the purchase plus three days for possible postal delivery. The 1-day and 10-day vignettes, by contrast, are valid at once. If you leave at short notice and need a long duration, buy it at a sales outlet or well before the trip.' },
        { q: 'Are there Austrian motorway sections where no vignette is needed?', a: 'Yes, on four sections since 15 December 2019: the A1 from Walserberg to Salzburg Nord, the A12 from the border to Kufstein-Süd, the A14 from Hörbranz to Hohenems and the A26 in Linz. If you only drive to Salzburg, Kufstein or Bregenz you need no vignette. On the section-toll roads (Brenner, Tauern, Karawanken, Pyhrn, Arlberg) you pay that toll instead of the vignette.' },
      ];
    },
    body: (h) => {
      const { kfz, moto, ab } = D(h);
      const rows = h.M.produkte('AT', 'pkw', ab).map((p, i) => [['1 day', '10 days', '2 months', 'Year (to 31 Jan 2027)'][i], h.eur(p.preis, 2), h.eur(h.P.vignetten.AT.produkte.moto[i].preis, 2), p.bis ? h.date(p.bis) : '–']);
      return `<h2>2026 vignette prices</h2>
<p>Prices are set by the 2025 vignette price regulation; they have applied since 1 December 2025 and include 20% VAT. The last column shows how long a vignette starting on ${h.date(ab)} is valid.</p>
${h.table(['Duration', 'Car, motorhome up to 3.5 t', 'Motorcycle', `valid until (start ${h.date(ab)})`], rows, undefined, ['l', 'r', 'r', 'r'])}
<p>Source: ${h.src('asfinagVignette')} and ${h.src('asfinagHelp')}, read on ${h.date(h.P.retrieved_at)}.</p>
<h2>Transit: two days count, not the whole holiday</h2>
<p>The most common mistake on the way south is buying a long vignette for a holiday in which you cross Austria twice. The 1-day vignette at ${h.eur(kfz['1t'], 2)} is valid for the whole calendar day; two of them cost ${h.eur(kfz['1t'] * 2, 2)}, less than the 2-month vignette at ${h.eur(kfz['2m'], 2)}. Only when the drive out and the drive back are at most ten days apart does the 10-day vignette at ${h.eur(kfz['10t'], 2)} win. The calculator above compares this for your dates; choose “Holiday” and it counts every day, in case you use motorways in Austria itself.</p>
<p>For a motorcycle the same logic applies at lower prices: two days for ${h.eur(moto['1t'] * 2, 2)} against ${h.eur(moto['2m'], 2)} for two months.</p>
<h2>The digital vignette and the end of the sticker</h2>
<p>The red 2026 sticker is the last of its kind. ASFINAG names 31 January 2027 as the switch-over day; from 1 February 2027 only digital vignettes, tied to the number plate, exist. Prices for the 2027 vignette year have not been published as of ${h.date(h.today)}, so the calculator shows no amount for trips from 1 December 2026. More on this, including the 18-day rule, on the ${h.a('digitale-vignette', 'digital vignette')} page.</p>
<h2>Motorhome, caravan, motorcycle</h2>
<p>A motorhome up to 3.5 tonnes pays like a car. A caravan or trailer behind a vehicle up to 3.5 tonnes needs no vignette of its own (toll regulations, part A). Above 3.5 tonnes the vignette does not apply; the distance-based GO toll with an on-board box does, and this site does not calculate that case.</p>
<h2>Section tolls come on top</h2>
<p>On five stretches you pay a toll per passage instead of the vignette: Brenner, Tauern, Karawanken, Pyhrn and Arlberg. Before and after them the vignette is still required. What that means for your route is on the ${h.a('maut-oesterreich', 'Austrian tolls')} and ${h.a('brennermaut', 'Brenner toll')} pages; the whole trip, all countries included, is on the ${h.a('home', 'home page')}.</p>
<p>Where to buy? In ASFINAG’s web shop or at the sales outlets of ASFINAG and its partners. Online resellers often sell the same vignette with a service fee: the price above is the official one.</p>`;
    },
  },
  nl: {
    slug: 'vignet-oostenrijk',
    nav: 'Vignet Oostenrijk',
    card: 'Prijzen 2026 van ASFINAG, goedkoopste duur voor uw reisdata.',
    title: 'Vignet Oostenrijk 2026: prijzen en goedkoopste duur',
    description: 'Vignet Oostenrijk 2026: € 9,60 voor 1 dag, € 12,80 voor 10 dagen, € 32 voor 2 maanden. De rekenhulp kiest de goedkoopste duur voor uw heen- en terugreis.',
    h1: 'Vignet Oostenrijk 2026: 1 dag, 10 dagen, 2 maanden of een jaar?',
    intro: 'Vul de dag van vertrek en van terugkeer in: de rekenhulp kiest uit de vier vignetten van ASFINAG het goedkoopste voor uw rijdagen.',
    resume: (h) => {
      const { kfz, moto, durch, kurz } = D(h);
      return `Het vignet voor Oostenrijk kost in 2026 voor een auto of een camper tot 3,5 ton ${h.eur(kfz['1t'], 2)} voor één dag, ${h.eur(kfz['10t'], 2)} voor tien dagen, ${h.eur(kfz['2m'], 2)} voor twee maanden en ${h.eur(kfz.jahr, 2)} voor het hele vignetjaar tot 31 januari 2027; voor een motor is dat ${h.eur(moto['1t'], 2)}, ${h.eur(moto['10t'], 2)}, ${h.eur(moto['2m'], 2)} en ${h.eur(moto.jahr, 2)}. Wie Oostenrijk alleen doorkruist op weg naar Italië, Slovenië of Kroatië, heeft het vignet nodig op de dag van de heenreis en op de dag van de terugreis, niet daartussen. Bij veertien dagen vakantie volstaan daarom ${wahl(h, durch)} voor samen ${h.eur(durch.summeEur, 2)}; liggen er maar zeven dagen tussen, dan is ${wahl(h, kurz)} voor ${h.eur(kurz.summeEur, 2)} goedkoper. Het plakvignet van 2026 is het laatste: vanaf 1 februari 2027 bestaat alleen nog het digitale vignet, waarvan ASFINAG de prijzen voor 2027 nog niet heeft gepubliceerd.`;
    },
    faqs: (h) => {
      const { kfz, V } = D(h);
      return [
        { q: 'Heeft mijn caravan in Oostenrijk een eigen vignet nodig?', a: `Nee. Het tolreglement van ASFINAG rekent geen tijdsafhankelijke tol voor een aanhanger zolang het trekkende voertuig hoogstens 3,5 ton toegelaten totaalgewicht heeft; het gewicht van de caravan zelf speelt geen rol. U koopt dus alleen het vignet voor de auto, bijvoorbeeld het 10-dagenvignet van ${h.eur(kfz['10t'], 2)}. Ook op de trajecten met trajecttol, zoals de Brenner, betaalt de caravan niets extra.` },
        { q: 'Wat kost rijden zonder vignet op de Oostenrijkse snelweg?', a: `Sinds 1 januari 2026 vraagt ASFINAG een vervangende tol van ${h.eur(V.strafe.betrag)} voor auto’s en campers en ${h.eur(V.strafe.moto)} voor motoren; daarvoor was dat 120 en 65 euro. Wie niet betaalt, riskeert een administratieve procedure met boetes tot 3.000 euro. De controle gebeurt op de nummerplaat, dus een digitaal vignet wordt herkend ook al kleeft er niets op de voorruit.` },
        { q: 'Vanaf wanneer geldt een online gekocht 2-maanden- of jaarvignet?', a: 'Pas vanaf de 18e dag na de aankoop als u als consument in de webwinkel van ASFINAG koopt: 14 dagen bedenktijd plus drie dagen voor een eventuele verzending per post. Het dagvignet en het 10-dagenvignet gelden daarentegen meteen. Wie op korte termijn vertrekt en een lange duur nodig heeft, koopt het dus in een verkooppunt of ruim voor de reis.' },
        { q: 'Zijn er Oostenrijkse snelwegen zonder vignetplicht?', a: 'Ja, sinds 15 december 2019 op vier stukken: de A1 van Walserberg tot Salzburg Nord, de A12 van de grens tot Kufstein-Süd, de A14 van Hörbranz tot Hohenems en de A26 in Linz. Wie alleen naar Salzburg, Kufstein of Bregenz rijdt, heeft geen vignet nodig. Op de trajecten met trajecttol (Brenner, Tauern, Karawanken, Pyhrn, Arlberg) betaalt u die tol in plaats van het vignet.' },
      ];
    },
    body: (h) => {
      const { kfz, moto, ab } = D(h);
      const rows = h.M.produkte('AT', 'pkw', ab).map((p, i) => [['1 dag', '10 dagen', '2 maanden', 'Jaar (tot 31-1-2027)'][i], h.eur(p.preis, 2), h.eur(h.P.vignetten.AT.produkte.moto[i].preis, 2), p.bis ? h.date(p.bis) : '–']);
      return `<h2>Prijzen van het vignet 2026</h2>
<p>De prijzen staan in de vignetprijsverordening 2025; ze gelden sinds 1 december 2025 en bevatten 20 % btw. De laatste kolom toont tot wanneer een vignet geldt dat op ${h.date(ab)} begint.</p>
${h.table(['Duur', 'Auto, camper tot 3,5 t', 'Motor', `geldig tot (start ${h.date(ab)})`], rows, undefined, ['l', 'r', 'r', 'r'])}
<p>Bron: ${h.src('asfinagVignette')} en ${h.src('asfinagHelp')}, gelezen op ${h.date(h.P.retrieved_at)}.</p>
<h2>Doorreis: twee dagen tellen, niet de hele vakantie</h2>
<p>De meest gemaakte fout op weg naar het zuiden is een lang vignet kopen voor een vakantie waarin u Oostenrijk twee keer doorkruist. Het dagvignet van ${h.eur(kfz['1t'], 2)} geldt de hele kalenderdag; twee ervan kosten ${h.eur(kfz['1t'] * 2, 2)}, minder dan het 2-maandenvignet van ${h.eur(kfz['2m'], 2)}. Pas als heen- en terugreis hoogstens tien dagen uit elkaar liggen, is het 10-dagenvignet van ${h.eur(kfz['10t'], 2)} de betere keuze. De rekenhulp hierboven vergelijkt dat voor uw data; met “Vakantie” telt hij elke dag, voor het geval u in Oostenrijk zelf snelweg rijdt.</p>
<p>Voor de motor geldt dezelfde rekensom tegen lagere prijzen: twee dagen voor ${h.eur(moto['1t'] * 2, 2)} tegenover ${h.eur(moto['2m'], 2)} voor twee maanden.</p>
<h2>Het digitale vignet en het einde van het plakvignet</h2>
<p>Het rode plakvignet van 2026 is het laatste in zijn soort. ASFINAG noemt 31 januari 2027 als dag van de overstap; vanaf 1 februari 2027 bestaan alleen nog digitale vignetten, gekoppeld aan de nummerplaat. De prijzen voor het vignetjaar 2027 zijn op ${h.date(h.today)} nog niet gepubliceerd: de rekenhulp toont voor reizen vanaf 1 december 2026 dus geen bedrag. Meer daarover, ook over de termijn van 18 dagen, op de pagina ${h.a('digitale-vignette', 'digitaal vignet')}.</p>
<h2>Camper, caravan, motor</h2>
<p>Een camper tot 3,5 ton betaalt als een auto. Een caravan of aanhanger achter een voertuig tot 3,5 ton heeft geen eigen vignet nodig (tolreglement, deel A). Boven 3,5 ton geldt niet het vignet maar de kilometerheffing GO-Maut met een kastje: dat geval rekent deze site niet.</p>
<h2>Bovenop het vignet: de trajecttol</h2>
<p>Op vijf trajecten betaalt u in plaats van het vignet tol per doorrit: Brenner, Tauern, Karawanken, Pyhrn en Arlberg. Ervoor en erna blijft de vignetplicht gelden. Wat dat voor uw route betekent, staat op de pagina’s ${h.a('maut-oesterreich', 'tol Oostenrijk')} en ${h.a('brennermaut', 'Brennertol')}; de hele rit met alle landen rekent de ${h.a('home', 'startpagina')}.</p>
<p>Waar kopen? In de webwinkel van ASFINAG of in de verkooppunten van ASFINAG en haar partners. Verkopers op het internet rekenen voor hetzelfde vignet vaak servicekosten: de prijs hierboven is de officiële.</p>`;
    },
  },
});
