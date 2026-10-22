import { defineGuide, type Helpers } from '../../lib/guide-types';
import type { Sorte } from '../../lib/engine/params';

/** Spritpreise Österreich : Landesdurchschnitt der Woche (Weekly Oil Bulletin), Spanne über 26 Wochen, Vergleich mit Nachbarn. */
const C = 'AT';
function D(h: Helpers) {
  const p = (c: string, s: Sorte) => h.M.preis(c, s);
  const spanne = (s: Sorte) => {
    const v = h.M.verlauf(C, s);
    if (!v.length) return null;
    let lo = v[0], hi = v[0];
    for (const x of v) { if (x[1] < lo[1]) lo = x; if (x[1] > hi[1]) hi = x; }
    return { lo, hi, n: v.length };
  };
  const rang = (s: Sorte) => {
    const alle = h.M.SPRIT_LAENDER.map((c) => ({ c, p: p(c, s) })).filter((x): x is { c: string; p: number } => x.p != null).sort((a, b) => a.p - b.p);
    return { pos: alle.findIndex((x) => x.c === C) + 1, n: alle.length };
  };
  const ab = h.M.addDays(h.today, 7);
  const fahrt = (start: string, ziel: string) => h.M.reise({ start, ziel, fz: 'pkw', sorte: 'e95', verbrauch: h.M.vorgabeVerbrauch('pkw'), ab, dauer: 14, hinUndZurueck: true, aufenthalt: false });
  return { p, e95: p(C, 'e95') ?? 0, diesel: p(C, 'diesel') ?? 0, lpg: p(C, 'lpg'), de95: p('DE', 'e95') ?? 0, deD: p('DE', 'diesel') ?? 0, spanne, rang, fahrt, woche: h.M.SPRIT_STAND };
}
/** « 0,362 € weniger als in Deutschland » : Richtung nach dem Vorzeichen. */
const um = (h: Helpers, a: number, b: number, wo: string) => {
  const d = Math.round((a - b) * 1000) / 1000;
  if (d === 0) return h.T(`genauso viel wie ${wo}`, `the same as ${wo}`, `evenveel als ${wo}`);
  return h.T(`${h.l3(Math.abs(d))} ${d < 0 ? 'weniger' : 'mehr'} als ${wo}`, `${h.l3(Math.abs(d))} ${d < 0 ? 'less' : 'more'} than ${wo}`, `${h.l3(Math.abs(d))} ${d < 0 ? 'minder' : 'meer'} dan ${wo}`);
};
const l3x = (h: Helpers, x: number | null) => (x == null ? '–' : h.l3(x));
function preisTabelle(h: Helpers) {
  const { p } = D(h);
  const rows = [C, 'DE', 'IT', 'SI', 'HU', 'CZ', 'NL', 'BE'].map((c) => [h.land(c), l3x(h, p(c, 'e95')), l3x(h, p(c, 'diesel')), l3x(h, p(c, 'lpg')), p(c, 'e95') == null ? '–' : h.eur(p(c, 'e95')! * 50, 2)]);
  return h.table([h.T('Land', 'Country', 'Land'), h.T('Super 95', 'Petrol 95', 'Euro 95'), 'Diesel', h.T('Autogas', 'LPG', 'LPG'), h.T('50 L Super 95', '50 L petrol 95', '50 L Euro 95')], rows, undefined, ['l', 'r', 'r', 'r', 'r']);
}
function spanneTabelle(h: Helpers) {
  const { spanne, p } = D(h);
  const rows = (['e95', 'diesel'] as Sorte[]).map((s) => { const x = spanne(s)!; return [s === 'e95' ? h.T('Super 95', 'Petrol 95', 'Euro 95') : 'Diesel', `${h.l3(x.lo[1])} (${h.date(x.lo[0])})`, `${h.l3(x.hi[1])} (${h.date(x.hi[0])})`, l3x(h, p(C, s))]; });
  return h.table([h.T('Sorte', 'Fuel', 'Brandstof'), h.T('Tiefster Wert (Woche)', 'Lowest (week)', 'Laagste (week)'), h.T('Höchster Wert (Woche)', 'Highest (week)', 'Hoogste (week)'), h.T('Aktuell', 'Latest', 'Laatst')], rows, undefined, ['l', 'r', 'r', 'r']);
}
/** Anteil Österreichs an einer Fahrt : Kilometer, Liter, Kosten, gleiche Liter zum deutschen Preis. */
function anteil(h: Helpers, start: string, ziel: string) {
  const { fahrt, de95 } = D(h);
  const r = fahrt(start, ziel);
  const x = r?.sprit.find((s) => s.land === C);
  if (!r || !x || x.kosten == null) return null;
  return { km: x.km, liter: x.liter, kosten: x.kosten, daheim: x.liter * de95, von: h.M.KNOTEN[start].n[h.lang], nach: h.M.KNOTEN[ziel].n[h.lang] };
}

