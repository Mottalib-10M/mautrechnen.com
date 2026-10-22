import { defineGuide, type Helpers } from '../../lib/guide-types';
import type { Sorte } from '../../lib/engine/params';

/** Spritpreise Kroatien : Wochendurchschnitt (Weekly Oil Bulletin), Vergleich mit Slowenien und Deutschland, Sprit auf dem kroatischen Teil der Strecke. */
const C = 'HR';
function D(h: Helpers) {
  const p = (c: string, s: Sorte) => h.M.preis(c, s);
  const spanne = (s: Sorte) => {
    const v = h.M.verlauf(C, s);
    if (!v.length) return null;
    let lo = v[0], hi = v[0];
    for (const x of v) { if (x[1] < lo[1]) lo = x; if (x[1] > hi[1]) hi = x; }
    return { lo, hi, n: v.length, erst: v[0], letzt: v[v.length - 1] };
  };
  const ab = h.M.addDays(h.today, 7);
  const fahrt = (start: string, ziel: string) => h.M.reise({ start, ziel, fz: 'pkw', sorte: 'diesel', verbrauch: h.M.vorgabeVerbrauch('pkw'), ab, dauer: 14, hinUndZurueck: true, aufenthalt: false });
  return { p, e95: p(C, 'e95') ?? 0, diesel: p(C, 'diesel') ?? 0, lpg: p(C, 'lpg'), si95: p('SI', 'e95') ?? 0, siD: p('SI', 'diesel') ?? 0, de95: p('DE', 'e95') ?? 0, deD: p('DE', 'diesel') ?? 0, spanne, fahrt };
}
const um = (h: Helpers, a: number, b: number, wo: string) => {
  const d = Math.round((a - b) * 1000) / 1000;
  if (d === 0) return h.T(`genauso viel wie ${wo}`, `the same as ${wo}`, `evenveel als ${wo}`);
  return h.T(`${h.l3(Math.abs(d))} ${d < 0 ? 'weniger' : 'mehr'} als ${wo}`, `${h.l3(Math.abs(d))} ${d < 0 ? 'less' : 'more'} than ${wo}`, `${h.l3(Math.abs(d))} ${d < 0 ? 'minder' : 'meer'} dan ${wo}`);
};
const l3x = (h: Helpers, x: number | null) => (x == null ? '–' : h.l3(x));
const vollTank = (h: Helpers, x: number | null) => (x == null ? '–' : h.eur(x * 50, 2));
function vergleich(h: Helpers) {
  const { p } = D(h);
  const rows = [C, 'SI', 'HU', 'AT', 'IT', 'DE', 'NL', 'BE'].map((c) => [h.land(c), l3x(h, p(c, 'e95')), vollTank(h, p(c, 'e95')), l3x(h, p(c, 'diesel')), vollTank(h, p(c, 'diesel'))]);
  return h.table([h.T('Land', 'Country', 'Land'), 'Super 95', h.T('50 L Super', '50 L petrol', '50 L Euro 95'), 'Diesel', h.T('50 L Diesel', '50 L diesel', '50 L diesel')], rows, undefined, ['l', 'r', 'r', 'r', 'r']);
}
function verlaufTab(h: Helpers) {
  const { spanne } = D(h);
  const name: Record<Sorte, string> = { e95: h.T('Super 95', 'Petrol 95', 'Euro 95'), diesel: 'Diesel', lpg: h.T('Autogas', 'LPG', 'LPG') };
  const rows = (['e95', 'diesel', 'lpg'] as Sorte[]).flatMap((s) => { const x = spanne(s); return x ? [[name[s], `${h.l3(x.erst[1])} (${h.date(x.erst[0])})`, h.l3(x.lo[1]), h.l3(x.hi[1]), h.l3(x.letzt[1])]] : []; });
  return h.table([h.T('Sorte', 'Fuel', 'Brandstof'), h.T('vor 26 Wochen', '26 weeks ago', '26 weken geleden'), h.T('Tief', 'Low', 'Laag'), h.T('Hoch', 'High', 'Hoog'), h.T('zuletzt', 'latest', 'laatst')], rows, undefined, ['l', 'r', 'r', 'r', 'r']);
}
/** Kroatischer Anteil : Diesel, 7 L/100 km, hin und zurück ; Vergleich mit dem slowenischen Preis. */
function anteil(h: Helpers, start: string, ziel: string) {
  const { fahrt, siD } = D(h);
  const r = fahrt(start, ziel);
  const x = r?.sprit.find((s) => s.land === C);
  if (!r || !x || x.kosten == null) return null;
  return [`${h.M.KNOTEN[start].n[h.lang]} – ${h.M.KNOTEN[ziel].n[h.lang]}`, h.num(x.km), h.num(x.liter * 2, 1), h.eur(x.kosten * 2, 2), h.eur(x.liter * 2 * siD, 2)];
}

