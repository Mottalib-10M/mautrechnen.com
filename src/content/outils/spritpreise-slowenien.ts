import { defineGuide, type Helpers } from '../../lib/guide-types';
import type { Sorte } from '../../lib/engine/params';

/** Benzinpreis Slowenien : Wochendurchschnitt (Weekly Oil Bulletin), Wochen günstiger als Österreich, Durchfahrt nach Kroatien. */
const C = 'SI';
function D(h: Helpers) {
  const p = (c: string, s: Sorte) => h.M.preis(c, s);
  const spanne = (s: Sorte) => {
    const v = h.M.verlauf(C, s);
    if (!v.length) return null;
    let lo = v[0], hi = v[0];
    for (const x of v) { if (x[1] < lo[1]) lo = x; if (x[1] > hi[1]) hi = x; }
    return { lo, hi, n: v.length, erst: v[0], letzt: v[v.length - 1] };
  };
  /** Wochen, in denen Slowenien günstiger war als das andere Land (beide Werte gemeldet). */
  const wochen = (andere: string, s: Sorte) => {
    const a = new Map(h.M.verlauf(andere, s));
    const v = h.M.verlauf(C, s).filter(([w]) => a.has(w));
    return { billiger: v.filter(([w, x]) => x < a.get(w)!).length, n: v.length };
  };
  const ab = h.M.addDays(h.today, 7);
  const fahrt = (start: string, ziel: string) => h.M.reise({ start, ziel, fz: 'pkw', sorte: 'e95', verbrauch: h.M.vorgabeVerbrauch('pkw'), ab, dauer: 14, hinUndZurueck: true, aufenthalt: false });
  return { p, e95: p(C, 'e95') ?? 0, diesel: p(C, 'diesel') ?? 0, lpg: p(C, 'lpg'), at95: p('AT', 'e95') ?? 0, atD: p('AT', 'diesel') ?? 0, it95: p('IT', 'e95') ?? 0, itD: p('IT', 'diesel') ?? 0, hr95: p('HR', 'e95') ?? 0, spanne, wochen, fahrt };
}
const um = (h: Helpers, a: number, b: number, wo: string) => {
  const d = Math.round((a - b) * 1000) / 1000;
  if (d === 0) return h.T(`genauso viel wie ${wo}`, `the same as ${wo}`, `evenveel als ${wo}`);
  return h.T(`${h.l3(Math.abs(d))} ${d < 0 ? 'weniger' : 'mehr'} als ${wo}`, `${h.l3(Math.abs(d))} ${d < 0 ? 'less' : 'more'} than ${wo}`, `${h.l3(Math.abs(d))} ${d < 0 ? 'minder' : 'meer'} dan ${wo}`);
};
const l3x = (h: Helpers, x: number | null) => (x == null ? '–' : h.l3(x));
/** Slowenien gegen die Nachbarn : Literpreis und Unterschied für 50 Liter Super. */
function nachbarn(h: Helpers) {
  const { p, e95 } = D(h);
  const rows = [C, 'AT', 'IT', 'HR', 'HU', 'DE'].map((c) => {
    const x = p(c, 'e95');
    const d = x == null || c === C ? '–' : `${x > e95 ? '+' : x < e95 ? '−' : ''}${h.eur(Math.abs(x - e95) * 50, 2)}`;
    return [h.land(c), l3x(h, x), l3x(h, p(c, 'diesel')), l3x(h, p(c, 'lpg')), d];
  });
  return h.table([h.T('Land', 'Country', 'Land'), 'Super 95', 'Diesel', h.T('Autogas', 'LPG', 'LPG'), h.T('50 L Super gegenüber Slowenien', '50 L petrol versus Slovenia', '50 L Euro 95 tegenover Slovenië')], rows, undefined, ['l', 'r', 'r', 'r', 'r']);
}
function durchfahrt(h: Helpers, start: string, ziel: string) {
  const { fahrt } = D(h);
  const r = fahrt(start, ziel);
  const x = r?.sprit.find((s) => s.land === C);
  if (!r || !x || x.kosten == null) return null;
  return [`${h.M.KNOTEN[start].n[h.lang]} – ${h.M.KNOTEN[ziel].n[h.lang]}`, h.num(x.km), h.num((x.km / r.route.km) * 100, 0) + ' %', h.num(x.liter, 1), h.eur(x.kosten, 2)];
}

