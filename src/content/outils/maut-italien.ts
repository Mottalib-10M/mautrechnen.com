import { defineGuide, type Helpers } from '../../lib/guide-types';

type Fz = 'pkw' | 'wohnmobil' | 'gespann' | 'motorrad';
/** Maut Italien : Kilometertarif × Kilometer, auf 10 Cent gerundet ; unser Betrag ist eine Schätzung. */
function D(h: Helpers) {
  const T = h.P.italien_tarife;
  const fahrt = (von: string, nach: string, fz: Fz) => {
    const r = h.M.route(von, nach);
    const p = r ? h.M.maut(r.schritte, fz) : [];
    return { km: r?.km ?? 0, s: h.M.mautSumme(p), it: p.filter((x) => x.typ === 'it') };
  };
  const rom = { pkw: fahrt('b_brenner', 'rom', 'pkw'), wm: fahrt('b_brenner', 'rom', 'wohnmobil'), gs: fahrt('b_brenner', 'rom', 'gespann') };
  const strecken: Array<[string, string]> = [['b_brenner', 'verona'], ['b_brenner', 'rimini'], ['b_brenner', 'rom'], ['b_arnoldstein', 'udine'], ['b_chiasso', 'bologna']];
  return { T, fahrt, rom, strecken };
}
const ort = (h: Helpers, id: string) => h.M.KNOTEN[id].n[h.lang];

