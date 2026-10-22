import { defineGuide, type Helpers } from '../../lib/guide-types';
import type { Sorte } from '../../lib/engine/params';

/** Benzineprijs Duitsland : Wochendurchschnitt (Weekly Oil Bulletin) für Leser aus den Niederlanden und Belgien, Durchfahrt nach Süden. */
const C = 'DE';
function D(h: Helpers) {
  const p = (c: string, s: Sorte) => h.M.preis(c, s);
  const spanne = (s: Sorte) => {
    const v = h.M.verlauf(C, s);
    if (!v.length) return null;
    let lo = v[0], hi = v[0];
    for (const x of v) { if (x[1] < lo[1]) lo = x; if (x[1] > hi[1]) hi = x; }
    return { lo, hi, n: v.length };
  };
  /** Wochen, in denen Deutschland günstiger war als das andere Land. */
  const wochen = (andere: string, s: Sorte) => {
    const a = new Map(h.M.verlauf(andere, s));
    const v = h.M.verlauf(C, s).filter(([w]) => a.has(w));
    return { billiger: v.filter(([w, x]) => x < a.get(w)!).length, n: v.length };
  };
  const ab = h.M.addDays(h.today, 7);
  const fahrt = (start: string, ziel: string) => h.M.reise({ start, ziel, fz: 'pkw', sorte: 'e95', verbrauch: h.M.vorgabeVerbrauch('pkw'), ab, dauer: 14, hinUndZurueck: true, aufenthalt: false });
  return { p, e95: p(C, 'e95') ?? 0, diesel: p(C, 'diesel') ?? 0, lpg: p(C, 'lpg'), nl95: p('NL', 'e95') ?? 0, nlD: p('NL', 'diesel') ?? 0, nlL: p('NL', 'lpg'), be95: p('BE', 'e95') ?? 0, beD: p('BE', 'diesel') ?? 0, at95: p('AT', 'e95') ?? 0, spanne, wochen, fahrt };
}
const um = (h: Helpers, a: number, b: number, wo: string) => {
  const d = Math.round((a - b) * 1000) / 1000;
  if (d === 0) return h.T(`genauso viel wie ${wo}`, `the same as ${wo}`, `evenveel als ${wo}`);
  return h.T(`${h.l3(Math.abs(d))} ${d < 0 ? 'weniger' : 'mehr'} als ${wo}`, `${h.l3(Math.abs(d))} ${d < 0 ? 'less' : 'more'} than ${wo}`, `${h.l3(Math.abs(d))} ${d < 0 ? 'minder' : 'meer'} dan ${wo}`);
};
const l3x = (h: Helpers, x: number | null) => (x == null ? '–' : h.l3(x));
/** Deutschland neben den Start- und Nachbarländern ; Unterschied für 50 Liter gegenüber den Niederlanden. */
function tabelle(h: Helpers) {
  const { p, nl95 } = D(h);
  const rows = ['NL', 'BE', C, 'LU', 'AT', 'FR', 'CZ'].map((c) => {
    const x = p(c, 'e95');
    return [h.land(c), l3x(h, x), l3x(h, p(c, 'diesel')), l3x(h, p(c, 'lpg')), x == null || c === 'NL' ? '–' : `${x > nl95 ? '+' : x < nl95 ? '−' : ''}${h.eur(Math.abs(x - nl95) * 50, 2)}`];
  });
  return h.table([h.T('Land', 'Country', 'Land'), h.T('Super 95', 'Petrol 95', 'Euro 95'), 'Diesel', 'LPG', h.T('50 L gegenüber NL', '50 L versus the Netherlands', '50 L tegenover Nederland')], rows, undefined, ['l', 'r', 'r', 'r', 'r']);
}
/** Deutscher Anteil einer Fahrt (einfache Fahrt) und Ersparnis gegenüber dem niederländischen Preis. */
function anteil(h: Helpers, start: string, ziel: string) {
  const { fahrt, nl95 } = D(h);
  const r = fahrt(start, ziel);
  const x = r?.sprit.find((s) => s.land === C);
  if (!r || !x || x.kosten == null) return null;
  return { name: `${h.M.KNOTEN[start].n[h.lang]} – ${h.M.KNOTEN[ziel].n[h.lang]}`, km: x.km, liter: x.liter, kosten: x.kosten, nl: x.liter * nl95 };
}

