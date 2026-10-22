import type { Helpers } from '../../lib/guide-types';
import { route } from '../../i18n/routes';
import { daten, linkliste } from './daten';

const NAMEN: Record<string, string> = {
  'vignette-oesterreich': 'Austrian vignette: prices and cheapest duration',
  'digitale-vignette': 'Austrian digital vignette: the sticker ends in 2027',
  'vignette-schweiz': 'Swiss vignette: annual sticker and trailers',
  'vignette-slowenien': 'Slovenian vignette: classes 2A and 2B',
  'vignette-tschechien': 'Czech vignette: prices in koruna',
  'vignette-ungarn': 'Hungarian vignette: e-matrica D1',
  'maut-italien': 'Italian motorway tolls: per-kilometre rates and estimate',
  'maut-frankreich': 'French motorway tolls: classes and rate sheets',
  'maut-kroatien': 'Croatian motorway tolls: Split and Istria',
  'maut-spanien': 'Spanish motorway tolls: AP-7, Costa del Sol, AP-6',
  'maut-oesterreich': 'Austrian motorway tolls: vignette and section tolls',
  brennermaut: 'Brenner toll: A13 and A22',
  tauerntunnel: 'Tauern tunnel toll: A10 each way',
  karawankentunnel: 'Karawanken tunnel toll into Slovenia',
  'spritpreise-oesterreich': 'Fuel prices in Austria',
  'spritpreise-italien': 'Fuel prices in Italy',
  'spritpreise-kroatien': 'Fuel prices in Croatia',
  'spritpreise-slowenien': 'Fuel prices in Slovenia',
  'benzinpreis-frankreich': 'Fuel prices in France',
  'benzineprijs-duitsland': 'Fuel prices in Germany',
  'benzineprijs-belgie': 'Fuel prices in Belgium',
  'tanken-luxemburg': 'Fuel prices in Luxembourg',
  'maut-nach-kroatien': 'Tolls to Croatia: the whole drive',
  'maut-nach-italien': 'Tolls to Italy: Brenner or Gotthard',
};

