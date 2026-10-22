import { defineGuide, type Helpers } from '../../lib/guide-types';

type Fz = 'pkw' | 'wohnmobil' | 'gespann' | 'motorrad';
/** Maut nach Kroatien : ganze Fahrt ab DE, NL, BE mit Vignetten (AT, SI), Streckenmaut, kroatischer Maut und Sprit. */
function D(h: Helpers) {
  const ab = h.M.addDays(h.today, 7);
  const sorte = (fz: Fz) => (fz === 'pkw' || fz === 'motorrad' ? 'e95' : 'diesel') as 'e95' | 'diesel';
  const go = (start: string, ziel: string, fz: Fz = 'pkw', meiden: string[] = []) => h.M.reise({ start, ziel, fz, sorte: sorte(fz), verbrauch: h.P.verbrauch_vorgabe[fz], ab, dauer: 14, hinUndZurueck: true, aufenthalt: false, meiden });
  const haupt = go('muenchen', 'split');
  const fz = (['pkw', 'wohnmobil', 'gespann', 'motorrad'] as Fz[]).map((f) => [f, go('muenchen', 'split', f)] as const);
  const ohneSI = go('muenchen', 'split', 'pkw', ['SI']);
  const ohneAT = go('muenchen', 'split', 'pkw', ['AT']);
  const ziele = ['rijeka', 'krk', 'umag', 'pula', 'zadar', 'split', 'makarska'].map((z) => [z, go('muenchen', z)] as const);
  return { ab, go, haupt, fz, ohneSI, ohneAT, ziele };
}
const ort = (h: Helpers, id: string) => h.M.KNOTEN[id].n[h.lang];
type R = ReturnType<typeof D>['haupt'];
const anteil = (r: R) => (r && r.summen.gesamt > 0 ? (r.summen.vignetten + r.summen.mautGeprueft) / r.summen.gesamt : 0);
const km = (r: R, c: string) => (r ? r.route.laender.filter((x) => x.c === c).reduce((a, x) => a + x.km, 0) : 0);
const vig = (r: R, c: string) => r?.vignetten.find((v) => v.land === c)?.summeEur ?? 0;
/** Maut eines Landes, hin und zurück. */
const mautLand = (r: R, c: string) => (r ? r.maut.filter((p) => p.land === c && !p.schaetzung).reduce((a, p) => a + (p.preis ?? 0), 0) * r.fahrten : 0);

