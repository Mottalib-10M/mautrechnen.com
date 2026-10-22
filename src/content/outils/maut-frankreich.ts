import { defineGuide, type Helpers } from '../../lib/guide-types';

type Fz = 'pkw' | 'wohnmobil' | 'gespann' | 'motorrad';
/** Maut Frankreich : geschlossene Systeme, Klassen 1, 2 und 5, Raster von APRR, ASF und Escota ab 1.2.2026. */
function D(h: Helpers) {
  const fahrt = (von: string, nach: string, fz: Fz) => {
    const r = h.M.route(von, nach);
    const p = r ? h.M.maut(r.schritte, fz) : [];
    return { km: r?.km ?? 0, p, s: h.M.mautSumme(p) };
  };
  const spanien = { pkw: fahrt('b_basel_fr', 'b_lejonquera', 'pkw'), wm: fahrt('b_basel_fr', 'b_lejonquera', 'wohnmobil'), mo: fahrt('b_basel_fr', 'b_lejonquera', 'motorrad') };
  const paris = fahrt('b_kehl', 'paris', 'pkw');
  const sys = h.P.systeme;
  const paare = (['aprr', 'asf', 'escota'] as const).flatMap((k) => Object.values(sys[k].paare).map((x) => ({ k, ...(x as { von: string; bis: string; preis: Record<Fz, number | null> }) })));
  const fl = sys.aprr.paare['mulhouse|beaune'].teile[0].preis;
  const mb = h.P.tunnel.montblanc, fr = h.P.tunnel.frejus;
  return { fahrt, spanien, paris, sys, paare, fl, mb, fr };
}

