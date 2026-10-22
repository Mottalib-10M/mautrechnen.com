import { defineGuide, type Helpers } from '../../lib/guide-types';
import type { Sorte } from '../../lib/engine/params';

/** Spritpreise Italien : Wochendurchschnitt (Weekly Oil Bulletin), Autogas, Vergleich mit Österreich und Deutschland, Anteil an der Fahrt. */
const C = 'IT';
function D(h: Helpers) {
  const p = (c: string, s: Sorte) => h.M.preis(c, s);
  const spanne = (s: Sorte) => {
    const v = h.M.verlauf(C, s);
    if (!v.length) return null;
    let lo = v[0], hi = v[0];
    for (const x of v) { if (x[1] < lo[1]) lo = x; if (x[1] > hi[1]) hi = x; }
    return { lo, hi, n: v.length, erst: v[0] };
  };
  const rang = (s: Sorte) => {
    const alle = h.M.SPRIT_LAENDER.map((c) => ({ c, p: p(c, s) })).filter((x): x is { c: string; p: number } => x.p != null).sort((a, b) => a.p - b.p);
    return { pos: alle.findIndex((x) => x.c === C) + 1, n: alle.length };
  };
  const ab = h.M.addDays(h.today, 7);
  const fahrt = (start: string, ziel: string) => h.M.reise({ start, ziel, fz: 'pkw', sorte: 'e95', verbrauch: h.M.vorgabeVerbrauch('pkw'), ab, dauer: 14, hinUndZurueck: true, aufenthalt: false });
  return { p, e95: p(C, 'e95') ?? 0, diesel: p(C, 'diesel') ?? 0, lpg: p(C, 'lpg'), at95: p('AT', 'e95') ?? 0, de95: p('DE', 'e95') ?? 0, deD: p('DE', 'diesel') ?? 0, spanne, rang, fahrt };
}
const um = (h: Helpers, a: number, b: number, wo: string) => {
  const d = Math.round((a - b) * 1000) / 1000;
  if (d === 0) return h.T(`genauso viel wie ${wo}`, `the same as ${wo}`, `evenveel als ${wo}`);
  return h.T(`${h.l3(Math.abs(d))} ${d < 0 ? 'weniger' : 'mehr'} als ${wo}`, `${h.l3(Math.abs(d))} ${d < 0 ? 'less' : 'more'} than ${wo}`, `${h.l3(Math.abs(d))} ${d < 0 ? 'minder' : 'meer'} dan ${wo}`);
};
const l3x = (h: Helpers, x: number | null) => (x == null ? '–' : h.l3(x));
function nachbarn(h: Helpers) {
  const { p } = D(h);
  const rows = [C, 'AT', 'SI', 'FR', 'HR', 'DE', 'NL'].map((c) => [h.land(c), l3x(h, p(c, 'e95')), l3x(h, p(c, 'diesel')), l3x(h, p(c, 'lpg'))]);
  return h.table([h.T('Land', 'Country', 'Land'), h.T('Super 95 je Liter', 'Petrol 95 per litre', 'Euro 95 per liter'), h.T('Diesel je Liter', 'Diesel per litre', 'Diesel per liter'), h.T('Autogas je Liter', 'LPG per litre', 'LPG per liter')], rows, undefined, ['l', 'r', 'r', 'r']);
}
/** Italienischer Anteil einer Fahrt hin und zurück. */
function strecke(h: Helpers, start: string, ziel: string) {
  const { fahrt, de95 } = D(h);
  const r = fahrt(start, ziel);
  const x = r?.sprit.find((s) => s.land === C);
  if (!r || !x || x.kosten == null) return null;
  return [`${h.M.KNOTEN[start].n[h.lang]} – ${h.M.KNOTEN[ziel].n[h.lang]}`, h.num(x.km), h.num(x.liter * 2, 1), h.eur(x.kosten * 2, 2), h.eur(x.liter * 2 * de95, 2)];
}

