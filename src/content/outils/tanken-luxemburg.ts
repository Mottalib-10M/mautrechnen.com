import { defineGuide, type Helpers } from '../../lib/guide-types';
import type { Sorte } from '../../lib/engine/params';

/** Tanken in Luxemburg : Wochendurchschnitt (Weekly Oil Bulletin), Wochen als günstigstes Nachbarland, eine Tankfüllung auf der Durchfahrt. */
const C = 'LU';
const KREIS = ['LU', 'NL', 'BE', 'DE', 'FR'];
function D(h: Helpers) {
  const p = (c: string, s: Sorte) => h.M.preis(c, s);
  const spanne = (s: Sorte) => {
    const v = h.M.verlauf(C, s);
    if (!v.length) return null;
    let lo = v[0], hi = v[0];
    for (const x of v) { if (x[1] < lo[1]) lo = x; if (x[1] > hi[1]) hi = x; }
    return { lo, hi, n: v.length };
  };
  /** Wochen, in denen Luxemburg unter den fünf Ländern den niedrigsten Durchschnitt hatte. */
  const ersterPlatz = (s: Sorte) => {
    const reihen = KREIS.map((c) => new Map(h.M.verlauf(c, s)));
    const wochen = h.M.verlauf(C, s).map(([w]) => w).filter((w) => reihen.every((r) => r.has(w)));
    const n = wochen.filter((w) => KREIS.every((c, i) => c === C || reihen[i].get(w)! > reihen[0].get(w)!)).length;
    return { n, von: wochen.length };
  };
  const ab = h.M.addDays(h.today, 7);
  const fahrt = (start: string, ziel: string) => h.M.reise({ start, ziel, fz: 'pkw', sorte: 'e95', verbrauch: h.M.vorgabeVerbrauch('pkw'), ab, dauer: 14, hinUndZurueck: true, aufenthalt: false });
  return { p, e95: p(C, 'e95') ?? 0, diesel: p(C, 'diesel') ?? 0, lpg: p(C, 'lpg'), nl95: p('NL', 'e95') ?? 0, nlD: p('NL', 'diesel') ?? 0, nlL: p('NL', 'lpg'), be95: p('BE', 'e95') ?? 0, fr95: p('FR', 'e95') ?? 0, frD: p('FR', 'diesel') ?? 0, spanne, ersterPlatz, fahrt };
}
const um = (h: Helpers, a: number, b: number, wo: string) => {
  const d = Math.round((a - b) * 1000) / 1000;
  if (d === 0) return h.T(`genauso viel wie ${wo}`, `the same as ${wo}`, `evenveel als ${wo}`);
  return h.T(`${h.l3(Math.abs(d))} ${d < 0 ? 'weniger' : 'mehr'} als ${wo}`, `${h.l3(Math.abs(d))} ${d < 0 ? 'less' : 'more'} than ${wo}`, `${h.l3(Math.abs(d))} ${d < 0 ? 'minder' : 'meer'} dan ${wo}`);
};
const l3x = (h: Helpers, x: number | null) => (x == null ? '–' : h.l3(x));
/** Eine Tankfüllung von 50 Litern in Luxemburg statt im anderen Land : Ersparnis (+) oder Mehrkosten (−). */
function tank(h: Helpers) {
  const { p } = D(h);
  const lu = { e95: p(C, 'e95'), diesel: p(C, 'diesel') };
  const d = (x: number | null, y: number | null) => (x == null || y == null ? '–' : `${y > x ? '+' : y < x ? '−' : ''}${h.eur(Math.abs(y - x) * 50, 2)}`);
  const rows = KREIS.filter((c) => c !== C).map((c) => [h.land(c), l3x(h, p(c, 'e95')), d(lu.e95, p(c, 'e95')), l3x(h, p(c, 'diesel')), d(lu.diesel, p(c, 'diesel'))]);
  rows.unshift([h.land(C), l3x(h, lu.e95), '–', l3x(h, lu.diesel), '–']);
  return h.table([h.T('Land', 'Country', 'Land'), h.T('Super 95', 'Petrol 95', 'Euro 95'), h.T('50 L in LU gespart', '50 L saved in LU', '50 L bespaard in LU'), 'Diesel', h.T('50 L in LU gespart', '50 L saved in LU', '50 L bespaard in LU')], rows, undefined, ['l', 'r', 'r', 'r', 'r']);
}
function door(h: Helpers, start: string, ziel: string) {
  const { fahrt, fr95 } = D(h);
  const r = fahrt(start, ziel);
  const x = r?.sprit.find((s) => s.land === C);
  if (!r || !x || x.preis == null) return null;
  return { name: `${h.M.KNOTEN[start].n[h.lang]} – ${h.M.KNOTEN[ziel].n[h.lang]}`, km: x.km, voll: (fr95 - x.preis) * 50 };
}