export default defineGuide({
  id: 'spritpreise-slowenien',
  group: 'sprit',
  order: 33,
  tool: 'sprit',
  land: 'SI',
  related: ['vignette-slowenien', 'karawankentunnel', 'spritpreise-kroatien', 'spritpreise-oesterreich', 'maut-nach-kroatien'],
  sources: ['wob', 'osm'],
  de: {
    slug: 'benzinpreis-slowenien',
    nav: 'Benzinpreis Slowenien',
    card: 'Super, Diesel und Autogas in Slowenien im Wochenmittel, gegen Österreich, Italien und Kroatien.',
    title: 'Benzinpreis Slowenien 2026: Super, Diesel und Autogas',
    description: 'Benzinpreis Slowenien 2026: amtliche Wochenwerte für Super 95, Diesel und Autogas, Vergleich mit Österreich, Italien und Kroatien, Tankstopp auf der Durchfahrt.',
    h1: 'Benzinpreis in Slowenien 2026: Tankstopp zwischen Karawanken und Kroatien',
    intro: 'Sorte und Tankfüllung wählen: der Rechner stellt den slowenischen Durchschnitt neben Österreich, Deutschland oder jedes andere Land des Bulletins.',
    resume: (h) => {
      const { e95, diesel, lpg, at95, atD, it95, hr95, wochen, spanne } = D(h);
      const w = wochen('AT', 'e95');
      const s = spanne('e95')!;
      return `Slowenien meldete für die Woche vom ${h.date(h.M.SPRIT_STAND)} einen Landesdurchschnitt von ${h.l3(e95)} je Liter Super 95 und ${h.l3(diesel)} je Liter Diesel${lpg != null ? `, Autogas kostete ${h.l3(lpg)}` : ''}, alle Steuern inbegriffen. Super ist damit ${um(h, e95, at95, 'in Österreich')}, ${um(h, e95, it95, 'in Italien')} und ${um(h, e95, hr95, 'in Kroatien')}; Diesel ist ${um(h, diesel, atD, 'in Österreich')}. In ${w.billiger} der letzten ${w.n} Wochen war Super in Slowenien günstiger als in Österreich. Die Spanne dieses Zeitraums reicht von ${h.l3(s.lo[1])} bis ${h.l3(s.hi[1])}. Wer über den Karawankentunnel oder Spielfeld nach Kroatien fährt, durchquert Slowenien auf der Autobahn, für die eine Vignette Pflicht ist; ein Tankstopp liegt deshalb oft genau auf dieser Strecke. Die Zahlen sind Landesmittel aus dem Weekly Oil Bulletin der Europäischen Kommission, keine Preise einzelner Tankstellen.`;
    },
    faqs: (h) => {
      const { e95, diesel, it95, itD, wochen, spanne } = D(h);
      const w = wochen('AT', 'e95');
      const s = spanne('diesel')!;
      const d = durchfahrt(h, 'muenchen', 'split');
      return [
        { q: 'In wie vielen Wochen des letzten Halbjahres war Super in Slowenien billiger als in Österreich?', a: `In ${w.billiger} von ${w.n} Wochen, in denen beide Länder einen Wert gemeldet haben. Ein günstigerer Preis in Slowenien ist also ${w.billiger * 2 >= w.n ? 'die Regel, aber keine Garantie' : 'eher die Ausnahme'}. Diese Woche liegt der slowenische Durchschnitt bei ${h.l3(e95)}. Die Seite rechnet den Vergleich mit jedem neuen Bulletin neu, statt eine feste Aussage zu treffen.` },
        { q: 'Reicht ein in Österreich gefüllter Tank für die Durchfahrt durch Slowenien?', a: d ? `Auf der schnellsten Strecke von München nach Split liegen ${d[1]} km in Slowenien, ${d[2]} der ganzen Strecke. Ein Auto mit 7 Litern auf 100 km braucht dafür ${d[3]} Liter je Richtung; ein voller Tank aus Österreich reicht also locker. Ob Sie trotzdem in Slowenien tanken, entscheidet der Preisunterschied in der Tabelle oben.` : 'Die Strecke konnte nicht berechnet werden. Der Rechner der Startseite zeigt für jede Fahrt die Kilometer und Liter je Land, auch für Slowenien, und den Spritpreis jedes Landes aus dem Bulletin.' },
        { q: 'Ist Diesel in Slowenien günstiger als jenseits der Grenze bei Triest?', a: `Im Landesmittel der Woche vom ${h.date(h.M.SPRIT_STAND)} kostet Diesel in Slowenien ${h.l3(diesel)} und in Italien ${h.l3(itD)}, also ${um(h, diesel, itD, 'in Italien')}. Beim Super stehen ${h.l3(e95)} gegen ${h.l3(it95)}. Für 50 Liter Diesel macht das ${h.eur(Math.abs(diesel - itD) * 50, 2)} aus. Die Werte gelten für das ganze Land, nicht für die Grenzorte.` },
        { q: 'Wie hat sich der Dieselpreis in Slowenien seit dem Frühjahr entwickelt?', a: `Vor ${s.n} Wochen lag der slowenische Durchschnitt für Diesel bei ${h.l3(s.erst[1])}, in der letzten Woche bei ${h.l3(s.letzt[1])}, also ${um(h, s.letzt[1], s.erst[1], 'damals')}. Am tiefsten war er mit ${h.l3(s.lo[1])} in der Woche vom ${h.date(s.lo[0])}, am höchsten mit ${h.l3(s.hi[1])} in der Woche vom ${h.date(s.hi[0])}.` },
      ];
    },
    body: (h) => {
      const rows = [durchfahrt(h, 'muenchen', 'split'), durchfahrt(h, 'koeln', 'porec'), durchfahrt(h, 'berlin', 'pula'), durchfahrt(h, 'muenchen', 'portoroz'), durchfahrt(h, 'stuttgart', 'ljubljana')].filter((x): x is string[] => !!x);
      return `<h2>Slowenien gegen seine Nachbarn</h2>
<p>Landesdurchschnitte mit Steuern in der Woche vom ${h.date(h.M.SPRIT_STAND)}. Die letzte Spalte zeigt, was 50 Liter Super im jeweiligen Land mehr (+) oder weniger (−) kosten als in Slowenien.</p>
${nachbarn(h)}
<h2>Wie viel Slowenien auf Ihrer Strecke ausmacht</h2>
<p>Ein Auto mit 7 Litern Super auf 100 km, schnellste Strecke des Rechners, einfache Fahrt. Gezählt sind Kilometer, Anteil an der ganzen Strecke, Liter und Kosten in Slowenien.</p>
${h.table([h.T('Strecke', 'Route', 'Route'), h.T('km in Slowenien', 'km in Slovenia', 'km in Slovenië'), h.T('Anteil', 'Share', 'Aandeel'), h.T('Liter', 'Litres', 'Liter'), h.T('Kosten', 'Cost', 'Kosten')], rows, undefined, ['l', 'r', 'r', 'r', 'r'])}
<p>Auf dem Weg nach Dalmatien ist Slowenien ein kurzes Durchreiseland, nach Istrien oder an die slowenische Küste ein größerer Teil der Fahrt. Für die slowenische Autobahn brauchen Sie die ${h.a('vignette-slowenien', 'E-Vignette')}, auf der Route über Villach zusätzlich die Maut für den ${h.a('karawankentunnel', 'Karawankentunnel')}.</p>
<h2>Tanken vor oder nach der Grenze</h2>
<p>Die Entscheidung hängt an drei Zahlen: dem Preis im Land davor, in Slowenien und im Land danach. Die Seiten ${h.a('spritpreise-oesterreich', 'Spritpreise Österreich')} und ${h.a('spritpreise-kroatien', 'Spritpreise Kroatien')} zeigen die beiden Nachbarn mit derselben Quelle und derselben Woche. Die gesamte Fahrt mit Vignetten, Maut und Sprit rechnet die ${h.a('home', 'Startseite')}. Beispiele für die Fahrt an die Adria stehen auf ${h.a('maut-nach-kroatien', 'Maut nach Kroatien')}.</p>
<h2>Quelle</h2>
<p>${h.src('wob')}, Europäische Kommission. Die Mitgliedstaaten melden ihre Durchschnittspreise mit Steuern jede Woche; die Weiterverwendung ist mit Quellenangabe erlaubt (Beschluss 2011/833/EU). Diese Seite übernimmt die Werte wöchentlich. Einzelheiten zur Berechnung in der ${h.a('method', 'Methode')}.</p>`;
    },
  },
  en: {
    slug: 'fuel-prices-slovenia',
    nav: 'Fuel prices Slovenia',
    card: 'Weekly average for petrol, diesel and LPG in Slovenia, against Austria, Italy and Croatia.',
    title: 'Fuel prices in Slovenia 2026: petrol, diesel and LPG',
    description: 'Fuel prices in Slovenia 2026: official weekly figures for petrol 95, diesel and LPG, compared with Austria, Italy and Croatia, and where to stop in transit.',
    h1: 'Fuel prices in Slovenia 2026: a stop between the Karawanken and Croatia',
    intro: 'Pick the fuel and the fill-up: the calculator sets the Slovenian average beside Austria, Germany or any other bulletin country.',
    resume: (h) => {
      const { e95, diesel, lpg, at95, atD, it95, hr95, wochen, spanne } = D(h);
      const w = wochen('AT', 'e95');
      const s = spanne('e95')!;
      return `Slovenia reported a national average of ${h.l3(e95)} per litre of petrol 95 and ${h.l3(diesel)} per litre of diesel for the week of ${h.date(h.M.SPRIT_STAND)}${lpg != null ? `, with LPG at ${h.l3(lpg)}` : ''}, all taxes included. Petrol is therefore ${um(h, e95, at95, 'in Austria')}, ${um(h, e95, it95, 'in Italy')} and ${um(h, e95, hr95, 'in Croatia')}; diesel is ${um(h, diesel, atD, 'in Austria')}. In ${w.billiger} of the last ${w.n} weeks petrol was cheaper in Slovenia than in Austria. The range over that period runs from ${h.l3(s.lo[1])} to ${h.l3(s.hi[1])}. If you drive to Croatia via the Karawanken tunnel or Spielfeld, you cross Slovenia on motorways that require a vignette, so a fuel stop often falls on exactly that stretch. The figures are national averages from the European Commission’s Weekly Oil Bulletin, not prices at individual stations.`;
    },
    faqs: (h) => {
      const { e95, diesel, it95, itD, wochen, spanne } = D(h);
      const w = wochen('AT', 'e95');
      const s = spanne('diesel')!;
      const d = durchfahrt(h, 'muenchen', 'split');
      return [
        { q: 'In how many weeks of the last half-year was petrol cheaper in Slovenia than in Austria?', a: `In ${w.billiger} of ${w.n} weeks in which both countries reported a value. A lower price in Slovenia is thus ${w.billiger * 2 >= w.n ? 'the rule, but not a guarantee' : 'rather the exception'}. This week the Slovenian average stands at ${h.l3(e95)}. The page recalculates the comparison with every new bulletin instead of making a fixed claim.` },
        { q: 'Will a tank filled in Austria last through Slovenia?', a: d ? `On the fastest route from Munich to Split, ${d[1]} km lie in Slovenia, ${d[2]} of the whole distance. A car using 7 litres per 100 km needs ${d[3]} litres for that each way, so a full tank from Austria is plenty. Whether you still fill up in Slovenia depends on the price gap in the table above.` : 'The route could not be calculated. The calculator on the home page shows the kilometres and litres per country for every trip, Slovenia included, together with each country’s fuel price from the bulletin.' },
        { q: 'Is diesel in Slovenia cheaper than across the border near Trieste?', a: `On the national averages for the week of ${h.date(h.M.SPRIT_STAND)} diesel costs ${h.l3(diesel)} in Slovenia and ${h.l3(itD)} in Italy, that is ${um(h, diesel, itD, 'in Italy')}. For petrol it is ${h.l3(e95)} against ${h.l3(it95)}. On 50 litres of diesel that makes ${h.eur(Math.abs(diesel - itD) * 50, 2)}. The values cover the whole country, not the border towns.` },
        { q: 'How has the diesel price in Slovenia moved since the spring?', a: `${s.n} weeks ago the Slovenian diesel average was ${h.l3(s.erst[1])}, last week it was ${h.l3(s.letzt[1])}, that is ${um(h, s.letzt[1], s.erst[1], 'then')}. Its lowest point was ${h.l3(s.lo[1])} in the week of ${h.date(s.lo[0])}, its highest ${h.l3(s.hi[1])} in the week of ${h.date(s.hi[0])}.` },
      ];
    },
    body: (h) => {
      const rows = [durchfahrt(h, 'muenchen', 'split'), durchfahrt(h, 'koeln', 'porec'), durchfahrt(h, 'berlin', 'pula'), durchfahrt(h, 'muenchen', 'portoroz'), durchfahrt(h, 'stuttgart', 'ljubljana')].filter((x): x is string[] => !!x);
      return `<h2>Slovenia against its neighbours</h2>
<p>National averages with taxes in the week of ${h.date(h.M.SPRIT_STAND)}. The last column shows how much more (+) or less (−) 50 litres of petrol cost in each country than in Slovenia.</p>
${nachbarn(h)}
<h2>How much of your route is in Slovenia</h2>
<p>A car using 7 litres of petrol per 100 km, the calculator’s fastest route, one way. Counted are the kilometres, the share of the whole route, the litres and the cost in Slovenia.</p>
${h.table([h.T('Strecke', 'Route', 'Route'), h.T('km in Slowenien', 'km in Slovenia', 'km in Slovenië'), h.T('Anteil', 'Share', 'Aandeel'), h.T('Liter', 'Litres', 'Liter'), h.T('Kosten', 'Cost', 'Kosten')], rows, undefined, ['l', 'r', 'r', 'r', 'r'])}
<p>On the way to Dalmatia Slovenia is a short transit country; to Istria or the Slovenian coast it is a larger part of the drive. On Slovenian motorways you need the ${h.a('vignette-slowenien', 'e-vignette')}, and on the route via Villach also the toll for the ${h.a('karawankentunnel', 'Karawanken tunnel')}.</p>
<h2>Fill up before or after the border</h2>
<p>The decision rests on three numbers: the price in the country before, in Slovenia and in the country after. The pages on ${h.a('spritpreise-oesterreich', 'fuel prices in Austria')} and ${h.a('spritpreise-kroatien', 'fuel prices in Croatia')} show both neighbours from the same source and the same week. The whole drive with vignettes, tolls and fuel is on the ${h.a('home', 'home page')}. Examples for the drive to the Adriatic are on ${h.a('maut-nach-kroatien', 'tolls to Croatia')}.</p>
<h2>Source</h2>
<p>${h.src('wob')}, European Commission. Member states report their average prices with taxes every week; re-use is permitted with acknowledgement of the source (Decision 2011/833/EU). This page takes the values weekly. Details of the calculation in the ${h.a('method', 'method')}.</p>`;
    },
  },
});
