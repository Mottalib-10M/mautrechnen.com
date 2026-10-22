import { defineGuide, type Helpers } from '../../lib/guide-types';
import type { Sorte } from '../../lib/engine/params';

/** Benzineprijs België : Wochendurchschnitt (Weekly Oil Bulletin), Vergleich mit den Niederlanden, Luxemburg und Frankreich, Fahrten ab Belgien. */
const C = 'BE';
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
  const fahrt = (start: string, ziel: string, sorte: Sorte = 'e95') => h.M.reise({ start, ziel, fz: 'pkw', sorte, verbrauch: h.M.vorgabeVerbrauch('pkw'), ab, dauer: 14, hinUndZurueck: true, aufenthalt: false });
  return { p, e95: p(C, 'e95') ?? 0, diesel: p(C, 'diesel') ?? 0, lpg: p(C, 'lpg'), nl95: p('NL', 'e95') ?? 0, nlD: p('NL', 'diesel') ?? 0, lu95: p('LU', 'e95') ?? 0, luD: p('LU', 'diesel') ?? 0, fr95: p('FR', 'e95') ?? 0, frD: p('FR', 'diesel') ?? 0, spanne, fahrt };
}
const um = (h: Helpers, a: number, b: number, wo: string) => {
  const d = Math.round((a - b) * 1000) / 1000;
  if (d === 0) return h.T(`genauso viel wie ${wo}`, `the same as ${wo}`, `evenveel als ${wo}`);
  return h.T(`${h.l3(Math.abs(d))} ${d < 0 ? 'weniger' : 'mehr'} als ${wo}`, `${h.l3(Math.abs(d))} ${d < 0 ? 'less' : 'more'} than ${wo}`, `${h.l3(Math.abs(d))} ${d < 0 ? 'minder' : 'meer'} dan ${wo}`);
};
const l3x = (h: Helpers, x: number | null) => (x == null ? '–' : h.l3(x));
function buren(h: Helpers) {
  const { p } = D(h);
  const rows = [C, 'NL', 'LU', 'FR', 'DE'].map((c) => [h.land(c), l3x(h, p(c, 'e95')), l3x(h, p(c, 'diesel')), l3x(h, p(c, 'lpg')), p(c, 'diesel') == null ? '–' : h.eur(p(c, 'diesel')! * 50, 2)]);
  return h.table([h.T('Land', 'Country', 'Land'), h.T('Super 95', 'Petrol 95', 'Euro 95'), 'Diesel', 'LPG', h.T('50 L Diesel', '50 L diesel', '50 L diesel')], rows, undefined, ['l', 'r', 'r', 'r', 'r']);
}
function verloop(h: Helpers) {
  const { spanne } = D(h);
  const naam: Record<Sorte, string> = { e95: h.T('Super 95', 'Petrol 95', 'Euro 95'), diesel: 'Diesel', lpg: 'LPG' };
  const rows = (['e95', 'diesel', 'lpg'] as Sorte[]).flatMap((s) => { const x = spanne(s); return x ? [[naam[s], h.l3(x.erst[1]), `${h.l3(x.lo[1])} (${h.date(x.lo[0])})`, `${h.l3(x.hi[1])} (${h.date(x.hi[0])})`, h.l3(x.letzt[1])]] : []; });
  return h.table([h.T('Sorte', 'Fuel', 'Brandstof'), h.T('vor 26 Wochen', '26 weeks ago', '26 weken geleden'), h.T('Tief', 'Low', 'Laagste'), h.T('Hoch', 'High', 'Hoogste'), h.T('zuletzt', 'latest', 'laatst')], rows, undefined, ['l', 'r', 'r', 'r', 'r']);
}
/** Ganze Fahrt ab Belgien (Diesel) : Spritkosten hin und zurück, Anteil Belgien, günstigstes Land. */
function rit(h: Helpers, start: string, ziel: string) {
  const { fahrt } = D(h);
  const r = fahrt(start, ziel, 'diesel');
  if (!r) return null;
  const be = r.sprit.find((s) => s.land === C);
  return { name: `${h.M.KNOTEN[start].n[h.lang]} – ${h.M.KNOTEN[ziel].n[h.lang]}`, km: r.route.km, beKm: be?.km ?? 0, sprit: r.summen.sprit, tanken: r.tanken };
}