export default defineGuide({
  id: 'tanken-luxemburg',
  group: 'sprit',
  order: 37,
  tool: 'sprit',
  land: 'LU',
  related: ['benzineprijs-belgie', 'benzinpreis-frankreich', 'benzineprijs-duitsland', 'maut-frankreich'],
  sources: ['wob', 'osm'],
  nl: {
    slug: 'tanken-in-luxemburg',
    nav: 'Tanken in Luxemburg',
    card: 'Euro 95, diesel en LPG in Luxemburg als weekgemiddelde, en wat één volle tank daar scheelt.',
    title: 'Tanken in Luxemburg 2026: Euro 95, diesel en LPG per week',
    description: 'Tanken in Luxemburg 2026: officieel weekgemiddelde voor Euro 95, diesel en LPG, naast Nederland, België, Duitsland en Frankrijk, en wat een volle tank scheelt.',
    h1: 'Tanken in Luxemburg 2026: hoeveel scheelt één volle tank?',
    intro: 'Kies brandstof en tankbeurt: de rekenhulp toont wat 50 liter in Luxemburg kost tegenover Nederland, België of een ander land.',
    resume: (h) => {
      const { e95, diesel, lpg, nl95, be95, fr95, nlD, frD, ersterPlatz, spanne } = D(h);
      const e = ersterPlatz('e95');
      const s = spanne('e95')!;
      return `Luxemburg meldde voor de week van ${h.date(h.M.SPRIT_STAND)} een landelijk gemiddelde van ${h.l3(e95)} per liter Euro 95 en ${h.l3(diesel)} per liter diesel${lpg != null ? `, LPG kostte ${h.l3(lpg)}` : ''}, belastingen inbegrepen. Euro 95 is daarmee ${um(h, e95, nl95, 'in Nederland')}, ${um(h, e95, be95, 'in België')} en ${um(h, e95, fr95, 'in Frankrijk')}; diesel is ${um(h, diesel, nlD, 'in Nederland')} en ${um(h, diesel, frD, 'in Frankrijk')}. Van de laatste ${e.von} weken had Luxemburg er ${e.n} de laagste prijs voor Euro 95 van de vijf landen Nederland, België, Luxemburg, Duitsland en Frankrijk. De Luxemburgse prijs bewoog in die periode tussen ${h.l3(s.lo[1])} en ${h.l3(s.hi[1])}. Wie vanuit Nederland of België naar Lyon, de Provence of Spanje rijdt, komt op de snelste route vaak door Luxemburg, al zijn het maar enkele tientallen kilometers. Een volle tank daar is de enige keer dat het land meetelt. De cijfers komen uit de Weekly Oil Bulletin van de Europese Commissie; prijzen van afzonderlijke tankstations noemt deze pagina niet.`;
    },
    faqs: (h) => {
      const { lpg, nlL, ersterPlatz } = D(h);
      const d = ersterPlatz('diesel');
      const r = door(h, 'utrecht', 'nizza');
      const o = door(h, 'bruessel', 'orange');
      return [
        { q: 'In hoeveel weken was diesel in Luxemburg goedkoper dan in alle vier de buurlanden?', a: `In ${d.n} van de laatste ${d.von} weken waarin Nederland, België, Luxemburg, Duitsland en Frankrijk alle vijf een dieselprijs meldden. ${d.n * 2 >= d.von ? 'Luxemburg is dus meestal de goedkoopste van de vijf, maar niet elke week' : 'Luxemburg is dus lang niet elke week de goedkoopste van de vijf'}. De pagina telt opnieuw zodra een nieuw bulletin verschijnt.` },
        { q: 'Hoeveel scheelt één volle tank in Luxemburg op een rit naar Zuid-Frankrijk?', a: r ? `Op de snelste route ${r.name} kost 50 liter Euro 95 in Luxemburg deze week ${h.eur(Math.abs(r.voll), 2)} ${r.voll >= 0 ? 'minder' : 'meer'} dan tegen het Franse gemiddelde. Heen en terug zijn dat twee tankbeurten, dus ${h.eur(Math.abs(r.voll) * 2, 2)}. De rest van de brandstof koopt u op deze afstand toch in Frankrijk.` : 'De route kon niet worden berekend. De rekenhulp op de startpagina toont per land de prijs en de kosten van de brandstof op uw route.' },
        { q: 'Is LPG in Luxemburg goedkoper dan in Nederland?', a: lpg != null && nlL != null ? `In de week van ${h.date(h.M.SPRIT_STAND)} kostte LPG in Luxemburg gemiddeld ${h.l3(lpg)} en in Nederland ${h.l3(nlL)} per liter, dus ${um(h, lpg, nlL, 'in Nederland')}. Op 40 liter is dat ${h.eur(Math.abs(lpg - nlL) * 40, 2)}. Het bulletin geeft alleen het landelijke gemiddelde, niet het aantal pompen met LPG.` : 'Voor de laatste week ontbreekt in het bulletin een LPG-waarde voor Luxemburg of Nederland. Een vergelijking is dus nu niet mogelijk; voor Euro 95 en diesel zijn de cijfers van beide landen wel beschikbaar.' },
        { q: 'Hoeveel kilometer rijdt u door Luxemburg op weg naar de Provence?', a: o ? `Op de snelste route ${o.name} van de rekenhulp ${h.num(o.km)} km per richting. Dat is te weinig om de tank leeg te rijden, maar genoeg voor een tankstop zonder omweg. Een auto met 7 liter per 100 km verbruikt op dat stuk ${h.num((o.km * 7) / 100, 1)} liter; de besparing zit dus in de liters die u daar tankt, niet in die u er verbruikt.` : 'Op de snelste route van de rekenhulp ligt Luxemburg deze keer niet op de weg. In de rekenhulp op de startpagina kunt u start en bestemming kiezen en ziet u per land de kilometers en kosten.' },
      ];
    },
    body: (h) => {
      const rows = [door(h, 'utrecht', 'nizza'), door(h, 'bruessel', 'orange'), door(h, 'amsterdam', 'lloret'), door(h, 'eindhoven', 'lyon'), door(h, 'luettich', 'montpellier')].filter((x): x is NonNullable<ReturnType<typeof door>> => !!x).map((x) => [x.name, h.num(x.km), `${x.voll > 0 ? '+' : x.voll < 0 ? '−' : ''}${h.eur(Math.abs(x.voll), 2)}`]);
      return `<h2>Eén volle tank in Luxemburg tegenover de buren</h2>
<p>Landelijke gemiddelden met belastingen in de week van ${h.date(h.M.SPRIT_STAND)}. De kolommen “bespaard” tonen wat 50 liter in Luxemburg goedkoper (+) of duurder (−) is dan in het andere land.</p>
${tank(h)}
<h2>Routes die door Luxemburg lopen</h2>
<p>Snelste route van de rekenhulp; de tweede kolom telt de kilometers in Luxemburg per richting, de derde wat 50 liter Euro 95 in Luxemburg scheelt tegenover het Franse gemiddelde, het land dat daarna komt.</p>
${h.table(['Route', 'km in Luxemburg', '50 L Euro 95 tegenover Frankrijk'], rows, undefined, ['l', 'r', 'r'])}
<p>Routes via Rijsel en Parijs lopen niet door Luxemburg. Wie daar toch wil tanken, rijdt om; of dat loont, hangt af van het verschil in de tabel en van de extra kilometers.</p>
<h2>Tol, vignetten en de rest van de rit</h2>
<p>Luxemburg en België heffen geen tol voor personenauto’s. Na de grens bij Zoufftgen begint in Frankrijk eerst een tolvrij stuk langs Metz en Nancy; bij de tolpost Gye begint het gesloten APRR-net, over de A31 naar Beaune en Lyon. De Franse tarieven staan op ${h.a('maut-frankreich', 'tol Frankrijk')}, de literprijzen op ${h.a('benzinpreis-frankreich', 'benzineprijs Frankrijk')}. Vergelijk ook ${h.a('benzineprijs-belgie', 'benzineprijs België')} en ${h.a('benzineprijs-duitsland', 'benzineprijs Duitsland')}.</p>
<h2>Bron</h2>
<p>${h.src('wob')}, Europese Commissie. De lidstaten melden elke week hun gemiddelde prijzen met belastingen; hergebruik is toegestaan met bronvermelding (Besluit 2011/833/EU). Wij nemen de cijfers wekelijks over. De hele rit rekent de ${h.a('home', 'startpagina')}, de rekenwijze staat in de ${h.a('method', 'methode')}.</p>`;
    },
  },
  en: {
    slug: 'fuel-prices-luxembourg',
    nav: 'Fuel prices Luxembourg',
    card: 'Weekly average for petrol, diesel and LPG in Luxembourg, and what one full tank there saves.',
    title: 'Fuel prices in Luxembourg 2026: what one full tank saves',
    description: 'Fuel prices in Luxembourg 2026: weekly average for petrol 95, diesel and LPG, beside the Netherlands, Belgium, Germany and France, and what a full tank saves.',
    h1: 'Fuel prices in Luxembourg 2026: how much does one full tank save?',
    intro: 'Pick the fuel and the fill-up: the calculator shows what 50 litres cost in Luxembourg against the Netherlands, Belgium or another country.',
    resume: (h) => {
      const { e95, diesel, lpg, nl95, be95, fr95, nlD, frD, ersterPlatz, spanne } = D(h);
      const e = ersterPlatz('e95');
      const s = spanne('e95')!;
      return `Luxembourg reported a national average of ${h.l3(e95)} per litre of petrol 95 and ${h.l3(diesel)} per litre of diesel for the week of ${h.date(h.M.SPRIT_STAND)}${lpg != null ? `, with LPG at ${h.l3(lpg)}` : ''}, taxes included. Petrol is therefore ${um(h, e95, nl95, 'in the Netherlands')}, ${um(h, e95, be95, 'in Belgium')} and ${um(h, e95, fr95, 'in France')}; diesel is ${um(h, diesel, nlD, 'in the Netherlands')} and ${um(h, diesel, frD, 'in France')}. In ${e.n} of the last ${e.von} weeks Luxembourg had the lowest petrol price of the five countries Netherlands, Belgium, Luxembourg, Germany and France. Its own price moved between ${h.l3(s.lo[1])} and ${h.l3(s.hi[1])} over that period. If you drive from the Netherlands or Belgium to Lyon, Provence or Spain, the fastest route often runs through Luxembourg, even if only for a few dozen kilometres. A full tank there is the only time the country counts. The figures come from the European Commission’s Weekly Oil Bulletin; this page quotes no prices at individual stations.`;
    },
    faqs: (h) => {
      const { lpg, nlL, ersterPlatz } = D(h);
      const d = ersterPlatz('diesel');
      const r = door(h, 'utrecht', 'nizza');
      const o = door(h, 'bruessel', 'orange');
      return [
        { q: 'In how many weeks was diesel in Luxembourg cheaper than in all four neighbours?', a: `In ${d.n} of the last ${d.von} weeks in which the Netherlands, Belgium, Luxembourg, Germany and France all reported a diesel price. ${d.n * 2 >= d.von ? 'Luxembourg is thus usually the cheapest of the five, but not every week' : 'Luxembourg is thus far from the cheapest of the five every week'}. The page counts again as soon as a new bulletin appears.` },
        { q: 'How much does one full tank in Luxembourg save on a drive to southern France?', a: r ? `On the fastest route ${r.name}, 50 litres of petrol 95 in Luxembourg cost ${h.eur(Math.abs(r.voll), 2)} ${r.voll >= 0 ? 'less' : 'more'} this week than at the French average. Out and back that is two fill-ups, so ${h.eur(Math.abs(r.voll) * 2, 2)}. On that distance you buy the rest of the fuel in France anyway.` : 'The route could not be calculated. The calculator on the home page shows the price and cost of fuel per country on your route.' },
        { q: 'Is LPG in Luxembourg cheaper than in the Netherlands?', a: lpg != null && nlL != null ? `In the week of ${h.date(h.M.SPRIT_STAND)} LPG cost ${h.l3(lpg)} per litre on average in Luxembourg and ${h.l3(nlL)} in the Netherlands, so ${um(h, lpg, nlL, 'in the Netherlands')}. On 40 litres that is ${h.eur(Math.abs(lpg - nlL) * 40, 2)}. The bulletin gives only the national average, not the number of pumps selling LPG.` : 'For the latest week the bulletin lacks an LPG value for Luxembourg or the Netherlands, so no comparison is possible right now; figures for petrol 95 and diesel are available for both.' },
        { q: 'How many kilometres of the drive to Provence lie in Luxembourg?', a: o ? `On the calculator’s fastest route ${o.name}, ${h.num(o.km)} km each way. That is too little to empty the tank but enough for a fuel stop without a detour. A car using 7 litres per 100 km burns ${h.num((o.km * 7) / 100, 1)} litres on that stretch; the saving lies in the litres you buy there, not in those you use there.` : 'On the calculator’s fastest route Luxembourg is not on the way this time. In the calculator on the home page you can choose start and destination and see kilometres and costs per country.' },
      ];
    },
    body: (h) => {
      const rows = [door(h, 'utrecht', 'nizza'), door(h, 'bruessel', 'orange'), door(h, 'amsterdam', 'lloret'), door(h, 'eindhoven', 'lyon'), door(h, 'luettich', 'montpellier')].filter((x): x is NonNullable<ReturnType<typeof door>> => !!x).map((x) => [x.name, h.num(x.km), `${x.voll > 0 ? '+' : x.voll < 0 ? '−' : ''}${h.eur(Math.abs(x.voll), 2)}`]);
      return `<h2>One full tank in Luxembourg against the neighbours</h2>
<p>National averages with taxes in the week of ${h.date(h.M.SPRIT_STAND)}. The “saved” columns show how much cheaper (+) or dearer (−) 50 litres are in Luxembourg than in the other country.</p>
${tank(h)}
<h2>Routes that run through Luxembourg</h2>
<p>The calculator’s fastest route; the second column counts the kilometres in Luxembourg each way, the third what 50 litres of petrol in Luxembourg save against the French average, the country that comes next.</p>
${h.table(['Route', 'km in Luxembourg', '50 L petrol against France'], rows, undefined, ['l', 'r', 'r'])}
<p>Routes via Lille and Paris do not pass through Luxembourg. Filling up there anyway means a detour; whether it pays depends on the gap in the table and the extra kilometres.</p>
<h2>Tolls, vignettes and the rest of the drive</h2>
<p>Luxembourg and Belgium charge no toll for cars. After the border at Zoufftgen, France starts with a toll-free stretch past Metz and Nancy; at the Gye toll station the closed APRR network begins, on the A31 to Beaune and Lyon. French rates are on ${h.a('maut-frankreich', 'French tolls')}, prices per litre on ${h.a('benzinpreis-frankreich', 'fuel prices in France')}. Compare also ${h.a('benzineprijs-belgie', 'fuel prices in Belgium')} and ${h.a('benzineprijs-duitsland', 'fuel prices in Germany')}.</p>
<h2>Source</h2>
<p>${h.src('wob')}, European Commission. Member states report their average prices with taxes every week; re-use is permitted with acknowledgement of the source (Decision 2011/833/EU). We take the values weekly. The whole drive is on the ${h.a('home', 'home page')}, the method of calculation in the ${h.a('method', 'method')}.</p>`;
    },
  },
});