export const en = {
  start: 'frankfurt', ziel: 'venedig',
  title: 'Toll calculator 2026: tolls, vignettes and fuel for Europe',
  description: 'Toll calculator 2026 for a holiday drive: vignettes, tolls, tunnels and fuel for every country on the route, from the operators’ rate sheets, no sign-up needed.',
  h1: 'Toll calculator 2026: what does the drive to your holiday cost?',
  intro: 'Choose start, destination and vehicle: vignettes, tolls, tunnels and fuel for every country on the route, there and back.',
  resume: (h: Helpers) => {
    const { haupt: r } = daten(h);
    if (!r) return '';
    return `This toll calculator adds up the cost of a holiday drive by car, motorhome, car and caravan or motorcycle for every country on the route: the vignettes of Austria, Switzerland, Slovenia, the Czech Republic, Hungary and Slovakia in the duration that is cheapest for your dates, distance-based tolls in France, Italy, Croatia and Spain, the section tolls of the Austrian Alpine tunnels, and fuel at each country’s official average price. Every rate comes from the operator’s own price list and carries a date; what we could not read is marked “not verified” without an amount, and the Italian toll appears separately as an estimate. For a car trip from Frankfurt to Venice, leaving on ${h.date(h.M.addDays(h.today, 7))} and returning fourteen days later, the calculator finds ${h.eur(r.summen.vignetten, 2)} in vignettes, ${h.eur(r.summen.mautGeprueft, 2)} in tolls read from rate sheets, an estimated ${h.eur(r.summen.mautSchaetzung, 2)} in Italian tolls and ${h.eur(r.summen.sprit, 2)} in fuel, ${h.eur(r.summen.gesamt, 2)} in all there and back. It runs in your browser, with no account and nothing sent to us.`;
  },
  faqs: (h: Helpers) => {
    const { vignetten } = daten(h);
    const at = vignetten.find((v) => v.c === 'AT')!;
    return [
      { q: 'Why does the toll calculator count only two vignette days?', a: `Because a country you only drive through is used on two days: the day you go and the day you come back. For a fourteen-day holiday, two Austrian 1-day vignettes are therefore often cheaper than a longer one, currently ${at.pkw.verfuegbar ? h.eur(at.pkw.summeEur, 2) : 'an amount not yet published'} together. If you also use motorways in the destination country during your stay, tick that option in the calculator, and the vignette will cover every day.` },
      { q: 'What does “not verified” mean in a result?', a: 'Your route includes a section whose price we could not read from the operator, for example Sanef in northern France or some Italian concession holders. Rather than invent an amount, the calculator lists the section without a price and leaves it out of the total, which is then a lower limit. As soon as a rate sheet becomes readable, we add it with its date and source.' },
      { q: 'How up to date are the fuel prices in the calculator?', a: `They come from the European Commission’s Weekly Oil Bulletin, which publishes average prices including taxes for every member state each week. The calculator currently uses the bulletin of ${h.date(h.M.SPRIT_STAND)}. A script reads the bulletin again every Tuesday and Thursday. Switzerland has no figure in this series, so for Swiss kilometres you enter the price per litre yourself.` },
      { q: 'Does the toll calculator cost anything or need an account?', a: 'No. The calculator is free, asks for no sign-up or e-mail address and runs entirely in your browser; your route and dates are not sent to us. It contains no links to vignette resellers or toll boxes. You buy a vignette from the country’s official sales point, whose page we cite as the source for each price.' },
      { q: 'Can I embed the trip cost calculator on my own website?', a: 'Yes. The “Widget” page gives a short code that lets you place the calculator on a blog, a campsite website or a travel forum. It shows the same rates as this site and is updated with it. The widget carries no advertising and costs nothing; a link to the source stays visible below it.' },
      { q: 'How do I know a price in the calculator still applies?', a: `Every rate sits in our parameter file with its source and the date it was read, most recently ${h.date(h.P.retrieved_at)}. For vignettes we also record when the price period ends; if your trip falls after that and the operator has not yet published new prices, the calculator says “2027 prices not yet published” instead of carrying an old amount forward. The method page describes each step.` },
      { q: 'Who runs this toll calculator?', a: 'The site is run by the company Radif Partners. It is not a public authority or a toll operator and does not speak for ASFINAG, the Swiss customs office, DARS or any other body. We read the public rate sheets, check the arithmetic and cite a source for every amount. You can report mistakes through the contact page, and we correct them with a date.' },
    ];
  },
  body: (h: Helpers) => {
    const { fahrten, vignetten, vz, sprit, T, ab, go } = daten(h);
    const kopf = ['Route', 'Distance', 'Vignettes', 'Tolls (read)', 'Tolls (estimate)', 'Fuel', 'Total'];
    const vRows = vignetten.map((v) => [h.land(v.c), vz(v.pkw), vz(v.wm), vz(v.mo)]);
    const sRows = sprit.map((s) => [h.land(s.c), h.l3(s.e95), s.diesel != null ? h.l3(s.diesel) : '–']);
    const g = go('frankfurt', 'venedig', 'gespann'), w = go('frankfurt', 'venedig', 'wohnmobil'), p = go('frankfurt', 'venedig');
    return `<h2>Why this toll calculator</h2>
<p>Mautrechnen works out in one step the full cost of the return trip, with the vignette of the cheapest duration for your dates, every toll read from the operator’s 2026 rate sheet (and marked “estimate” or “not verified” when it is not), and fuel at the official price of each country crossed, with no sign-up and no link to a reseller.</p>
<p>Most pages about tolls describe one country after another. When you plan a holiday, though, what counts is the total: driving to Croatia means two vignettes, two Austrian tunnels and the Croatian motorway, and filling up in four countries at four prices. The calculator above routes your trip through a network of about 130 towns and border crossings, finds the fastest connection and assigns every kilometre to a country and a type of charge. The details are in the <a href="${route('method', 'en')}">method</a>. Who is behind the site is explained on <a href="${route('about', 'en')}">about us</a>.</p>
<h2>How to use the calculator</h2>
<p>Pick your start and destination above, then the vehicle, the fuel type and your consumption per 100 kilometres. Enter the day you leave and the number of days until you drive back, and choose whether you are making a return trip. If you will also drive on motorways in the destination country during your stay, tick that option so the vignette covers every day. To avoid a country, exclude it, and the calculator will look for another route and show what it costs. The result lists each country with its items separately, with the source of each rate, so you can check every amount yourself.</p>
<h2>Examples: what typical holiday drives cost</h2>
${fahrten([['frankfurt', 'venedig'], ['muenchen', 'split'], ['koeln', 'gardasee'], ['stuttgart', 'nizza'], ['berlin', 'budapest'], ['amsterdam', 'lloret'], ['bruessel', 'orange'], ['luxemburg', 'rom']], kopf, `Car, petrol, return, leaving ${h.date(ab)}, 14-day stay`)}
<p>The “Tolls (read)” column only contains amounts we have read on a rate sheet. The Italian toll stands next to it as an estimate, because Italy publishes per-kilometre rates but no openly readable distances between toll stations. “nv” counts the sections whose price we do not know; they are missing from the total. Fuel is costed at ${h.num(h.P.verbrauch_vorgabe.pkw)} litres per 100 km and the national average of each country on the way. Change the vehicle, consumption, dates or fuel in the calculator and every line changes with it.</p>
<h2>Vignettes: which duration for a transit?</h2>
${h.table(['Country', 'Car', 'Motorhome', 'Motorcycle'], vRows, `Cheapest combination for leaving on ${h.date(ab)} and returning 14 days later, in euros`, ['l', 'r', 'r', 'r'])}
<p>Six countries on the holiday routes charge a time-based vignette. For each one the calculator checks every product and picks the cheapest combination that covers your driving days: in Austria often two 1-day vignettes, in Slovenia two weekly vignettes or a monthly one depending on the gap, in Switzerland always the annual vignette, because there is nothing shorter. Prices in koruna, forint or francs are converted to euros at the European Central Bank reference rate. A dash means no prices have yet been published for those dates. Details are on the pages for ${h.a('vignette-oesterreich', 'Austria')}, ${h.a('vignette-schweiz', 'Switzerland')}, ${h.a('vignette-slowenien', 'Slovenia')}, ${h.a('vignette-tschechien', 'the Czech Republic')} and ${h.a('vignette-ungarn', 'Hungary')}.</p>
<p>In the Czech Republic and Slovakia motorcycles are exempt, in Switzerland a trailer needs a vignette of its own, in Austria it does not. In Slovenia the height over the front axle separates classes 2A and 2B; we did not find the caravan rule on the DARS site, so the calculator only counts the towing vehicle’s vignette there and says so.</p>
<h2>Distance-based tolls: France, Italy, Croatia, Spain</h2>
<p>In France you pay by entry and exit within closed systems. We have read the 2026 rate sheets of APRR, ASF and Escota, in force since 1 February 2026, and the calculator works through your route system by system. Sanef, which runs mainly the motorways of the north and east, blocks automated access to its list, so its sections appear as “not verified”. Motorhomes over two metres and cars towing a caravan pay class 2 in France, motorcycles class 5. More on ${h.a('maut-frankreich', 'French motorway tolls')}.</p>
<p>Italy charges by the kilometres between entry and exit, with rates per operator for lowland and mountain stretches. The 2026 per-kilometre rates of Autostrade per l’Italia and the A22 Brenner motorway are published; the exact distances between toll stations are not. Our figure is therefore an estimate, rounded to 10 cents as at the toll booth. For some concessions, including the A4 between Brescia and Padua and Autostrade Alto Adriatico, we have read no rate. Classes and formula are explained on ${h.a('maut-italien', 'Italian motorway tolls')}.</p>
<p>Croatia has no vignette but price lists per section from HAC, Autocesta Zagreb–Macelj and BINA-Istra, and any vehicle towing a trailer is group II there. In Spain the AP-7 from the French border to Valencia no longer appears in the 2026 rate sheets; you still pay on the Costa del Sol and on the AP-6 near Madrid. The pages ${h.a('maut-kroatien', 'Croatian motorway tolls')} and ${h.a('maut-spanien', 'Spanish motorway tolls')} give every price we have read.</p>
<h2>Alpine tunnels and section tolls</h2>
<p>Besides the vignette, Austria charges a section toll on five Alpine routes: Brenner, Tauern, Karawanken, Pyhrn and Arlberg. Each single trip covers one direction; cars, motorhomes up to 3.5 tonnes and motorcycles pay the same, trailers nothing. On the way to Croatia you usually pass the Tauern and Karawanken, on the way to Italy the Brenner. Then there are the large tunnels between France, Switzerland and Italy: the Mont Blanc tunnel costs a car ${h.eur(T.montblanc.einfach.pkw, 2)} one way and ${h.eur(T.montblanc.hinzurueck.pkw, 2)} return, the Fréjus tunnel the same, the Great St Bernard ${h.eur(T.gsb.einfach.pkw, 2)} one way. Pages: ${h.a('maut-oesterreich', 'Austrian motorway tolls')}, ${h.a('brennermaut', 'Brenner toll')}, ${h.a('tauerntunnel', 'Tauern tunnel')}, ${h.a('karawankentunnel', 'Karawanken tunnel')}.</p>
<h2>Motorhome, caravan, motorcycle</h2>
<p>Every country draws its vehicle classes differently, which is why it pays to choose the right vehicle in the calculator. For Frankfurt to Venice and back we work out ${p ? h.eur(p.summen.gesamt, 2) : '–'} by car, ${w ? h.eur(w.summen.gesamt, 2) : '–'} by motorhome and ${g ? h.eur(g.summen.gesamt, 2) : '–'} with a car and caravan, each at the default consumption. The differences arise in the vignette classes and, above all, in Italy, where motorhomes with a high front axle are class B and cars with a single-axle caravan class 3. In Austria every vehicle up to 3.5 tonnes pays the same vignette and section toll. The calculator does not handle vehicles over 3.5 tonnes, because distance-based systems such as the Austrian GO toll apply to them.</p>
<h2>Fuel: where a litre costs least</h2>
${h.table(['Country', 'Petrol 95', 'Diesel'], sRows, `National average including taxes, Weekly Oil Bulletin, ${h.date(h.M.SPRIT_STAND)}`, ['l', 'r', 'r'])}
<p>The table is sorted by the petrol price and changes every week. For each trip the calculator shows which transit country has the cheapest litre; filling up there saves the difference per litre on the whole tank. These are national averages: motorway service stations often charge more. Country pages: ${h.a('spritpreise-oesterreich', 'Austria')}, ${h.a('spritpreise-italien', 'Italy')}, ${h.a('spritpreise-kroatien', 'Croatia')}, ${h.a('spritpreise-slowenien', 'Slovenia')}, ${h.a('benzinpreis-frankreich', 'France')}, ${h.a('benzineprijs-duitsland', 'Germany')}, ${h.a('benzineprijs-belgie', 'Belgium')} and ${h.a('tanken-luxemburg', 'Luxembourg')}.</p>
<h2>What changes in 2027</h2>
<p>Austria is abolishing the sticker vignette: the 2026 vignette is the last one you glue on, it is valid until 31 January 2027, and after that only the digital vignette linked to your number plate remains. When we read the ASFINAG pages, the 2027 prices had not yet been published. Slovenia, the Czech Republic, Hungary and Slovakia also tend to announce next year’s prices shortly before the year ends. If your trip falls in that period, the calculator shows “not yet published” and does not carry an old price forward. What to watch out for at the changeover is on ${h.a('digitale-vignette', 'Austrian digital vignette')}.</p>
<h2>What the calculator does not do</h2>
<p>The calculator does not know about ferries, parking charges, low-emission zones or city tolls, nor discounts for toll boxes or frequent-driver cards. It always takes the fastest route in its network; distances come from OpenStreetMap and may differ from your satnav. German motorways are free for cars and therefore only show up in the fuel line. Where we have not read a rule from the operator, we say so instead of guessing.</p>
<h2>All pages at a glance</h2>
${linkliste(h, NAMEN)}
<p>Two overviews cover whole journeys: ${h.a('maut-nach-kroatien', 'tolls to Croatia')} and ${h.a('maut-nach-italien', 'tolls to Italy')}. Sources, calculation steps and the limits of the data are set out in the <a href="${route('method', 'en')}">method</a>.</p>`;
  },
};
