import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Karawankentunnel-Maut : A11/A2 zwischen Villach und Jesenice, 9 € je Richtung (ASFINAG nach Süden, DARS in Hrušica nach Norden). */
function D(h: Helpers) {
  const K = h.P.streckenmaut.karawanken;
  const r = h.M.route('villach', 'ljubljana');
  const at = r ? r.laender.filter((x) => x.c === 'AT').reduce((a, x) => a + x.km, 0) : 0;
  const si = r ? r.laender.filter((x) => x.c === 'SI').reduce((a, x) => a + x.km, 0) : 0;
  const ab = h.M.addDays(h.today, 7);
  const tage = h.M.fahrtage(ab, 14, true, false);
  const vAT = h.M.vignette('AT', 'pkw', tage);
  const vSI = h.M.vignette('SI', 'pkw', tage);
  const SI = Object.fromEntries(h.P.vignetten.SI.produkte['2A'].map((p) => [p.id, p.preis])) as Record<string, number>;
  const reise = h.M.reise({ start: 'muenchen', ziel: 'ljubljana', fz: 'pkw', sorte: 'e95', verbrauch: h.P.verbrauch_vorgabe.pkw, ab, dauer: 14, hinUndZurueck: true, aufenthalt: false });
  return { K, r, at, si, vAT, vSI, SI, reise, ab };
}

