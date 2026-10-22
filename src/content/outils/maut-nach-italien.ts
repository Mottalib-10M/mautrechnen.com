import { defineGuide, type Helpers } from '../../lib/guide-types';

type Fz = 'pkw' | 'wohnmobil' | 'gespann' | 'motorrad';
/** Maut nach Italien : ganze Fahrt über Brenner oder Gotthard, Vignetten AT/CH, Streckenmaut, italienische Maut (Schätzung), Sprit. */
function D(h: Helpers) {
  const ab = h.M.addDays(h.today, 7);
  const sorte = (fz: Fz) => (fz === 'pkw' || fz === 'motorrad' ? 'e95' : 'diesel') as 'e95' | 'diesel';
  const go = (start: string, ziel: string, fz: Fz = 'pkw', meiden: string[] = []) => h.M.reise({ start, ziel, fz, sorte: sorte(fz), verbrauch: h.P.verbrauch_vorgabe[fz], ab, dauer: 14, hinUndZurueck: true, aufenthalt: false, meiden });
  const haupt = go('muenchen', 'rimini');
  return { ab, go, haupt };
}
const ort = (h: Helpers, id: string) => h.M.KNOTEN[id].n[h.lang];
type R = ReturnType<typeof D>['haupt'];
const ueber = (r: R) => (r ? r.route.laender.map((x) => x.c).filter((c) => c === 'AT' || c === 'CH') : []);
const vig = (r: R, c: string) => r?.vignetten.find((v) => v.land === c)?.summeEur ?? 0;
const zelle = (h: Helpers, r: R) => (r ? `${h.eur(r.summen.mautSchaetzung, 2)}${r.offen.length ? ` + ${r.offen.length} nv` : ''}` : '–');

