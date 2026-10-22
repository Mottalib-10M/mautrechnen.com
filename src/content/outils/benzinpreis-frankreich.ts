import { defineGuide, type Helpers } from '../../lib/guide-types';
import type { Sorte } from '../../lib/engine/params';

/** Benzinpreis Frankreich : Wochendurchschnitt (Weekly Oil Bulletin), Luxemburg davor, Spanien danach, französischer Anteil an der Fahrt. */
const C = 'FR';
function D(h: Helpers) {
  const p = (c: string, s: Sorte) => h.M.preis(c, s);
  const spanne = (s: Sorte) => {
    const v = h.M.verlauf(C, s);
    if (!v.length) return null;
    let lo = v[0], hi = v[0];
    for (const x of v) { if (x[1] < lo[1]) lo = x; if (x[1] > hi[1]) hi = x; }
    return { lo, hi, n: v.length, erst: v[0] };
  };
  const ab = h.M.addDays(h.today, 7);
  const fahrt = (start: string, ziel: string, sorte: Sorte) => h.M.reise({ start, ziel, fz: 'pkw', sorte, verbrauch: h.M.vorgabeVerbrauch('pkw'), ab, dauer: 14, hinUndZurueck: true, aufenthalt: false });
  const heim = h.T('DE', 'DE', 'NL');
  return { p, e95: p(C, 'e95') ?? 0, diesel: p(C, 'diesel') ?? 0, lpg: p(C, 'lpg'), lu95: p('LU', 'e95') ?? 0, luD: p('LU', 'diesel') ?? 0, es95: p('ES', 'e95') ?? 0, esD: p('ES', 'diesel') ?? 0, heim, h95: p(heim, 'e95') ?? 0, hD: p(heim, 'diesel') ?? 0, spanne, fahrt };
}
const um = (h: Helpers, a: number, b: number, wo: string) => {
  const d = Math.round((a - b) * 1000) / 1000;
  if (d === 0) return h.T(`genauso viel wie ${wo}`, `the same as ${wo}`, `evenveel als ${wo}`);
  return h.T(`${h.l3(Math.abs(d))} ${d < 0 ? 'weniger' : 'mehr'} als ${wo}`, `${h.l3(Math.abs(d))} ${d < 0 ? 'less' : 'more'} than ${wo}`, `${h.l3(Math.abs(d))} ${d < 0 ? 'minder' : 'meer'} dan ${wo}`);
};
const l3x = (h: Helpers, x: number | null) => (x == null ? '–' : h.l3(x));
/** Länder auf dem Weg nach Südfrankreich und Spanien, günstigster Super-Preis zuerst. */
function weg(h: Helpers) {
  const { p } = D(h);
  const laender = [C, 'DE', 'NL', 'BE', 'LU', 'ES', 'IT'].map((c) => ({ c, e: p(c, 'e95') })).sort((a, b) => (a.e ?? 99) - (b.e ?? 99));
  const rows = laender.map(({ c, e }) => [h.land(c), l3x(h, e), l3x(h, p(c, 'diesel')), l3x(h, p(c, 'lpg'))]);
  return h.table([h.T('Land (günstigstes Super zuerst)', 'Country (cheapest petrol first)', 'Land (goedkoopste Euro 95 eerst)'), h.T('Super 95', 'Petrol 95', 'Euro 95'), 'Diesel', h.T('Autogas', 'LPG', 'LPG')], rows, undefined, ['l', 'r', 'r', 'r']);
}
/** Französischer Anteil (Diesel, hin und zurück) und dieselbe Menge zum luxemburgischen Preis. */
function anteil(h: Helpers, start: string, ziel: string) {
  const { fahrt, luD } = D(h);
  const r = fahrt(start, ziel, 'diesel');
  const x = r?.sprit.find((s) => s.land === C);
  if (!r || !x || x.kosten == null) return null;
  return { name: `${h.M.KNOTEN[start].n[h.lang]} – ${h.M.KNOTEN[ziel].n[h.lang]}`, km: x.km, liter: x.liter * 2, kosten: x.kosten * 2, lu: x.liter * 2 * luD, maut: r.summen.mautGeprueft, offen: r.offen.length };
}
const zeilen = (h: Helpers, paare: Array<[string, string]>) => paare.map(([a, b]) => anteil(h, a, b)).filter((x): x is NonNullable<ReturnType<typeof anteil>> => !!x).map((x) => [x.name, h.num(x.km), h.num(x.liter, 1), h.eur(x.kosten, 2), h.eur(x.lu, 2)]);
const kopf = (h: Helpers) => [h.T('Strecke', 'Route', 'Route'), h.T('km in Frankreich', 'km in France', 'km in Frankrijk'), h.T('Liter Diesel', 'Litres of diesel', 'Liter diesel'), h.T('in Frankreich', 'in France', 'in Frankrijk'), h.T('zum Preis in Luxemburg', 'at the Luxembourg price', 'tegen de Luxemburgse prijs')];