export default defineGuide({
  id: 'maut-italien',
  group: 'maut',
  order: 20,
  tool: 'maut',
  laender: ['IT', 'AT', 'CH', 'SI'],
  von: 'b_brenner',
  nach: 'rom',
  related: ['brennermaut', 'maut-nach-italien', 'spritpreise-italien', 'maut-oesterreich', 'vignette-schweiz', 'maut-frankreich'],
  sources: ['aspiCalcolo', 'aspiClassi', 'a22', 'osm'],
  de: {
    slug: 'maut-italien',
    nav: 'Maut Italien',
    card: 'Kilometertarife 2026 von Autostrade und A22, Mautklassen, geschätzte Maut je Strecke.',
    title: 'Maut Italien 2026: Kilometertarife, Klassen, Schätzung',
    description: 'Maut Italien 2026: so rechnen Autostrade per l’Italia und die A22, welche Klasse Pkw, Wohnmobil und Gespann haben und was die Fahrt Brenner–Rom etwa kostet.',
    h1: 'Maut Italien 2026: was kostet die Autostrada?',
    intro: 'Start und Ziel wählen: der Rechner schätzt die italienische Maut aus den amtlichen Kilometertarifen und zeigt, welche Abschnitte er nicht kennt.',
    resume: (h) => {
      const { T, rom } = D(h);
      return `Die italienische Autobahnmaut wird nach Kilometern berechnet: Jeder Betreiber hat einen Tarif je Kilometer und Fahrzeugklasse, die Mehrwertsteuer von 22 % ist enthalten, und der Betrag jeder Fahrt wird auf 10 Cent gerundet. Bei Autostrade per l’Italia kostet ein Kilometer 2026 für einen Pkw ${h.eur(T.aspi_pianura.preis.pkw, 5)} im Flachland und ${h.eur(T.aspi_montagna.preis.pkw, 5)} auf Bergstrecken; auf der Brennerautobahn A22 sind es ${h.eur(T.a22_montagna.preis.pkw, 5)} am Berg und ${h.eur(T.a22_pianura.preis.pkw, 5)} in der Ebene. Weil die amtlichen Kilometer von Mautstelle zu Mautstelle nicht frei veröffentlicht sind, rechnet diese Seite mit den Kilometern der Route und nennt das Ergebnis ausdrücklich eine Schätzung. Vom Brenner nach Rom (${h.num(rom.pkw.km)} km) ergibt das für den Pkw etwa ${h.eur(rom.pkw.s.schaetzung, 2)}, für ein Wohnmobil der Klasse B etwa ${h.eur(rom.wm.s.schaetzung, 2)} und für ein Gespann mit einachsigem Wohnwagen (Klasse 3) etwa ${h.eur(rom.gs.s.schaetzung, 2)}, jeweils einfache Fahrt. Für einige Konzessionen, etwa die A4 zwischen Brescia und Padua, haben wir keinen Tarif gelesen: Dort zeigt der Rechner keinen Betrag.`;
    },
    faqs: (h) => {
      const { rom, T } = D(h);
      return [
        { q: 'Warum zeigt der Rechner für Italien nur eine Schätzung?', a: `Weil die Betreiber zwar ihre Kilometertarife veröffentlichen, nicht aber frei zugänglich die amtlichen Kilometer zwischen zwei Mautstellen; ihre eigenen Rechner sind nur im Browser mit Sicherheitsabfrage nutzbar. Wir multiplizieren den Tarif deshalb mit der Länge der Route laut OpenStreetMap. Das Ergebnis liegt nahe am Ticketpreis, kann aber um einige Euro abweichen, etwa wenn die Mautstelle nicht genau an unserem Knotenpunkt liegt.` },
        { q: 'In welche Mautklasse fällt ein Pkw mit Wohnwagen in Italien?', a: `Ein Pkw mit einachsigem Wohnwagen hat zusammen drei Achsen und fällt damit in die Klasse 3. Bei Autostrade kostet das im Flachland ${h.eur(T.aspi_pianura.preis.gespann, 5)} je Kilometer statt ${h.eur(T.aspi_pianura.preis.pkw, 5)} für den Pkw allein. Vom Brenner nach Rom macht das nach unserer Schätzung ${h.eur(rom.gs.s.schaetzung - rom.pkw.s.schaetzung, 2)} mehr aus. Ein Wohnwagen mit Tandemachse ergibt vier Achsen und eine noch höhere Klasse.` },
        { q: 'Zahlt ein Motorrad in Italien weniger Maut als ein Auto?', a: 'Nein. Italien teilt die Fahrzeuge nach Achsen und nach der Höhe über der Vorderachse ein, nicht nach der Art des Fahrzeugs. Motorrad und Pkw haben beide zwei Achsen und liegen an der Vorderachse unter 1,30 Meter, sie fallen also beide in die Klasse A und zahlen denselben Kilometertarif. Anders als in Frankreich gibt es für Motorräder keine eigene, günstigere Klasse.' },
        { q: 'Welche italienischen Autobahnen rechnet diese Seite nicht?', a: 'Die Abschnitte von Konzessionären, deren Tarif 2026 wir nicht lesen konnten: die A4 Brescia–Padova, die Autostrade Alto Adriatico im Nordosten, die A7 Milano–Serravalle Richtung Genua und die A10 dei Fiori zur französischen Grenze. Sie erscheinen im Rechner als „nicht verifiziert“ und gehen in keine Summe ein, die Fahrt zum Gardasee, nach Venedig oder an die Riviera ist dort also unvollständig.' },
      ];
    },
    body: (h) => {
      const { T, fahrt, strecken } = D(h);
      const tarif = [
        ['Autostrade per l’Italia, Flachland', h.eur(T.aspi_pianura.preis.pkw, 5), h.eur(T.aspi_pianura.preis.wohnmobil, 5), h.eur(T.aspi_pianura.preis.gespann, 5)],
        ['Autostrade per l’Italia, Berg', h.eur(T.aspi_montagna.preis.pkw, 5), h.eur(T.aspi_montagna.preis.wohnmobil, 5), h.eur(T.aspi_montagna.preis.gespann, 5)],
        ['A22 Brennero, Berg', h.eur(T.a22_montagna.preis.pkw, 5), h.eur(T.a22_montagna.preis.wohnmobil, 5), h.eur(T.a22_montagna.preis.gespann, 5)],
        ['A22 Brennero, Flachland', h.eur(T.a22_pianura.preis.pkw, 5), h.eur(T.a22_pianura.preis.wohnmobil, 5), h.eur(T.a22_pianura.preis.gespann, 5)],
      ];
      const rows = strecken.map(([a, b]) => { const p = fahrt(a, b, 'pkw'), w = fahrt(a, b, 'wohnmobil'), g = fahrt(a, b, 'gespann'); return [`${ort(h, a)} – ${ort(h, b)}`, `${h.num(p.km)} km`, h.eur(p.s.schaetzung, 2), h.eur(w.s.schaetzung, 2), h.eur(g.s.schaetzung, 2)]; });
      return `<h2>Die Formel der Betreiber</h2>
<p>Autostrade per l’Italia beschreibt die Berechnung so: Kilometertarif der Fahrzeugklasse mal gefahrene Kilometer, dazu die Mehrwertsteuer, der Betrag auf 10 Cent gerundet (${h.src('aspiCalcolo')}). Jeder Konzessionär rechnet seinen Abschnitt getrennt; wer vom Brenner über die A22 und dann über die A1 fährt, bekommt also zwei getrennt gerundete Beträge. Die Tarife unten enthalten bereits 22 % Mehrwertsteuer und gelten seit dem 1. Januar 2026.</p>
${h.table(['Betreiber, Streckenart', 'Klasse A (Pkw, Motorrad)', 'Klasse B (Wohnmobil)', 'Klasse 3 (Pkw + Wohnwagen)'], tarif, 'Euro je Kilometer, mit Mehrwertsteuer', ['l', 'r', 'r', 'r'])}
<p>Quellen: ${h.src('aspiCalcolo')}, ${h.src('a22')}, Klassen nach ${h.src('aspiClassi')}. Klasse A heißt: zwei Achsen und an der Vorderachse höchstens 1,30 Meter hoch. Die meisten Wohnmobile und hohen Kastenwagen liegen darüber und fahren in Klasse B.</p>
<h2>Geschätzte Maut auf typischen Strecken</h2>
${h.table(['Strecke', 'Länge', 'Pkw', 'Wohnmobil', 'Pkw + Wohnwagen'], rows, 'Einfache Fahrt, Schätzung aus Kilometertarif × Routenlänge (OpenStreetMap)', ['l', 'r', 'r', 'r', 'r'])}
<p>Die Längen stammen aus dem Routing auf Daten von ${h.src('osm', 'OpenStreetMap')}. Die tatsächliche Mautstrecke beginnt und endet an den Mautstellen und kann einige Kilometer kürzer oder länger sein. Für Hin- und Rückfahrt verdoppelt der Rechner den Betrag.</p>
<h2>Vor Italien: Österreich oder Schweiz</h2>
<p>Wer über den Brenner kommt, zahlt vorher die österreichische Streckenmaut auf der A13 und braucht vor Innsbruck die Vignette, siehe ${h.a('brennermaut', 'Brennermaut')}. Über den Gotthard und Chiasso braucht man die ${h.a('vignette-schweiz', 'Schweizer Vignette')}. Die ganze Fahrt ab Deutschland, den Niederlanden oder Belgien mit Sprit rechnet ${h.a('maut-nach-italien', 'Maut nach Italien')}.</p>`;
    },
  },
  en: {
    slug: 'italy-tolls',
    nav: 'Italy tolls',
    card: '2026 per-km rates of Autostrade and the A22, toll classes, estimated toll per route.',
    title: 'Motorway tolls in Italy 2026: per-km rates and classes',
    description: 'Italian motorway tolls 2026: how Autostrade per l’Italia and the A22 charge, the class of cars, motorhomes and caravans, and what Brenner to Rome roughly costs.',
    h1: 'Italian motorway tolls 2026: what does the autostrada cost?',
    intro: 'Choose start and destination: the calculator estimates the Italian toll from the official per-km rates and shows which sections it does not know.',
    resume: (h) => {
      const { T, rom } = D(h);
      return `Italian motorway tolls are charged by distance: every operator has a rate per kilometre and vehicle class, 22% VAT is included, and the amount for each trip is rounded to 10 cents. On Autostrade per l’Italia a kilometre costs a car ${h.eur(T.aspi_pianura.preis.pkw, 5)} on lowland stretches and ${h.eur(T.aspi_montagna.preis.pkw, 5)} on mountain stretches in 2026; on the A22 Brenner motorway it is ${h.eur(T.a22_montagna.preis.pkw, 5)} in the mountains and ${h.eur(T.a22_pianura.preis.pkw, 5)} on the plain. Because the official distances between toll stations are not freely published, this site uses the route distance and calls the result an estimate, explicitly. From the Brenner to Rome (${h.num(rom.pkw.km)} km) that gives roughly ${h.eur(rom.pkw.s.schaetzung, 2)} for a car, about ${h.eur(rom.wm.s.schaetzung, 2)} for a class B motorhome and about ${h.eur(rom.gs.s.schaetzung, 2)} for a car with a single-axle caravan (class 3), one way in each case. For some concessions, such as the A4 between Brescia and Padua, we have not read a rate: there the calculator shows no amount.`;
    },
    faqs: (h) => {
      const { rom, T } = D(h);
      return [
        { q: 'Why does the calculator only give an estimate for Italy?', a: 'Because operators publish their per-km rates but not, in open form, the official distance between two toll stations; their own calculators only work in a browser behind a security check. We therefore multiply the rate by the route length from OpenStreetMap. The result is close to the ticket price but can differ by a few euros, for instance when the toll station is not exactly at our network node.' },
        { q: 'Which toll class is a car with a caravan in Italy?', a: `A car with a single-axle caravan has three axles in total and is therefore class 3. On Autostrade lowland stretches that costs ${h.eur(T.aspi_pianura.preis.gespann, 5)} per kilometre instead of ${h.eur(T.aspi_pianura.preis.pkw, 5)} for the car alone. From the Brenner to Rome our estimate puts the difference at ${h.eur(rom.gs.s.schaetzung - rom.pkw.s.schaetzung, 2)}. A caravan with a twin axle makes four axles and an even higher class.` },
        { q: 'Do motorcycles pay less than cars on Italian motorways?', a: 'No. Italy classifies vehicles by axles and by height above the front axle, not by vehicle type. A motorcycle and a car both have two axles and stay under 1.30 metres at the front axle, so both fall into class A and pay the same per-km rate. Unlike France, Italy has no separate, cheaper class for motorcycles.' },
        { q: 'Which Italian motorways does this site not calculate?', a: 'Sections run by concessionaires whose 2026 rates we could not read: the A4 Brescia–Padova, Autostrade Alto Adriatico in the north-east, the A7 Milano–Serravalle towards Genoa and the A10 dei Fiori to the French border. They appear in the calculator as “not verified” and are left out of every total, so trips to Lake Garda, Venice or the Riviera are incomplete there.' },
      ];
    },
    body: (h) => {
      const { T, fahrt, strecken } = D(h);
      const tarif = [
        ['Autostrade per l’Italia, lowland', h.eur(T.aspi_pianura.preis.pkw, 5), h.eur(T.aspi_pianura.preis.wohnmobil, 5), h.eur(T.aspi_pianura.preis.gespann, 5)],
        ['Autostrade per l’Italia, mountain', h.eur(T.aspi_montagna.preis.pkw, 5), h.eur(T.aspi_montagna.preis.wohnmobil, 5), h.eur(T.aspi_montagna.preis.gespann, 5)],
        ['A22 Brennero, mountain', h.eur(T.a22_montagna.preis.pkw, 5), h.eur(T.a22_montagna.preis.wohnmobil, 5), h.eur(T.a22_montagna.preis.gespann, 5)],
        ['A22 Brennero, lowland', h.eur(T.a22_pianura.preis.pkw, 5), h.eur(T.a22_pianura.preis.wohnmobil, 5), h.eur(T.a22_pianura.preis.gespann, 5)],
      ];
      const rows = strecken.map(([a, b]) => { const p = fahrt(a, b, 'pkw'), w = fahrt(a, b, 'wohnmobil'), g = fahrt(a, b, 'gespann'); return [`${ort(h, a)} – ${ort(h, b)}`, `${h.num(p.km)} km`, h.eur(p.s.schaetzung, 2), h.eur(w.s.schaetzung, 2), h.eur(g.s.schaetzung, 2)]; });
      return `<h2>The operators’ formula</h2>
<p>Autostrade per l’Italia describes the calculation as the per-km rate for the vehicle class times the kilometres driven, plus VAT, rounded to 10 cents (${h.src('aspiCalcolo')}). Each concessionaire charges its own section separately: a driver going from the Brenner down the A22 and then on the A1 gets two separately rounded amounts. The rates below already include 22% VAT and have applied since 1 January 2026.</p>
${h.table(['Operator, type of stretch', 'Class A (car, motorcycle)', 'Class B (motorhome)', 'Class 3 (car + caravan)'], tarif, 'Euros per kilometre, VAT included', ['l', 'r', 'r', 'r'])}
<p>Sources: ${h.src('aspiCalcolo')}, ${h.src('a22')}, classes as per ${h.src('aspiClassi')}. Class A means two axles and no more than 1.30 metres high at the front axle. Most motorhomes and high vans exceed that and travel in class B.</p>
<h2>Estimated tolls on typical routes</h2>
${h.table(['Route', 'Distance', 'Car', 'Motorhome', 'Car + caravan'], rows, 'One way, estimate from per-km rate × route length (OpenStreetMap)', ['l', 'r', 'r', 'r', 'r'])}
<p>Distances come from routing on ${h.src('osm', 'OpenStreetMap')} data. The actual tolled distance starts and ends at the toll stations and can be a few kilometres shorter or longer. For a return trip the calculator doubles the amount.</p>
<h2>Before Italy: Austria or Switzerland</h2>
<p>Coming over the Brenner, you first pay the Austrian section toll on the A13 and need the vignette before Innsbruck; see ${h.a('brennermaut', 'Brenner toll')}. Via the Gotthard and Chiasso you need the ${h.a('vignette-schweiz', 'Swiss vignette')}. The whole trip from Germany, the Netherlands or Belgium, fuel included, is on ${h.a('maut-nach-italien', 'tolls to Italy')}.</p>`;
    },
  },
  nl: {
    slug: 'tol-italie',
    nav: 'Tol Italië',
    card: 'Kilometertarieven 2026 van Autostrade en de A22, tolklassen, geschatte tol per route.',
    title: 'Tol Italië 2026: kilometertarieven, klassen en schatting',
    description: 'Tol Italië 2026: zo rekenen Autostrade per l’Italia en de A22, in welke klasse auto, camper en caravan vallen en wat de rit Brenner–Rome ongeveer kost.',
    h1: 'Tol Italië 2026: wat kost de autostrada?',
    intro: 'Kies vertrek en bestemming: de rekenhulp schat de Italiaanse tol uit de officiële kilometertarieven en toont welke trajecten hij niet kent.',
    resume: (h) => {
      const { T, rom } = D(h);
      return `De Italiaanse snelwegtol wordt per kilometer berekend: elke exploitant heeft een tarief per kilometer en voertuigklasse, de btw van 22 % is inbegrepen, en het bedrag van elke rit wordt afgerond op 10 cent. Bij Autostrade per l’Italia kost een kilometer voor een auto in 2026 ${h.eur(T.aspi_pianura.preis.pkw, 5)} in vlak land en ${h.eur(T.aspi_montagna.preis.pkw, 5)} op bergtrajecten; op de Brennersnelweg A22 is dat ${h.eur(T.a22_montagna.preis.pkw, 5)} in de bergen en ${h.eur(T.a22_pianura.preis.pkw, 5)} in de vlakte. Omdat de officiële afstanden tussen tolstations niet vrij gepubliceerd zijn, rekent deze site met de afstand van de route en noemt het resultaat uitdrukkelijk een schatting. Van de Brenner naar Rome (${h.num(rom.pkw.km)} km) geeft dat voor een auto ongeveer ${h.eur(rom.pkw.s.schaetzung, 2)}, voor een camper in klasse B ongeveer ${h.eur(rom.wm.s.schaetzung, 2)} en voor een auto met eenassige caravan (klasse 3) ongeveer ${h.eur(rom.gs.s.schaetzung, 2)}, telkens enkele reis. Voor enkele concessies, zoals de A4 tussen Brescia en Padua, hebben wij geen tarief gelezen: daar toont de rekenhulp geen bedrag.`;
    },
    faqs: (h) => {
      const { rom, T } = D(h);
      return [
        { q: 'Waarom geeft de rekenhulp voor Italië alleen een schatting?', a: 'Omdat de exploitanten wel hun kilometertarieven publiceren, maar niet vrij toegankelijk de officiële afstand tussen twee tolstations; hun eigen rekenhulpen werken alleen in een browser met een beveiligingscontrole. Wij vermenigvuldigen het tarief daarom met de lengte van de route volgens OpenStreetMap. Het resultaat ligt dicht bij de ticketprijs, maar kan enkele euro’s afwijken, bijvoorbeeld als het tolstation niet precies op ons knooppunt ligt.' },
        { q: 'In welke tolklasse valt een auto met caravan in Italië?', a: `Een auto met een eenassige caravan heeft samen drie assen en valt dus in klasse 3. Bij Autostrade kost dat in vlak land ${h.eur(T.aspi_pianura.preis.gespann, 5)} per kilometer in plaats van ${h.eur(T.aspi_pianura.preis.pkw, 5)} voor de auto alleen. Van de Brenner naar Rome scheelt dat volgens onze schatting ${h.eur(rom.gs.s.schaetzung - rom.pkw.s.schaetzung, 2)}. Een caravan met tandemas geeft vier assen en een nog hogere klasse.` },
        { q: 'Betaalt een motor in Italië minder tol dan een auto?', a: 'Nee. Italië deelt voertuigen in naar het aantal assen en de hoogte boven de vooras, niet naar het soort voertuig. Een motor en een auto hebben allebei twee assen en blijven bij de vooras onder 1,30 meter, ze vallen dus allebei in klasse A en betalen hetzelfde kilometertarief. Anders dan Frankrijk kent Italië geen aparte, goedkopere klasse voor motoren.' },
        { q: 'Welke Italiaanse snelwegen rekent deze site niet?', a: 'De trajecten van concessiehouders waarvan wij het tarief van 2026 niet konden lezen: de A4 Brescia–Padova, Autostrade Alto Adriatico in het noordoosten, de A7 Milano–Serravalle richting Genua en de A10 dei Fiori naar de Franse grens. Ze staan in de rekenhulp als “niet geverifieerd” en tellen in geen enkel totaal mee; ritten naar het Gardameer, Venetië of de Rivièra zijn daar dus onvolledig.' },
      ];
    },
    body: (h) => {
      const { T, fahrt, strecken } = D(h);
      const tarif = [
        ['Autostrade per l’Italia, vlak land', h.eur(T.aspi_pianura.preis.pkw, 5), h.eur(T.aspi_pianura.preis.wohnmobil, 5), h.eur(T.aspi_pianura.preis.gespann, 5)],
        ['Autostrade per l’Italia, berg', h.eur(T.aspi_montagna.preis.pkw, 5), h.eur(T.aspi_montagna.preis.wohnmobil, 5), h.eur(T.aspi_montagna.preis.gespann, 5)],
        ['A22 Brennero, berg', h.eur(T.a22_montagna.preis.pkw, 5), h.eur(T.a22_montagna.preis.wohnmobil, 5), h.eur(T.a22_montagna.preis.gespann, 5)],
        ['A22 Brennero, vlak land', h.eur(T.a22_pianura.preis.pkw, 5), h.eur(T.a22_pianura.preis.wohnmobil, 5), h.eur(T.a22_pianura.preis.gespann, 5)],
      ];
      const rows = strecken.map(([a, b]) => { const p = fahrt(a, b, 'pkw'), w = fahrt(a, b, 'wohnmobil'), g = fahrt(a, b, 'gespann'); return [`${ort(h, a)} – ${ort(h, b)}`, `${h.num(p.km)} km`, h.eur(p.s.schaetzung, 2), h.eur(w.s.schaetzung, 2), h.eur(g.s.schaetzung, 2)]; });
      return `<h2>De formule van de exploitanten</h2>
<p>Autostrade per l’Italia beschrijft de berekening als het kilometertarief van de voertuigklasse maal de gereden kilometers, plus btw, afgerond op 10 cent (${h.src('aspiCalcolo')}). Elke concessiehouder rekent zijn eigen traject apart: wie van de Brenner over de A22 en daarna over de A1 rijdt, krijgt dus twee apart afgeronde bedragen. De tarieven hieronder bevatten al 22 % btw en gelden sinds 1 januari 2026.</p>
${h.table(['Exploitant, soort traject', 'Klasse A (auto, motor)', 'Klasse B (camper)', 'Klasse 3 (auto + caravan)'], tarif, 'Euro per kilometer, btw inbegrepen', ['l', 'r', 'r', 'r'])}
<p>Bronnen: ${h.src('aspiCalcolo')}, ${h.src('a22')}, klassen volgens ${h.src('aspiClassi')}. Klasse A betekent: twee assen en boven de vooras hoogstens 1,30 meter hoog. De meeste campers en hoge bestelbussen zitten daarboven en rijden in klasse B.</p>
<h2>Geschatte tol op gangbare routes</h2>
${h.table(['Route', 'Afstand', 'Auto', 'Camper', 'Auto + caravan'], rows, 'Enkele reis, schatting uit kilometertarief × lengte van de route (OpenStreetMap)', ['l', 'r', 'r', 'r', 'r'])}
<p>De afstanden komen uit een routeberekening op gegevens van ${h.src('osm', 'OpenStreetMap')}. Het werkelijke tolplichtige stuk begint en eindigt bij de tolstations en kan enkele kilometers korter of langer zijn. Voor heen en terug verdubbelt de rekenhulp het bedrag.</p>
<h2>Vóór Italië: Oostenrijk of Zwitserland</h2>
<p>Wie over de Brenner komt, betaalt eerst de Oostenrijkse trajecttol op de A13 en heeft vóór Innsbruck het vignet nodig; zie ${h.a('brennermaut', 'Brennertol')}. Via de Gotthard en Chiasso hebt u het ${h.a('vignette-schweiz', 'Zwitserse vignet')} nodig. De hele rit vanuit Nederland, België of Duitsland, met brandstof, rekent ${h.a('maut-nach-italien', 'tol naar Italië')}.</p>`;
    },
  },
});