export default defineGuide({
  id: 'maut-nach-italien',
  group: 'strecke',
  order: 41,
  tool: 'reise',
  von: 'muenchen',
  nach: 'rimini',
  related: ['maut-italien', 'brennermaut', 'vignette-schweiz', 'vignette-oesterreich', 'spritpreise-italien', 'maut-oesterreich'],
  sources: ['asfinagVignette', 'asfinagStrecke', 'bazgVignette', 'aspiCalcolo', 'a22', 'wob'],
  de: {
    slug: 'maut-nach-italien',
    nav: 'Maut nach Italien',
    card: 'Brenner oder Gotthard: Vignetten, Streckenmaut, italienische Maut und Sprit.',
    title: 'Maut nach Italien 2026: Brenner oder Gotthard im Vergleich',
    description: 'Maut nach Italien 2026: Vignette Österreich oder Schweiz, Brennermaut, italienische Autobahn als Schätzung und Sprit, hin und zurück ab Ihrer Stadt berechnet.',
    h1: 'Maut nach Italien 2026: was kostet die Fahrt an die Adria?',
    intro: 'Start, Ziel, Fahrzeug und Reisedaten eingeben: der Rechner nimmt die schnellste Strecke und addiert Vignetten, Maut und Sprit je Land.',
    resume: (h) => {
      const { haupt: r } = D(h);
      if (!r) return '';
      return `Nach Italien führen aus Deutschland zwei Hauptwege: über Österreich und den Brenner oder über die Schweiz und den Gotthard. Über den Brenner zahlt man die österreichische Vignette für die Inntalautobahn und die Streckenmaut der A13, über den Gotthard die Schweizer Jahresvignette, die es nur als ganzes Jahr gibt. In Italien selbst wird jede Autobahnfahrt nach Kilometern abgerechnet, und weil die amtlichen Kilometer von Mautstelle zu Mautstelle nicht frei veröffentlicht sind, schätzen wir diesen Teil mit den Kilometertarifen der Betreiber. Für die Fahrt von München nach Rimini (${h.num(r.route.km)} km) mit dem Pkw, Abfahrt am ${h.date(h.M.addDays(h.today, 7))} und Rückfahrt vierzehn Tage später, ergeben sich ${h.eur(r.summen.vignetten, 2)} für Vignetten, ${h.eur(r.summen.mautGeprueft, 2)} für die Brennermaut und geschätzte ${h.eur(r.summen.mautSchaetzung, 2)} für die italienische Autobahn, hin und zurück. Mit Sprit zum Landesdurchschnitt (${h.eur(r.summen.sprit, 2)}) sind es zusammen rund ${h.eur(r.summen.gesamt, 2)}.`;
    },
    faqs: (h) => {
      const { go } = D(h);
      const f = go('frankfurt', 'rimini');
      const fa = go('frankfurt', 'rimini', 'pkw', ['CH']);
      const m = go('muenchen', 'rimini');
      const mg = go('muenchen', 'rimini', 'gespann');
      return [
        { q: 'Ist der Weg über die Schweiz oder über Österreich günstiger?', a: f && fa ? `Das hängt vom Start ab. Ab Frankfurt nimmt der Rechner den Weg ${ueber(f).includes('CH') ? 'über die Schweiz' : 'über Österreich'} und kommt hin und zurück auf ${h.eur(f.summen.gesamt, 2)}; ohne die Schweiz wären es ${h.eur(fa.summen.gesamt, 2)} bei ${h.num(fa.route.km)} statt ${h.num(f.route.km)} km.${ueber(f).includes('CH') ? ` Die Schweizer Vignette kostet ${h.eur(vig(f, 'CH'), 2)} und gilt ein ganzes Jahr; dafür entfällt die Brennermaut.` : ''}` : '' },
        { q: 'Warum ist die italienische Maut im Rechner nur geschätzt?', a: 'Weil die italienischen Betreiber zwar ihre Kilometertarife veröffentlichen, nicht aber frei lesbare Entfernungen von Mautstelle zu Mautstelle; ihre eigenen Rechner sind zum Teil durch ein Captcha geschützt. Wir multiplizieren deshalb den Tarif mit der Länge laut OpenStreetMap und runden wie in Italien auf 10 Cent. Der Betrag erscheint getrennt als Schätzung, damit Sie ihn nicht mit einem gelesenen Preis verwechseln.' },
        { q: 'Was kostet die Fahrt nach Rimini mit Wohnwagen?', a: m && mg ? `Mit Pkw und Wohnwagen rechnen wir ab München hin und zurück rund ${h.eur(mg.summen.gesamt, 2)} statt ${h.eur(m.summen.gesamt, 2)}. In Österreich zahlt der Wohnwagen weder Vignette noch Brennermaut. In Italien hebt er das Gespann in die Klasse 3, deren Kilometertarif deutlich höher ist; die geschätzte italienische Maut steigt dadurch auf ${h.eur(mg.summen.mautSchaetzung, 2)}.` : '' },
      ].filter((x) => x.a);
    },
    body: (h) => {
      const { go, ab } = D(h);
      const starts = ['muenchen', 'stuttgart', 'frankfurt', 'koeln', 'berlin', 'hamburg'];
      const rowsS = starts.map((s) => { const r = go(s, 'rimini'); return r ? [ort(h, s), ueber(r).map((c) => h.land(c)).join(', '), h.eur(r.summen.vignetten, 2), h.eur(r.summen.mautGeprueft, 2), zelle(h, r), h.eur(r.summen.sprit, 2), h.eur(r.summen.gesamt, 2)] : [ort(h, s), '–', '–', '–', '–', '–', '–']; });
      const ziele = ['bozen', 'gardasee', 'venedig', 'lignano', 'rimini', 'florenz', 'rom'];
      const rowsZ = ziele.map((z) => { const r = go('muenchen', z); return r ? [ort(h, z), `${h.num(r.route.km)} km`, h.eur(r.summen.mautGeprueft, 2), zelle(h, r), h.eur(r.summen.gesamt, 2)] : [ort(h, z), '–', '–', '–', '–']; });
      const name: Record<Fz, string> = { pkw: 'Pkw', wohnmobil: 'Wohnmobil', gespann: 'Pkw mit Wohnwagen', motorrad: 'Motorrad' };
      const rowsF = (['pkw', 'wohnmobil', 'gespann', 'motorrad'] as Fz[]).map((f) => { const r = go('muenchen', 'rimini', f); return r ? [name[f], h.eur(r.summen.vignetten, 2), h.eur(r.summen.mautGeprueft, 2), h.eur(r.summen.mautSchaetzung, 2), h.eur(r.summen.gesamt, 2)] : [name[f], '–', '–', '–', '–']; });
      return `<h2>Ab sechs deutschen Städten nach Rimini</h2>
${h.table(['Start', 'über', 'Vignetten', 'Maut (gelesen)', 'Maut Italien (Schätzung)', 'Sprit', 'Summe'], rowsS, `Pkw, Super, hin und zurück, Abfahrt ${h.date(ab)}, 14 Tage Aufenthalt`, ['l', 'l', 'r', 'r', 'r', 'r', 'r'])}
<p>Der Rechner wählt die Strecke nach der kürzesten Fahrzeit. Ab dem Westen und Norden führt sie oft durch die Schweiz, ab München und Berlin über den Brenner. „nv“ bedeutet: Auf der Strecke liegen Abschnitte, deren Preis wir nicht gelesen haben; sie sind in der Summe nicht enthalten. Wer ein Land meiden will, kann es im Rechner oben ausschließen.</p>
<h2>Ziele in Italien ab München</h2>
${h.table(['Ziel', 'Strecke', 'Maut (gelesen)', 'Maut Italien (Schätzung)', 'Summe'], rowsZ, 'Pkw, hin und zurück', ['l', 'r', 'r', 'r', 'r'])}
<p>Bis Bozen und an den Gardasee bleibt die italienische Maut klein, weil die Strecke auf der A22 kurz ist. Nach Venedig und an die obere Adria kommen Abschnitte anderer Konzessionäre hinzu, deren Tarife wir nicht gelesen haben, etwa die A4 zwischen Brescia und Padua oder die Autostrade Alto Adriatico. Nach Florenz und Rom fährt man den größten Teil auf dem Netz der Autostrade per l’Italia, für das die Kilometertarife bekannt sind. Die Tarife je Klasse erklärt ${h.a('maut-italien', 'Maut Italien')}.</p>
<h2>Fahrzeuge im Vergleich</h2>
${h.table(['Fahrzeug', 'Vignetten', 'Brennermaut', 'Maut Italien (Schätzung)', 'Summe'], rowsF, 'München – Rimini, hin und zurück', ['l', 'r', 'r', 'r', 'r'])}
<p>In Österreich zahlen alle Fahrzeuge bis 3,5 Tonnen dieselbe Brennermaut, nur die Vignette ist für Motorräder günstiger. In Italien zählt die Klasse: A für Pkw und Motorrad, B für Wohnmobile mit hoher Vorderachse, 3 für Pkw mit einachsigem Wohnwagen. Einzelheiten zur A13 stehen unter ${h.a('brennermaut', 'Brennermaut')}, zur Schweizer Jahresvignette unter ${h.a('vignette-schweiz', 'Vignette Schweiz')}.</p>`;
    },
  },
  en: {
    slug: 'tolls-to-italy',
    nav: 'Tolls to Italy',
    card: 'Brenner or Gotthard: vignettes, section tolls, Italian tolls and fuel.',
    title: 'Tolls to Italy 2026: Brenner and Gotthard routes compared',
    description: 'Tolls to Italy 2026: Austrian or Swiss vignette, the Brenner toll, Italian motorway tolls as an estimate and fuel, worked out there and back from your city.',
    h1: 'Tolls to Italy 2026: what does the drive to the Adriatic cost?',
    intro: 'Enter start, destination, vehicle and dates: the calculator takes the fastest route and adds up vignettes, tolls and fuel per country.',
    resume: (h) => {
      const { haupt: r } = D(h);
      if (!r) return '';
      return `From Germany there are two main ways into Italy: through Austria and over the Brenner, or through Switzerland and the Gotthard. Via the Brenner you pay the Austrian vignette for the Inn valley motorway and the A13 section toll; via the Gotthard you pay the Swiss vignette, which is only sold for a whole year. In Italy itself every motorway trip is charged by distance, and because the official distances between toll stations are not openly published, we estimate this part with the operators’ per-kilometre rates. For a car trip from Munich to Rimini (${h.num(r.route.km)} km), leaving on ${h.date(h.M.addDays(h.today, 7))} and returning fourteen days later, that comes to ${h.eur(r.summen.vignetten, 2)} for vignettes, ${h.eur(r.summen.mautGeprueft, 2)} for the Brenner toll and an estimated ${h.eur(r.summen.mautSchaetzung, 2)} for the Italian motorway, there and back. With fuel at national average prices (${h.eur(r.summen.sprit, 2)}) the total is around ${h.eur(r.summen.gesamt, 2)}.`;
    },
    faqs: (h) => {
      const { go } = D(h);
      const f = go('frankfurt', 'rimini');
      const fa = go('frankfurt', 'rimini', 'pkw', ['CH']);
      const m = go('muenchen', 'rimini');
      const mg = go('muenchen', 'rimini', 'gespann');
      return [
        { q: 'Is the route through Switzerland or through Austria cheaper?', a: f && fa ? `It depends on where you start. From Frankfurt the calculator takes the route ${ueber(f).includes('CH') ? 'through Switzerland' : 'through Austria'} and arrives at ${h.eur(f.summen.gesamt, 2)} there and back; without Switzerland it would be ${h.eur(fa.summen.gesamt, 2)} over ${h.num(fa.route.km)} instead of ${h.num(f.route.km)} km.${ueber(f).includes('CH') ? ` The Swiss vignette costs ${h.eur(vig(f, 'CH'), 2)} and is valid for a whole year; in exchange there is no Brenner toll.` : ''}` : '' },
        { q: 'Why is the Italian toll only estimated in the calculator?', a: 'Because the Italian operators publish their per-kilometre rates but not openly readable distances between toll stations; some of their own calculators sit behind a captcha. We therefore multiply the rate by the OpenStreetMap distance and round to 10 cents, as Italy does. The amount is shown separately as an estimate, so that you do not mistake it for a price we have read.' },
        { q: 'What does the drive to Rimini cost with a caravan?', a: m && mg ? `With a car and caravan we work out about ${h.eur(mg.summen.gesamt, 2)} from Munich there and back, instead of ${h.eur(m.summen.gesamt, 2)}. In Austria the caravan pays neither vignette nor Brenner toll. In Italy it moves the combination into class 3, whose per-kilometre rate is markedly higher; the estimated Italian toll rises to ${h.eur(mg.summen.mautSchaetzung, 2)} as a result.` : '' },
      ].filter((x) => x.a);
    },
    body: (h) => {
      const { go, ab } = D(h);
      const starts = ['muenchen', 'stuttgart', 'frankfurt', 'koeln', 'amsterdam', 'bruessel'];
      const rowsS = starts.map((s) => { const r = go(s, 'rimini'); return r ? [ort(h, s), ueber(r).map((c) => h.land(c)).join(', '), h.eur(r.summen.vignetten, 2), h.eur(r.summen.mautGeprueft, 2), zelle(h, r), h.eur(r.summen.sprit, 2), h.eur(r.summen.gesamt, 2)] : [ort(h, s), '–', '–', '–', '–', '–', '–']; });
      const ziele = ['bozen', 'gardasee', 'venedig', 'lignano', 'rimini', 'florenz', 'rom'];
      const rowsZ = ziele.map((z) => { const r = go('muenchen', z); return r ? [ort(h, z), `${h.num(r.route.km)} km`, h.eur(r.summen.mautGeprueft, 2), zelle(h, r), h.eur(r.summen.gesamt, 2)] : [ort(h, z), '–', '–', '–', '–']; });
      const name: Record<Fz, string> = { pkw: 'Car', wohnmobil: 'Motorhome', gespann: 'Car with caravan', motorrad: 'Motorcycle' };
      const rowsF = (['pkw', 'wohnmobil', 'gespann', 'motorrad'] as Fz[]).map((f) => { const r = go('muenchen', 'rimini', f); return r ? [name[f], h.eur(r.summen.vignetten, 2), h.eur(r.summen.mautGeprueft, 2), h.eur(r.summen.mautSchaetzung, 2), h.eur(r.summen.gesamt, 2)] : [name[f], '–', '–', '–', '–']; });
      return `<h2>To Rimini from six cities</h2>
${h.table(['Start', 'via', 'Vignettes', 'Tolls (read)', 'Italian tolls (estimate)', 'Fuel', 'Total'], rowsS, `Car, petrol, return, leaving ${h.date(ab)}, 14-day stay`, ['l', 'l', 'r', 'r', 'r', 'r', 'r'])}
<p>The calculator picks the route with the shortest driving time. From the west and north it often runs through Switzerland, from Munich over the Brenner. “nv” means that the route includes sections whose price we have not read; they are left out of the total. If you want to avoid a country, you can exclude it in the calculator above.</p>
<h2>Destinations in Italy from Munich</h2>
${h.table(['Destination', 'Distance', 'Tolls (read)', 'Italian tolls (estimate)', 'Total'], rowsZ, 'Car, return', ['l', 'r', 'r', 'r', 'r'])}
<p>To Bolzano and Lake Garda the Italian toll stays small, because the A22 stretch is short. To Venice and the northern Adriatic, sections of other concession holders come in whose rates we have not read, such as the A4 between Brescia and Padua or Autostrade Alto Adriatico. To Florence and Rome most of the drive is on the Autostrade per l’Italia network, whose per-kilometre rates are known. The rates by class are explained on ${h.a('maut-italien', 'Italian motorway tolls')}.</p>
<h2>Vehicles compared</h2>
${h.table(['Vehicle', 'Vignettes', 'Brenner toll', 'Italian tolls (estimate)', 'Total'], rowsF, 'Munich – Rimini, return', ['l', 'r', 'r', 'r', 'r'])}
<p>In Austria every vehicle up to 3.5 tonnes pays the same Brenner toll; only the vignette is cheaper for motorcycles. In Italy the class matters: A for cars and motorcycles, B for motorhomes with a high front axle, 3 for cars towing a single-axle caravan. Details on the A13 are on ${h.a('brennermaut', 'Brenner toll')}, on the Swiss annual vignette on ${h.a('vignette-schweiz', 'Swiss vignette')}.</p>`;
    },
  },
  nl: {
    slug: 'tol-naar-italie',
    nav: 'Tol naar Italië',
    card: 'Via Zwitserland of Oostenrijk: vignetten, trajecttol, Italiaanse tol en brandstof.',
    title: 'Tol naar Italië 2026: via Zwitserland of Oostenrijk rijden?',
    description: 'Tol naar Italië 2026: vignet voor Zwitserland of Oostenrijk, Brennertol, Italiaanse tol als schatting en brandstof, heen en terug berekend vanuit uw woonplaats.',
    h1: 'Tol naar Italië 2026: wat kost de rit naar het zuiden?',
    intro: 'Vul vertrek, bestemming, voertuig en reisdata in: de rekenhulp neemt de snelste route en telt vignetten, tol en brandstof per land op.',
    resume: (h) => {
      const r = D(h).go('utrecht', 'rimini');
      if (!r) return '';
      const via = ueber(r).map((c) => h.land(c)).join(' en ');
      return `Wie vanuit Nederland of België met de auto naar Italië rijdt, kiest meestal tussen twee wegen over de Alpen: door Zwitserland via de Gotthard of door Oostenrijk via de Brenner. Zwitserland verkoopt alleen een jaarvignet, Oostenrijk vignetten voor één dag, tien dagen of twee maanden plus trajecttol op de Brenner. In Italië betaalt u per gereden kilometer; omdat de officiële afstanden tussen tolstations niet vrij gepubliceerd zijn, schatten wij dat deel met de kilometertarieven van de beheerders. Voor een rit van Utrecht naar Rimini (${h.num(r.route.km)} km) kiest de rekenhulp de route via ${via}. Met vertrek op ${h.date(h.M.addDays(h.today, 7))} en terugreis veertien dagen later kost dat ${h.eur(r.summen.vignetten, 2)} aan vignetten, ${h.eur(r.summen.mautGeprueft, 2)} aan gelezen tol en naar schatting ${h.eur(r.summen.mautSchaetzung, 2)} aan Italiaanse tol, heen en terug. Met brandstof tegen het landelijke gemiddelde (${h.eur(r.summen.sprit, 2)}) komt u op ongeveer ${h.eur(r.summen.gesamt, 2)}.`;
    },
    faqs: (h) => {
      const { go } = D(h);
      const u = go('utrecht', 'rimini');
      const ua = go('utrecht', 'rimini', 'pkw', ['CH']);
      const b = go('bruessel', 'gardasee');
      return [
        { q: 'Is rijden via Zwitserland goedkoper dan via Oostenrijk vanuit Utrecht?', a: u && ua ? `Volgens onze berekening kost Utrecht–Rimini heen en terug ${h.eur(u.summen.gesamt, 2)} via ${ueber(u).map((c) => h.land(c)).join(' en ')} en ${h.eur(ua.summen.gesamt, 2)} als u Zwitserland vermijdt, over ${h.num(ua.route.km)} in plaats van ${h.num(u.route.km)} km.${ueber(u).includes('CH') ? ` Het Zwitserse vignet kost ${h.eur(vig(u, 'CH'), 2)} en geldt een heel jaar; via de Gotthard vervalt wel de Brennertol.` : ''} Bij het vermijden van een land kan een deel van de tol niet geverifieerd zijn.` : '' },
        { q: 'Waarom ontbreken bij sommige routes naar Italië tolbedragen?', a: b ? `Omdat een deel van de trajecten van beheerders is waarvan wij het tarief niet konden lezen, zoals Sanef in Noord-Frankrijk of enkele Italiaanse concessies. ${b.offen.length ? `Op Brussel–Gardameer liggen ${b.offen.length} zulke trajecten.` : ''} De rekenhulp toont ze als “niet geverifieerd” zonder bedrag en telt ze niet mee, zodat het totaal geen verzonnen getal bevat.` : '' },
        { q: 'Hoe schat de rekenhulp de Italiaanse tol?', a: 'Hij vermenigvuldigt het kilometertarief van de beheerder, inclusief btw, met de afstand volgens OpenStreetMap en rondt af op 10 cent, zoals in Italië. De beheerders publiceren de tarieven, maar niet de officiële afstanden tussen de tolstations, en hun eigen rekentools zijn deels beveiligd met een captcha. Het bedrag staat daarom apart als schatting.' },
      ].filter((x) => x.a);
    },
    body: (h) => {
      const { go, ab } = D(h);
      const starts = ['amsterdam', 'utrecht', 'rotterdam', 'eindhoven', 'antwerpen', 'bruessel'];
      const rowsS = starts.map((s) => { const r = go(s, 'rimini'); return r ? [ort(h, s), ueber(r).map((c) => h.land(c)).join(', '), h.eur(r.summen.vignetten, 2), h.eur(r.summen.mautGeprueft, 2), zelle(h, r), h.eur(r.summen.sprit, 2), h.eur(r.summen.gesamt, 2)] : [ort(h, s), '–', '–', '–', '–', '–', '–']; });
      const ziele = ['gardasee', 'venedig', 'rimini', 'florenz', 'rom'];
      const rowsZ = ziele.map((z) => { const r = go('utrecht', z); return r ? [ort(h, z), `${h.num(r.route.km)} km`, h.eur(r.summen.vignetten, 2), zelle(h, r), h.eur(r.summen.gesamt, 2)] : [ort(h, z), '–', '–', '–', '–']; });
      return `<h2>Vanuit Nederland en België naar Rimini</h2>
${h.table(['Vertrek', 'via', 'Vignetten', 'Tol (gelezen)', 'Tol Italië (schatting)', 'Brandstof', 'Totaal'], rowsS, `Auto, Euro 95, heen en terug, vertrek ${h.date(ab)}, 14 dagen verblijf`, ['l', 'l', 'r', 'r', 'r', 'r', 'r'])}
<p>De rekenhulp kiest de route met de kortste rijtijd. Vanuit België loopt die soms door Luxemburg en Frankrijk, waar een deel van de snelwegen van Sanef is; die tarieven hebben wij niet gelezen. “nv” in de tabel betekent dat er zulke niet-geverifieerde trajecten op de route liggen; ze zitten niet in het totaal. Wilt u een land vermijden, dan kunt u het in de rekenhulp hierboven uitsluiten.</p>
<h2>Bestemmingen in Italië vanuit Utrecht</h2>
${h.table(['Bestemming', 'Afstand', 'Vignetten', 'Tol Italië (schatting)', 'Totaal'], rowsZ, 'Auto, heen en terug', ['l', 'r', 'r', 'r', 'r'])}
<p>Naar het Gardameer en Venetië liggen op de route trajecten van Italiaanse concessiehouders waarvan wij het tarief niet hebben gelezen. Naar Florence en Rome rijdt u grotendeels op het net van Autostrade per l’Italia, waarvan de kilometertarieven bekend zijn. Hoe de Italiaanse klassen werken staat op ${h.a('maut-italien', 'tol Italië')}, het Zwitserse jaarvignet op ${h.a('vignette-schweiz', 'vignet Zwitserland')} en het Oostenrijkse op ${h.a('vignette-oesterreich', 'vignet Oostenrijk')}.</p>
<h2>Camper en caravan</h2>
<p>In Zwitserland heeft een caravan of aanhanger een eigen vignet nodig, in Oostenrijk niet. Een camper tot 3,5 ton rijdt in beide landen met hetzelfde vignet als een auto. In Italië valt een camper met hoge vooras in klasse B en een auto met eenassige caravan in klasse 3, met een duidelijk hoger kilometertarief. Vul in de rekenhulp uw eigen voertuig in om het verschil te zien; brandstofprijzen langs de route vergelijkt ${h.a('benzineprijs-duitsland', 'benzineprijs Duitsland')}.</p>`;
    },
  },
});