export default defineGuide({
  id: 'karawankentunnel',
  group: 'maut',
  order: 27,
  tool: 'maut',
  laender: ['AT', 'SI'],
  von: 'villach',
  nach: 'ljubljana',
  related: ['vignette-slowenien', 'tauerntunnel', 'maut-oesterreich', 'maut-kroatien', 'spritpreise-slowenien'],
  sources: ['asfinagStrecke', 'darsKarawanken', 'darsValidity', 'asfinagVignette'],
  de: {
    slug: 'karawankentunnel-maut',
    nav: 'Karawankentunnel',
    card: 'A11 nach Slowenien: Preis je Richtung, wer kassiert und wo die Vignetten gelten.',
    title: 'Karawankentunnel Maut 2026: Preis je Richtung, Vignetten',
    description: 'Karawankentunnel Maut 2026: was der Tunnel zwischen Villach und Jesenice je Richtung kostet, wer kassiert und warum keine der beiden Vignetten darin gilt.',
    h1: 'Karawankentunnel Maut 2026: was kostet der Weg nach Slowenien?',
    intro: 'Von Villach bis Ljubljana: der Rechner zeigt die Tunnelmaut; die Vignetten für Österreich und Slowenien rechnet der Reiserechner dazu.',
    resume: (h) => {
      const { K, at, si, vAT, vSI } = D(h);
      return `Der Karawankentunnel verbindet die österreichische A11 bei Villach mit der slowenischen A2 bei Jesenice und ist der kürzeste Autobahnweg von Kärnten nach Ljubljana und weiter nach Kroatien. Für den Tunnel gilt weder die österreichische noch die slowenische Vignette: Er ist ein eigener Mautabschnitt. Eine Durchfahrt kostet 2026 ${h.eur(K.preis.pkw, 2)} je Richtung. Nach Süden kassiert die ASFINAG, die für Pkw, Wohnmobil bis 3,5 Tonnen und Motorrad denselben Preis verlangt und Anhänger nicht berechnet. Nach Norden zahlt man laut der slowenischen Autobahngesellschaft DARS an der Mautstelle Hrušica ebenfalls ${h.eur(K.dars_hrusica, 2)}. Auf der Strecke von Villach nach Ljubljana fährt man ${h.num(at)} km in Österreich und ${h.num(si)} km in Slowenien; auf beiden Seiten des Tunnels gilt die jeweilige Vignettenpflicht. Für eine Hin- und Rückfahrt mit vierzehn Tagen Pause kostet die günstigste österreichische Vignette derzeit ${h.eur(vAT.summeEur, 2)}, die slowenische ${h.eur(vSI.summeEur, 2)}, dazu zweimal die Tunnelmaut.`;
    },
    faqs: (h) => {
      const { K, SI } = D(h);
      return [
        { q: 'Gilt die slowenische E-Vignette im Karawankentunnel?', a: `Nein. Die DARS schreibt ausdrücklich, dass die E-Vignette im Tunnel nicht gilt und dass die Tunnelmaut von ${h.eur(K.dars_hrusica, 2)} an der Mautstelle Hrušica bezahlt wird. Auch das kurze Stück der A2 von Hrušica bis zur Grenze ist durch die Tunnelmaut abgedeckt. Die slowenische Vignette, etwa die Wochenvignette für ${h.eur(SI['7t'], 2)}, brauchen Sie erst für die Autobahn dahinter.` },
        { q: 'Zahlt man den Karawankentunnel bei Hin- und Rückfahrt zweimal?', a: `Ja. Jede Durchfahrt kostet ${h.eur(K.preis.pkw, 2)}, eine Rückfahrkarte gibt es nicht. Für eine Urlaubsreise nach Slowenien oder Kroatien und zurück sind es also ${h.eur(2 * K.preis.pkw, 2)}. Für Pendler bietet die ASFINAG eine Monatskarte für 14 Fahrten in 30 Tagen zu ${h.eur(K.monatskarte_14, 2)} an; für einen Urlaub lohnt sie sich nicht.` },
        { q: 'Ist die Route über den Karawankentunnel günstiger als über Spielfeld?', a: 'Das hängt vom Ziel ab. Für Ljubljana, Istrien und die Kvarner-Bucht ist der Tunnel der direkte Weg. Für Zagreb und Dalmatien führen beide Routen durch Slowenien; über Graz und Spielfeld fällt statt der Karawanken- und der Tauernmaut eventuell die Pyhrnmaut an. Unser Rechner wählt die schnellste Strecke im Netz und nennt alle Mautposten darauf einzeln, sodass Sie sehen, welche Tunnel anfallen.' },
      ];
    },
    body: (h) => {
      const { K, reise, ab } = D(h);
      const rows = reise ? [
        ['Vignette Österreich', h.eur(reise.vignetten.find((v) => v.land === 'AT')?.summeEur ?? 0, 2)],
        ['Vignette Slowenien', h.eur(reise.vignetten.find((v) => v.land === 'SI')?.summeEur ?? 0, 2)],
        ['Streckenmaut (Tauern, Karawanken), hin und zurück', h.eur(reise.summen.mautGeprueft, 2)],
        ['Sprit, hin und zurück', h.eur(reise.summen.sprit, 2)],
        ['Summe', h.eur(reise.summen.gesamt, 2)],
      ] : [];
      return `<h2>Wer kassiert in welcher Richtung?</h2>
${h.table(['Richtung', 'Betreiber', 'Pkw bis 3,5 t'], [['Österreich → Slowenien', 'ASFINAG (A11)', h.eur(K.preis.pkw, 2)], ['Slowenien → Österreich', 'DARS (Mautstelle Hrušica)', h.eur(K.dars_hrusica, 2)]], 'Eine Durchfahrt', ['l', 'l', 'r'])}
<p>Quellen: ${h.src('asfinagStrecke')}, ${h.src('darsKarawanken')} und ${h.src('darsValidity')}, gelesen am ${h.date(h.P.retrieved_at)}. Die DARS nennt den Preis für ihre Klasse R1, also Fahrzeuge bis 3,5 Tonnen; einen eigenen Motorradpreis für die Richtung Norden haben wir dort nicht gelesen. Der Rechner setzt für beide Richtungen den Tarif der ASFINAG an, der für alle Fahrzeuge bis 3,5 Tonnen gleich ist.</p>
<h2>Beispiel: München – Ljubljana und zurück</h2>
${h.table(['Posten', 'Pkw'], rows, `Abfahrt ${h.date(ab)}, Rückfahrt 14 Tage später, Route über Tauern und Karawanken`, ['l', 'r'])}
<p>Die Streckenmaut in dieser Rechnung enthält zweimal die Tauernautobahn und zweimal den Karawankentunnel. Die Sprit-Zeile nutzt die Landesdurchschnitte des Weekly Oil Bulletin; in welchem Land der Tank am günstigsten zu füllen ist, sagt ${h.a('spritpreise-slowenien', 'Spritpreise Slowenien')}.</p>
<h2>Vor und hinter dem Tunnel</h2>
<p>Auf österreichischer Seite ist die A11 von Villach bis zum Tunnelportal vignettenpflichtig; Laufzeiten und Preise stehen unter ${h.a('vignette-oesterreich', 'Vignette Österreich')}. In Slowenien beginnt die Vignettenpflicht hinter Hrušica; welche Klasse Ihr Fahrzeug hat und welche Laufzeit genügt, erklärt ${h.a('vignette-slowenien', 'Vignette Slowenien')}. Wer weiter nach Kroatien fährt, findet die Preise der Abschnitte bis Rijeka und Split unter ${h.a('maut-kroatien', 'Maut Kroatien')}.</p>`;
    },
  },
  en: {
    slug: 'karawanken-tunnel-toll',
    nav: 'Karawanken tunnel',
    card: 'A11 into Slovenia: price per direction, who collects it and where the vignettes apply.',
    title: 'Karawanken tunnel toll 2026: price each way and vignettes',
    description: 'Karawanken tunnel toll 2026: what the tunnel between Villach and Jesenice costs each way, who collects it and why neither country’s vignette is valid inside.',
    h1: 'Karawanken tunnel toll 2026: what does the way into Slovenia cost?',
    intro: 'From Villach to Ljubljana: the calculator shows the tunnel toll; the trip calculator adds the Austrian and Slovenian vignettes.',
    resume: (h) => {
      const { K, at, si, vAT, vSI } = D(h);
      return `The Karawanken tunnel links the Austrian A11 near Villach with the Slovenian A2 near Jesenice and is the shortest motorway route from Carinthia to Ljubljana and on to Croatia. Neither the Austrian nor the Slovenian vignette is valid in the tunnel: it is a toll section of its own. In 2026 a passage costs ${h.eur(K.preis.pkw, 2)} each way. Southbound, ASFINAG collects the toll, charging the same for cars, motorhomes up to 3.5 tonnes and motorcycles and nothing for trailers. Northbound, according to the Slovenian motorway company DARS, you also pay ${h.eur(K.dars_hrusica, 2)}, at the Hrušica toll plaza. From Villach to Ljubljana you drive ${h.num(at)} km in Austria and ${h.num(si)} km in Slovenia, and each country’s vignette requirement applies on its side of the tunnel. For a return trip with a fourteen-day stay, the cheapest Austrian vignette currently costs ${h.eur(vAT.summeEur, 2)} and the Slovenian one ${h.eur(vSI.summeEur, 2)}, plus the tunnel toll twice.`;
    },
    faqs: (h) => {
      const { K, SI } = D(h);
      return [
        { q: 'Is the Slovenian e-vignette valid in the Karawanken tunnel?', a: `No. DARS states explicitly that the e-vignette is not valid in the tunnel and that the tunnel toll of ${h.eur(K.dars_hrusica, 2)} is paid at the Hrušica toll plaza. The short stretch of the A2 from Hrušica to the border is also covered by the tunnel toll. You only need the Slovenian vignette, such as the weekly one for ${h.eur(SI['7t'], 2)}, for the motorway beyond.` },
        { q: 'Do you pay the Karawanken tunnel twice on a return trip?', a: `Yes. Each passage costs ${h.eur(K.preis.pkw, 2)}, and there is no return ticket. A holiday trip to Slovenia or Croatia and back therefore costs ${h.eur(2 * K.preis.pkw, 2)} in tunnel tolls. For commuters, ASFINAG offers a monthly card for 14 trips within 30 days at ${h.eur(K.monatskarte_14, 2)}; it is not worth it for a holiday.` },
        { q: 'Is the Karawanken route cheaper than going via Spielfeld?', a: 'It depends on where you are going. For Ljubljana, Istria and the Kvarner Gulf, the tunnel is the direct route. For Zagreb and Dalmatia both routes cross Slovenia; via Graz and Spielfeld you may pay the Pyhrn toll instead of the Karawanken and Tauern tolls. Our calculator picks the fastest route in its network and lists every toll item on it separately, so you can see which tunnels apply.' },
      ];
    },
    body: (h) => {
      const { K, reise, ab } = D(h);
      const rows = reise ? [
        ['Austrian vignette', h.eur(reise.vignetten.find((v) => v.land === 'AT')?.summeEur ?? 0, 2)],
        ['Slovenian vignette', h.eur(reise.vignetten.find((v) => v.land === 'SI')?.summeEur ?? 0, 2)],
        ['Section tolls (Tauern, Karawanken), return', h.eur(reise.summen.mautGeprueft, 2)],
        ['Fuel, return', h.eur(reise.summen.sprit, 2)],
        ['Total', h.eur(reise.summen.gesamt, 2)],
      ] : [];
      return `<h2>Who collects in which direction?</h2>
${h.table(['Direction', 'Operator', 'Car up to 3.5 t'], [['Austria → Slovenia', 'ASFINAG (A11)', h.eur(K.preis.pkw, 2)], ['Slovenia → Austria', 'DARS (Hrušica toll plaza)', h.eur(K.dars_hrusica, 2)]], 'One passage', ['l', 'l', 'r'])}
<p>Sources: ${h.src('asfinagStrecke')}, ${h.src('darsKarawanken')} and ${h.src('darsValidity')}, read on ${h.date(h.P.retrieved_at)}. DARS gives the price for its class R1, vehicles up to 3.5 tonnes; we did not find a separate motorcycle price for the northbound direction there. The calculator applies the ASFINAG tariff, which is the same for all vehicles up to 3.5 tonnes, in both directions.</p>
<h2>Example: Munich to Ljubljana and back</h2>
${h.table(['Item', 'Car'], rows, `Leaving ${h.date(ab)}, returning 14 days later, via the Tauern and Karawanken`, ['l', 'r'])}
<p>The section tolls in this sum include the Tauern motorway twice and the Karawanken tunnel twice. The fuel line uses the national averages from the Weekly Oil Bulletin; which country is cheapest for filling up is on ${h.a('spritpreise-slowenien', 'fuel prices in Slovenia')}.</p>
<h2>Before and after the tunnel</h2>
<p>On the Austrian side, the A11 from Villach to the tunnel portal requires a vignette; durations and prices are on ${h.a('vignette-oesterreich', 'Austrian vignette')}. In Slovenia the vignette requirement begins after Hrušica; which class your vehicle is in and which duration is enough is explained on ${h.a('vignette-slowenien', 'Slovenian vignette')}. If you continue to Croatia, the prices of the sections to Rijeka and Split are on ${h.a('maut-kroatien', 'Croatian motorway tolls')}.</p>`;
    },
  },
});