export default defineGuide({
  id: 'spritpreise-italien',
  group: 'sprit',
  order: 31,
  tool: 'sprit',
  land: 'IT',
  related: ['maut-italien', 'brennermaut', 'maut-nach-italien', 'spritpreise-oesterreich', 'spritpreise-slowenien'],
  sources: ['wob', 'osm'],
  de: {
    slug: 'spritpreise-italien',
    nav: 'Spritpreise Italien',
    card: 'Benzin, Diesel und Autogas in Italien im Wochenmittel, gegen Österreich und Deutschland.',
    title: 'Spritpreise Italien 2026: Benzin, Diesel und Autogas',
    description: 'Spritpreise Italien 2026: amtlicher Wochendurchschnitt für Super 95, Diesel und Autogas, Vergleich mit Österreich und Deutschland, Spritkosten bis zur Adria.',
    h1: 'Spritpreise in Italien 2026: vor oder nach dem Brenner tanken?',
    intro: 'Sorte und Tankfüllung wählen: der Rechner stellt den italienischen Landesdurchschnitt neben Ihr Heimatland und alle anderen Länder des Bulletins.',
    resume: (h) => {
      const { e95, diesel, lpg, at95, de95, rang, spanne } = D(h);
      const s = spanne('e95')!;
      return `Italien meldete für die Woche vom ${h.date(h.M.SPRIT_STAND)} einen Landesdurchschnitt von ${h.l3(e95)} je Liter Super 95 (Benzina senza piombo), ${h.l3(diesel)} je Liter Diesel${lpg != null ? ` und ${h.l3(lpg)} je Liter Autogas (GPL)` : ''}, jeweils mit Steuern. Damit kostet Super in Italien ${um(h, e95, at95, 'in Österreich')} und ${um(h, e95, de95, 'in Deutschland')}. Im Bulletin der Europäischen Kommission steht Italien beim Super auf Platz ${rang('e95').pos} und beim Diesel auf Platz ${rang('diesel').pos} von ${rang('e95').n} Ländern, gezählt vom günstigsten an. Vor ${s.n} Wochen lag Super bei ${h.l3(s.erst[1])}, die Spanne dieses halben Jahres reicht von ${h.l3(s.lo[1])} bis ${h.l3(s.hi[1])}. Wer über den Brenner an die Adria fährt, legt den größten Teil der Strecke in Italien zurück: dort entscheidet der Literpreis über die Spritkosten mehr als in jedem Durchreiseland. Diese Seite nennt keine Preise einzelner Tankstellen.`;
    },
    faqs: (h) => {
      const { e95, lpg, at95, diesel, spanne } = D(h);
      const s = spanne('e95')!;
      const vorAT = at95 < e95;
      return [
        { q: 'Ist Autogas in Italien pro Liter wirklich so viel billiger als Super?', a: lpg == null ? `Für die Woche vom ${h.date(h.M.SPRIT_STAND)} meldet Italien keinen Durchschnitt für Autogas, ein Vergleich ist deshalb nicht möglich. Super 95 kostet ${h.l3(e95)} je Liter. Sobald das Bulletin wieder einen Wert für GPL enthält, zeigt ihn die Tabelle dieser Seite und der Rechner oben.` : `Je Liter ja: ${h.l3(lpg)} für Autogas gegen ${h.l3(e95)} für Super 95 in der Woche vom ${h.date(h.M.SPRIT_STAND)}, also ${h.pct(lpg / e95, 0)} des Benzinpreises. Ein Auto mit Gasanlage verbraucht aber je 100 km mehr Liter Gas als Benzin; wie viel, hängt vom Motor ab. Tragen Sie Ihren eigenen Verbrauch in den Rechner der Startseite ein.` },
        { q: 'Tankt man auf der Fahrt nach Italien besser vor dem Brenner in Tirol?', a: `Nach dem Landesmittel der letzten Woche ist Super 95 in Österreich ${um(h, at95, e95, 'in Italien')}. ${vorAT ? `Ein voller Tank in Tirol spart bei 50 Litern rund ${h.eur((e95 - at95) * 50, 2)} gegenüber dem italienischen Schnitt.` : `Ein voller Tank in Tirol bringt diese Woche also keinen Vorteil; bei 50 Litern liegt Italien um ${h.eur((at95 - e95) * 50, 2)} vorn.`} Tankstellen an der Autobahn verlangen in beiden Ländern oft mehr als den Durchschnitt.` },
        { q: 'Wie viel teurer ist Diesel als Super an italienischen Tankstellen im Mittel?', a: `In der Woche vom ${h.date(h.M.SPRIT_STAND)} lag der italienische Durchschnitt für Diesel bei ${h.l3(diesel)}, also ${um(h, diesel, e95, 'Super 95')}. Für eine Tankfüllung von 50 Litern sind das ${h.eur(Math.abs(diesel - e95) * 50, 2)} Unterschied. Das Bulletin misst landesweite Mittelwerte; regionale Unterschiede, etwa zwischen Autobahn und Stadt, bildet es nicht ab.` },
        { q: 'Wann war Super 95 in Italien in diesem Halbjahr am billigsten?', a: `In der Woche vom ${h.date(s.lo[0])}, mit ${h.l3(s.lo[1])} je Liter im Landesmittel. Der höchste Wert der letzten ${s.n} Wochen war ${h.l3(s.hi[1])} in der Woche vom ${h.date(s.hi[0])}. Für eine Fahrt von München nach Rimini und zurück mit rund 70 Litern in Italien macht diese Spanne ${h.eur((s.hi[1] - s.lo[1]) * 70, 2)} aus.` },
      ];
    },
    body: (h) => {
      const rows = [strecke(h, 'muenchen', 'rimini'), strecke(h, 'frankfurt', 'rom'), strecke(h, 'hamburg', 'venedig'), strecke(h, 'stuttgart', 'rimini')].filter((x): x is string[] => !!x);
      const { e95, de95 } = D(h);
      return `<h2>Italien und die Nachbarn: Literpreise der Woche vom ${h.date(h.M.SPRIT_STAND)}</h2>
${nachbarn(h)}
<p>Die Werte sind Landesdurchschnitte mit allen Steuern. Für die Schweiz veröffentlicht die Kommission keine Zahlen, sie fehlt deshalb in der Tabelle; wer über den Gotthard fährt, kann im Rechner der ${h.a('home', 'Startseite')} einen eigenen Preis in Franken eingeben.</p>
<h2>Wie viel Sprit auf den italienischen Kilometern verbraucht wird</h2>
<p>Die Tabelle nimmt die schnellste Strecke des Rechners, ein Auto mit 7 Litern auf 100 km und Super 95, und zählt nur den Teil der Fahrt in Italien, hin und zurück. Die letzte Spalte zeigt, was dieselbe Menge zum deutschen Durchschnitt kosten würde.</p>
${h.table([h.T('Strecke', 'Route', 'Route'), h.T('km in Italien', 'km in Italy', 'km in Italië'), h.T('Liter (hin und zurück)', 'Litres (return)', 'Liter (heen en terug)'), h.T('Kosten in Italien', 'Cost in Italy', 'Kosten in Italië'), h.T('zum Preis in Deutschland', 'at the German price', 'tegen de Duitse prijs')], rows, undefined, ['l', 'r', 'r', 'r', 'r'])}
<p>Weil Super 95 in Italien diese Woche ${e95 < de95 ? 'günstiger' : 'teurer'} ist als in Deutschland, ${e95 < de95 ? 'lohnt es sich, mit wenig Sprit über die Grenze zu fahren und in Italien zu tanken' : 'lohnt es sich, den Tank vor der Grenze zu füllen, wenn die Reichweite bis zum Ziel reicht'}. Die Rechnung kippt, sobald sich die Wochenpreise verschieben: die Tabelle wird mit jedem neuen Bulletin neu gerechnet.</p>
<h2>Zum Sprit kommt die Maut</h2>
<p>Auf der Fahrt an die Adria bezahlen Sie außer dem Sprit die ${h.a('brennermaut', 'Brennermaut')} in Österreich und die Autobahnmaut in Italien. Den italienischen Betrag rechnen wir als Schätzung aus dem Kilometertarif der Betreiber, weil die Preise von Mautstelle zu Mautstelle nicht frei veröffentlicht sind; Einzelheiten auf der Seite ${h.a('maut-italien', 'Maut Italien')}, typische Fahrten auf ${h.a('maut-nach-italien', 'Maut nach Italien')}.</p>
<h2>Woher die Zahlen kommen</h2>
<p>Quelle ist das ${h.src('wob')} der Europäischen Kommission, das die Landesdurchschnitte jede Woche veröffentlicht. Die Weiterverwendung ist mit Quellenangabe erlaubt (Beschluss 2011/833/EU). Wir übernehmen die Werte wöchentlich; der Stand dieser Seite ist die Woche vom ${h.date(h.M.SPRIT_STAND)}. Die Strecken stammen aus OpenStreetMap, Einzelheiten in der ${h.a('method', 'Methode')}.</p>`;
    },
  },
  en: {
    slug: 'fuel-prices-italy',
    nav: 'Fuel prices Italy',
    card: 'Weekly average for petrol, diesel and LPG in Italy, against Austria and Germany.',
    title: 'Fuel prices in Italy 2026: petrol, diesel, LPG compared',
    description: 'Fuel prices in Italy 2026: official weekly average for petrol 95, diesel and LPG, against Austria and Germany, and the fuel cost of a drive to the Adriatic.',
    h1: 'Fuel prices in Italy 2026: fill up before or after the Brenner?',
    intro: 'Pick the fuel and the fill-up: the calculator sets the Italian national average beside your home country and every other bulletin country.',
    resume: (h) => {
      const { e95, diesel, lpg, at95, de95, rang, spanne } = D(h);
      const s = spanne('e95')!;
      return `For the week of ${h.date(h.M.SPRIT_STAND)} Italy reported a national average of ${h.l3(e95)} per litre of petrol 95 (benzina senza piombo), ${h.l3(diesel)} per litre of diesel${lpg != null ? ` and ${h.l3(lpg)} per litre of LPG (GPL)` : ''}, all with taxes. Petrol in Italy therefore costs ${um(h, e95, at95, 'in Austria')} and ${um(h, e95, de95, 'in Germany')}. In the European Commission’s bulletin Italy ranks ${rang('e95').pos} for petrol and ${rang('diesel').pos} for diesel out of ${rang('e95').n} countries, counted from the cheapest. ${s.n} weeks ago petrol stood at ${h.l3(s.erst[1])}; over this half-year the range runs from ${h.l3(s.lo[1])} to ${h.l3(s.hi[1])}. If you drive over the Brenner to the Adriatic, most of the distance lies in Italy, so the Italian price per litre weighs more on your fuel bill than any transit country. This page does not quote prices at individual stations.`;
    },
    faqs: (h) => {
      const { e95, lpg, at95, diesel, spanne } = D(h);
      const s = spanne('e95')!;
      const vorAT = at95 < e95;
      return [
        { q: 'Is LPG in Italy really that much cheaper per litre than petrol?', a: lpg == null ? `For the week of ${h.date(h.M.SPRIT_STAND)} Italy reports no LPG average, so no comparison is possible. Petrol 95 costs ${h.l3(e95)} per litre. As soon as the bulletin carries a GPL value again, the table on this page and the calculator above will show it.` : `Per litre, yes: ${h.l3(lpg)} for LPG against ${h.l3(e95)} for petrol 95 in the week of ${h.date(h.M.SPRIT_STAND)}, which is ${h.pct(lpg / e95, 0)} of the petrol price. A car running on gas burns more litres per 100 km than on petrol, though; how many more depends on the engine. Enter your own consumption in the calculator on the home page.` },
        { q: 'On the way to Italy, is it better to fill up in Tyrol before the Brenner?', a: `On last week’s national averages petrol 95 in Austria is ${um(h, at95, e95, 'in Italy')}. ${vorAT ? `A full tank in Tyrol saves about ${h.eur((e95 - at95) * 50, 2)} on 50 litres compared with the Italian average.` : `A full tank in Tyrol brings no advantage this week; on 50 litres Italy is ahead by ${h.eur((at95 - e95) * 50, 2)}.`} Motorway stations in both countries often charge more than the average.` },
        { q: 'How much more does diesel cost than petrol at Italian pumps on average?', a: `In the week of ${h.date(h.M.SPRIT_STAND)} the Italian diesel average was ${h.l3(diesel)}, that is ${um(h, diesel, e95, 'petrol 95')}. On a 50-litre fill-up that makes a difference of ${h.eur(Math.abs(diesel - e95) * 50, 2)}. The bulletin measures national averages; it does not show regional gaps, for instance between motorway and town.` },
        { q: 'When was petrol 95 cheapest in Italy this half-year?', a: `In the week of ${h.date(s.lo[0])}, at ${h.l3(s.lo[1])} per litre on national average. The highest value of the last ${s.n} weeks was ${h.l3(s.hi[1])} in the week of ${h.date(s.hi[0])}. For a return trip from Munich to Rimini with about 70 litres bought in Italy, that range is worth ${h.eur((s.hi[1] - s.lo[1]) * 70, 2)}.` },
      ];
    },
    body: (h) => {
      const rows = [strecke(h, 'muenchen', 'rimini'), strecke(h, 'frankfurt', 'rom'), strecke(h, 'hamburg', 'venedig'), strecke(h, 'stuttgart', 'rimini')].filter((x): x is string[] => !!x);
      const { e95, de95 } = D(h);
      return `<h2>Italy and its neighbours: prices per litre in the week of ${h.date(h.M.SPRIT_STAND)}</h2>
${nachbarn(h)}
<p>The values are national averages with all taxes. The Commission publishes no figures for Switzerland, so it is missing from the table; if you drive through the Gotthard, you can enter your own price in francs in the calculator on the ${h.a('home', 'home page')}.</p>
<h2>How much fuel the Italian kilometres take</h2>
<p>The table takes the calculator’s fastest route, a car using 7 litres per 100 km and petrol 95, and counts only the Italian part of the trip, out and back. The last column shows what the same amount would cost at the German average.</p>
${h.table([h.T('Strecke', 'Route', 'Route'), h.T('km in Italien', 'km in Italy', 'km in Italië'), h.T('Liter (hin und zurück)', 'Litres (return)', 'Liter (heen en terug)'), h.T('Kosten in Italien', 'Cost in Italy', 'Kosten in Italië'), h.T('zum Preis in Deutschland', 'at the German price', 'tegen de Duitse prijs')], rows, undefined, ['l', 'r', 'r', 'r', 'r'])}
<p>Because petrol 95 in Italy is ${e95 < de95 ? 'cheaper' : 'dearer'} than in Germany this week, ${e95 < de95 ? 'it pays to cross the border with little fuel and fill up in Italy' : 'it pays to fill the tank before the border if the range covers the distance to your destination'}. The answer changes as soon as the weekly prices shift: the table is recalculated with every new bulletin.</p>
<h2>Tolls on top of fuel</h2>
<p>On the way to the Adriatic you pay the ${h.a('brennermaut', 'Brenner toll')} in Austria and the motorway toll in Italy as well as fuel. We give the Italian amount as an estimate from the operators’ per-kilometre rates, because station-to-station prices are not openly published; details on the ${h.a('maut-italien', 'Italian tolls')} page, typical trips on ${h.a('maut-nach-italien', 'tolls to Italy')}.</p>
<h2>Where the figures come from</h2>
<p>The source is the European Commission’s ${h.src('wob')}, which publishes the national averages every week. Re-use is permitted with acknowledgement of the source (Decision 2011/833/EU). We take the values weekly; this page shows the week of ${h.date(h.M.SPRIT_STAND)}. Routes come from OpenStreetMap; details in the ${h.a('method', 'method')}.</p>`;
    },
  },
});