export default defineGuide({
  id: 'benzineprijs-duitsland',
  group: 'sprit',
  order: 35,
  tool: 'sprit',
  land: 'DE',
  related: ['benzineprijs-belgie', 'spritpreise-oesterreich', 'vignette-oesterreich', 'tanken-luxemburg', 'maut-nach-kroatien'],
  sources: ['wob', 'osm'],
  nl: {
    slug: 'benzineprijs-duitsland',
    nav: 'Benzineprijs Duitsland',
    card: 'Euro 95, diesel en LPG in Duitsland als weekgemiddelde, naast Nederland en België.',
    title: 'Benzineprijs Duitsland 2026: tanken op weg naar het zuiden',
    description: 'Benzineprijs Duitsland 2026: officieel weekgemiddelde voor Euro 95, diesel en LPG, naast Nederland en België, en wat tanken op weg naar het zuiden scheelt.',
    h1: 'Benzineprijs in Duitsland 2026: voltanken na de grens?',
    intro: 'Kies brandstof en tankbeurt: de rekenhulp toont wat een volle tank in Duitsland kost tegenover Nederland of België.',
    resume: (h) => {
      const { e95, diesel, lpg, nl95, nlD, be95, beD, wochen, spanne } = D(h);
      const w = wochen('NL', 'e95');
      const s = spanne('e95')!;
      return `Duitsland meldde voor de week van ${h.date(h.M.SPRIT_STAND)} een landelijk gemiddelde van ${h.l3(e95)} per liter Euro 95 en ${h.l3(diesel)} per liter diesel${lpg != null ? `, LPG (Autogas) kostte ${h.l3(lpg)}` : ''}, belastingen inbegrepen. Euro 95 is daarmee ${um(h, e95, nl95, 'in Nederland')} en ${um(h, e95, be95, 'in België')}; diesel is ${um(h, diesel, nlD, 'in Nederland')} en ${um(h, diesel, beD, 'in België')}. Op een tankbeurt van 50 liter Euro 95 scheelt dat ${h.eur(Math.abs(e95 - nl95) * 50, 2)} ten opzichte van Nederland. In ${w.billiger} van de laatste ${w.n} weken was Euro 95 in Duitsland goedkoper dan in Nederland; de Duitse prijs bewoog in die periode tussen ${h.l3(s.lo[1])} en ${h.l3(s.hi[1])}. Wie naar Oostenrijk, Italië of Kroatië rijdt, legt vaak honderden kilometers door Duitsland af en tankt daar dus vrijwel zeker. De cijfers komen uit de Weekly Oil Bulletin van de Europese Commissie; prijzen van afzonderlijke stations noemt deze pagina niet.`;
    },
    faqs: (h) => {
      const { e95, diesel, nl95, nlD, lpg, nlL, wochen } = D(h);
      const w = wochen('NL', 'diesel');
      const a = anteil(h, 'amsterdam', 'split');
      return [
        { q: 'Hoeveel scheelt een volle tank in Duitsland tegenover Nederland?', a: `Met de weekcijfers van ${h.date(h.M.SPRIT_STAND)} kost 50 liter Euro 95 in Duitsland ${h.eur(e95 * 50, 2)} en in Nederland ${h.eur(nl95 * 50, 2)}, 50 liter diesel ${h.eur(diesel * 50, 2)} tegenover ${h.eur(nlD * 50, 2)}. ${e95 < nl95 ? 'Na de grens tanken is deze week dus goedkoper' : 'Voor de grens tanken is deze week dus goedkoper'}. Tankstations langs de Autobahn liggen meestal boven het landelijke gemiddelde.` },
        { q: 'In hoeveel weken was diesel in Duitsland goedkoper dan in Nederland?', a: `In ${w.billiger} van de laatste ${w.n} weken waarin beide landen een waarde meldden. Dat maakt een lagere Duitse dieselprijs ${w.billiger * 2 >= w.n ? 'tot de regel, maar niet tot een zekerheid' : 'eerder tot een uitzondering'}. De pagina rekent de vergelijking bij elk nieuw bulletin opnieuw uit, zodat de uitspraak klopt voor de week waarin u leest.` },
        { q: 'Hoeveel liter verbruikt u in Duitsland op weg van Amsterdam naar Kroatië?', a: a ? `Op de snelste route ${a.name} liggen ${h.num(a.km)} km in Duitsland. Een auto met 7 liter per 100 km verbruikt daar per richting ${h.num(a.liter, 1)} liter Euro 95, tegen het Duitse gemiddelde ${h.eur(a.kosten, 2)} en tegen het Nederlandse ${h.eur(a.nl, 2)}. Met caravan of dakkoffer ligt het verbruik hoger; vul het in op de startpagina.` : 'De route kon niet worden berekend. De rekenhulp op de startpagina toont voor elke rit de kilometers, liters en brandstofkosten per land, ook voor Duitsland.' },
        { q: 'Wat kost LPG in Duitsland vergeleken met Nederland?', a: lpg != null && nlL != null ? `In de week van ${h.date(h.M.SPRIT_STAND)} kostte LPG in Duitsland gemiddeld ${h.l3(lpg)} en in Nederland ${h.l3(nlL)} per liter, Duitsland was dus ${um(h, lpg, nlL, 'Nederland')}. Op 40 liter is dat ${h.eur(Math.abs(lpg - nlL) * 40, 2)} verschil. Het bulletin geeft landelijke gemiddelden; het aantal LPG-pompen langs de route staat er niet in.` : 'Voor de laatste week ontbreekt in het bulletin een LPG-waarde voor Duitsland of Nederland, dus een vergelijking is nu niet mogelijk. Voor Euro 95 en diesel zijn de weekcijfers van beide landen wel beschikbaar.' },
      ];
    },
    body: (h) => {
      const { e95, at95 } = D(h);
      const rows = [anteil(h, 'amsterdam', 'split'), anteil(h, 'utrecht', 'venedig'), anteil(h, 'eindhoven', 'gardasee'), anteil(h, 'groningen', 'prag'), anteil(h, 'rotterdam', 'salzburg')].filter((x): x is NonNullable<ReturnType<typeof anteil>> => !!x).map((x) => [x.name, h.num(x.km), h.num(x.liter, 1), h.eur(x.kosten, 2), h.eur(x.nl, 2)]);
      return `<h2>Duitsland naast Nederland en België</h2>
<p>Landelijke gemiddelden met belastingen in de week van ${h.date(h.M.SPRIT_STAND)}. De laatste kolom toont hoeveel 50 liter Euro 95 in elk land meer (+) of minder (−) kost dan in Nederland.</p>
${tabelle(h)}
<p>Landen in het bulletin met deze week een lagere gemiddelde prijs voor Euro 95 dan Duitsland: ${h.M.SPRIT_LAENDER.filter((c) => (h.M.preis(c, 'e95') ?? 99) < D(h).e95).length} van de ${h.M.SPRIT_LAENDER.length}.</p>
<h2>Hoeveel Duitsland op uw route weegt</h2>
<p>Snelste route van de rekenhulp, een auto met 7 liter Euro 95 per 100 km, enkele reis; alleen het Duitse deel telt. De laatste kolom rekent dezelfde liters tegen de Nederlandse prijs.</p>
${h.table(['Route', 'km in Duitsland', 'Liter', 'in Duitsland', 'tegen de Nederlandse prijs'], rows, undefined, ['l', 'r', 'r', 'r', 'r'])}
<p>Wie naar het zuidoosten rijdt, komt na Duitsland vaak in Oostenrijk. Daar is Euro 95 deze week ${um(h, at95, e95, 'in Duitsland')}; de details staan op ${h.a('spritpreise-oesterreich', 'brandstofprijzen Oostenrijk')}. Voor de Oostenrijkse snelweg heeft u bovendien een ${h.a('vignette-oesterreich', 'vignet')} nodig.</p>
<h2>Geen tol voor auto’s, wel elders op de route</h2>
<p>Duitsland heft geen tol voor personenauto’s en campers tot 3,5 ton; de kosten van het Duitse deel zijn dus vooral brandstof. Vignetten en tol vallen pas in de landen daarna. Voorbeelden van de hele rit staan op ${h.a('maut-nach-kroatien', 'tol naar Kroatië')}, de buren op ${h.a('benzineprijs-belgie', 'benzineprijs België')} en ${h.a('tanken-luxemburg', 'tanken in Luxemburg')}.</p>
<h2>Bron</h2>
<p>${h.src('wob')}, Europese Commissie. De lidstaten melden elke week hun gemiddelde prijzen met belastingen; hergebruik is toegestaan met bronvermelding (Besluit 2011/833/EU). Wij nemen de cijfers wekelijks over. De hele rit rekent de ${h.a('home', 'startpagina')}, de rekenwijze staat in de ${h.a('method', 'methode')}.</p>`;
    },
  },
  en: {
    slug: 'fuel-prices-germany',
    nav: 'Fuel prices Germany',
    card: 'Weekly average for petrol, diesel and LPG in Germany, beside the Netherlands and Belgium.',
    title: 'Fuel prices in Germany 2026: petrol, diesel and LPG weekly',
    description: 'Fuel prices in Germany 2026: official weekly average for petrol 95, diesel and LPG, against the Netherlands and Belgium, and what a stop on the way south saves.',
    h1: 'Fuel prices in Germany 2026: fill up after the border?',
    intro: 'Pick the fuel and the fill-up: the calculator shows what a tank in Germany costs against the Netherlands or Belgium.',
    resume: (h) => {
      const { e95, diesel, lpg, nl95, nlD, be95, beD, wochen, spanne } = D(h);
      const w = wochen('NL', 'e95');
      const s = spanne('e95')!;
      return `Germany reported a national average of ${h.l3(e95)} per litre of petrol 95 and ${h.l3(diesel)} per litre of diesel for the week of ${h.date(h.M.SPRIT_STAND)}${lpg != null ? `, with LPG (Autogas) at ${h.l3(lpg)}` : ''}, taxes included. Petrol is therefore ${um(h, e95, nl95, 'in the Netherlands')} and ${um(h, e95, be95, 'in Belgium')}; diesel is ${um(h, diesel, nlD, 'in the Netherlands')} and ${um(h, diesel, beD, 'in Belgium')}. On a 50-litre fill-up of petrol that makes ${h.eur(Math.abs(e95 - nl95) * 50, 2)} against the Netherlands. In ${w.billiger} of the last ${w.n} weeks petrol was cheaper in Germany than in the Netherlands; the German price moved between ${h.l3(s.lo[1])} and ${h.l3(s.hi[1])} over that period. If you drive to Austria, Italy or Croatia from the Low Countries, you often cover hundreds of kilometres in Germany and will almost certainly fill up there. The figures come from the European Commission’s Weekly Oil Bulletin; this page quotes no prices of individual stations.`;
    },
    faqs: (h) => {
      const { e95, diesel, nl95, nlD, lpg, nlL, wochen } = D(h);
      const w = wochen('NL', 'diesel');
      const a = anteil(h, 'amsterdam', 'split');
      return [
        { q: 'How much does a full tank in Germany save against the Netherlands?', a: `On the weekly figures of ${h.date(h.M.SPRIT_STAND)}, 50 litres of petrol 95 cost ${h.eur(e95 * 50, 2)} in Germany and ${h.eur(nl95 * 50, 2)} in the Netherlands, 50 litres of diesel ${h.eur(diesel * 50, 2)} against ${h.eur(nlD * 50, 2)}. ${e95 < nl95 ? 'Filling up after the border is therefore cheaper this week' : 'Filling up before the border is therefore cheaper this week'}. Stations on the Autobahn usually charge more than the national average.` },
        { q: 'In how many weeks was diesel cheaper in Germany than in the Netherlands?', a: `In ${w.billiger} of the last ${w.n} weeks in which both countries reported a value. That makes a lower German diesel price ${w.billiger * 2 >= w.n ? 'the rule, though not a certainty' : 'rather the exception'}. The page recalculates the comparison with every new bulletin, so the statement holds for the week in which you read it.` },
        { q: 'How many litres do you burn in Germany on the way from Amsterdam to Croatia?', a: a ? `On the fastest route ${a.name}, ${h.num(a.km)} km lie in Germany. A car using 7 litres per 100 km burns ${h.num(a.liter, 1)} litres of petrol there each way, ${h.eur(a.kosten, 2)} at the German average and ${h.eur(a.nl, 2)} at the Dutch one. With a caravan or roof box consumption is higher; enter it on the home page.` : 'The route could not be calculated. The calculator on the home page shows kilometres, litres and fuel cost per country for every trip, Germany included.' },
        { q: 'What does LPG cost in Germany compared with the Netherlands?', a: lpg != null && nlL != null ? `In the week of ${h.date(h.M.SPRIT_STAND)} LPG cost ${h.l3(lpg)} per litre on average in Germany and ${h.l3(nlL)} in the Netherlands, so Germany was ${um(h, lpg, nlL, 'the Netherlands')}. On 40 litres that is a difference of ${h.eur(Math.abs(lpg - nlL) * 40, 2)}. The bulletin gives national averages; it does not count LPG pumps along the route.` : 'For the latest week the bulletin lacks an LPG value for Germany or the Netherlands, so no comparison is possible right now. Weekly figures for petrol 95 and diesel are available for both countries.' },
      ];
    },
    body: (h) => {
      const { e95, at95 } = D(h);
      const rows = [anteil(h, 'amsterdam', 'split'), anteil(h, 'utrecht', 'venedig'), anteil(h, 'eindhoven', 'gardasee'), anteil(h, 'groningen', 'prag'), anteil(h, 'rotterdam', 'salzburg')].filter((x): x is NonNullable<ReturnType<typeof anteil>> => !!x).map((x) => [x.name, h.num(x.km), h.num(x.liter, 1), h.eur(x.kosten, 2), h.eur(x.nl, 2)]);
      return `<h2>Germany beside the Netherlands and Belgium</h2>
<p>National averages with taxes in the week of ${h.date(h.M.SPRIT_STAND)}. The last column shows how much more (+) or less (−) 50 litres of petrol 95 cost in each country than in the Netherlands.</p>
${tabelle(h)}
<p>Countries in the bulletin with a lower average price for petrol 95 than Germany this week: ${h.M.SPRIT_LAENDER.filter((c) => (h.M.preis(c, 'e95') ?? 99) < D(h).e95).length} of ${h.M.SPRIT_LAENDER.length}.</p>
<h2>How much Germany weighs on your route</h2>
<p>The calculator’s fastest route, a car using 7 litres of petrol per 100 km, one way; only the German part is counted. The last column prices the same litres at the Dutch average.</p>
${h.table(['Route', 'km in Germany', 'Litres', 'in Germany', 'at the Dutch price'], rows, undefined, ['l', 'r', 'r', 'r', 'r'])}
<p>Heading south-east, Austria often follows Germany. Petrol there is ${um(h, at95, e95, 'in Germany')} this week; details on ${h.a('spritpreise-oesterreich', 'fuel prices in Austria')}. For the Austrian motorway you also need a ${h.a('vignette-oesterreich', 'vignette')}.</p>
<h2>No car toll in Germany, but further along the route</h2>
<p>Germany levies no toll on cars and motorhomes up to 3.5 tonnes, so the cost of the German part is mostly fuel. Vignettes and tolls only start in the countries after it. Examples of the whole drive are on ${h.a('maut-nach-kroatien', 'tolls to Croatia')}, the neighbours on ${h.a('benzineprijs-belgie', 'fuel prices in Belgium')} and ${h.a('tanken-luxemburg', 'fuel in Luxembourg')}.</p>
<h2>Source</h2>
<p>${h.src('wob')}, European Commission. Member states report their average prices with taxes every week; re-use is permitted with acknowledgement of the source (Decision 2011/833/EU). We take the values weekly. The whole drive is on the ${h.a('home', 'home page')}, the method of calculation in the ${h.a('method', 'method')}.</p>`;
    },
  },
});