export default defineGuide({
  id: 'benzinpreis-frankreich',
  group: 'sprit',
  order: 34,
  tool: 'sprit',
  land: 'FR',
  related: ['maut-frankreich', 'tanken-luxemburg', 'maut-spanien', 'benzineprijs-belgie', 'spritpreise-italien'],
  sources: ['wob', 'osm'],
  de: {
    slug: 'benzinpreis-frankreich',
    nav: 'Benzinpreis Frankreich',
    card: 'Super, Diesel und Autogas in Frankreich im Wochenmittel, mit Luxemburg und Spanien verglichen.',
    title: 'Benzinpreis Frankreich 2026: Super, Diesel, Autogas',
    description: 'Benzinpreis Frankreich 2026: amtlicher Wochendurchschnitt für Super 95, Diesel und Autogas, Vergleich mit Luxemburg und Spanien, Sprit bis ans Mittelmeer.',
    h1: 'Benzinpreis in Frankreich aktuell: wo tanken auf dem Weg nach Süden?',
    intro: 'Sorte und Tankfüllung wählen: der Rechner zeigt, was eine Tankfüllung in Frankreich gegenüber Deutschland oder einem anderen Land kostet.',
    resume: (h) => {
      const { e95, diesel, lpg, lu95, es95, h95, hD, spanne } = D(h);
      const s = spanne('e95')!;
      const a = anteil(h, 'amsterdam', 'lloret');
      return `In der Woche vom ${h.date(h.M.SPRIT_STAND)} lag der französische Landesdurchschnitt bei ${h.l3(e95)} je Liter Super 95 (SP95), ${h.l3(diesel)} je Liter Diesel (Gazole)${lpg != null ? ` und ${h.l3(lpg)} je Liter Autogas (GPL)` : ''}, Steuern inbegriffen. Super kostet damit ${um(h, e95, h95, 'in Deutschland')}, ${um(h, e95, lu95, 'in Luxemburg')} und ${um(h, e95, es95, 'in Spanien')}; Diesel ${um(h, diesel, hD, 'in Deutschland')}. Frankreich ist auf dem Weg nach Südfrankreich oder Spanien das Land mit den meisten Kilometern${a ? `: von Amsterdam an die Costa Brava sind es ${h.num(a.km)} km in Frankreich` : ''}. Deshalb wiegt der französische Literpreis auf diesen Fahrten schwerer als jeder andere. In den letzten ${s.n} Wochen schwankte Super zwischen ${h.l3(s.lo[1])} und ${h.l3(s.hi[1])}. Die Werte stammen aus dem Weekly Oil Bulletin der Europäischen Kommission und sind Mittelwerte für das ganze Land, keine Preise einzelner Tankstellen.`;
    },
    faqs: (h) => {
      const { e95, diesel, lu95, luD, es95, esD, spanne } = D(h);
      const s = spanne('e95')!;
      const a = anteil(h, 'koeln', 'lloret') ?? anteil(h, 'frankfurt', 'barcelona');
      return [
        { q: 'Lohnt sich vor der Fahrt durch Frankreich ein Tankstopp in Luxemburg?', a: `Nach den Wochenwerten vom ${h.date(h.M.SPRIT_STAND)} ist Super 95 in Luxemburg ${um(h, lu95, e95, 'in Frankreich')} und Diesel ${um(h, luD, diesel, 'in Frankreich')}. Bei 50 Litern Diesel sind das ${h.eur(Math.abs(luD - diesel) * 50, 2)} ${luD < diesel ? 'zugunsten Luxemburgs' : 'zugunsten Frankreichs'}. Ob sich der Umweg lohnt, hängt davon ab, ob Luxemburg ohnehin auf Ihrer Strecke liegt.` },
        { q: 'Was kostet allein der französische Dieselanteil einer Fahrt an die Costa Brava?', a: a ? `Auf der schnellsten Strecke ${a.name} liegen ${h.num(a.km)} km in Frankreich. Mit 7 Litern Diesel auf 100 km sind das hin und zurück ${h.num(a.liter, 1)} Liter, zum französischen Durchschnitt ${h.eur(a.kosten, 2)}. Dazu kommt die französische Autobahnmaut, die der Rechner der Startseite nach den Tarifblättern der Betreiber getrennt ausweist.` : 'Die Strecke konnte nicht berechnet werden. Der Rechner der Startseite zeigt für jede Fahrt die Kilometer, Liter und Spritkosten je Land, Frankreich eingeschlossen, und daneben die Maut.' },
        { q: 'Ist der Sprit in Spanien diese Woche günstiger als in Frankreich?', a: `Im Landesmittel der Woche vom ${h.date(h.M.SPRIT_STAND)} kostet Super 95 in Spanien ${h.l3(es95)} gegen ${h.l3(e95)} in Frankreich, Diesel ${h.l3(esD)} gegen ${h.l3(diesel)}. Spanien ist beim Super also ${um(h, es95, e95, 'Frankreich')}. Wer nach Katalonien fährt, kann den Tankstopp je nach Reichweite hinter die Grenze legen oder davor.` },
        { q: 'Wie viel hat Super 95 in Frankreich vor einem halben Jahr gekostet?', a: `Vor ${s.n} Wochen meldete Frankreich ${h.l3(s.erst[1])} je Liter, zuletzt ${h.l3(e95)}. Der tiefste Wert in diesem Zeitraum war ${h.l3(s.lo[1])} in der Woche vom ${h.date(s.lo[0])}, der höchste ${h.l3(s.hi[1])} in der Woche vom ${h.date(s.hi[0])}. Für 50 Liter liegen zwischen Tief und Hoch ${h.eur((s.hi[1] - s.lo[1]) * 50, 2)}.` },
      ];
    },
    body: (h) => {
      const rows = zeilen(h, [['koeln', 'lloret'], ['frankfurt', 'nizza'], ['saarbruecken', 'montpellier'], ['freiburg', 'barcelona'], ['duesseldorf', 'orange']]);
      return `<h2>Frankreich und die Länder davor und danach</h2>
<p>Landesdurchschnitte mit Steuern, Woche vom ${h.date(h.M.SPRIT_STAND)}, sortiert nach dem Preis für Super 95. Luxemburg und Belgien liegen auf vielen Strecken vor der französischen Grenze, Spanien und Italien dahinter.</p>
${weg(h)}
<h2>Diesel auf den französischen Kilometern</h2>
<p>Schnellste Strecke des Rechners, Auto mit 7 Litern Diesel auf 100 km, hin und zurück; gezählt wird nur der französische Teil. Die letzte Spalte setzt dieselbe Menge zum luxemburgischen Durchschnitt an, als Maß dafür, was ein günstigeres Nachbarland ausmachen kann, wenn der Tank so weit reichen würde.</p>
${h.table(kopf(h), rows, undefined, ['l', 'r', 'r', 'r', 'r'])}
<p>Ein Tank reicht nicht für über tausend Kilometer: auf langen Fahrten tankt man in Frankreich fast immer mindestens einmal. Sinnvoll ist, mit vollem Tank aus dem günstigeren Land zu starten und den zweiten Stopp ${D(h).es95 < D(h).e95 ? 'möglichst erst in Spanien einzuplanen, wenn die Fahrt dorthin geht' : 'so zu legen, wie es die Reichweite erlaubt'}.</p>
<h2>Was neben dem Sprit anfällt</h2>
<p>Die französische Autobahnmaut rechnen wir nach den Tarifblättern 2026 von APRR, ASF und Escota. Die Abschnitte der Sanef (A4 und A1) bleiben „nicht verifiziert“, weil wir deren Tarifraster nicht lesen konnten; sie fehlen in der Summe. Einzelheiten auf ${h.a('maut-frankreich', 'Maut Frankreich')} und ${h.a('maut-spanien', 'Maut Spanien')}, die Literpreise Luxemburgs auf ${h.a('tanken-luxemburg', 'Tanken in Luxemburg')}.</p>
<h2>Quelle</h2>
<p>Alle Literpreise stammen aus dem ${h.src('wob')} der Europäischen Kommission. Die Mitgliedstaaten melden Durchschnittspreise mit Steuern jede Woche; die Weiterverwendung ist mit Quellenangabe erlaubt (Beschluss 2011/833/EU). Wir übernehmen die Werte wöchentlich. Die ganze Fahrt mit Maut und Vignetten rechnet die ${h.a('home', 'Startseite')}, die Rechenwege erklärt die ${h.a('method', 'Methode')}.</p>`;
    },
  },
  en: {
    slug: 'fuel-prices-france',
    nav: 'Fuel prices France',
    card: 'Weekly average for petrol, diesel and LPG in France, against Luxembourg and Spain.',
    title: 'Fuel prices in France 2026: petrol, diesel and LPG weekly',
    description: 'Fuel prices in France 2026: official weekly average for petrol 95, diesel and LPG, against Luxembourg, Germany and Spain, and the fuel cost to the Med.',
    h1: 'Fuel prices in France 2026: where to fill up on the way south?',
    intro: 'Pick the fuel and the fill-up: the calculator shows what a tank in France costs against Germany or any other bulletin country.',
    resume: (h) => {
      const { e95, diesel, lpg, lu95, es95, h95, hD, spanne } = D(h);
      const s = spanne('e95')!;
      const a = anteil(h, 'amsterdam', 'lloret');
      return `In the week of ${h.date(h.M.SPRIT_STAND)} France’s national average stood at ${h.l3(e95)} per litre of petrol 95 (SP95) and ${h.l3(diesel)} per litre of diesel (gazole)${lpg != null ? `, with LPG (GPL) at ${h.l3(lpg)}` : ''}, taxes included. Petrol thus costs ${um(h, e95, h95, 'in Germany')}, ${um(h, e95, lu95, 'in Luxembourg')} and ${um(h, e95, es95, 'in Spain')}; diesel is ${um(h, diesel, hD, 'in Germany')}. On the way to southern France or Spain, France is the country with the most kilometres${a ? `: from Amsterdam to the Costa Brava ${h.num(a.km)} km lie in France` : ''}. That is why the French price per litre weighs more on those trips than any other. Over the last ${s.n} weeks petrol moved between ${h.l3(s.lo[1])} and ${h.l3(s.hi[1])}. The values come from the European Commission’s Weekly Oil Bulletin and are averages for the whole country, not prices at individual stations.`;
    },
    faqs: (h) => {
      const { e95, diesel, lu95, luD, es95, esD, spanne } = D(h);
      const s = spanne('e95')!;
      const a = anteil(h, 'koeln', 'lloret') ?? anteil(h, 'frankfurt', 'barcelona');
      return [
        { q: 'Is a fuel stop in Luxembourg worth it before driving through France?', a: `On the weekly figures of ${h.date(h.M.SPRIT_STAND)} petrol 95 in Luxembourg is ${um(h, lu95, e95, 'in France')} and diesel ${um(h, luD, diesel, 'in France')}. On 50 litres of diesel that is ${h.eur(Math.abs(luD - diesel) * 50, 2)} in favour of ${luD < diesel ? 'Luxembourg' : 'France'}. Whether the detour pays depends on whether Luxembourg lies on your route anyway.` },
        { q: 'What does the French share of diesel cost on a drive to the Costa Brava?', a: a ? `On the fastest route ${a.name}, ${h.num(a.km)} km lie in France. At 7 litres of diesel per 100 km that is ${h.num(a.liter, 1)} litres out and back, ${h.eur(a.kosten, 2)} at the French average. The French motorway tolls come on top; the calculator on the home page lists them separately from the operators’ rate sheets.` : 'The route could not be calculated. The calculator on the home page shows kilometres, litres and fuel cost per country for every trip, France included, with the tolls alongside.' },
        { q: 'Is fuel in Spain cheaper than in France this week?', a: `On the national averages for the week of ${h.date(h.M.SPRIT_STAND)} petrol 95 costs ${h.l3(es95)} in Spain against ${h.l3(e95)} in France, diesel ${h.l3(esD)} against ${h.l3(diesel)}. For petrol Spain is thus ${um(h, es95, e95, 'France')}. If you are heading for Catalonia, you can put the fuel stop before or after the border, depending on your range.` },
        { q: 'What did petrol 95 cost in France half a year ago?', a: `${s.n} weeks ago France reported ${h.l3(s.erst[1])} per litre, most recently ${h.l3(e95)}. The lowest value in that period was ${h.l3(s.lo[1])} in the week of ${h.date(s.lo[0])}, the highest ${h.l3(s.hi[1])} in the week of ${h.date(s.hi[0])}. On 50 litres the gap between low and high is ${h.eur((s.hi[1] - s.lo[1]) * 50, 2)}.` },
      ];
    },
    body: (h) => {
      const rows = zeilen(h, [['koeln', 'lloret'], ['frankfurt', 'nizza'], ['saarbruecken', 'montpellier'], ['freiburg', 'barcelona'], ['duesseldorf', 'orange']]);
      return `<h2>France and the countries before and after</h2>
<p>National averages with taxes, week of ${h.date(h.M.SPRIT_STAND)}, sorted by the price of petrol 95. Luxembourg and Belgium lie before the French border on many routes, Spain and Italy beyond it.</p>
${weg(h)}
<h2>Diesel on the French kilometres</h2>
<p>The calculator’s fastest route, a car using 7 litres of diesel per 100 km, out and back; only the French part is counted. The last column prices the same amount at the Luxembourg average, as a measure of what a cheaper neighbour can be worth if a tank went that far.</p>
${h.table(kopf(h), rows, undefined, ['l', 'r', 'r', 'r', 'r'])}
<p>No tank lasts for more than a thousand kilometres, so on long drives you will almost always fill up in France at least once. It makes sense to set off with a full tank from the cheaper country and to place the second stop ${D(h).es95 < D(h).e95 ? 'in Spain if that is where you are going' : 'wherever your range allows'}.</p>
<h2>What comes on top of fuel</h2>
<p>We calculate French motorway tolls from the 2026 rate sheets of APRR, ASF and Escota. Sanef sections (A4 and A1) stay “not verified” because we could not read their rate grid; they are left out of the total. Details on ${h.a('maut-frankreich', 'French tolls')} and ${h.a('maut-spanien', 'Spanish tolls')}, Luxembourg’s prices per litre on ${h.a('tanken-luxemburg', 'fuel in Luxembourg')}.</p>
<h2>Source</h2>
<p>All prices per litre come from the European Commission’s ${h.src('wob')}. Member states report average prices with taxes every week; re-use is permitted with acknowledgement of the source (Decision 2011/833/EU). We take the values weekly. The whole drive with tolls and vignettes is on the ${h.a('home', 'home page')}, the calculations are explained in the ${h.a('method', 'method')}.</p>`;
    },
  },
  nl: {
    slug: 'benzineprijs-frankrijk',
    nav: 'Benzineprijs Frankrijk',
    card: 'Euro 95, diesel en LPG in Frankrijk als weekgemiddelde, naast Nederland, België en Luxemburg.',
    title: 'Benzineprijs Frankrijk 2026: Euro 95, diesel en LPG',
    description: 'Benzineprijs Frankrijk 2026: officieel weekgemiddelde voor Euro 95, diesel en LPG, naast Nederland, België en Luxemburg, en brandstof tot de Middellandse Zee.',
    h1: 'Benzineprijs in Frankrijk 2026: waar tanken op weg naar het zuiden?',
    intro: 'Kies brandstof en tankbeurt: de rekenhulp toont wat een volle tank in Frankrijk kost tegenover Nederland of een ander land uit het bulletin.',
    resume: (h) => {
      const { p, e95, diesel, lpg, lu95, h95, hD, spanne } = D(h);
      const s = spanne('e95')!;
      const be = p('BE', 'e95') ?? 0;
      const a = anteil(h, 'utrecht', 'nizza');
      return `In de week van ${h.date(h.M.SPRIT_STAND)} lag het Franse landelijke gemiddelde op ${h.l3(e95)} per liter Euro 95 (SP95) en ${h.l3(diesel)} per liter diesel (gazole)${lpg != null ? `, LPG (GPL) kostte ${h.l3(lpg)}` : ''}, belastingen inbegrepen. Euro 95 kost daarmee ${um(h, e95, h95, 'in Nederland')}, ${um(h, e95, be, 'in België')} en ${um(h, e95, lu95, 'in Luxemburg')}; diesel ${um(h, diesel, hD, 'in Nederland')}. Wie naar de Provence, de Côte d’Azur of Spanje rijdt, legt het grootste deel van de route in Frankrijk af${a ? `: van Utrecht naar Nice zijn dat ${h.num(a.km)} km` : ''}. De Franse literprijs telt op die ritten dus het zwaarst. In de laatste ${s.n} weken schommelde Euro 95 tussen ${h.l3(s.lo[1])} en ${h.l3(s.hi[1])}. De cijfers komen uit de Weekly Oil Bulletin van de Europese Commissie en zijn gemiddelden voor het hele land, geen prijzen van afzonderlijke tankstations.`;
    },
    faqs: (h) => {
      const { p, e95, diesel, lu95, luD, spanne } = D(h);
      const be = p('BE', 'diesel') ?? 0;
      const s = spanne('diesel')!;
      const a = anteil(h, 'amsterdam', 'lloret') ?? anteil(h, 'rotterdam', 'lloret');
      return [
        { q: 'Is tanken in Luxemburg voordeliger dan in Frankrijk op weg naar het zuiden?', a: `Volgens de weekcijfers van ${h.date(h.M.SPRIT_STAND)} is Euro 95 in Luxemburg ${um(h, lu95, e95, 'in Frankrijk')} en diesel ${um(h, luD, diesel, 'in Frankrijk')}. Op 50 liter diesel scheelt dat ${h.eur(Math.abs(luD - diesel) * 50, 2)} in het voordeel van ${luD < diesel ? 'Luxemburg' : 'Frankrijk'}. Op de snelste routes van de rekenhulp vanuit Nederland naar Lyon of Nice ligt Luxemburg op de weg, een stop kost dan nauwelijks omweg.` },
        { q: 'Hoeveel diesel verbruikt een auto op het Franse deel van de rit naar de Costa Brava?', a: a ? `Op de snelste route ${a.name} liggen ${h.num(a.km)} km in Frankrijk. Bij 7 liter diesel per 100 km is dat heen en terug ${h.num(a.liter, 1)} liter, tegen het Franse gemiddelde ${h.eur(a.kosten, 2)}. Tegen de Luxemburgse prijs zou dezelfde hoeveelheid ${h.eur(a.lu, 2)} kosten. De Franse tol komt daar nog bij.` : 'De route kon niet worden berekend. De rekenhulp op de startpagina toont per land de kilometers, liters en brandstofkosten van elke rit, Frankrijk inbegrepen, met de tol ernaast.' },
        { q: 'Is diesel in Frankrijk duurder dan in België?', a: `In de week van ${h.date(h.M.SPRIT_STAND)} kostte diesel in Frankrijk gemiddeld ${h.l3(diesel)} en in België ${h.l3(be)}, Frankrijk was dus ${um(h, diesel, be, 'België')}. Over de laatste ${s.n} weken lag de Franse diesel tussen ${h.l3(s.lo[1])} en ${h.l3(s.hi[1])}. Het verschil kan van week tot week omslaan; de tabel toont steeds de laatste cijfers.` },
      ];
    },
    body: (h) => {
      const rows = zeilen(h, [['utrecht', 'nizza'], ['amsterdam', 'lloret'], ['bruessel', 'orange'], ['antwerpen', 'montpellier'], ['eindhoven', 'lyon']]);
      return `<h2>Frankrijk en de landen ervoor en erna</h2>
<p>Landelijke gemiddelden met belastingen, week van ${h.date(h.M.SPRIT_STAND)}, gesorteerd op de prijs van Euro 95. België en Luxemburg liggen op veel routes vóór de Franse grens, Spanje en Italië erachter.</p>
${weg(h)}
<h2>Diesel op de Franse kilometers</h2>
<p>Snelste route van de rekenhulp, een auto met 7 liter diesel per 100 km, heen en terug; alleen het Franse deel telt. De laatste kolom rekent dezelfde hoeveelheid tegen het Luxemburgse gemiddelde, als maat voor wat een goedkoper buurland kan opleveren als één tank zo ver zou reiken.</p>
${h.table(kopf(h), rows, undefined, ['l', 'r', 'r', 'r', 'r'])}
<p>Geen tank reikt meer dan duizend kilometer: op lange ritten tankt u in Frankrijk bijna altijd minstens één keer. Het loont om met een volle tank uit het goedkopere land te vertrekken en de tweede stop ${D(h).es95 < D(h).e95 ? 'pas in Spanje te plannen als de reis daarheen gaat' : 'te leggen waar uw actieradius het toelaat'}.</p>
<h2>Wat er naast de brandstof bijkomt</h2>
<p>De Franse tol rekenen wij volgens de tariefbladen 2026 van APRR, ASF en Escota. Trajecten van Sanef (A4 en A1) blijven “niet geverifieerd” omdat wij hun tariefrooster niet konden lezen; ze tellen niet mee in het totaal. Meer op ${h.a('maut-frankreich', 'tol Frankrijk')}, de literprijzen van de buren op ${h.a('benzineprijs-belgie', 'benzineprijs België')} en ${h.a('tanken-luxemburg', 'tanken in Luxemburg')}.</p>
<h2>Bron</h2>
<p>Alle literprijzen komen uit de ${h.src('wob')} van de Europese Commissie. De lidstaten melden elke week hun gemiddelde prijzen met belastingen; hergebruik is toegestaan met bronvermelding (Besluit 2011/833/EU). Wij nemen de cijfers wekelijks over. De hele rit met tol en vignetten rekent de ${h.a('home', 'startpagina')}, de rekenwijze staat in de ${h.a('method', 'methode')}.</p>`;
    },
  },
});