export default defineGuide({
  id: 'maut-nach-kroatien',
  group: 'strecke',
  order: 40,
  tool: 'reise',
  von: 'muenchen',
  nach: 'split',
  related: ['maut-kroatien', 'vignette-slowenien', 'vignette-oesterreich', 'karawankentunnel', 'spritpreise-kroatien', 'tauerntunnel'],
  sources: ['asfinagVignette', 'asfinagStrecke', 'darsVignette', 'hacA1', 'hacBregana', 'wob'],
  de: {
    slug: 'maut-nach-kroatien',
    nav: 'Maut nach Kroatien',
    card: 'Die ganze Fahrt an die Adria: Vignetten, Tunnel, kroatische Maut und Sprit.',
    title: 'Maut nach Kroatien 2026: Kosten der ganzen Fahrt ab München',
    description: 'Maut nach Kroatien 2026: Vignetten für Österreich und Slowenien, Tauern- und Karawankentunnel, kroatische Autobahn und Sprit, hin und zurück für Ihr Fahrzeug.',
    h1: 'Maut nach Kroatien 2026: was kostet die Fahrt an die Adria?',
    intro: 'Start, Ziel, Fahrzeug und Reisedaten eingeben: der Rechner addiert Vignetten, Maut und Sprit für jedes Land auf dem Weg.',
    resume: (h) => {
      const { haupt: r } = D(h);
      if (!r) return '';
      return `Wer aus Süddeutschland nach Kroatien fährt, durchquert fast immer Österreich und Slowenien und zahlt dort auf vier Arten: die österreichische Vignette, die Streckenmaut für Tauernautobahn und Karawankentunnel, die slowenische Vignette und schließlich die kroatische Autobahnmaut nach Abschnitten. Für eine Fahrt von München nach Split (${h.num(r.route.km)} km je Richtung) mit dem Pkw, Abfahrt am ${h.date(h.M.addDays(h.today, 7))} und Rückfahrt vierzehn Tage später, kommen so ${h.eur(r.summen.vignetten, 2)} für Vignetten und ${h.eur(r.summen.mautGeprueft, 2)} für Maut und Tunnel zusammen, hin und zurück. Der Sprit kostet nach den amtlichen Durchschnittspreisen der vier Länder etwa ${h.eur(r.summen.sprit, 2)}, bei ${h.num(h.P.verbrauch_vorgabe.pkw)} Litern auf 100 km. Insgesamt sind das rund ${h.eur(r.summen.gesamt, 2)}; Vignetten und Maut machen davon ${h.pct(anteil(r), 0)} aus. Wohnmobil, Gespann und Motorrad zahlen andere Beträge, weil jedes Land die Fahrzeugklassen anders zieht.`;
    },
    faqs: (h) => {
      const { haupt: r, fz, ohneSI } = D(h);
      const wm = fz.find(([f]) => f === 'wohnmobil')![1];
      return [
        { q: 'Welche Länder kosten auf der Fahrt nach Split am meisten?', a: r ? `Hin und zurück kostet die kroatische Autobahn von der Grenze bis Split ${h.eur(mautLand(r, 'HR'), 2)}, die österreichische Streckenmaut für Tauern und Karawanken ${h.eur(mautLand(r, 'AT'), 2)}. ${mautLand(r, 'HR') > r.summen.vignetten ? 'Kroatien allein kostet damit mehr als alle Vignetten zusammen.' : 'Die Vignetten kosten zusammen mehr als die kroatische Maut.'} Die Vignetten für Österreich (${h.eur(vig(r, 'AT'), 2)}) und Slowenien (${h.eur(vig(r, 'SI'), 2)}) sind bei vierzehn Tagen Urlaub vergleichsweise günstig, weil Sie nur zwei Fahrtage abdecken müssen.` : '' },
        { q: 'Kann man Slowenien auf dem Weg nach Kroatien umfahren?', a: `${ohneSI ? `Ja, aber die Strecke wird ${h.num(ohneSI.route.km)} km lang.` : 'In unserem Netz nicht: Ohne Slowenien findet der Rechner keine Autobahnverbindung von München nach Split.'} Eine Route über Ungarn nach Zagreb enthält unser Netz nicht, wir rechnen sie deshalb auch nicht. Die slowenische Vignette ist bei zwei Fahrtagen ohnehin ein kleiner Posten: Für Pkw sind es hin und zurück derzeit ${h.eur(vig(D(h).haupt, 'SI'), 2)}, und nach Istrien führt kein Weg an Slowenien vorbei.` },
        { q: 'Wie viel teurer ist die Fahrt mit dem Wohnmobil?', a: r && wm ? `Für München–Split und zurück rechnen wir mit dem Wohnmobil rund ${h.eur(wm.summen.gesamt, 2)} statt ${h.eur(r.summen.gesamt, 2)}. Der Unterschied kommt aus drei Quellen: In Slowenien fallen die meisten Wohnmobile in die teurere Klasse 2B, in Kroatien in die Gruppe II, und der Verbrauch ist höher. In Österreich zahlt das Wohnmobil bis 3,5 Tonnen dagegen dasselbe wie der Pkw.` : '' },
        { q: 'Wo tankt man auf dem Weg nach Kroatien am günstigsten?', a: r?.tanken ? `Nach dem letzten Weekly Oil Bulletin der EU-Kommission ist der Durchschnittspreis für Super auf dieser Strecke in ${h.land(r.tanken.land)} am niedrigsten, mit ${h.l3(r.tanken.preis)} je Liter. Das ist ein Landesdurchschnitt: An Autobahntankstellen liegt der Preis oft darüber. Der Rechner zeigt nach jeder Berechnung, in welchem Durchreiseland der Liter am wenigsten kostet.` : '' },
      ].filter((f) => f.a);
    },
    body: (h) => {
      const { go, fz, ziele, ohneAT, ab } = D(h);
      const starts = ['muenchen', 'stuttgart', 'frankfurt', 'koeln', 'berlin', 'hamburg'];
      const rowsS = starts.map((s) => { const r = go(s, 'split'); return r ? [ort(h, s), `${h.num(r.route.km)} km`, h.eur(r.summen.vignetten, 2), h.eur(r.summen.mautGeprueft, 2), h.eur(r.summen.sprit, 2), h.eur(r.summen.gesamt, 2)] : [ort(h, s), '–', '–', '–', '–', '–']; });
      const name: Record<Fz, string> = { pkw: 'Pkw', wohnmobil: 'Wohnmobil', gespann: 'Pkw mit Wohnwagen', motorrad: 'Motorrad' };
      const rowsF = fz.map(([f, r]) => r ? [name[f], h.eur(r.summen.vignetten, 2), h.eur(r.summen.mautGeprueft, 2), h.eur(r.summen.sprit, 2), h.eur(r.summen.gesamt, 2)] : [name[f], '–', '–', '–', '–']);
      const rowsZ = ziele.map(([z, r]) => r ? [ort(h, z), `${h.num(r.route.km)} km`, `${h.num(km(r, 'HR'))} km`, h.eur(r.summen.mautGeprueft, 2), h.eur(r.summen.gesamt, 2)] : [ort(h, z), '–', '–', '–', '–']);
      return `<h2>Ab sechs deutschen Städten nach Split</h2>
${h.table(['Start', 'Strecke', 'Vignetten', 'Maut', 'Sprit', 'Summe'], rowsS, `Pkw, Super, hin und zurück, Abfahrt ${h.date(ab)}, 14 Tage Aufenthalt`, ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>Vignetten und Maut sind ab jeder Stadt fast gleich, weil alle Routen ab München dieselben Abschnitte nehmen; den Unterschied macht der Sprit für die Anfahrt durch Deutschland. Wer aus dem Norden kommt, zahlt deshalb vor allem mehr an der Zapfsäule. Die Strecke wählt der Rechner nach der kürzesten Fahrzeit im Netz.</p>
<h2>Fahrzeug macht den Unterschied</h2>
${h.table(['Fahrzeug', 'Vignetten', 'Maut', 'Sprit', 'Summe'], rowsF, 'München – Split, hin und zurück; Wohnmobil und Gespann mit Diesel', ['l', 'r', 'r', 'r', 'r'])}
<p>Die Klassen sind in jedem Land anders gezogen. In Österreich zahlen alle Fahrzeuge bis 3,5 Tonnen dieselbe Streckenmaut, der Wohnwagen ist frei. In Slowenien entscheidet die Höhe über der Vorderachse: Die meisten Wohnmobile sind Klasse 2B und zahlen das Doppelte der Klasse 2A. Für den Wohnwagen am Pkw haben wir die Regel der DARS nicht verifiziert; der Rechner rechnet nur die Vignette des Zugfahrzeugs und sagt das dazu. In Kroatien hebt jeder Anhänger den Pkw in die Gruppe II.</p>
<h2>Ziele an der Küste</h2>
${h.table(['Ziel', 'Strecke', 'davon Kroatien', 'Maut', 'Summe'], rowsZ, 'Ab München, Pkw, hin und zurück', ['l', 'r', 'r', 'r', 'r'])}
<p>Nach Istrien und in die Kvarner-Bucht ist die kroatische Maut gering: Die Ypsilon-Autobahn der BINA-Istra kostet nur wenige Euro, die Küstenstraße von Umag nach Rovinj ist mautfrei, und die Brücke nach Krk kostet in unserem Netz nichts. In Dalmatien wird die A1 der HAC zur größten Einzelposition. Die Tarife je Abschnitt stehen unter ${h.a('maut-kroatien', 'Maut Kroatien')}.</p>
<h2>Andere Wege</h2>
<p>${ohneAT ? `Wer Österreich meiden will, fährt in unserem Netz über die Schweiz und Italien; die Strecke wird dabei ${h.num(ohneAT.route.km)} km lang statt rund ${h.num(go('muenchen', 'split')?.route.km ?? 0)} km, und ${ohneAT.offen.length} Abschnitte darauf sind nicht verifiziert. Zum Vergleich der Summen fehlt damit ein Teil der Maut.` : 'Ohne Österreich findet der Rechner keine sinnvolle Strecke.'} Die Alternativen innerhalb Österreichs, über die Tauern oder über den Pyhrn nach Spielfeld, vergleicht ${h.a('maut-oesterreich', 'Maut Österreich')}. Ausführliche Seiten gibt es zu ${h.a('tauerntunnel', 'Tauerntunnel')}, ${h.a('karawankentunnel', 'Karawankentunnel')} und ${h.a('vignette-slowenien', 'Vignette Slowenien')}.</p>`;
    },
  },
  en: {
    slug: 'tolls-to-croatia',
    nav: 'Tolls to Croatia',
    card: 'The whole drive to the Adriatic: vignettes, tunnels, Croatian tolls and fuel.',
    title: 'Tolls to Croatia 2026: cost of the whole drive from Munich',
    description: 'Tolls to Croatia 2026: Austrian and Slovenian vignettes, the Tauern and Karawanken tunnels, Croatian motorway tolls and fuel, there and back for your vehicle.',
    h1: 'Tolls to Croatia 2026: what does the drive to the Adriatic cost?',
    intro: 'Enter start, destination, vehicle and dates: the calculator adds up vignettes, tolls and fuel for every country on the way.',
    resume: (h) => {
      const { haupt: r } = D(h);
      if (!r) return '';
      return `Driving from southern Germany to Croatia, you almost always cross Austria and Slovenia and pay in four ways: the Austrian vignette, the section tolls for the Tauern motorway and the Karawanken tunnel, the Slovenian vignette and finally the Croatian motorway toll by section. For a car trip from Munich to Split (${h.num(r.route.km)} km each way), leaving on ${h.date(h.M.addDays(h.today, 7))} and returning fourteen days later, that adds up to ${h.eur(r.summen.vignetten, 2)} for vignettes and ${h.eur(r.summen.mautGeprueft, 2)} for tolls and tunnels, there and back. Fuel at the official average prices of the four countries comes to about ${h.eur(r.summen.sprit, 2)}, at ${h.num(h.P.verbrauch_vorgabe.pkw)} litres per 100 km. The total is around ${h.eur(r.summen.gesamt, 2)}, of which vignettes and tolls make up ${h.pct(anteil(r), 0)}. Motorhomes, cars with caravans and motorcycles pay different amounts, because each country draws its vehicle classes differently.`;
    },
    faqs: (h) => {
      const { haupt: r, fz, ohneSI } = D(h);
      const wm = fz.find(([f]) => f === 'wohnmobil')![1];
      return [
        { q: 'Which countries cost the most on the drive to Split?', a: r ? `There and back, the Croatian motorway from the border to Split costs ${h.eur(mautLand(r, 'HR'), 2)} and the Austrian section tolls for the Tauern and Karawanken ${h.eur(mautLand(r, 'AT'), 2)}. ${mautLand(r, 'HR') > r.summen.vignetten ? 'Croatia alone therefore costs more than all the vignettes together.' : 'The vignettes together cost more than the Croatian tolls.'} The vignettes for Austria (${h.eur(vig(r, 'AT'), 2)}) and Slovenia (${h.eur(vig(r, 'SI'), 2)}) are relatively cheap for a fourteen-day holiday, because they only need to cover two driving days.` : '' },
        { q: 'Can you bypass Slovenia on the way to Croatia?', a: `${ohneSI ? `Yes, but the route grows to ${h.num(ohneSI.route.km)} km.` : 'Not in our network: without Slovenia the calculator finds no motorway link from Munich to Split.'} Our network does not include a route through Hungary to Zagreb, so we do not calculate one. With only two driving days the Slovenian vignette is a small item anyway: for a car it currently costs ${h.eur(vig(D(h).haupt, 'SI'), 2)} there and back, and there is no way to Istria that avoids Slovenia.` },
        { q: 'How much more does the drive cost in a motorhome?', a: r && wm ? `For Munich to Split and back we work out about ${h.eur(wm.summen.gesamt, 2)} in a motorhome instead of ${h.eur(r.summen.gesamt, 2)}. The difference has three sources: in Slovenia most motorhomes fall into the dearer class 2B, in Croatia into group II, and consumption is higher. In Austria, by contrast, a motorhome up to 3.5 tonnes pays the same as a car.` : '' },
        { q: 'Where is fuel cheapest on the way to Croatia?', a: r?.tanken ? `According to the European Commission’s latest Weekly Oil Bulletin, the average price of petrol on this route is lowest in ${h.land(r.tanken.land)}, at ${h.l3(r.tanken.preis)} per litre. That is a national average: motorway service stations are often dearer. After every calculation the calculator shows which transit country has the cheapest litre.` : '' },
      ].filter((f) => f.a);
    },
    body: (h) => {
      const { go, fz, ziele, ohneAT, ab } = D(h);
      const starts = ['muenchen', 'stuttgart', 'frankfurt', 'koeln', 'amsterdam', 'bruessel'];
      const rowsS = starts.map((s) => { const r = go(s, 'split'); return r ? [ort(h, s), `${h.num(r.route.km)} km`, h.eur(r.summen.vignetten, 2), h.eur(r.summen.mautGeprueft, 2), h.eur(r.summen.sprit, 2), h.eur(r.summen.gesamt, 2)] : [ort(h, s), '–', '–', '–', '–', '–']; });
      const name: Record<Fz, string> = { pkw: 'Car', wohnmobil: 'Motorhome', gespann: 'Car with caravan', motorrad: 'Motorcycle' };
      const rowsF = fz.map(([f, r]) => r ? [name[f], h.eur(r.summen.vignetten, 2), h.eur(r.summen.mautGeprueft, 2), h.eur(r.summen.sprit, 2), h.eur(r.summen.gesamt, 2)] : [name[f], '–', '–', '–', '–']);
      const rowsZ = ziele.map(([z, r]) => r ? [ort(h, z), `${h.num(r.route.km)} km`, `${h.num(km(r, 'HR'))} km`, h.eur(r.summen.mautGeprueft, 2), h.eur(r.summen.gesamt, 2)] : [ort(h, z), '–', '–', '–', '–']);
      return `<h2>To Split from six cities</h2>
${h.table(['Start', 'Distance', 'Vignettes', 'Tolls', 'Fuel', 'Total'], rowsS, `Car, petrol, return, leaving ${h.date(ab)}, 14-day stay`, ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>Vignettes and tolls are almost identical from every city, because every route takes the same sections from Munich onwards; the difference lies in the fuel for the approach through Germany, the Netherlands or Belgium. Coming from further north, you mainly pay more at the pump. The calculator picks the route with the shortest driving time in its network.</p>
<h2>The vehicle makes the difference</h2>
${h.table(['Vehicle', 'Vignettes', 'Tolls', 'Fuel', 'Total'], rowsF, 'Munich – Split, return; motorhome and caravan on diesel', ['l', 'r', 'r', 'r', 'r'])}
<p>Each country draws its classes differently. In Austria every vehicle up to 3.5 tonnes pays the same section toll, and caravans travel free. In Slovenia the height over the front axle decides: most motorhomes are class 2B and pay double the class 2A price. We have not verified the DARS rule for a caravan behind a car; the calculator only counts the towing vehicle’s vignette and says so. In Croatia any trailer moves a car into group II.</p>
<h2>Destinations on the coast</h2>
${h.table(['Destination', 'Distance', 'of which Croatia', 'Tolls', 'Total'], rowsZ, 'From Munich, car, return', ['l', 'r', 'r', 'r', 'r'])}
<p>To Istria and the Kvarner Gulf the Croatian toll is small: the BINA-Istra Y motorway costs only a few euros, the coast road from Umag to Rovinj is toll-free, and the Krk bridge costs nothing in our network. In Dalmatia the HAC A1 becomes the largest single item. Rates per section are on ${h.a('maut-kroatien', 'Croatian motorway tolls')}.</p>
<h2>Other routes</h2>
<p>${ohneAT ? `If you want to avoid Austria, our network sends you through Switzerland and Italy; the route then grows to ${h.num(ohneAT.route.km)} km instead of about ${h.num(go('muenchen', 'split')?.route.km ?? 0)} km, and ${ohneAT.offen.length} sections on it are not verified, so part of the toll is missing from any comparison.` : 'Without Austria the calculator finds no sensible route.'} The options within Austria, over the Tauern or via the Pyhrn to Spielfeld, are compared on ${h.a('maut-oesterreich', 'Austrian motorway tolls')}. There are detailed pages on the ${h.a('tauerntunnel', 'Tauern tunnel toll')}, the ${h.a('karawankentunnel', 'Karawanken tunnel toll')} and the ${h.a('vignette-slowenien', 'Slovenian vignette')}.</p>`;
    },
  },
  nl: {
    slug: 'tol-naar-kroatie',
    nav: 'Tol naar Kroatië',
    card: 'De hele rit naar de Adriatische kust: vignetten, tunnels, Kroatische tol en brandstof.',
    title: 'Tol naar Kroatië 2026: kosten van de hele rit uit NL en BE',
    description: 'Tol naar Kroatië 2026: vignetten voor Oostenrijk en Slovenië, Tauern- en Karawankentunnel, Kroatische snelweg en brandstof, heen en terug voor uw voertuig.',
    h1: 'Tol naar Kroatië 2026: wat kost de rit naar de Adriatische Zee?',
    intro: 'Vul vertrek, bestemming, voertuig en reisdata in: de rekenhulp telt vignetten, tol en brandstof op voor elk land onderweg.',
    resume: (h) => {
      const r = D(h).go('utrecht', 'split');
      if (!r) return '';
      return `Wie vanuit Nederland of België naar Kroatië rijdt, doorkruist Duitsland zonder tol voor personenauto’s en betaalt daarna op vier manieren: het Oostenrijkse vignet, de trajecttol voor de Tauernsnelweg en de Karawankentunnel, het Sloveense vignet en ten slotte de Kroatische snelwegtol per traject. Voor een rit met de auto van Utrecht naar Split (${h.num(r.route.km)} km per richting), vertrek op ${h.date(h.M.addDays(h.today, 7))} en terugreis veertien dagen later, komt dat neer op ${h.eur(r.summen.vignetten, 2)} aan vignetten en ${h.eur(r.summen.mautGeprueft, 2)} aan tol en tunnels, heen en terug. De brandstof kost volgens de officiële gemiddelde prijzen van de ${r.route.laender.length} landen ongeveer ${h.eur(r.summen.sprit, 2)}, bij ${h.num(h.P.verbrauch_vorgabe.pkw)} liter per 100 km. In totaal is dat zo’n ${h.eur(r.summen.gesamt, 2)}; vignetten en tol maken daarvan ${h.pct(anteil(r), 0)} uit. Bij zo’n lange rit is de brandstof dus veruit de grootste post. Campers, auto’s met caravan en motoren betalen andere bedragen.`;
    },
    faqs: (h) => {
      const { go } = D(h);
      const r = go('utrecht', 'split');
      const wm = go('utrecht', 'split', 'wohnmobil');
      return [
        { q: 'Waarom is de rit naar Kroatië voor Nederlanders vooral een brandstofkwestie?', a: r ? `Omdat ruim ${h.num(km(r, 'DE') + km(r, 'NL'))} km van de route door Nederland en Duitsland loopt, waar een personenauto geen tol betaalt. Vignetten en tol beginnen pas in Oostenrijk. Van de ongeveer ${h.eur(r.summen.gesamt, 2)} voor heen en terug gaat daardoor ${h.eur(r.summen.sprit, 2)} naar brandstof, de rest naar vignetten en tol.` : '' },
        { q: 'Hoeveel duurder is de rit met de camper vanuit Utrecht?', a: r && wm ? `Voor Utrecht–Split en terug rekenen wij met de camper ongeveer ${h.eur(wm.summen.gesamt, 2)} in plaats van ${h.eur(r.summen.gesamt, 2)}. Het verschil komt uit het hogere verbruik, de duurdere klasse 2B in Slovenië en groep II in Kroatië. In Oostenrijk betaalt een camper tot 3,5 ton hetzelfde als een auto, zowel voor het vignet als voor de trajecttol.` : '' },
        { q: 'Waar tank je op weg naar Kroatië het voordeligst?', a: r?.tanken ? `Volgens de laatste Weekly Oil Bulletin van de Europese Commissie is de gemiddelde prijs voor Euro 95 op deze route het laagst in ${h.land(r.tanken.land)}, met ${h.l3(r.tanken.preis)} per liter. Dat is een landelijk gemiddelde; langs de snelweg betaalt u vaak meer. De rekenhulp toont na elke berekening in welk doorreisland de liter het minst kost.` : '' },
      ].filter((f) => f.a);
    },
    body: (h) => {
      const { go, ab } = D(h);
      const starts = ['amsterdam', 'utrecht', 'rotterdam', 'eindhoven', 'antwerpen', 'bruessel'];
      const rowsS = starts.map((s) => { const r = go(s, 'split'); return r ? [ort(h, s), `${h.num(r.route.km)} km`, h.eur(r.summen.vignetten, 2), h.eur(r.summen.mautGeprueft, 2), h.eur(r.summen.sprit, 2), h.eur(r.summen.gesamt, 2)] : [ort(h, s), '–', '–', '–', '–', '–']; });
      const name: Record<Fz, string> = { pkw: 'Auto', wohnmobil: 'Camper', gespann: 'Auto met caravan', motorrad: 'Motor' };
      const rowsF = (['pkw', 'wohnmobil', 'gespann', 'motorrad'] as Fz[]).map((f) => { const r = go('utrecht', 'split', f); return r ? [name[f], h.eur(r.summen.vignetten, 2), h.eur(r.summen.mautGeprueft, 2), h.eur(r.summen.sprit, 2), h.eur(r.summen.gesamt, 2)] : [name[f], '–', '–', '–', '–']; });
      const rowsZ = ['rijeka', 'pula', 'zadar', 'split', 'makarska'].map((z) => { const r = go('utrecht', z); return r ? [ort(h, z), `${h.num(r.route.km)} km`, h.eur(r.summen.mautGeprueft, 2), h.eur(r.summen.gesamt, 2)] : [ort(h, z), '–', '–', '–']; });
      return `<h2>Vanuit Nederland en België naar Split</h2>
${h.table(['Vertrek', 'Afstand', 'Vignetten', 'Tol', 'Brandstof', 'Totaal'], rowsS, `Auto, Euro 95, heen en terug, vertrek ${h.date(ab)}, 14 dagen verblijf`, ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>Vignetten en tol zijn vanuit elke stad gelijk, omdat alle routes vanaf de Oostenrijkse grens dezelfde trajecten volgen. Het verschil zit in de kilometers door Nederland, België en Duitsland, en dus in de brandstof. De rekenhulp kiest de route met de kortste rijtijd in zijn netwerk.</p>
<h2>Per voertuig</h2>
${h.table(['Voertuig', 'Vignetten', 'Tol', 'Brandstof', 'Totaal'], rowsF, 'Utrecht – Split, heen en terug; camper en caravan op diesel', ['l', 'r', 'r', 'r', 'r'])}
<p>Elk land deelt de klassen anders in. Oostenrijk rekent voor alle voertuigen tot 3,5 ton dezelfde trajecttol, de caravan rijdt gratis mee. Slovenië kijkt naar de hoogte boven de vooras: de meeste campers vallen in klasse 2B, tegen het dubbele tarief van 2A. Voor een caravan achter de auto hebben wij de regel van DARS niet geverifieerd; de rekenhulp telt alleen het vignet van de trekkende auto en meldt dat. In Kroatië brengt elke aanhanger de auto in groep II.</p>
<h2>Andere bestemmingen aan de kust</h2>
${h.table(['Bestemming', 'Afstand', 'Tol', 'Totaal'], rowsZ, 'Vanuit Utrecht, auto, heen en terug', ['l', 'r', 'r', 'r'])}
<p>Naar Istrië en de Kvarnerbaai is de Kroatische tol laag, omdat de Istrische Y van BINA-Istra maar enkele euro’s kost en de brug naar Krk in ons netwerk gratis is. Verder naar het zuiden wordt de A1 van HAC de grootste post. De bedragen per traject staan op ${h.a('maut-kroatien', 'tol Kroatië')}, het Sloveense vignet op ${h.a('vignette-slowenien', 'vignet Slovenië')} en het Oostenrijkse op ${h.a('vignette-oesterreich', 'vignet Oostenrijk')}. Waar u onderweg het goedkoopst tankt, vergelijkt ${h.a('benzineprijs-duitsland', 'benzineprijs Duitsland')}.</p>`;
    },
  },
});
