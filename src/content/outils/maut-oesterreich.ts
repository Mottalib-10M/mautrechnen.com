import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Maut Österreich : Vignette plus Streckenmaut (A9, A10, A11, A13, S16), Felbertauern und Großglockner. */
function D(h: Helpers) {
  const S = h.P.streckenmaut;
  const T = h.P.tunnel;
  const kfz = Object.fromEntries(h.P.vignetten.AT.produkte.kfz.map((p) => [p.id, p.preis])) as Record<string, number>;
  const fahrt = (von: string, nach: string) => {
    const r = h.M.route(von, nach);
    return { km: r?.km ?? 0, s: r ? h.M.mautSumme(h.M.maut(r.schritte, 'pkw')).geprueft : 0 };
  };
  const sued = fahrt('b_walserberg', 'b_karawanken');
  const brenner = fahrt('b_kiefersfelden', 'b_brenner');
  const ab = h.M.addDays(h.today, 7);
  const v = h.M.vignette('AT', 'pkw', h.M.fahrtage(ab, 14, true, false));
  const strecken = ['brenner', 'tauern', 'karawanken', 'pyhrn', 'arlberg'] as const;
  return { S, T, kfz, fahrt, sued, brenner, v, strecken };
}
const ort = (h: Helpers, id: string) => h.M.KNOTEN[id].n[h.lang];