export default defineGuide({
  id: 'benzineprijs-belgie',
  group: 'sprit',
  order: 36,
  tool: 'sprit',
  land: 'BE',
  related: ['tanken-luxemburg', 'benzinpreis-frankreich', 'benzineprijs-duitsland', 'maut-frankreich', 'maut-spanien'],
  sources: ['wob', 'osm'],
  nl: {
    slug: 'benzineprijs-belgie',
    nav: 'Benzineprijs België',
    card: 'Euro 95, diesel en LPG in België als weekgemiddelde, naast Nederland, Luxemburg en Frankrijk.',
    title: 'Benzineprijs België 2026: Euro 95, diesel en LPG per week',
    description: 'Benzineprijs België 2026: officieel weekgemiddelde voor Euro 95, diesel en LPG, naast Nederland, Luxemburg en Frankrijk, en brandstof naar het zuiden.',
    h1: 'Benzineprijs in België 2026: hier tanken of over de grens?',
    intro: 'Kies brandstof en tankbeurt: de rekenhulp toont wat een volle tank in België kost tegenover Nederland, Luxemburg of een ander land.',
    resume: (h) => {
      const { e95, diesel, lpg, nl95, nlD, lu95, luD, fr95, spanne } = D(h);
      const s = spanne('diesel')!;
      return `In de week van ${h.date(h.M.SPRIT_STAND)} kostte een liter Euro 95 in België gemiddeld ${h.l3(e95)} en een liter diesel ${h.l3(diesel)}${lpg != null ? `, LPG ${h.l3(lpg)}` : ''}, alle belastingen inbegrepen. Euro 95 is daarmee ${um(h, e95, nl95, 'in Nederland')}, ${um(h, e95, lu95, 'in Luxemburg')} en ${um(h, e95, fr95, 'in Frankrijk')}. Bij diesel ligt België ${um(h, diesel, nlD, 'Nederland')} en ${um(h, diesel, luD, 'Luxemburg')}; op 50 liter diesel is het verschil met Luxemburg ${h.eur(Math.abs(diesel - luD) * 50, 2)}. In de laatste ${s.n} weken schommelde de Belgische diesel tussen ${h.l3(s.lo[1])} en ${h.l3(s.hi[1])}. Voor Belgen die naar Frankrijk of Spanje rijden en voor Nederlanders die België doorkruisen, telt vooral de vraag of de volgende tankbeurt in België, Luxemburg of Frankrijk valt. De cijfers komen uit de Weekly Oil Bulletin van de Europese Commissie en zijn landelijke gemiddelden; prijzen van afzonderlijke tankstations noemt deze pagina niet.`;
    },
    faqs: (h) => {
      const { e95, nl95, spanne } = D(h);
      const l = spanne('lpg');
      const r = rit(h, 'bruessel', 'orange');
      const a = rit(h, 'antwerpen', 'montpellier') ?? rit(h, 'antwerpen', 'lyon');
      return [
        { q: 'Tankt een Nederlander op weg naar Frankrijk beter in België?', a: `Met de weekcijfers van ${h.date(h.M.SPRIT_STAND)} is Euro 95 in België ${um(h, e95, nl95, 'in Nederland')}. Op 50 liter is dat ${h.eur(Math.abs(e95 - nl95) * 50, 2)} in het voordeel van ${e95 < nl95 ? 'België' : 'Nederland'}. ${e95 < nl95 ? 'Met een bijna lege tank de grens over rijden loont deze week dus' : 'Deze week tankt u dus beter nog in Nederland'}. Tankstations langs de snelweg wijken vaak naar boven af.` },
        { q: 'Hoe sterk is de LPG-prijs in België het afgelopen halfjaar veranderd?', a: l ? `Zesentwintig weken geleden meldde België ${h.l3(l.erst[1])} per liter LPG, de laatste week ${h.l3(l.letzt[1])}, dus ${um(h, l.letzt[1], l.erst[1], 'toen')}. Het laagste punt was ${h.l3(l.lo[1])} in de week van ${h.date(l.lo[0])}, het hoogste ${h.l3(l.hi[1])}. Op 40 liter scheelt dat tussen laag en hoog ${h.eur((l.hi[1] - l.lo[1]) * 40, 2)}.` : 'België meldde de laatste weken geen LPG-gemiddelde aan de Commissie. De rekenhulp kan voor LPG in België daarom geen bedrag tonen; voor Euro 95 en diesel zijn de weekcijfers wel beschikbaar.' },
        { q: 'Wat kost de diesel voor een rit van Brussel naar de Provence en terug?', a: r ? `Op de snelste route ${r.name} (${h.num(r.km)} km enkele reis) kost de diesel heen en terug ${h.eur(r.sprit, 2)}, bij 7 liter per 100 km en de gemiddelde prijs van elk doorkruist land. Daarvan liggen ${h.num(r.beKm)} km per richting in België. De Franse tol en eventuele vignetten rekent de startpagina erbij.` : 'De route kon niet worden berekend. De rekenhulp op de startpagina toont voor elke rit de brandstofkosten per land en de tol, heen en terug.' },
        { q: 'In welk land tankt u op de route van Antwerpen naar Zuid-Frankrijk het goedkoopst?', a: a?.tanken ? `Op de snelste route ${a.name} heeft ${h.land(a.tanken.land)} deze week de laagste gemiddelde dieselprijs van alle doorkruiste landen, met ${h.l3(a.tanken.preis)} per liter. De volgorde kan elke week veranderen; de rekenhulp op de startpagina kiest bij elke berekening opnieuw het goedkoopste land op uw route.` : 'Voor deze route kon geen goedkoopste land worden bepaald. De rekenhulp op de startpagina toont voor elke rit welk doorkruist land de laagste gemiddelde prijs heeft voor de gekozen brandstof.' },
      ];
    },
    body: (h) => {
      const rows = [rit(h, 'bruessel', 'orange'), rit(h, 'gent', 'lloret'), rit(h, 'antwerpen', 'nizza'), rit(h, 'bruessel', 'barcelona'), rit(h, 'gent', 'rom')].filter((x): x is NonNullable<ReturnType<typeof rit>> => !!x).map((x) => [x.name, h.num(x.km), h.num(x.beKm), h.eur(x.sprit, 2), x.tanken ? h.land(x.tanken.land) : '–']);
      return `<h2>België naast de buurlanden</h2>
<p>Landelijke gemiddelden met belastingen in de week van ${h.date(h.M.SPRIT_STAND)}, per liter en voor een tankbeurt van 50 liter diesel.</p>
${buren(h)}
<h2>Het afgelopen halfjaar</h2>
${verloop(h)}
<p>De kolommen tonen de waarde van 26 weken geleden, het laagste en het hoogste weekgemiddelde en de laatste waarde. Zo ziet u of de prijs in uw reisweek aan de bovenkant of de onderkant van de bandbreedte ligt.</p>
<h2>Ritten vanuit België: brandstof heen en terug</h2>
<p>Snelste route van de rekenhulp, een auto met 7 liter diesel per 100 km, heen en terug, elk land tegen zijn eigen gemiddelde prijs. De laatste kolom noemt het doorkruiste land met de laagste dieselprijs.</p>
${h.table(['Route', 'km (enkel)', 'km in België', 'Diesel heen en terug', 'Goedkoopst tanken'], rows, undefined, ['l', 'r', 'r', 'r', 'l'])}
<p>Op routes via Luxemburg valt een tankstop in dat land zonder omweg; de prijzen staan op ${h.a('tanken-luxemburg', 'tanken in Luxemburg')}. Wie via Rijsel naar Parijs rijdt, gaat niet door Luxemburg en komt meteen in Frankrijk, waar de ${h.a('benzinpreis-frankreich', 'Franse brandstofprijs')} geldt.</p>
<h2>Tol en vignetten op dezelfde rit</h2>
<p>In België betaalt een personenauto geen tol op de snelweg; de eerste tol op weg naar het zuiden valt in Frankrijk. Die rekenen wij volgens de tariefbladen 2026 van APRR, ASF en Escota; de trajecten van Sanef (A1 Rijsel–Parijs, A4) blijven “niet geverifieerd”. Meer op ${h.a('maut-frankreich', 'tol Frankrijk')} en ${h.a('maut-spanien', 'tol Spanje')}; voor ritten naar het oosten zie ${h.a('benzineprijs-duitsland', 'benzineprijs Duitsland')}.</p>
<h2>Bron</h2>
<p>${h.src('wob')}, Europese Commissie. De lidstaten melden elke week hun gemiddelde prijzen met belastingen; hergebruik is toegestaan met bronvermelding (Besluit 2011/833/EU). Wij nemen de cijfers wekelijks over. De hele rit rekent de ${h.a('home', 'startpagina')}, de rekenwijze staat in de ${h.a('method', 'methode')}.</p>`;
    },
  },
  en: {
    slug: 'fuel-prices-belgium',
    nav: 'Fuel prices Belgium',
    card: 'Weekly average for petrol, diesel and LPG in Belgium, beside the Netherlands, Luxembourg and France.',
    title: 'Fuel prices in Belgium 2026: petrol, diesel and LPG weekly',
    description: 'Fuel prices in Belgium 2026: official weekly average for petrol 95, diesel and LPG, against the Netherlands, Luxembourg and France, and fuel for a drive south.',
    h1: 'Fuel prices in Belgium 2026: fill up here or across the border?',
    intro: 'Pick the fuel and the fill-up: the calculator shows what a tank in Belgium costs against the Netherlands, Luxembourg or another country.',
    resume: (h) => {
      const { e95, diesel, lpg, nl95, nlD, lu95, luD, fr95, spanne } = D(h);
      const s = spanne('diesel')!;
      return `In the week of ${h.date(h.M.SPRIT_STAND)} a litre of petrol 95 cost ${h.l3(e95)} on Belgium’s national average and a litre of diesel ${h.l3(diesel)}${lpg != null ? `, LPG ${h.l3(lpg)}` : ''}, all taxes included. Petrol is therefore ${um(h, e95, nl95, 'in the Netherlands')}, ${um(h, e95, lu95, 'in Luxembourg')} and ${um(h, e95, fr95, 'in France')}. For diesel Belgium is ${um(h, diesel, nlD, 'the Netherlands')} and ${um(h, diesel, luD, 'Luxembourg')}; on 50 litres of diesel the gap to Luxembourg is ${h.eur(Math.abs(diesel - luD) * 50, 2)}. Over the last ${s.n} weeks Belgian diesel moved between ${h.l3(s.lo[1])} and ${h.l3(s.hi[1])}. For Belgians driving to France or Spain, and for Dutch drivers crossing Belgium, the real question is whether the next fill-up falls in Belgium, Luxembourg or France. The figures come from the European Commission’s Weekly Oil Bulletin and are national averages; this page quotes no prices at individual stations.`;
    },
    faqs: (h) => {
      const { e95, nl95, spanne } = D(h);
      const l = spanne('lpg');
      const r = rit(h, 'bruessel', 'orange');
      const a = rit(h, 'antwerpen', 'montpellier') ?? rit(h, 'antwerpen', 'lyon');
      return [
        { q: 'Should a Dutch driver heading for France fill up in Belgium?', a: `On the weekly figures of ${h.date(h.M.SPRIT_STAND)} petrol 95 in Belgium is ${um(h, e95, nl95, 'in the Netherlands')}. On 50 litres that is ${h.eur(Math.abs(e95 - nl95) * 50, 2)} in favour of ${e95 < nl95 ? 'Belgium' : 'the Netherlands'}. ${e95 < nl95 ? 'Crossing the border with a nearly empty tank pays off this week' : 'This week it is better to fill up while still in the Netherlands'}. Motorway stations often charge more than the average.` },
        { q: 'How much has the LPG price in Belgium changed over the last six months?', a: l ? `Twenty-six weeks ago Belgium reported ${h.l3(l.erst[1])} per litre of LPG, last week ${h.l3(l.letzt[1])}, that is ${um(h, l.letzt[1], l.erst[1], 'then')}. The low point was ${h.l3(l.lo[1])} in the week of ${h.date(l.lo[0])}, the high ${h.l3(l.hi[1])}. On 40 litres the gap between low and high is ${h.eur((l.hi[1] - l.lo[1]) * 40, 2)}.` : 'Belgium has reported no LPG average to the Commission in recent weeks. The calculator therefore cannot show an LPG amount for Belgium; weekly figures for petrol 95 and diesel are available.' },
        { q: 'What does diesel cost for a drive from Brussels to Provence and back?', a: r ? `On the fastest route ${r.name} (${h.num(r.km)} km one way) diesel for the return trip costs ${h.eur(r.sprit, 2)}, at 7 litres per 100 km and the average price of each country crossed. Of that distance, ${h.num(r.beKm)} km each way lie in Belgium. The home page adds French tolls and any vignettes.` : 'The route could not be calculated. The calculator on the home page shows fuel cost per country and tolls for every trip, out and back.' },
        { q: 'In which country is fuel cheapest on the route from Antwerp to southern France?', a: a?.tanken ? `On the fastest route ${a.name}, ${h.land(a.tanken.land)} has the lowest average diesel price of all countries crossed this week, at ${h.l3(a.tanken.preis)} per litre. The order can change every week; the calculator on the home page picks the cheapest country on your route afresh with each calculation.` : 'No cheapest country could be determined for this route. The calculator on the home page shows, for every trip, which country crossed has the lowest average price for the chosen fuel.' },
      ];
    },
    body: (h) => {
      const rows = [rit(h, 'bruessel', 'orange'), rit(h, 'gent', 'lloret'), rit(h, 'antwerpen', 'nizza'), rit(h, 'bruessel', 'barcelona'), rit(h, 'gent', 'rom')].filter((x): x is NonNullable<ReturnType<typeof rit>> => !!x).map((x) => [x.name, h.num(x.km), h.num(x.beKm), h.eur(x.sprit, 2), x.tanken ? h.land(x.tanken.land) : '–']);
      return `<h2>Belgium beside its neighbours</h2>
<p>National averages with taxes in the week of ${h.date(h.M.SPRIT_STAND)}, per litre and for a 50-litre fill-up of diesel.</p>
${buren(h)}
<h2>The last six months</h2>
${verloop(h)}
<p>The columns show the value 26 weeks ago, the lowest and highest weekly average and the latest value, so you can see whether the price in your travel week sits near the top or the bottom of the range.</p>
<h2>Trips from Belgium: fuel out and back</h2>
<p>The calculator’s fastest route, a car using 7 litres of diesel per 100 km, out and back, each country at its own average price. The last column names the country crossed with the lowest diesel price.</p>
${h.table(['Route', 'km (one way)', 'km in Belgium', 'Diesel, return', 'Cheapest to fill up'], rows, undefined, ['l', 'r', 'r', 'r', 'l'])}
<p>On routes through Luxembourg a fuel stop in that country needs no detour; prices are on ${h.a('tanken-luxemburg', 'fuel in Luxembourg')}. If you drive via Lille to Paris, you skip Luxembourg and enter France directly, where the ${h.a('benzinpreis-frankreich', 'French fuel price')} applies.</p>
<h2>Tolls and vignettes on the same trip</h2>
<p>A car pays no motorway toll in Belgium; the first toll on the way south is in France. We calculate it from the 2026 rate sheets of APRR, ASF and Escota; Sanef sections (A1 Lille–Paris, A4) stay “not verified”. More on ${h.a('maut-frankreich', 'French tolls')} and ${h.a('maut-spanien', 'Spanish tolls')}; for trips east see ${h.a('benzineprijs-duitsland', 'fuel prices in Germany')}.</p>
<h2>Source</h2>
<p>${h.src('wob')}, European Commission. Member states report their average prices with taxes every week; re-use is permitted with acknowledgement of the source (Decision 2011/833/EU). We take the values weekly. The whole drive is on the ${h.a('home', 'home page')}, the method of calculation in the ${h.a('method', 'method')}.</p>`;
    },
  },
});
