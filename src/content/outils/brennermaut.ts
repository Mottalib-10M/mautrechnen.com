import { defineGuide, type Helpers } from '../../lib/guide-types';

type Fz = 'pkw' | 'wohnmobil' | 'gespann' | 'motorrad';
/** Brennermaut : A13 Innsbruck–Brenner (Streckenmaut ASFINAG), Vignette auf der A12, danach A22 (Schätzung). */
function D(h: Helpers) {
  const B = h.P.streckenmaut.brenner;
  const A22 = h.P.italien_tarife.a22_montagna.preis;
  const it = (fz: Fz) => {
    const r = h.M.route('b_brenner', 'verona');
    const p = r ? h.M.maut(r.schritte, fz) : [];
    return { km: r?.km ?? 0, s: h.M.mautSumme(p).schaetzung };
  };
  const at = h.M.route('b_kiefersfelden', 'b_brenner');
  const a12 = h.M.route('b_kiefersfelden', 'innsbruck');
  const a13 = h.M.route('innsbruck', 'b_brenner');
  const ab = h.M.addDays(h.today, 7);
  const v = h.M.vignette('AT', 'pkw', h.M.fahrtage(ab, 14, true, false));
  const vm = h.M.vignette('AT', 'motorrad', h.M.fahrtage(ab, 14, true, false));
  const verona = { pkw: it('pkw'), wm: it('wohnmobil'), g: it('gespann') };
  return { B, A22, at, a12, a13, v, vm, verona };
}

