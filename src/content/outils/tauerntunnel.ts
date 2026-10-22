import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Tauerntunnel-Maut : A10 Tauernautobahn (Tauern- und Katschbergtunnel), Vignette davor und danach, Felbertauern als Alternative. */
function D(h: Helpers) {
  const S = h.P.streckenmaut.tauern;
  const K = h.P.streckenmaut.karawanken;
  const F = h.P.tunnel.felbertauern;
  const r = h.M.route('b_walserberg', 'villach');
  const sb = h.M.route('salzburg', 'villach');
  const ab = h.M.addDays(h.today, 7);
  const reise = h.M.reise({ start: 'muenchen', ziel: 'villach', fz: 'pkw', sorte: 'e95', verbrauch: h.P.verbrauch_vorgabe.pkw, ab, dauer: 14, hinUndZurueck: true, aufenthalt: false });
  const v = h.M.vignette('AT', 'pkw', h.M.fahrtage(ab, 14, true, false));
  return { S, K, F, r, sb, reise, v };
}

export default defineGuide({
  id: 'tauerntunnel',
  group: 'maut',
  order: 26,
  tool: 'maut',
  laender: ['AT', 'DE'],
  von: 'b_walserberg',
  nach: 'villach',
  related: ['maut-oesterreich', 'karawankentunnel', 'vignette-oesterreich', 'maut-nach-kroatien', 'spritpreise-oesterreich'],
  sources: ['asfinagStrecke', 'asfinagMautordnung', 'asfinagVignette', 'felbertauern'],
  de: {
    slug: 'tauerntunnel-maut',
    nav: 'Tauerntunnel',
    card: 'A10 Tauernautobahn: Preis je Richtung, Teilstrecke und Vignette davor und danach.',
    title: 'Tauerntunnel Maut 2026: A10 je Richtung und Vignette',
    description: 'Tauerntunnel Maut 2026: was die A10 durch Tauern- und Katschbergtunnel je Richtung kostet, wann die Teilstrecke reicht und wo vorher die Vignette nötig ist.',
    h1: 'Tauerntunnel Maut 2026: was kostet die A10 nach Kärnten?',
    intro: 'Vom Walserberg bis Villach: der Rechner zeigt die Streckenmaut der Tauernautobahn; die Vignette steht im Reiserechner.',
    resume: (h) => {
      const { S, r, sb, reise, v } = D(h);
      return `Die Tauernautobahn A10 verbindet Salzburg mit Villach und ist für viele Urlauber die Hauptroute nach Kärnten, Slowenien und Kroatien. Zwischen Flachau und Rennweg liegen der Tauerntunnel und der Katschbergtunnel; dieser Abschnitt ist eine Streckenmaut der ASFINAG. 2026 kostet die ganze Strecke ${h.eur(S.preis.pkw, 2)} je Richtung, gleich für Pkw, Wohnmobil bis 3,5 Tonnen und Motorrad, ein Anhänger zahlt nichts dazu. Wer nur einen der beiden Tunnel durchfährt, zahlt die Teilstrecke für ${h.eur(S.teilstrecke, 2)}. Vor und hinter dem Mautabschnitt gilt die Vignettenpflicht: Vom Grenzübergang Walserberg bis Salzburg ist die A1 vignettenfrei, ab dort bis Villach (${h.num(sb?.km ?? 0)} km von insgesamt ${h.num(r?.km ?? 0)} km) braucht man eine Vignette, für eine Hin- und Rückfahrt mit vierzehn Tagen Pause derzeit ${h.eur(v.summeEur, 2)}. Eine Urlaubsfahrt von München nach Villach und zurück kostet mit Vignette, Tauernmaut und Sprit insgesamt etwa ${h.eur(reise?.summen.gesamt ?? 0, 2)}.`;
    },
    faqs: (h) => {
      const { S, F, K } = D(h);
      return [
        { q: 'Wann reicht die Teilstrecke der Tauernautobahn?', a: `Wenn Sie zwischen den beiden Tunneln auf- oder abfahren und deshalb nur einen davon durchfahren. Laut Tarif der ASFINAG kostet die Fahrt ${h.eur(S.teilstrecke, 2)} statt ${h.eur(S.preis.pkw, 2)}. Wer von Salzburg nach Villach durchfährt, passiert beide Tunnel und zahlt den vollen Preis, je Richtung einmal.` },
        { q: 'Ist die Felbertauernstraße eine günstigere Alternative zum Tauerntunnel?', a: `Für die Maut allein kaum: Die Felbertauernstraße kostet ${h.eur(F.einfach.pkw, 2)} je Fahrt für Pkw und Wohnmobil, also nur wenig weniger als die A10 mit ${h.eur(S.preis.pkw, 2)}. Sie braucht keine Vignette, führt aber über Mittersill nach Lienz in Osttirol und ist für Ziele in Kärnten und Slowenien ein Umweg. Unser Rechner fährt immer die Autobahn.` },
        { q: 'Was kommt nach dem Tauerntunnel bis Slowenien noch dazu?', a: `Hinter Villach folgt der Karawankentunnel der A11, eine eigene Streckenmaut von ${h.eur(K.preis.pkw, 2)} je Richtung. Von Salzburg bis Slowenien zahlen Sie also zwei Streckenmauten, zusammen ${h.eur(S.preis.pkw + K.preis.pkw, 2)} je Richtung, plus Vignette in Österreich. In Slowenien beginnt hinter dem Tunnel die slowenische Vignettenpflicht.` },
      ];
    },
    body: (h) => {
      const { S, reise } = D(h);
      const rows = reise ? [
        ['Vignetten', h.eur(reise.summen.vignetten, 2)],
        ['Streckenmaut (hin und zurück)', h.eur(reise.summen.mautGeprueft, 2)],
        ['Sprit (hin und zurück)', h.eur(reise.summen.sprit, 2)],
        ['Summe', h.eur(reise.summen.gesamt, 2)],
      ] : [];
      return `<h2>Tarif der Tauernautobahn 2026</h2>
${h.table(['Fahrt', 'Pkw, Wohnmobil bis 3,5 t, Motorrad'], [['Gesamtstrecke, eine Richtung', h.eur(S.preis.pkw, 2)], ['Gesamtstrecke, hin und zurück', h.eur(2 * S.preis.pkw, 2)], ['Teilstrecke (ein Tunnel)', h.eur(S.teilstrecke, 2)], ['Mehrfahrtenkarte', h.eur(S.mehrfahrtenkarte, 2)]], undefined, ['l', 'r'])}
<p>Quelle: ${h.src('asfinagStrecke')} und ${h.src('asfinagMautordnung')}, gelesen am ${h.date(h.P.retrieved_at)}. Eine Einzelfahrt berechtigt zu einer Durchfahrt in einer Richtung; eine Rückfahrkarte gibt es nicht. Die Mehrfahrtenkarte richtet sich an Pendler und lohnt sich erst nach vielen Durchfahrten.</p>
<h2>Beispiel: München – Villach und zurück</h2>
${h.table(['Posten', 'Pkw'], rows, `Abfahrt ${h.date(h.M.addDays(h.today, 7))}, Rückfahrt 14 Tage später, ${h.num(h.P.verbrauch_vorgabe.pkw)} l Super auf 100 km`, ['l', 'r'])}
<p>Der Sprit ist mit dem Durchschnittspreis jedes Landes aus dem Weekly Oil Bulletin der EU-Kommission gerechnet, der jede Woche neu erscheint. Für andere Fahrzeuge, Daten oder Ziele genügt der Reiserechner auf der ${h.a('maut-nach-kroatien', 'Seite zur Fahrt nach Kroatien')}; die übrigen Alpenstrecken stehen unter ${h.a('maut-oesterreich', 'Maut Österreich')}.</p>
<h2>Ganzjahrestarif</h2>
<p>Das Tarifblatt der ASFINAG nennt für die A10 einen einzigen Preis für das ganze Jahr; einen Saisonzuschlag wie an der Costa del Sol in Spanien kennt es nicht. Ob Sie am Ferienwochenende oder im November fahren, ändert an der Maut also nichts, wohl aber an der Fahrzeit und damit am Verbrauch. Der Rechner nimmt den Verbrauch, den Sie eingeben, und die Länge der Strecke laut OpenStreetMap. Hinter Villach führt die A11 durch den ${h.a('karawankentunnel', 'Karawankentunnel')} nach Slowenien, die A2 weiter nach Italien.</p>`;
    },
  },
  en: {
    slug: 'tauern-tunnel-toll',
    nav: 'Tauern tunnel',
    card: 'A10 Tauern motorway: price per direction, partial route and the vignette either side.',
    title: 'Tauern tunnel toll 2026: A10 each way and the vignette',
    description: 'Tauern tunnel toll 2026: what the A10 through the Tauern and Katschberg tunnels costs each way, when the partial fare will do and where you need a vignette.',
    h1: 'Tauern tunnel toll 2026: what does the A10 to Carinthia cost?',
    intro: 'From Walserberg to Villach: the calculator shows the Tauern motorway section toll; the vignette is in the trip calculator.',
    resume: (h) => {
      const { S, r, sb, reise, v } = D(h);
      return `The A10 Tauern motorway links Salzburg with Villach and is the main route for many holidaymakers heading to Carinthia, Slovenia and Croatia. Between Flachau and Rennweg lie the Tauern tunnel and the Katschberg tunnel; this stretch is an ASFINAG section toll. In 2026 the full route costs ${h.eur(S.preis.pkw, 2)} each way, the same for cars, motorhomes up to 3.5 tonnes and motorcycles, and a trailer pays nothing extra. If you only go through one of the two tunnels, you pay the partial fare of ${h.eur(S.teilstrecke, 2)}. Before and after the toll section a vignette is required: the A1 from the Walserberg border crossing to Salzburg is vignette-free, but from there to Villach (${h.num(sb?.km ?? 0)} km out of ${h.num(r?.km ?? 0)} km in all) you need one, currently ${h.eur(v.summeEur, 2)} for a return trip with a fourteen-day stay. A holiday drive from Munich to Villach and back costs about ${h.eur(reise?.summen.gesamt ?? 0, 2)} in total with vignette, Tauern toll and fuel.`;
    },
    faqs: (h) => {
      const { S, F, K } = D(h);
      return [
        { q: 'When is the Tauern motorway partial fare enough?', a: `When you join or leave between the two tunnels and so only pass one of them. Under the ASFINAG tariff the trip then costs ${h.eur(S.teilstrecke, 2)} instead of ${h.eur(S.preis.pkw, 2)}. Driving straight through from Salzburg to Villach, you pass both tunnels and pay the full price once in each direction.` },
        { q: 'Is the Felbertauern road a cheaper alternative to the Tauern tunnel?', a: `Hardly, on tolls alone: the Felbertauern road costs ${h.eur(F.einfach.pkw, 2)} per trip for a car or motorhome, only a little less than the A10 at ${h.eur(S.preis.pkw, 2)}. It needs no vignette, but it runs via Mittersill to Lienz in East Tyrol and is a detour for destinations in Carinthia and Slovenia. Our calculator always takes the motorway.` },
        { q: 'What else do you pay after the Tauern tunnel on the way to Slovenia?', a: `After Villach comes the Karawanken tunnel on the A11, a separate section toll of ${h.eur(K.preis.pkw, 2)} each way. From Salzburg to Slovenia you therefore pay two section tolls, ${h.eur(S.preis.pkw + K.preis.pkw, 2)} together each way, plus the Austrian vignette. In Slovenia the Slovenian vignette requirement begins after the tunnel.` },
      ];
    },
    body: (h) => {
      const { S, reise } = D(h);
      const rows = reise ? [
        ['Vignettes', h.eur(reise.summen.vignetten, 2)],
        ['Section tolls (return)', h.eur(reise.summen.mautGeprueft, 2)],
        ['Fuel (return)', h.eur(reise.summen.sprit, 2)],
        ['Total', h.eur(reise.summen.gesamt, 2)],
      ] : [];
      return `<h2>Tauern motorway rates in 2026</h2>
${h.table(['Trip', 'Car, motorhome up to 3.5 t, motorcycle'], [['Full route, one way', h.eur(S.preis.pkw, 2)], ['Full route, return', h.eur(2 * S.preis.pkw, 2)], ['Partial route (one tunnel)', h.eur(S.teilstrecke, 2)], ['Multi-trip card', h.eur(S.mehrfahrtenkarte, 2)]], undefined, ['l', 'r'])}
<p>Source: ${h.src('asfinagStrecke')} and ${h.src('asfinagMautordnung')}, read on ${h.date(h.P.retrieved_at)}. A single trip entitles you to one passage in one direction; there is no return ticket. The multi-trip card is aimed at commuters and only pays off after many passages.</p>
<h2>Example: Munich to Villach and back</h2>
${h.table(['Item', 'Car'], rows, `Leaving ${h.date(h.M.addDays(h.today, 7))}, returning 14 days later, ${h.num(h.P.verbrauch_vorgabe.pkw)} l of petrol per 100 km`, ['l', 'r'])}
<p>Fuel is costed at each country’s average price from the European Commission’s Weekly Oil Bulletin, which is published every week. For other vehicles, dates or destinations, use the trip calculator on the ${h.a('maut-nach-kroatien', 'page on driving to Croatia')}; the other Alpine routes are on ${h.a('maut-oesterreich', 'Austrian motorway tolls')}.</p>
<h2>One rate all year</h2>
<p>The ASFINAG rate sheet gives a single price for the A10 all year round; it has no seasonal surcharge like the one on Spain’s Costa del Sol. Whether you drive on a holiday weekend or in November makes no difference to the toll, though it does to journey time and therefore to consumption. The calculator uses the consumption you enter and the route length from OpenStreetMap. After Villach the A11 runs through the ${h.a('karawankentunnel', 'Karawanken tunnel')} into Slovenia, and the A2 continues to Italy.</p>`;
    },
  },
});