export default defineGuide({
  id: 'maut-frankreich',
  group: 'maut',
  order: 21,
  tool: 'maut',
  laender: ['FR', 'ES', 'LU', 'BE', 'DE'],
  von: 'b_basel_fr',
  nach: 'b_lejonquera',
  related: ['maut-spanien', 'benzinpreis-frankreich', 'maut-italien', 'tanken-luxemburg', 'vignette-schweiz'],
  sources: ['aprr', 'vinciLiaisons', 'asfGuide', 'sanef', 'atmb', 'atmbFluxLibre', 'sftrf'],
  de: {
    slug: 'maut-frankreich',
    nav: 'Maut Frankreich',
    card: 'Péage 2026 nach den Rastern von APRR, ASF und Escota: Klassen 1, 2 und 5, Tunnel.',
    title: 'Maut Frankreich 2026: Klassen, Péage-Preise, Tunnel',
    description: 'Maut Frankreich 2026: Preise von APRR, ASF und Escota ab 1. Februar, Klasse 1, 2 oder 5 für Pkw, Wohnmobil, Gespann und Motorrad, dazu Mont Blanc und Fréjus.',
    h1: 'Maut Frankreich 2026: was kostet der Péage, wie online bezahlen?',
    intro: 'Start und Ziel wählen: der Rechner nimmt die Preise je Ein- und Ausfahrt aus den Tarifrastern der Betreiber und nennt, was er nicht gelesen hat.',
    resume: (h) => {
      const { spanien, paris } = D(h);
      return `Auf den französischen Autobahnen zahlt man den Péage meist in geschlossenen Systemen: Bei der Einfahrt nimmt man ein Ticket, bei der Ausfahrt zahlt man den Preis für genau dieses Paar von Mautstellen. Wie viel, hängt von der Klasse ab. Klasse 1 gilt für Fahrzeuge bis 2 Meter Höhe und 3,5 Tonnen, auch mit einem Anhänger, der nicht höher ist; Klasse 2 für Fahrzeuge zwischen 2 und 3 Meter, also Wohnmobile und Gespanne mit hohem Wohnwagen; Klasse 5 für Motorräder. Seit dem 1. Februar 2026 gelten neue Raster. Von der Schweizer Grenze bei Basel über Mülhausen, Beaune und Lyon bis zur spanischen Grenze bei Le Perthus (${h.num(spanien.pkw.km)} km) ergeben sie ${h.eur(spanien.pkw.s.geprueft, 2)} für den Pkw, ${h.eur(spanien.wm.s.geprueft, 2)} für das Wohnmobil und ${h.eur(spanien.mo.s.geprueft, 2)} für das Motorrad, einfache Fahrt. Nicht gelesen haben wir das Raster der Sanef für die A4 und die A1: Die Fahrt von Straßburg nach Paris hat deshalb ${paris.s.offen.length ? 'keinen verifizierten Preis' : 'einen Preis'}.`;
    },
    faqs: (h) => {
      const { spanien, mb } = D(h);
      return [
        { q: 'Wann zahlt ein Gespann in Frankreich Klasse 1 und wann Klasse 2?', a: 'Entscheidend ist die Höhe. Laut Tarifführer der ASF bleibt ein Pkw mit Anhänger in Klasse 1, solange der Anhänger ohne Ladung höchstens 2 Meter hoch ist; ein flacher Gepäck- oder Bootsanhänger kostet also nichts extra. Ist der Wohnwagen zwischen 2 und 3 Meter hoch, gilt Klasse 2. Der Rechner setzt das Gespann in Klasse 2, rechnet also den Fall des hohen Wohnwagens.' },
        { q: 'Wie viel spart ein Motorrad auf der französischen Autobahn?', a: `Motorräder haben eine eigene Klasse 5 und zahlen deutlich weniger als ein Pkw. Von Basel bis zur spanischen Grenze sind es ${h.eur(spanien.mo.s.geprueft, 2)} statt ${h.eur(spanien.pkw.s.geprueft, 2)}, also gut ${h.num(Math.round((1 - spanien.mo.s.geprueft / spanien.pkw.s.geprueft) * 100))} Prozent weniger. Das gilt auch für Seitenwagen und Trikes. Im Fréjus-Tunnel fährt ein Motorrad mit Anhänger ebenfalls in Klasse 5.` },
        { q: 'Warum fehlt für Straßburg–Paris ein Mautbetrag?', a: 'Die Strecke läuft über die A4 der Sanef. Deren Tarifraster 2026 gibt es als PDF, der Server verweigert automatisierten Abrufen aber den Zugriff, auch über Archivkopien. Wir haben die Preise deshalb nicht gelesen und zeigen den Abschnitt als „nicht verifiziert“, statt einen alten oder geschätzten Wert einzusetzen. Dasselbe gilt für die A1 von Lille nach Paris.' },
        { q: 'Lohnt sich am Mont-Blanc-Tunnel das Ticket für Hin- und Rückfahrt?', a: `Ja, wenn Sie innerhalb einer Woche zurückkommen. Die einfache Fahrt kostet für den Pkw von Frankreich nach Italien ${h.eur(mb.einfach.pkw, 2)}, Hin und zurück ${h.eur(mb.hinzurueck.pkw, 2)}. Die Rückfahrt gilt laut ATMB bis Mitternacht des siebten Tages nach dem Ausstellen. Bei einem längeren Urlaub zahlen Sie zweimal den einfachen Preis, in der Gegenrichtung wegen der italienischen Mehrwertsteuer etwas mehr.` },
        { q: 'Kann ich die Maut in Frankreich online bezahlen?', a: 'An den klassischen Mautstellen zahlen Sie vor Ort, mit Karte, bar oder mit einem Télépéage-Gerät. Online zahlen Sie auf den Strecken ohne Schranken (Flux Libre): laut ATMB auf der A79 und auf der A13 und A14 in der Normandie, ab 2027 auch auf der A40 zwischen Passy und Annemasse. Dort wird das Kennzeichen erfasst, und Sie zahlen innerhalb von 72 Stunden auf der Website des Betreibers oder bei einem Tabakhändler des Nirio-Netzes. Einen Beleg über eine an der Mautstelle nicht bezahlte Fahrt begleichen Sie ebenfalls online mit Karte.' },
      ];
    },
    body: (h) => {
      const { paare, fl, mb, fr } = D(h);
      const z = (x: number | null) => (x == null ? 'nicht gelesen' : h.eur(x, 2));
      const rows = paare.map((x) => [`${x.von} – ${x.bis}`, x.k.toUpperCase(), z(x.preis.pkw), z(x.preis.wohnmobil), z(x.preis.motorrad)]);
      return `<h2>Gelesene Preise ab dem 1. Februar 2026</h2>
${h.table(['Einfahrt – Ausfahrt', 'Betreiber', 'Klasse 1', 'Klasse 2', 'Klasse 5'], rows, 'Einfache Fahrt, Euro mit Mehrwertsteuer', ['l', 'l', 'r', 'r', 'r'])}
<p>Quellen: ${h.src('aprr')}, ${h.src('vinciLiaisons')} und ${h.src('asfGuide')}. Die Zeilen ab Mülhausen setzen sich aus zwei Posten zusammen: der offenen Mautstelle Fontaine-Larivière an der A36 (${h.eur(fl.pkw, 2)} für den Pkw) und dem Ticket ab Saint-Maurice. Dazwischen, zwischen Belfort und Montbéliard, nehmen wir keine Maut an; das PDF der APRR sagt dazu nichts ausdrücklich. Die A35 von Basel nach Mülhausen steht in keinem Raster und ist im Rechner mautfrei.</p>
<h2>Was der Rechner nicht weiß</h2>
<p>Nicht verifiziert sind die Strecken der Sanef (A4 ab Metz und Straßburg nach Paris, A1 ab Lille) und die Mautstelle La Turbie an der A8 zwischen Nizza und der italienischen Grenze (${h.src('sanef', 'Raster der Sanef')}). Solche Abschnitte erscheinen in der Liste unter dem Rechner ohne Betrag. Für die Klasse 5 zwischen Lyon und Orange haben wir keinen Preis gelesen.</p>
<h2>Klassen in der Praxis</h2>
<p>Ein Wohnmobil zwischen 2 und 3 Meter Höhe zahlt Klasse 2; über 3 Meter Höhe oder über 3,5 Tonnen gilt Klasse 3, die dieser Rechner nicht abbildet. Fahrzeuge der Klasse 2, die für eine Person mit Behinderung umgebaut sind, zahlen den Tarif der Klasse 1. Wer mit Pkw und Wohnwagen fährt, misst am besten die Gesamthöhe: Unter 2 Metern bleibt es bei Klasse 1, und der Betrag des Rechners für das Gespann ist dann zu hoch.</p>
<h2>Alpentunnel nach Italien</h2>
<p>Mont-Blanc-Tunnel (${h.src('atmb')}) und Fréjus-Tunnel (${h.src('sftrf')}) kosten von Frankreich aus je ${h.eur(mb.einfach.pkw, 2)} einfach und ${h.eur(mb.hinzurueck.pkw, 2)} hin und zurück für den Pkw, ${h.eur(fr.einfach.wohnmobil, 2)} und ${h.eur(fr.hinzurueck.wohnmobil, 2)} in Klasse 2 sowie ${h.eur(fr.einfach.motorrad, 2)} und ${h.eur(fr.hinzurueck.motorrad, 2)} für das Motorrad. Danach beginnt die italienische Autobahn, siehe ${h.a('maut-italien', 'Maut Italien')}. Wer weiter nach Spanien fährt, findet die Lage hinter La Jonquera unter ${h.a('maut-spanien', 'Maut Spanien')}.</p>`;
    },
  },
  en: {
    slug: 'france-tolls',
    nav: 'France tolls',
    card: '2026 péage from the APRR, ASF and Escota rate grids: classes 1, 2 and 5, tunnels.',
    title: 'Motorway tolls in France 2026: classes, péage, tunnels',
    description: 'French motorway tolls 2026: APRR, ASF and Escota prices from 1 February, class 1, 2 or 5 for cars, motorhomes, caravans and motorbikes, plus Mont Blanc, Fréjus.',
    h1: 'French motorway tolls 2026: what does the péage cost?',
    intro: 'Choose start and destination: the calculator takes the price for each entry and exit from the operators’ rate grids and names what it has not read.',
    resume: (h) => {
      const { spanien, paris } = D(h);
      return `On French motorways the péage is mostly charged in closed systems: you take a ticket on entry and pay at the exit for exactly that pair of toll stations. How much depends on the class. Class 1 covers vehicles up to 2 metres high and 3.5 tonnes, including with a trailer that is no higher; class 2 covers vehicles between 2 and 3 metres, which means motorhomes and cars towing a tall caravan; class 5 is for motorcycles. New grids have applied since 1 February 2026. From the Swiss border at Basel via Mulhouse, Beaune and Lyon to the Spanish border at Le Perthus (${h.num(spanien.pkw.km)} km) they give ${h.eur(spanien.pkw.s.geprueft, 2)} for a car, ${h.eur(spanien.wm.s.geprueft, 2)} for a motorhome and ${h.eur(spanien.mo.s.geprueft, 2)} for a motorcycle, one way. We have not read Sanef’s grid for the A4 and A1, so the drive from Strasbourg to Paris has ${paris.s.offen.length ? 'no verified price' : 'a price'}.`;
    },
    faqs: (h) => {
      const { spanien, mb } = D(h);
      return [
        { q: 'When does a car with a caravan pay class 1 in France, and when class 2?', a: 'Height decides. According to the ASF rate guide, a car with a trailer stays in class 1 as long as the unloaded trailer is no more than 2 metres high, so a low luggage or boat trailer costs nothing extra. If the caravan is between 2 and 3 metres high, class 2 applies. The calculator puts a car with caravan in class 2, so it assumes a tall caravan.' },
        { q: 'How much does a motorcycle save on French motorways?', a: `Motorcycles have their own class 5 and pay much less than a car. From Basel to the Spanish border it is ${h.eur(spanien.mo.s.geprueft, 2)} instead of ${h.eur(spanien.pkw.s.geprueft, 2)}, a good ${h.num(Math.round((1 - spanien.mo.s.geprueft / spanien.pkw.s.geprueft) * 100))} per cent less. The same applies to sidecars and trikes. In the Fréjus tunnel a motorcycle with a trailer also travels in class 5.` },
        { q: 'Why is there no toll amount for Strasbourg to Paris?', a: 'The route runs on Sanef’s A4. Its 2026 rate grid exists as a PDF, but the server refuses automated access, archive copies included. We have therefore not read the prices and show the section as “not verified” rather than inserting an old or estimated figure. The same applies to the A1 from Lille to Paris.' },
        { q: 'Is the return ticket worth it at the Mont Blanc tunnel?', a: `Yes, if you come back within a week. One way from France to Italy costs a car ${h.eur(mb.einfach.pkw, 2)}, a return ${h.eur(mb.hinzurueck.pkw, 2)}. According to ATMB the return leg is valid until midnight on the seventh day after issue. On a longer holiday you pay the single fare twice, and slightly more in the opposite direction because of Italian VAT.` },
        { q: 'Can I pay French tolls online?', a: 'At conventional toll plazas you pay on the spot, by card, cash or with a télépéage tag. You pay online on barrier-free sections (Flux Libre): according to ATMB, the A79 and the A13 and A14 in Normandy, and from 2027 the A40 between Passy and Annemasse too. There the number plate is recorded and you pay within 72 hours on the operator’s website or at a tobacconist in the Nirio network. A receipt for a trip not paid at a toll plaza can also be settled online by card.' },
      ];
    },
    body: (h) => {
      const { paare, fl, mb, fr } = D(h);
      const z = (x: number | null) => (x == null ? 'not read' : h.eur(x, 2));
      const rows = paare.map((x) => [`${x.von} – ${x.bis}`, x.k.toUpperCase(), z(x.preis.pkw), z(x.preis.wohnmobil), z(x.preis.motorrad)]);
      return `<h2>Prices read, valid from 1 February 2026</h2>
${h.table(['Entry – exit', 'Operator', 'Class 1', 'Class 2', 'Class 5'], rows, 'One way, euros including VAT', ['l', 'l', 'r', 'r', 'r'])}
<p>Sources: ${h.src('aprr')}, ${h.src('vinciLiaisons')} and ${h.src('asfGuide')}. The rows starting at Mulhouse combine two items: the open toll barrier at Fontaine-Larivière on the A36 (${h.eur(fl.pkw, 2)} for a car) and the ticket from Saint-Maurice. In between, from Belfort to Montbéliard, we assume no toll; the APRR PDF does not say so explicitly. The A35 from Basel to Mulhouse appears in no grid and is toll-free in the calculator.</p>
<h2>What the calculator does not know</h2>
<p>Not verified are the Sanef routes (A4 from Metz and Strasbourg to Paris, A1 from Lille) and the La Turbie toll station on the A8 between Nice and the Italian border (${h.src('sanef', 'Sanef rate grid')}). Such sections appear without an amount in the list below the calculator. For class 5 between Lyon and Orange we have read no price.</p>
<h2>Classes in practice</h2>
<p>A motorhome between 2 and 3 metres high pays class 2; above 3 metres or 3.5 tonnes class 3 applies, which this calculator does not cover. Class 2 vehicles adapted for a disabled person pay the class 1 rate. If you tow a caravan, measure the total height: below 2 metres you stay in class 1, and the calculator’s figure for a car with caravan is then too high.</p>
<h2>Alpine tunnels to Italy</h2>
<p>From France, the Mont Blanc tunnel (${h.src('atmb')}) and the Fréjus tunnel (${h.src('sftrf')}) each cost ${h.eur(mb.einfach.pkw, 2)} one way and ${h.eur(mb.hinzurueck.pkw, 2)} return for a car, ${h.eur(fr.einfach.wohnmobil, 2)} and ${h.eur(fr.hinzurueck.wohnmobil, 2)} in class 2, and ${h.eur(fr.einfach.motorrad, 2)} and ${h.eur(fr.hinzurueck.motorrad, 2)} for a motorcycle. After that the Italian motorway starts; see ${h.a('maut-italien', 'Italian tolls')}. If you continue to Spain, what happens beyond La Jonquera is on ${h.a('maut-spanien', 'Spanish tolls')}.</p>`;
    },
  },
  nl: {
    slug: 'tol-frankrijk',
    nav: 'Tol Frankrijk',
    card: 'Péage 2026 volgens de tariefroosters van APRR, ASF en Escota: klassen 1, 2 en 5, tunnels.',
    title: 'Tol Frankrijk 2026: klassen, péageprijzen en tunnels',
    description: 'Tol Frankrijk 2026: prijzen van APRR, ASF en Escota vanaf 1 februari, klasse 1, 2 of 5 voor auto, camper, caravan en motor, plus Mont Blanc- en Fréjustunnel.',
    h1: 'Tol Frankrijk 2026: wat kost de péage?',
    intro: 'Kies vertrek en bestemming: de rekenhulp neemt de prijs per op- en afrit uit de tariefroosters van de exploitanten en zegt wat hij niet gelezen heeft.',
    resume: (h) => {
      const { spanien, paris } = D(h);
      return `Op de Franse snelwegen betaalt u de péage meestal in gesloten systemen: bij het oprijden neemt u een ticket, bij het afrijden betaalt u de prijs voor precies dat paar tolstations. Hoeveel, hangt af van de klasse. Klasse 1 geldt voor voertuigen tot 2 meter hoog en 3,5 ton, ook met een aanhanger die niet hoger is; klasse 2 voor voertuigen tussen 2 en 3 meter, dus campers en auto’s met een hoge caravan; klasse 5 voor motoren. Sinds 1 februari 2026 gelden nieuwe roosters. Van de Zwitserse grens bij Bazel via Mulhouse, Beaune en Lyon tot de Spaanse grens bij Le Perthus (${h.num(spanien.pkw.km)} km) geven ze ${h.eur(spanien.pkw.s.geprueft, 2)} voor een auto, ${h.eur(spanien.wm.s.geprueft, 2)} voor een camper en ${h.eur(spanien.mo.s.geprueft, 2)} voor een motor, enkele reis. Het rooster van Sanef voor de A4 en de A1 hebben wij niet gelezen: de rit van Straatsburg naar Parijs heeft daarom ${paris.s.offen.length ? 'geen geverifieerde prijs' : 'een prijs'}.`;
    },
    faqs: (h) => {
      const { spanien, mb } = D(h);
      return [
        { q: 'Wanneer betaalt een auto met caravan in Frankrijk klasse 1 en wanneer klasse 2?', a: 'De hoogte beslist. Volgens de tariefgids van ASF blijft een auto met aanhanger in klasse 1 zolang de onbeladen aanhanger hoogstens 2 meter hoog is; een lage bagage- of bootaanhanger kost dus niets extra. Is de caravan tussen 2 en 3 meter hoog, dan geldt klasse 2. De rekenhulp zet een auto met caravan in klasse 2 en gaat dus uit van een hoge caravan.' },
        { q: 'Hoeveel bespaart een motor op de Franse snelweg?', a: `Motoren hebben een eigen klasse 5 en betalen flink minder dan een auto. Van Bazel tot de Spaanse grens is het ${h.eur(spanien.mo.s.geprueft, 2)} in plaats van ${h.eur(spanien.pkw.s.geprueft, 2)}, dus ruim ${h.num(Math.round((1 - spanien.mo.s.geprueft / spanien.pkw.s.geprueft) * 100))} procent minder. Dat geldt ook voor zijspannen en trikes. In de Fréjustunnel rijdt een motor met aanhanger eveneens in klasse 5.` },
        { q: 'Waarom ontbreekt een tolbedrag voor Straatsburg–Parijs?', a: 'De route loopt over de A4 van Sanef. Het tariefrooster 2026 bestaat als pdf, maar de server weigert automatische toegang, ook via archiefkopieën. Wij hebben de prijzen dus niet gelezen en tonen het traject als “niet geverifieerd”, in plaats van een oude of geschatte waarde in te vullen. Hetzelfde geldt voor de A1 van Rijsel naar Parijs.' },
        { q: 'Loont een retourticket bij de Mont Blanc-tunnel?', a: `Ja, als u binnen een week terugkomt. Enkele reis van Frankrijk naar Italië kost voor een auto ${h.eur(mb.einfach.pkw, 2)}, heen en terug ${h.eur(mb.hinzurueck.pkw, 2)}. Volgens ATMB geldt de terugrit tot middernacht van de zevende dag na uitgifte. Bij een langere vakantie betaalt u twee keer de enkele prijs, in de andere richting door de Italiaanse btw iets meer.` },
        { q: 'Kan ik de tol in Frankrijk online betalen?', a: 'Bij de gewone tolposten betaalt u ter plaatse, met een kaart, contant of met een télépéage-badge. Online betaalt u op de trajecten zonder slagboom (Flux Libre): volgens ATMB op de A79 en op de A13 en A14 in Normandië, vanaf 2027 ook op de A40 tussen Passy en Annemasse. Daar wordt de nummerplaat geregistreerd en betaalt u binnen 72 uur op de site van de beheerder of bij een tabakszaak van het Nirio-netwerk. Ook een onbetaalde tolbon voldoet u online.' },
      ];
    },
    body: (h) => {
      const { paare, fl, mb, fr } = D(h);
      const z = (x: number | null) => (x == null ? 'niet gelezen' : h.eur(x, 2));
      const rows = paare.map((x) => [`${x.von} – ${x.bis}`, x.k.toUpperCase(), z(x.preis.pkw), z(x.preis.wohnmobil), z(x.preis.motorrad)]);
      return `<h2>Gelezen prijzen vanaf 1 februari 2026</h2>
${h.table(['Oprit – afrit', 'Exploitant', 'Klasse 1', 'Klasse 2', 'Klasse 5'], rows, 'Enkele reis, euro inclusief btw', ['l', 'l', 'r', 'r', 'r'])}
<p>Bronnen: ${h.src('aprr')}, ${h.src('vinciLiaisons')} en ${h.src('asfGuide')}. De regels vanaf Mulhouse bestaan uit twee posten: de open tolpoort Fontaine-Larivière op de A36 (${h.eur(fl.pkw, 2)} voor een auto) en het ticket vanaf Saint-Maurice. Daartussen, van Belfort tot Montbéliard, gaan wij uit van geen tol; de pdf van APRR zegt dat niet uitdrukkelijk. De A35 van Bazel naar Mulhouse staat in geen enkel rooster en is in de rekenhulp tolvrij.</p>
<h2>Wat de rekenhulp niet weet</h2>
<p>Niet geverifieerd zijn de trajecten van Sanef (A4 vanaf Metz en Straatsburg naar Parijs, A1 vanaf Rijsel) en de tolpost La Turbie op de A8 tussen Nice en de Italiaanse grens (${h.src('sanef', 'rooster van Sanef')}). Zulke trajecten staan zonder bedrag in de lijst onder de rekenhulp. Voor klasse 5 tussen Lyon en Orange hebben wij geen prijs gelezen.</p>
<h2>Klassen in de praktijk</h2>
<p>Een camper tussen 2 en 3 meter hoog betaalt klasse 2; boven 3 meter of 3,5 ton geldt klasse 3, die deze rekenhulp niet behandelt. Voertuigen van klasse 2 die zijn aangepast voor iemand met een handicap, betalen het tarief van klasse 1. Wie met auto en caravan rijdt, meet het best de totale hoogte: onder 2 meter blijft het klasse 1, en dan is het bedrag van de rekenhulp voor de combinatie te hoog.</p>
<h2>Alpentunnels naar Italië</h2>
<p>De Mont Blanc-tunnel (${h.src('atmb')}) en de Fréjustunnel (${h.src('sftrf')}) kosten vanuit Frankrijk elk ${h.eur(mb.einfach.pkw, 2)} enkele reis en ${h.eur(mb.hinzurueck.pkw, 2)} heen en terug voor een auto, ${h.eur(fr.einfach.wohnmobil, 2)} en ${h.eur(fr.hinzurueck.wohnmobil, 2)} in klasse 2, en ${h.eur(fr.einfach.motorrad, 2)} en ${h.eur(fr.hinzurueck.motorrad, 2)} voor een motor. Daarna begint de Italiaanse snelweg; zie ${h.a('maut-italien', 'tol Italië')}. Wie doorrijdt naar Spanje, leest wat er na La Jonquera komt op ${h.a('maut-spanien', 'tol Spanje')}.</p>`;
    },
  },
});