export default defineGuide({
  id: 'spritpreise-oesterreich',
  group: 'sprit',
  order: 30,
  tool: 'sprit',
  land: 'AT',
  related: ['vignette-oesterreich', 'maut-oesterreich', 'brennermaut', 'spritpreise-italien', 'spritpreise-slowenien'],
  sources: ['wob', 'osm'],
  de: {
    slug: 'spritpreise-oesterreich',
    nav: 'Spritpreise Österreich',
    card: 'Super 95 und Diesel im Landesdurchschnitt der Woche, mit Deutschland verglichen.',
    title: 'Spritpreise Österreich 2026: Super, Diesel und Vergleich',
    description: 'Spritpreise Österreich 2026: Super 95 und Diesel im amtlichen Wochendurchschnitt, Vergleich mit Deutschland und Italien, Spanne über 26 Wochen und Tankfüllung.',
    h1: 'Spritpreise in Österreich 2026: wo tanken auf der Durchreise?',
    intro: 'Sorte, Tankfüllung und Vergleichsland wählen: der Rechner zeigt, was 50 Liter in Österreich gegenüber Ihrem Heimatland kosten.',
    resume: (h) => {
      const { e95, diesel, de95, deD, rang, woche, spanne } = D(h);
      const s = spanne('e95')!;
      return `In der Woche vom ${h.date(woche)} kostete ein Liter Super 95 in Österreich im Landesdurchschnitt ${h.l3(e95)} und ein Liter Diesel ${h.l3(diesel)}, Steuern inbegriffen, laut dem Weekly Oil Bulletin der Europäischen Kommission. Das ist beim Super ${um(h, e95, de95, 'in Deutschland')} und beim Diesel ${um(h, diesel, deD, 'in Deutschland')}. Unter den ${rang('e95').n} Ländern des Bulletins, die diese Seite auswertet, liegt Österreich beim Super auf Platz ${rang('e95').pos} von günstig nach teuer, beim Diesel auf Platz ${rang('diesel').pos}. In den letzten ${s.n} Wochen schwankte Super 95 zwischen ${h.l3(s.lo[1])} und ${h.l3(s.hi[1])}. Für eine Tankfüllung von 50 Litern macht der Unterschied zu Deutschland beim Super ${h.eur(Math.abs(e95 - de95) * 50, 2)} aus. Die Zahlen sind Durchschnitte des ganzen Landes; den Preis an einer bestimmten Tankstelle nennt diese Seite nicht, und an der Autobahn liegt er oft darüber.`;
    },
    faqs: (h) => {
      const { e95, diesel, de95, deD, lpg, spanne } = D(h);
      const s = spanne('diesel')!;
      const billiger = e95 < de95;
      return [
        { q: 'Lohnt es sich, kurz vor der Grenze in Bayern noch einmal vollzutanken?', a: `Nach den Wochendurchschnitten vom ${h.date(h.M.SPRIT_STAND)} ist Super 95 in Österreich ${um(h, e95, de95, 'in Deutschland')}; bei 50 Litern sind das ${h.eur(Math.abs(e95 - de95) * 50, 2)} ${billiger ? 'zugunsten Österreichs' : 'zugunsten Deutschlands'}. ${billiger ? 'Mit fast leerem Tank über die Grenze zu fahren, rechnet sich also eher' : 'Der volle Tank aus Bayern rechnet sich also eher'}. Einzelne Tankstellen weichen vom Landesmittel ab, an der Autobahn oft nach oben.` },
        { q: 'Kostet Diesel in Österreich mehr als Super 95?', a: `In der Woche vom ${h.date(h.M.SPRIT_STAND)} lag Diesel bei ${h.l3(diesel)} und Super 95 bei ${h.l3(e95)} je Liter, Diesel war also ${um(h, diesel, e95, 'Super')}. In Deutschland betrug derselbe Abstand ${h.l3(Math.abs(deD - de95))}. Das Verhältnis kann sich von Woche zu Woche drehen; die Tabelle unten zeigt immer die zuletzt veröffentlichten Werte beider Sorten.` },
        { q: 'Steht Autogas für Österreich im Weekly Oil Bulletin?', a: lpg == null ? 'Nein, für die letzte Woche meldet Österreich keinen Landesdurchschnitt für Autogas (LPG) an die Kommission, und auch in den 26 Wochen davor fehlt der Wert. Der Rechner kann für Autogas in Österreich deshalb keinen Betrag zeigen. Wer mit LPG fährt, plant die Tankstopps besser in Ländern mit gemeldetem Preis, etwa Italien oder Slowenien.' : `Ja, Österreich meldet für die Woche vom ${h.date(h.M.SPRIT_STAND)} einen Durchschnitt von ${h.l3(lpg)} je Liter Autogas. Der Wert stammt wie Super und Diesel aus dem Weekly Oil Bulletin der Kommission, das Preise mit Steuern für jedes Mitgliedsland veröffentlicht. Für Fahrten mit LPG rechnet der Rechner damit.` },
        { q: 'Wie weit lagen der teuerste und der billigste Dieselpreis Österreichs im letzten halben Jahr auseinander?', a: `Über die letzten ${s.n} Wochen lag der tiefste Landesdurchschnitt für Diesel bei ${h.l3(s.lo[1])} (Woche vom ${h.date(s.lo[0])}), der höchste bei ${h.l3(s.hi[1])} (Woche vom ${h.date(s.hi[0])}). Für 50 Liter sind das ${h.eur((s.hi[1] - s.lo[1]) * 50, 2)} Unterschied zwischen der günstigsten und der teuersten Woche, mehr als eine Vignette für zehn Tage kostet.` },
      ];
    },
    body: (h) => {
      const { e95, rang } = D(h);
      const a = anteil(h, 'muenchen', 'split'), b = anteil(h, 'hamburg', 'venedig');
      const zeile = (x: NonNullable<ReturnType<typeof anteil>>) => `Auf der Strecke ${x.von} – ${x.nach} fahren Sie rund ${h.num(x.km)} km durch Österreich und verbrauchen dort mit 7 Litern auf 100 km etwa ${h.num(x.liter, 1)} Liter Super je Richtung. Zum österreichischen Durchschnitt kostet das ${h.eur(x.kosten, 2)}, zum deutschen ${h.eur(x.daheim, 2)}.`;
      return `<h2>Super 95, Diesel und Autogas in der Woche vom ${h.date(h.M.SPRIT_STAND)}</h2>
<p>Die Tabelle zeigt den Landesdurchschnitt mit allen Steuern für Österreich und die Länder, durch die oder aus denen man auf dem Weg in den Süden fährt. Die letzte Spalte rechnet eine Tankfüllung von 50 Litern Super 95.</p>
${preisTabelle(h)}
<p>Österreich steht beim Super 95 auf Platz ${rang('e95').pos} von ${rang('e95').n}. Ein Strich bedeutet, dass das Land für diese Sorte keinen Wert gemeldet hat.</p>
<h2>Spanne der letzten 26 Wochen</h2>
${spanneTabelle(h)}
<p>Wer seine Reise plant, sieht an der Spanne, wie viel der Zeitpunkt ausmacht: Der Preis einer einzelnen Woche ist kein fester Tarif wie die ${h.a('vignette-oesterreich', 'Vignette')} oder die ${h.a('maut-oesterreich', 'Streckenmaut')}, sondern ein Mittelwert, der sich jede Woche verschiebt.</p>
<h2>Was das auf der Durchreise ausmacht</h2>
<p>${a ? zeile(a) : ''} ${b ? zeile(b) : ''}</p>
<p>Bei Super 95 zu ${h.l3(e95)} je Liter ist ein Tankstopp in Österreich ${e95 < D(h).de95 ? 'günstiger als in Deutschland' : 'teurer als in Deutschland'}. Ob es sich lohnt, vor ${h.a('brennermaut', 'dem Brenner')} oder dem Karawankentunnel nachzutanken, hängt außerdem vom nächsten Land ab: die Durchschnitte für ${h.a('spritpreise-italien', 'Italien')} und ${h.a('spritpreise-slowenien', 'Slowenien')} stehen auf eigenen Seiten. Die ganze Fahrt mit Vignetten, Maut und Sprit für jedes Land rechnet die ${h.a('home', 'Startseite')}.</p>
<h2>Quelle und Stand</h2>
<p>Alle Preise stammen aus dem ${h.src('wob')}. Es sind Landesdurchschnitte mit Steuern, die jedes Mitgliedsland wöchentlich an die Europäische Kommission meldet. Die Weiterverwendung ist mit Quellenangabe erlaubt (Beschluss 2011/833/EU). Diese Seite übernimmt die Werte wöchentlich, Stand ist die Woche vom ${h.date(h.M.SPRIT_STAND)}. Wie die Zahlen in den Rechner kommen, erklärt die ${h.a('method', 'Methode')}.</p>`;
    },
  },
  en: {
    slug: 'fuel-prices-austria',
    nav: 'Fuel prices Austria',
    card: 'Weekly national average for petrol and diesel, compared with Germany.',
    title: 'Fuel prices in Austria 2026: petrol, diesel and comparison',
    description: 'Fuel prices in Austria 2026: weekly official average for petrol 95 and diesel, compared with Germany and Italy, 26-week range and the cost of a 50-litre tank.',
    h1: 'Fuel prices in Austria 2026: where to fill up in transit?',
    intro: 'Pick the fuel, the fill-up and a country to compare with: the calculator shows what 50 litres cost in Austria against home.',
    resume: (h) => {
      const { e95, diesel, de95, deD, rang, woche, spanne } = D(h);
      const s = spanne('e95')!;
      return `In the week of ${h.date(woche)} a litre of petrol 95 in Austria cost ${h.l3(e95)} on national average and a litre of diesel ${h.l3(diesel)}, taxes included, according to the European Commission’s Weekly Oil Bulletin. For petrol that is ${um(h, e95, de95, 'in Germany')}, for diesel ${um(h, diesel, deD, 'in Germany')}. Among the ${rang('e95').n} bulletin countries this site reads, Austria ranks ${rang('e95').pos} from cheapest to dearest for petrol and ${rang('diesel').pos} for diesel. Over the last ${s.n} weeks petrol 95 moved between ${h.l3(s.lo[1])} and ${h.l3(s.hi[1])}. On a 50-litre fill-up the gap to Germany comes to ${h.eur(Math.abs(e95 - de95) * 50, 2)} for petrol. These are averages for the whole country; this page does not quote the price at any particular filling station, and motorway stations often charge more than the average.`;
    },
    faqs: (h) => {
      const { e95, diesel, de95, deD, lpg, spanne } = D(h);
      const s = spanne('diesel')!;
      const billiger = e95 < de95;
      return [
        { q: 'Should I fill the tank in Bavaria before crossing into Austria?', a: `On the weekly averages of ${h.date(h.M.SPRIT_STAND)} petrol 95 in Austria is ${um(h, e95, de95, 'in Germany')}; on 50 litres that is ${h.eur(Math.abs(e95 - de95) * 50, 2)} in favour of ${billiger ? 'Austria' : 'Germany'}. ${billiger ? 'Crossing the border with a nearly empty tank therefore tends to pay off' : 'Filling up in Bavaria therefore tends to pay off'}. Individual stations differ from the national mean, motorway stations usually upwards.` },
        { q: 'Is diesel dearer than petrol in Austria?', a: `In the week of ${h.date(h.M.SPRIT_STAND)} diesel stood at ${h.l3(diesel)} and petrol 95 at ${h.l3(e95)} per litre, so diesel was ${um(h, diesel, e95, 'petrol')}. In Germany the same gap was ${h.l3(Math.abs(deD - de95))}. The relation can flip from one week to the next; the table below always shows the latest published values for both fuels.` },
        { q: 'Does the Weekly Oil Bulletin list LPG for Austria?', a: lpg == null ? 'No. For the latest week Austria reports no national average for LPG to the Commission, and the value is missing for the 26 weeks before as well. The calculator therefore cannot show an LPG amount for Austria. If you drive on LPG, plan your stops in countries that do report a price, such as Italy or Slovenia.' : `Yes, for the week of ${h.date(h.M.SPRIT_STAND)} Austria reports an average of ${h.l3(lpg)} per litre of LPG. Like petrol and diesel, the value comes from the Commission’s Weekly Oil Bulletin, which publishes prices with taxes for every member state. The calculator uses it for LPG trips.` },
        { q: 'How far apart were Austria’s cheapest and dearest diesel weeks in the last six months?', a: `Over the last ${s.n} weeks the lowest national average for diesel was ${h.l3(s.lo[1])} (week of ${h.date(s.lo[0])}) and the highest ${h.l3(s.hi[1])} (week of ${h.date(s.hi[0])}). On 50 litres that is a difference of ${h.eur((s.hi[1] - s.lo[1]) * 50, 2)} between the cheapest and the dearest week, more than a ten-day vignette costs.` },
      ];
    },
    body: (h) => {
      const { e95, rang } = D(h);
      const a = anteil(h, 'muenchen', 'split'), b = anteil(h, 'hamburg', 'venedig');
      const zeile = (x: NonNullable<ReturnType<typeof anteil>>) => `On the ${x.von} – ${x.nach} route you drive about ${h.num(x.km)} km through Austria and, at 7 litres per 100 km, burn some ${h.num(x.liter, 1)} litres of petrol there each way. At the Austrian average that costs ${h.eur(x.kosten, 2)}, at the German one ${h.eur(x.daheim, 2)}.`;
      return `<h2>Petrol 95, diesel and LPG in the week of ${h.date(h.M.SPRIT_STAND)}</h2>
<p>The table shows the national average with all taxes for Austria and for the countries you start from or cross on the way south. The last column prices a 50-litre fill-up of petrol 95.</p>
${preisTabelle(h)}
<p>Austria ranks ${rang('e95').pos} of ${rang('e95').n} for petrol 95. A dash means the country reported no value for that fuel.</p>
<h2>Range over the last 26 weeks</h2>
${spanneTabelle(h)}
<p>The range shows how much timing matters: a weekly fuel price is not a fixed tariff like the ${h.a('vignette-oesterreich', 'vignette')} or the ${h.a('maut-oesterreich', 'section tolls')}, but an average that shifts every week.</p>
<h2>What it means in transit</h2>
<p>${a ? zeile(a) : ''} ${b ? zeile(b) : ''}</p>
<p>With petrol 95 at ${h.l3(e95)} per litre, a stop in Austria is ${e95 < D(h).de95 ? 'cheaper than in Germany' : 'dearer than in Germany'}. Whether to top up before ${h.a('brennermaut', 'the Brenner')} or the Karawanken tunnel also depends on the next country: the averages for ${h.a('spritpreise-italien', 'Italy')} and ${h.a('spritpreise-slowenien', 'Slovenia')} have their own pages. The whole trip, with vignettes, tolls and fuel for every country, is on the ${h.a('home', 'home page')}.</p>
<h2>Source and date</h2>
<p>All prices come from the ${h.src('wob')}. They are national averages with taxes that each member state reports to the European Commission every week. Re-use is allowed with acknowledgement of the source (Commission Decision 2011/833/EU). This page takes the values weekly; the current figures are for the week of ${h.date(h.M.SPRIT_STAND)}. How the numbers reach the calculator is explained in the ${h.a('method', 'method')}.</p>`;
    },
  },
});