export default defineGuide({
  id: 'maut-oesterreich',
  group: 'maut',
  order: 24,
  tool: 'maut',
  laender: ['AT', 'DE'],
  von: 'b_walserberg',
  nach: 'b_karawanken',
  related: ['vignette-oesterreich', 'brennermaut', 'tauerntunnel', 'karawankentunnel', 'spritpreise-oesterreich', 'digitale-vignette'],
  sources: ['asfinagStrecke', 'asfinagMautordnung', 'asfinagVignette', 'felbertauern', 'grossglockner'],
  de: {
    slug: 'maut-oesterreich',
    nav: 'Maut Österreich',
    card: 'Vignette und Streckenmaut zusammen: Brenner, Tauern, Karawanken, Pyhrn, Arlberg.',
    title: 'Maut Österreich 2026: Vignette und Streckenmaut zusammen',
    description: 'Maut Österreich 2026: Vignette plus Streckenmaut für Brenner, Tauern, Karawanken, Pyhrn und Arlberg, Felbertauern und Großglockner, je Richtung berechnet.',
    h1: 'Maut Österreich 2026: was kostet die Durchfahrt wirklich?',
    intro: 'Einfahrt und Ausfahrt wählen: der Rechner addiert die Streckenmaut der ASFINAG auf Ihrem Weg; die Vignette rechnet er auf der Seite zur Vignette und im Reiserechner.',
    resume: (h) => {
      const { S, sued, v } = D(h);
      return `Wer durch Österreich fährt, zahlt oft zweimal: die Vignette für das Autobahnnetz und zusätzlich die Streckenmaut auf fünf Alpenstrecken der ASFINAG. 2026 kostet eine einfache Fahrt mit dem Pkw auf der A13 über den Brenner ${h.eur(S.brenner.preis.pkw, 2)}, auf der A10 durch Tauern- und Katschbergtunnel ${h.eur(S.tauern.preis.pkw, 2)}, durch den Karawankentunnel der A11 ${h.eur(S.karawanken.preis.pkw, 2)}, auf der A9 durch Bosruck- und Gleinalmtunnel zusammen ${h.eur(S.pyhrn.preis.pkw, 2)} und durch den Arlberg-Straßentunnel ${h.eur(S.arlberg.preis.pkw, 2)}. Jede Einzelfahrt gilt für eine Richtung; hin und zurück zahlt man also doppelt. Das Motorrad zahlt denselben Betrag, ein Wohnwagen oder Anhänger nichts zusätzlich. Auf der klassischen Route nach Kroatien vom Walserberg bis zum Karawankentunnel (${h.num(sued.km)} km) fallen so ${h.eur(sued.s, 2)} Streckenmaut je Richtung an. Für eine Hin- und Rückfahrt mit vierzehn Tagen Pause kommt die günstigste Vignette dazu, derzeit ${h.eur(v.summeEur, 2)}.`;
    },
    faqs: (h) => {
      const { S, T, kfz, sued } = D(h);
      return [
        { q: 'Gibt es für die Streckenmaut eine Hin- und Rückfahrkarte?', a: `Nein. Die ASFINAG verkauft Einzelfahrten, die je eine Durchfahrt in einer Richtung erlauben und ein Jahr gültig sind, sowie Mehrfahrtenkarten für Vielfahrer. Für die Tauernautobahn kostet die Mehrfahrtenkarte ${h.eur(S.tauern.mehrfahrtenkarte, 2)}, für den Brenner ${h.eur(S.brenner.mehrfahrtenkarte, 2)}. Für eine einzige Urlaubsreise lohnt sie sich nicht: zwei Einzelfahrten über die Tauern kosten ${h.eur(2 * S.tauern.preis.pkw, 2)}.` },
        { q: 'Muss ich die Streckenmaut zusätzlich zur Vignette zahlen?', a: `Ja, beide Abgaben stehen nebeneinander. Auf dem eigentlichen Mautabschnitt gilt keine Vignettenpflicht, aber die Autobahn davor und danach ist vignettenpflichtig. Wer vom Walserberg zum Karawankentunnel fährt, braucht deshalb eine Vignette, zum Beispiel für ${h.eur(kfz['10t'], 2)} für zehn Tage, und zahlt ${h.eur(sued.s, 2)} Streckenmaut. Nur die A13 von Innsbruck bis zum Brenner ist ganz Mautabschnitt.` },
        { q: 'Wie teuer sind Felbertauernstraße und Großglockner-Hochalpenstraße?', a: `Beide gehören nicht der ASFINAG und brauchen keine Vignette. Die Felbertauernstraße kostet eine einfache Fahrt ${h.eur(T.felbertauern.einfach.pkw, 2)} für Pkw und Wohnmobil und ${h.eur(T.felbertauern.einfach.motorrad, 2)} für das Motorrad. Die Großglockner-Hochalpenstraße verkauft eine Tageskarte für ${h.eur(T.grossglockner.tageskarte.pkw, 2)}, ab dem ${h.date(T.grossglockner.herbst_ab)} gilt bis zur Wintersperre ein Herbsttarif von ${h.eur(T.grossglockner.herbst.pkw, 2)}.` },
        { q: 'Was gilt für Wohnmobile über 3,5 Tonnen in Österreich?', a: 'Fahrzeuge über 3,5 Tonnen zulässige Gesamtmasse brauchen keine Vignette, sondern zahlen die fahrleistungsabhängige GO-Maut mit einer GO-Box an der Scheibe, auch auf den Streckenmaut-Abschnitten. Diese Tarife hängen von Achszahl und Emissionsklasse ab und sind nicht in unserem Rechner enthalten. Für schwere Wohnmobile zeigt die Seite deshalb keinen Betrag; maßgeblich ist die Mautordnung der ASFINAG.' },
      ];
    },
    body: (h) => {
      const { S, strecken, fahrt } = D(h);
      const rows = strecken.map((k) => [S[k].name.de, h.eur(S[k].preis.pkw, 2), h.eur(2 * S[k].preis.pkw, 2), 'mehrfahrtenkarte' in S[k] ? h.eur((S[k] as { mehrfahrtenkarte: number }).mehrfahrtenkarte, 2) : '–']);
      const wege: Array<[string, string]> = [['b_walserberg', 'villach'], ['b_walserberg', 'b_karawanken'], ['b_kiefersfelden', 'b_brenner'], ['linz', 'graz'], ['landeck', 'bregenz'], ['b_suben', 'b_spielfeld']];
      const w = wege.map(([a, b]) => { const f = fahrt(a, b); return [`${ort(h, a)} – ${ort(h, b)}`, `${h.num(f.km)} km`, h.eur(f.s, 2)]; });
      return `<h2>Die fünf Streckenmaut-Abschnitte 2026</h2>
${h.table(['Abschnitt', 'Einzelfahrt', 'hin und zurück', 'Mehrfahrtenkarte'], rows, 'Pkw, Wohnmobil bis 3,5 t und Motorrad zahlen gleich', ['l', 'r', 'r', 'r'])}
<p>Quelle: ${h.src('asfinagStrecke')} und ${h.src('asfinagMautordnung')}, gelesen am ${h.date(h.P.retrieved_at)}. Auf der A10 gibt es eine Teilstrecke für ${h.eur(S.tauern.teilstrecke, 2)}, wenn man nur einen der beiden Tunnel durchfährt; auf der A13 kosten Teilstrecken zwischen ${h.eur(Math.min(...S.brenner.teilstrecken), 2)} und ${h.eur(Math.max(...S.brenner.teilstrecken), 2)}. Für die Pyhrnautobahn verkauft die ASFINAG Bosruck (${h.eur(S.pyhrn.teile.bosruck, 2)}) und Gleinalm (${h.eur(S.pyhrn.teile.gleinalm, 2)}) einzeln.</p>
<h2>Was typische Durchfahrten kosten</h2>
${h.table(['Strecke', 'Länge', 'Streckenmaut Pkw'], w, 'Einfache Fahrt, ohne Vignette', ['l', 'r', 'r'])}
<p>Die Fahrt von Suben über Linz und den Pyhrn nach Spielfeld ist die Route vieler Urlauber nach Slowenien und Kroatien, die Salzburg meiden wollen; sie kostet durch zwei Tunnel mehr Streckenmaut als die Tauernroute. Welche Variante insgesamt günstiger ist, hängt auch von Sprit und Vignetten in den Nachbarländern ab: das rechnet ${h.a('maut-nach-kroatien', 'Maut nach Kroatien')} für die ganze Fahrt.</p>
<h2>Vignette, Streckenmaut, Sondermautstraßen</h2>
<p>Österreich hat drei Arten von Straßengebühren. Die zeitabhängige Vignette gilt auf allen Autobahnen und Schnellstraßen außer den Streckenmaut-Abschnitten; Laufzeiten und die billigste Wahl für Ihre Daten zeigt ${h.a('vignette-oesterreich', 'Vignette Österreich')}. Die Streckenmaut wird je Durchfahrt und Richtung verkauft, nach dem Tarif der Mautordnung, und gilt gleich für alle Fahrzeuge bis 3,5 Tonnen. Dazu kommen private oder landeseigene Panoramastraßen wie Felbertauern (${h.src('felbertauern')}) und Großglockner (${h.src('grossglockner')}) mit eigenen Preisen. Einzelheiten zum Brenner und zu den beiden Tunneln im Süden stehen unter ${h.a('brennermaut', 'Brennermaut')}, ${h.a('tauerntunnel', 'Tauerntunnel')} und ${h.a('karawankentunnel', 'Karawankentunnel')}.</p>`;
    },
  },
  en: {
    slug: 'austria-tolls',
    nav: 'Austria tolls',
    card: 'Vignette and section tolls together: Brenner, Tauern, Karawanken, Pyhrn, Arlberg.',
    title: 'Motorway tolls in Austria 2026: vignette and section tolls',
    description: 'Austrian motorway tolls 2026: the vignette plus section tolls on the Brenner, Tauern, Karawanken, Pyhrn and Arlberg, with Felbertauern and Grossglockner.',
    h1: 'Austrian motorway tolls 2026: what does crossing really cost?',
    intro: 'Choose entry and exit: the calculator adds up ASFINAG section tolls on your way; the vignette is worked out on the vignette page and in the trip calculator.',
    resume: (h) => {
      const { S, sued, v } = D(h);
      return `Driving through Austria, you often pay twice: the vignette for the motorway network and, on top, the section toll (Streckenmaut) on five Alpine routes run by ASFINAG. In 2026 a single car trip costs ${h.eur(S.brenner.preis.pkw, 2)} on the A13 over the Brenner, ${h.eur(S.tauern.preis.pkw, 2)} on the A10 through the Tauern and Katschberg tunnels, ${h.eur(S.karawanken.preis.pkw, 2)} through the Karawanken tunnel on the A11, ${h.eur(S.pyhrn.preis.pkw, 2)} in total on the A9 through the Bosruck and Gleinalm tunnels and ${h.eur(S.arlberg.preis.pkw, 2)} through the Arlberg road tunnel. Each single trip covers one direction, so a return journey costs double. Motorcycles pay the same amount, and a caravan or trailer pays nothing extra. On the classic route to Croatia, from Walserberg to the Karawanken tunnel (${h.num(sued.km)} km), that comes to ${h.eur(sued.s, 2)} in section tolls each way. For a return trip with a fourteen-day stay, add the cheapest vignette, currently ${h.eur(v.summeEur, 2)}.`;
    },
    faqs: (h) => {
      const { S, T, kfz, sued } = D(h);
      return [
        { q: 'Is there a return ticket for Austrian section tolls?', a: `No. ASFINAG sells single trips, each valid for one passage in one direction for a year, and multi-trip cards for frequent users. The Tauern motorway multi-trip card costs ${h.eur(S.tauern.mehrfahrtenkarte, 2)}, the Brenner one ${h.eur(S.brenner.mehrfahrtenkarte, 2)}. For a single holiday it does not pay off: two single Tauern trips cost ${h.eur(2 * S.tauern.preis.pkw, 2)}.` },
        { q: 'Do I pay the section toll on top of the vignette?', a: `Yes, the two charges sit side by side. No vignette is needed on the toll section itself, but the motorway before and after it requires one. Driving from Walserberg to the Karawanken tunnel, you therefore need a vignette, for example ${h.eur(kfz['10t'], 2)} for ten days, and pay ${h.eur(sued.s, 2)} in section tolls. Only the A13 from Innsbruck to the Brenner is a toll section along its whole length.` },
        { q: 'How much do the Felbertauern and Grossglockner roads cost?', a: `Neither belongs to ASFINAG, and neither needs a vignette. The Felbertauern road costs ${h.eur(T.felbertauern.einfach.pkw, 2)} one way for a car or motorhome and ${h.eur(T.felbertauern.einfach.motorrad, 2)} for a motorcycle. The Grossglockner High Alpine Road sells a day ticket for ${h.eur(T.grossglockner.tageskarte.pkw, 2)}; from ${h.date(T.grossglockner.herbst_ab)} until the winter closure an autumn rate of ${h.eur(T.grossglockner.herbst.pkw, 2)} applies.` },
        { q: 'What applies to motorhomes over 3.5 tonnes in Austria?', a: 'Vehicles over 3.5 tonnes maximum permitted weight need no vignette; they pay the distance-based GO toll with a GO-Box on the windscreen, on the section-toll routes too. Those rates depend on axles and emission class and are not part of our calculator. For heavy motorhomes the page therefore shows no amount; the ASFINAG toll regulations are what counts.' },
      ];
    },
    body: (h) => {
      const { S, strecken, fahrt } = D(h);
      const rows = strecken.map((k) => [S[k].name.en, h.eur(S[k].preis.pkw, 2), h.eur(2 * S[k].preis.pkw, 2), 'mehrfahrtenkarte' in S[k] ? h.eur((S[k] as { mehrfahrtenkarte: number }).mehrfahrtenkarte, 2) : '–']);
      const wege: Array<[string, string]> = [['b_walserberg', 'villach'], ['b_walserberg', 'b_karawanken'], ['b_kiefersfelden', 'b_brenner'], ['linz', 'graz'], ['landeck', 'bregenz'], ['b_suben', 'b_spielfeld']];
      const w = wege.map(([a, b]) => { const f = fahrt(a, b); return [`${ort(h, a)} – ${ort(h, b)}`, `${h.num(f.km)} km`, h.eur(f.s, 2)]; });
      return `<h2>The five section-toll routes in 2026</h2>
${h.table(['Section', 'Single trip', 'Return', 'Multi-trip card'], rows, 'Cars, motorhomes up to 3.5 t and motorcycles pay the same', ['l', 'r', 'r', 'r'])}
<p>Source: ${h.src('asfinagStrecke')} and ${h.src('asfinagMautordnung')}, read on ${h.date(h.P.retrieved_at)}. On the A10 there is a partial-route fare of ${h.eur(S.tauern.teilstrecke, 2)} if you only pass one of the two tunnels; on the A13, partial routes cost between ${h.eur(Math.min(...S.brenner.teilstrecken), 2)} and ${h.eur(Math.max(...S.brenner.teilstrecken), 2)}. On the Pyhrn motorway ASFINAG sells Bosruck (${h.eur(S.pyhrn.teile.bosruck, 2)}) and Gleinalm (${h.eur(S.pyhrn.teile.gleinalm, 2)}) separately.</p>
<h2>What typical crossings cost</h2>
${h.table(['Route', 'Distance', 'Section toll, car'], w, 'One way, without vignette', ['l', 'r', 'r'])}
<p>The drive from Suben via Linz and the Pyhrn to Spielfeld is the route many holidaymakers take to Slovenia and Croatia when they want to avoid Salzburg; with two tunnels it costs more in section tolls than the Tauern route. Which option is cheaper overall also depends on fuel and vignettes in the neighbouring countries: ${h.a('maut-nach-kroatien', 'tolls to Croatia')} works that out for the whole journey.</p>
<h2>Vignette, section toll, special toll roads</h2>
<p>Austria has three kinds of road charge. The time-based vignette covers all motorways and expressways except the section-toll routes; durations and the cheapest choice for your dates are on ${h.a('vignette-oesterreich', 'Austrian vignette')}. The section toll is sold per passage and direction under the toll regulations and is the same for every vehicle up to 3.5 tonnes. Then there are private or regionally owned scenic roads such as the Felbertauern (${h.src('felbertauern')}) and the Grossglockner (${h.src('grossglockner')}) with prices of their own. Details on the Brenner and the two southern tunnels are on ${h.a('brennermaut', 'Brenner toll')}, ${h.a('tauerntunnel', 'Tauern tunnel toll')} and ${h.a('karawankentunnel', 'Karawanken tunnel toll')}.</p>`;
    },
  },
});