export default defineGuide({
  id: 'spritpreise-kroatien',
  group: 'sprit',
  order: 32,
  tool: 'sprit',
  land: 'HR',
  related: ['maut-kroatien', 'maut-nach-kroatien', 'spritpreise-slowenien', 'vignette-slowenien', 'karawankentunnel'],
  sources: ['wob', 'osm'],
  de: {
    slug: 'spritpreise-kroatien',
    nav: 'Spritpreise Kroatien',
    card: 'Super, Diesel und Autogas in Kroatien im Wochenmittel, neben Slowenien und Deutschland.',
    title: 'Spritpreise Kroatien 2026: Diesel, Super und Autogas',
    description: 'Spritpreise Kroatien 2026: amtliche Wochenwerte für Super 95, Diesel und Autogas, neben Slowenien und Deutschland, mit Spritkosten bis Split, Zadar oder Pula.',
    h1: 'Spritpreise in Kroatien 2026: was kostet der Tank an der Adria?',
    intro: 'Sorte, Tankfüllung und Vergleichsland wählen: der Rechner zeigt, was eine Tankfüllung in Kroatien gegenüber zu Hause kostet.',
    resume: (h) => {
      const { e95, diesel, lpg, si95, siD, de95, deD, spanne } = D(h);
      const s = spanne('diesel')!;
      return `Ein Liter Super 95 kostete in Kroatien in der Woche vom ${h.date(h.M.SPRIT_STAND)} im Landesdurchschnitt ${h.l3(e95)}, ein Liter Diesel ${h.l3(diesel)}${lpg != null ? `, Autogas ${h.l3(lpg)}` : ''}, Steuern inbegriffen. Gegenüber Slowenien, dem letzten Land vor der Grenze, ist das beim Super ${um(h, e95, si95, 'dort')} und beim Diesel ${um(h, diesel, siD, 'dort')}; gegenüber Deutschland sind es beim Super ${um(h, e95, de95, 'in Deutschland')} und beim Diesel ${um(h, diesel, deD, 'in Deutschland')}. Für 50 Liter Diesel ergibt das ${h.eur(diesel * 50, 2)} in Kroatien und ${h.eur(deD * 50, 2)} in Deutschland. In den letzten ${s.n} Wochen bewegte sich Diesel in Kroatien zwischen ${h.l3(s.lo[1])} und ${h.l3(s.hi[1])}. Weil die Strecke von der slowenischen Grenze bis Split oder Makarska fast 500 Kilometer lang ist, tankt man auf dem Weg an die dalmatinische Küste fast immer auch in Kroatien. Die Zahlen stammen aus dem Weekly Oil Bulletin der Europäischen Kommission; Preise einzelner Tankstellen nennt diese Seite nicht.`;
    },
    faqs: (h) => {
      const { e95, diesel, si95, siD, spanne } = D(h);
      const l = spanne('lpg');
      const z = anteil(h, 'muenchen', 'split');
      return [
        { q: 'Tankt man vor der kroatischen Grenze besser noch in Slowenien voll?', a: `Nach den Wochenwerten vom ${h.date(h.M.SPRIT_STAND)} ist Diesel in Slowenien ${um(h, siD, diesel, 'in Kroatien')} und Super 95 ${um(h, si95, e95, 'in Kroatien')}. Bei 50 Litern Diesel sind das ${h.eur(Math.abs(siD - diesel) * 50, 2)} ${siD < diesel ? 'zugunsten Sloweniens' : 'zugunsten Kroatiens'}. Für die slowenische Autobahn brauchen Sie in jedem Fall eine Vignette; die Rechnung ändert sich, sobald neue Wochenpreise erscheinen.` },
        { q: 'Wie viel Diesel braucht ein Auto allein auf dem kroatischen Teil der Fahrt nach Split?', a: z ? `Auf der schnellsten Strecke des Rechners von München nach Split liegen ${z[1]} km in Kroatien. Mit 7 Litern auf 100 km sind das hin und zurück ${z[2]} Liter Diesel, die zum kroatischen Landesdurchschnitt ${z[3]} kosten. Zum slowenischen Durchschnitt wären es ${z[4]}. Mit Wohnwagen oder Dachbox steigt der Verbrauch; tragen Sie ihn im Rechner der Startseite ein.` : 'Die Strecke konnte nicht berechnet werden. Im Rechner der Startseite lassen sich Start, Ziel und Verbrauch frei wählen; er zeigt den Anteil jedes Landes an Kilometern und Spritkosten getrennt an, auch für Kroatien.' },
        { q: 'Hat sich Autogas in Kroatien im letzten halben Jahr verteuert?', a: l ? `Vor ${l.n} Wochen meldete Kroatien ${h.l3(l.erst[1])} je Liter Autogas, zuletzt ${h.l3(l.letzt[1])}; das ist ${um(h, l.letzt[1], l.erst[1], 'damals')}. Der tiefste Wert in diesem Zeitraum lag bei ${h.l3(l.lo[1])}, der höchste bei ${h.l3(l.hi[1])}. Wie bei Super und Diesel handelt es sich um Landesmittel mit Steuern.` : `Für Autogas meldet Kroatien in den letzten Wochen keinen Durchschnitt an die Kommission. Der Rechner kann für LPG in Kroatien deshalb keinen Betrag zeigen; für Super 95 und Diesel liegen die Wochenwerte vor.` },
      ];
    },
    body: (h) => {
      const rows = [anteil(h, 'muenchen', 'split'), anteil(h, 'muenchen', 'zadar'), anteil(h, 'koeln', 'porec'), anteil(h, 'berlin', 'pula'), anteil(h, 'stuttgart', 'makarska')].filter((x): x is string[] => !!x);
      return `<h2>Kroatien neben den Nachbarn: Woche vom ${h.date(h.M.SPRIT_STAND)}</h2>
<p>Landesdurchschnitte mit Steuern, je Liter und für eine Tankfüllung von 50 Litern. Slowenien und Ungarn sind die Länder, aus denen man nach Kroatien einfährt; Deutschland, die Niederlande und Belgien sind die Startländer der meisten Urlauber dieser Seite.</p>
${vergleich(h)}
<h2>Ein halbes Jahr im Rückblick</h2>
${verlaufTab(h)}
<p>Die Spalten zeigen den Wert vor 26 Wochen, das Tief und das Hoch des Zeitraums und den letzten Wert. So sehen Sie, ob der Preis Ihrer Reisewoche eher am oberen oder am unteren Rand liegt.</p>
<h2>Diesel auf dem kroatischen Teil der Strecke</h2>
<p>Ein Auto mit 7 Litern Diesel auf 100 km, schnellste Strecke des Rechners, hin und zurück; gezählt wird nur der Abschnitt in Kroatien. Die letzte Spalte setzt dieselben Liter zum slowenischen Durchschnitt an.</p>
${h.table([h.T('Strecke', 'Route', 'Route'), h.T('km in Kroatien', 'km in Croatia', 'km in Kroatië'), h.T('Liter', 'Litres', 'Liter'), h.T('in Kroatien', 'in Croatia', 'in Kroatië'), h.T('zum Preis in Slowenien', 'at the Slovenian price', 'tegen de Sloveense prijs')], rows, undefined, ['l', 'r', 'r', 'r', 'r'])}
<p>Nach Istrien (Poreč, Pula) sind es nur wenige Dutzend Kilometer in Kroatien; dort reicht ein Tank aus Slowenien oder Österreich meist bis ans Ziel. Nach Split, Zadar oder Makarska fährt man dagegen mehrere Hundert Kilometer über die A1, und der kroatische Literpreis zählt.</p>
<h2>Was sonst auf der Fahrt anfällt</h2>
<p>Zum Sprit kommen die ${h.a('maut-kroatien', 'kroatische Autobahnmaut')} nach Ein- und Ausfahrt, die ${h.a('vignette-slowenien', 'Vignette für Slowenien')} und auf der Route über Villach der ${h.a('karawankentunnel', 'Karawankentunnel')}. Komplette Beispiele stehen auf ${h.a('maut-nach-kroatien', 'Maut nach Kroatien')}, die Durchschnitte des Nachbarlandes auf ${h.a('spritpreise-slowenien', 'Spritpreise Slowenien')}.</p>
<p>Quelle: ${h.src('wob')} der Europäischen Kommission, Weiterverwendung mit Quellenangabe (Beschluss 2011/833/EU). Die Kommission veröffentlicht die Werte wöchentlich, wir übernehmen sie wöchentlich; mehr in der ${h.a('method', 'Methode')}.</p>`;
    },
  },
  en: {
    slug: 'fuel-prices-croatia',
    nav: 'Fuel prices Croatia',
    card: 'Weekly average for petrol, diesel and LPG in Croatia, beside Slovenia and Germany.',
    title: 'Fuel prices in Croatia 2026: diesel, petrol and LPG',
    description: 'Fuel prices in Croatia 2026: official weekly figures for petrol 95, diesel and LPG, beside Slovenia and Germany, and the fuel cost to Split, Zadar or Pula.',
    h1: 'Fuel prices in Croatia 2026: what does a tank cost on the coast?',
    intro: 'Pick the fuel, the fill-up and a country to compare: the calculator shows what a tank in Croatia costs against home.',
    resume: (h) => {
      const { e95, diesel, lpg, si95, siD, de95, deD, spanne } = D(h);
      const s = spanne('diesel')!;
      return `A litre of petrol 95 cost ${h.l3(e95)} on Croatia’s national average in the week of ${h.date(h.M.SPRIT_STAND)}, a litre of diesel ${h.l3(diesel)}${lpg != null ? `, LPG ${h.l3(lpg)}` : ''}, taxes included. Against Slovenia, the last country before the border, petrol is ${um(h, e95, si95, 'there')} and diesel ${um(h, diesel, siD, 'there')}; against Germany petrol is ${um(h, e95, de95, 'in Germany')} and diesel ${um(h, diesel, deD, 'in Germany')}. Fifty litres of diesel thus cost ${h.eur(diesel * 50, 2)} in Croatia and ${h.eur(deD * 50, 2)} in Germany. Over the last ${s.n} weeks Croatian diesel moved between ${h.l3(s.lo[1])} and ${h.l3(s.hi[1])}. Because the motorway from the Slovenian border to Split or Makarska is close to 500 kilometres long, on the way to the Dalmatian coast you will almost always fill up in Croatia too. The figures come from the European Commission’s Weekly Oil Bulletin; this page quotes no prices of individual stations.`;
    },
    faqs: (h) => {
      const { e95, diesel, si95, siD, spanne } = D(h);
      const l = spanne('lpg');
      const z = anteil(h, 'muenchen', 'split');
      return [
        { q: 'Should I fill up in Slovenia before the Croatian border?', a: `On the weekly figures of ${h.date(h.M.SPRIT_STAND)} diesel in Slovenia is ${um(h, siD, diesel, 'in Croatia')} and petrol 95 ${um(h, si95, e95, 'in Croatia')}. On 50 litres of diesel that is ${h.eur(Math.abs(siD - diesel) * 50, 2)} in favour of ${siD < diesel ? 'Slovenia' : 'Croatia'}. You need a vignette for the Slovenian motorway either way; the answer changes as soon as new weekly prices appear.` },
        { q: 'How much diesel does a car use on the Croatian part of the drive to Split?', a: z ? `On the calculator’s fastest route from Munich to Split, ${z[1]} km lie in Croatia. At 7 litres per 100 km that is ${z[2]} litres of diesel out and back, costing ${z[3]} at the Croatian national average. At the Slovenian average it would be ${z[4]}. With a caravan or a roof box consumption rises; enter it in the calculator on the home page.` : 'The route could not be calculated. The calculator on the home page lets you choose start, destination and consumption freely; it shows each country’s share of kilometres and fuel cost separately, Croatia included.' },
        { q: 'Has LPG become dearer in Croatia over the last six months?', a: l ? `${l.n} weeks ago Croatia reported ${h.l3(l.erst[1])} per litre of LPG, most recently ${h.l3(l.letzt[1])}; that is ${um(h, l.letzt[1], l.erst[1], 'then')}. The lowest value in that period was ${h.l3(l.lo[1])}, the highest ${h.l3(l.hi[1])}. As for petrol and diesel, these are national averages with taxes.` : 'Croatia has reported no LPG average to the Commission in recent weeks. The calculator therefore cannot show an LPG amount for Croatia; weekly values for petrol 95 and diesel are available.' },
      ];
    },
    body: (h) => {
      const rows = [anteil(h, 'muenchen', 'split'), anteil(h, 'muenchen', 'zadar'), anteil(h, 'koeln', 'porec'), anteil(h, 'berlin', 'pula'), anteil(h, 'stuttgart', 'makarska')].filter((x): x is string[] => !!x);
      return `<h2>Croatia beside its neighbours: week of ${h.date(h.M.SPRIT_STAND)}</h2>
<p>National averages with taxes, per litre and for a 50-litre fill-up. Slovenia and Hungary are the countries you enter Croatia from; Germany, the Netherlands and Belgium are where most travellers using this site set off.</p>
${vergleich(h)}
<h2>Six months in review</h2>
${verlaufTab(h)}
<p>The columns show the value 26 weeks ago, the low and the high of the period and the latest figure. That tells you whether the price in your travel week sits near the top or the bottom of the range.</p>
<h2>Diesel on the Croatian part of the route</h2>
<p>A car using 7 litres of diesel per 100 km, on the calculator’s fastest route, out and back; only the section in Croatia is counted. The last column prices the same litres at the Slovenian average.</p>
${h.table([h.T('Strecke', 'Route', 'Route'), h.T('km in Kroatien', 'km in Croatia', 'km in Kroatië'), h.T('Liter', 'Litres', 'Liter'), h.T('in Kroatien', 'in Croatia', 'in Kroatië'), h.T('zum Preis in Slowenien', 'at the Slovenian price', 'tegen de Sloveense prijs')], rows, undefined, ['l', 'r', 'r', 'r', 'r'])}
<p>To Istria (Poreč, Pula) only a few dozen kilometres lie in Croatia, so a tank filled in Slovenia or Austria usually lasts to the destination. To Split, Zadar or Makarska you drive several hundred kilometres on the A1, and the Croatian price per litre matters.</p>
<h2>What else the drive costs</h2>
<p>On top of fuel come the ${h.a('maut-kroatien', 'Croatian motorway toll')} by entry and exit, the ${h.a('vignette-slowenien', 'Slovenian vignette')} and, on the route via Villach, the ${h.a('karawankentunnel', 'Karawanken tunnel')}. Complete examples are on ${h.a('maut-nach-kroatien', 'tolls to Croatia')}, the neighbouring averages on ${h.a('spritpreise-slowenien', 'fuel prices in Slovenia')}.</p>
<p>Source: the European Commission’s ${h.src('wob')}, re-use permitted with acknowledgement of the source (Decision 2011/833/EU). The Commission publishes the values weekly and we take them weekly; more in the ${h.a('method', 'method')}.</p>`;
    },
  },
});