export default defineGuide({
  id: 'brennermaut',
  group: 'maut',
  order: 25,
  tool: 'maut',
  laender: ['AT', 'DE', 'IT'],
  von: 'b_kiefersfelden',
  nach: 'b_brenner',
  related: ['maut-oesterreich', 'vignette-oesterreich', 'maut-italien', 'maut-nach-italien', 'spritpreise-italien'],
  sources: ['asfinagStrecke', 'asfinagMautordnung', 'asfinagVignette', 'a22'],
  de: {
    slug: 'brennermaut',
    nav: 'Brennermaut',
    card: 'A13 je Richtung, Vignette davor auf der A12, dann die A22 bis Verona.',
    title: 'Brennermaut 2026: A13, Vignette und A22 bis Verona',
    description: 'Brennermaut 2026: was die A13 von Innsbruck zum Brenner je Richtung kostet, warum die A12 davor eine Vignette braucht und was die A22 bis Verona etwa ausmacht.',
    h1: 'Brennermaut 2026: was kostet die Fahrt über den Brenner?',
    intro: 'Von der Grenze bei Kiefersfelden bis zum Brenner: der Rechner zeigt die Streckenmaut der A13; Vignette und Italien rechnet der Reiserechner dazu.',
    resume: (h) => {
      const { B, at, a12, v, verona } = D(h);
      return `Die Brennerautobahn A13 von Innsbruck bis zur italienischen Grenze ist ein Streckenmaut-Abschnitt der ASFINAG: Eine einfache Fahrt kostet 2026 für Pkw, Wohnmobil bis 3,5 Tonnen und Motorrad gleich viel, nämlich ${h.eur(B.preis.pkw, 2)}, und ein Wohnwagen oder Anhänger zahlt nichts dazu. Hin und zurück sind es ${h.eur(2 * B.preis.pkw, 2)}. Auf der A13 selbst braucht man keine Vignette, wohl aber auf der Inntalautobahn A12 davor: Vignettenfrei ist nur das kurze Stück von der Grenze bis Kufstein-Süd, die übrigen ${h.num(a12?.km ?? 0)} km bis Innsbruck sind vignettenpflichtig. Für eine Hin- und Rückfahrt mit vierzehn Tagen Urlaub dazwischen kostet die günstigste Vignette derzeit ${h.eur(v.summeEur, 2)}. Von der Grenze bei Kiefersfelden bis zum Brenner sind es ${h.num(at?.km ?? 0)} km. Auf der italienischen Seite schließt die A22 der Autostrada del Brennero an; bis Verona schätzen wir für den Pkw rund ${h.eur(verona.pkw.s, 2)}, weil die amtlichen Kilometer von Mautstelle zu Mautstelle nicht frei veröffentlicht sind.`;
    },
    faqs: (h) => {
      const { B, vm, verona, A22 } = D(h);
      return [
        { q: 'Lohnt sich die Mehrfahrtenkarte für den Brenner?', a: `Nur für Vielfahrer. Die Mehrfahrtenkarte der ASFINAG für die A13 kostet ${h.eur(B.mehrfahrtenkarte, 2)}, eine Einzelfahrt ${h.eur(B.preis.pkw, 2)}. Sie rechnet sich also erst ab der siebten Durchfahrt im Gültigkeitszeitraum. Wer einmal im Jahr in den Urlaub nach Italien fährt, zahlt zwei Einzelfahrten, für Hin- und Rückweg je eine.` },
        { q: 'Was kostet der Brenner mit dem Motorrad?', a: `Auf der A13 genauso viel wie mit dem Pkw: ${h.eur(B.preis.pkw, 2)} je Richtung, weil das Tarifblatt der ASFINAG nicht nach Fahrzeugart unterscheidet. Günstiger ist für Motorräder dagegen die Vignette für die A12 davor; für eine Reise mit vierzehn Tagen Pause sind es ${h.eur(vm.summeEur, 2)}. In Italien zahlt das Motorrad auf der A22 den Kilometertarif der Klasse A wie ein Pkw.` },
        { q: 'Wie viel kostet ein Gespann auf der A22 bis Verona?', a: `Ein Pkw mit einachsigem Wohnwagen fällt in Italien in die Klasse 3. Mit dem Kilometertarif der A22 von ${h.num(A22.gespann, 5)} € statt ${h.num(A22.pkw, 5)} € schätzen wir vom Brenner bis Verona rund ${h.eur(verona.g.s, 2)} gegenüber ${h.eur(verona.pkw.s, 2)} für den Pkw. Auf der A13 in Österreich zahlt das Gespann dagegen nicht mehr als das Auto allein.` },
        { q: 'Zahlt der Wohnwagen auf der Brennerautobahn eine eigene Streckenmaut?', a: `Nein. Die Mautordnung der ASFINAG befreit Anhänger von der Streckenmaut, wenn das Zugfahrzeug höchstens 3,5 Tonnen zulässige Gesamtmasse hat; wie schwer der Wohnwagen selbst ist, spielt keine Rolle. Das Gespann zahlt auf der A13 also ${h.eur(B.preis.pkw, 2)} je Richtung wie ein Pkw allein. Teurer wird der Wohnwagen erst in Italien, wo er das Fahrzeug in eine höhere Klasse hebt.` },
      ];
    },
    body: (h) => {
      const { B, A22, a12, a13, verona } = D(h);
      const rows = [
        ['A12 Kiefersfelden – Kufstein-Süd', 'vignettenfrei', '–'],
        ['A12 Kufstein-Süd – Innsbruck', 'Vignette', `${h.num(a12?.km ?? 0)} km`],
        [B.name.de, `${h.eur(B.preis.pkw, 2)} je Richtung`, `${h.num(a13?.km ?? 0)} km`],
        ['A22 Brenner – Verona', `ca. ${h.eur(verona.pkw.s, 2)} (Schätzung)`, `${h.num(verona.pkw.km)} km`],
      ];
      return `<h2>Abschnitt für Abschnitt</h2>
${h.table(['Abschnitt', 'Pkw, einfache Fahrt', 'Länge'], rows, 'Von der deutschen Grenze bis Verona', ['l', 'r', 'r'])}
<p>Quelle für Österreich: ${h.src('asfinagStrecke')} und ${h.src('asfinagMautordnung')}, gelesen am ${h.date(h.P.retrieved_at)}. Für Teilstrecken der A13 verlangt die ASFINAG zwischen ${h.eur(Math.min(...B.teilstrecken), 2)} und ${h.eur(Math.max(...B.teilstrecken), 2)}; wer über den Pass nach Italien fährt, zahlt immer den vollen Preis.</p>
<h2>Die italienische Seite: Schätzung</h2>
<p>Die A22 rechnet nach Kilometern zwischen Ein- und Ausfahrt. Laut Tarifblatt 2026 der Autostrada del Brennero (${h.src('a22')}) kostet der Kilometer im Gebirgsabschnitt ${h.num(A22.pkw, 5)} € für Klasse A (Pkw, Motorrad), ${h.num(A22.wohnmobil, 5)} € für Klasse B (Wohnmobil mit hoher Vorderachse) und ${h.num(A22.gespann, 5)} € für Klasse 3 (Pkw mit Wohnwagen), Mehrwertsteuer inbegriffen. Wir multiplizieren mit der Länge laut Routing und runden wie in Italien auf 10 Cent. Das ergibt bis Verona rund ${h.eur(verona.pkw.s, 2)} für den Pkw und ${h.eur(verona.wm.s, 2)} für das Wohnmobil. Der Betrag an der Mautstelle kann abweichen, weil die amtlichen Kilometer von Mautstelle zu Mautstelle nicht frei veröffentlicht sind; der Rechner weist ihn deshalb getrennt als Schätzung aus.</p>
<h2>Was die ganze Brennerfahrt kostet</h2>
<p>Für die Strecke von München über den Brenner an die Adria oder an den Gardasee kommen zur Brennermaut die Vignette, die A22 und weitere italienische Abschnitte hinzu. Die Summe für Hin- und Rückfahrt mit Sprit rechnet ${h.a('maut-nach-italien', 'Maut nach Italien')}, die italienischen Tarife erklärt ${h.a('maut-italien', 'Maut Italien')}. Die anderen Alpenstrecken der ASFINAG vergleicht ${h.a('maut-oesterreich', 'Maut Österreich')}.</p>`;
    },
  },
  en: {
    slug: 'brenner-toll',
    nav: 'Brenner toll',
    card: 'A13 per direction, the vignette before it on the A12, then the A22 to Verona.',
    title: 'Brenner toll 2026: A13, the vignette and A22 to Verona',
    description: 'Brenner toll 2026: what the A13 from Innsbruck to the Brenner costs each way, why the A12 before it needs a vignette and roughly what the A22 to Verona adds.',
    h1: 'Brenner toll 2026: what does the drive over the Brenner cost?',
    intro: 'From the border at Kiefersfelden to the Brenner: the calculator shows the A13 section toll; the trip calculator adds the vignette and Italy.',
    resume: (h) => {
      const { B, at, a12, v, verona } = D(h);
      return `The A13 Brenner motorway from Innsbruck to the Italian border is an ASFINAG section-toll route: in 2026 a single trip costs the same for a car, a motorhome up to 3.5 tonnes and a motorcycle, namely ${h.eur(B.preis.pkw, 2)}, and a caravan or trailer pays nothing extra. A return trip is ${h.eur(2 * B.preis.pkw, 2)}. You need no vignette on the A13 itself, but you do on the A12 Inn valley motorway before it: only the short stretch from the border to Kufstein-Süd is vignette-free, and the remaining ${h.num(a12?.km ?? 0)} km to Innsbruck require one. For a return trip with a fourteen-day holiday in between, the cheapest vignette currently costs ${h.eur(v.summeEur, 2)}. From the border at Kiefersfelden to the Brenner it is ${h.num(at?.km ?? 0)} km. On the Italian side, the A22 of Autostrada del Brennero takes over; to Verona we estimate around ${h.eur(verona.pkw.s, 2)} for a car, because the official distances between toll stations are not openly published.`;
    },
    faqs: (h) => {
      const { B, vm, verona, A22 } = D(h);
      return [
        { q: 'Is the Brenner multi-trip card worth it?', a: `Only for frequent drivers. The ASFINAG multi-trip card for the A13 costs ${h.eur(B.mehrfahrtenkarte, 2)}, a single trip ${h.eur(B.preis.pkw, 2)}. It only pays off from the seventh passage within its validity. If you drive to Italy on holiday once a year, you pay two single trips, one for each direction.` },
        { q: 'What does the Brenner cost on a motorcycle?', a: `On the A13 the same as by car: ${h.eur(B.preis.pkw, 2)} each way, because the ASFINAG rate sheet makes no distinction by vehicle type. The vignette for the A12 before it is cheaper for motorcycles, though; for a trip with a fourteen-day stay it is ${h.eur(vm.summeEur, 2)}. In Italy a motorcycle pays the class A per-kilometre rate on the A22, like a car.` },
        { q: 'How much does a car and caravan pay on the A22 to Verona?', a: `A car towing a single-axle caravan is class 3 in Italy. With the A22 per-kilometre rate of ${h.num(A22.gespann, 5)} € instead of ${h.num(A22.pkw, 5)} €, we estimate around ${h.eur(verona.g.s, 2)} from the Brenner to Verona against ${h.eur(verona.pkw.s, 2)} for a car. On the Austrian A13, by contrast, the combination pays no more than the car alone.` },
        { q: 'Does a caravan pay its own section toll on the Brenner motorway?', a: `No. The ASFINAG toll regulations exempt trailers from the section toll as long as the towing vehicle has a maximum permitted weight of 3.5 tonnes or less; the weight of the caravan itself does not matter. On the A13 the combination therefore pays ${h.eur(B.preis.pkw, 2)} each way, like a car on its own. The caravan only costs more in Italy, where it moves the vehicle into a higher class.` },
      ];
    },
    body: (h) => {
      const { B, A22, a12, a13, verona } = D(h);
      const rows = [
        ['A12 Kiefersfelden – Kufstein-Süd', 'vignette-free', '–'],
        ['A12 Kufstein-Süd – Innsbruck', 'vignette', `${h.num(a12?.km ?? 0)} km`],
        [B.name.en, `${h.eur(B.preis.pkw, 2)} each way`, `${h.num(a13?.km ?? 0)} km`],
        ['A22 Brenner – Verona', `about ${h.eur(verona.pkw.s, 2)} (estimate)`, `${h.num(verona.pkw.km)} km`],
      ];
      return `<h2>Section by section</h2>
${h.table(['Section', 'Car, one way', 'Distance'], rows, 'From the German border to Verona', ['l', 'r', 'r'])}
<p>Source for Austria: ${h.src('asfinagStrecke')} and ${h.src('asfinagMautordnung')}, read on ${h.date(h.P.retrieved_at)}. For partial routes on the A13 ASFINAG charges between ${h.eur(Math.min(...B.teilstrecken), 2)} and ${h.eur(Math.max(...B.teilstrecken), 2)}; if you cross the pass into Italy, you always pay the full price.</p>
<h2>The Italian side: an estimate</h2>
<p>The A22 charges by the kilometres between entry and exit. According to the 2026 rate sheet of Autostrada del Brennero (${h.src('a22')}), a kilometre on the mountain section costs ${h.num(A22.pkw, 5)} € for class A (car, motorcycle), ${h.num(A22.wohnmobil, 5)} € for class B (motorhome with a high front axle) and ${h.num(A22.gespann, 5)} € for class 3 (car with caravan), VAT included. We multiply by the routed distance and round to 10 cents as Italy does. That gives about ${h.eur(verona.pkw.s, 2)} to Verona for a car and ${h.eur(verona.wm.s, 2)} for a motorhome. The amount at the toll booth may differ, because the official distances between toll stations are not openly published; the calculator therefore shows it separately as an estimate.</p>
<h2>What the whole Brenner trip costs</h2>
<p>For the drive from Munich over the Brenner to the Adriatic or Lake Garda, the vignette, the A22 and further Italian sections come on top of the Brenner toll. The total for the return trip including fuel is on ${h.a('maut-nach-italien', 'tolls to Italy')}, the Italian rates are explained on ${h.a('maut-italien', 'Italian motorway tolls')}. The other ASFINAG Alpine routes are compared on ${h.a('maut-oesterreich', 'Austrian motorway tolls')}.</p>`;
    },
  },
});
