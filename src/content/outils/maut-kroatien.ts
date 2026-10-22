import { defineGuide, type Helpers } from '../../lib/guide-types';

type Fz = 'pkw' | 'wohnmobil' | 'gespann' | 'motorrad';
type Paar = { von: string; bis: string; preis: Record<Fz, number | null> };
/** Maut Kroatien : Gruppen I, II, IA ; HAC, Bregana, Rupa, AZM, BINA-Istra ; Krk-Brücke frei. */
function D(h: Helpers) {
  const fahrt = (von: string, nach: string, fz: Fz) => {
    const r = h.M.route(von, nach);
    const p = r ? h.M.maut(r.schritte, fz) : [];
    return { km: r?.km ?? 0, s: h.M.mautSumme(p) };
  };
  const split = { pkw: fahrt('b_obrezje', 'split', 'pkw'), ii: fahrt('b_obrezje', 'split', 'gespann'), ia: fahrt('b_obrezje', 'split', 'motorrad') };
  const hac = Object.values(h.P.systeme.hac.paare) as Paar[];
  const bina = Object.values(h.P.systeme.bina.paare) as Paar[];
  const B = h.P.barrieren;
  const strecken: Array<[string, string]> = [['b_obrezje', 'rijeka'], ['b_obrezje', 'zadar'], ['b_obrezje', 'split'], ['b_gruskovje', 'split'], ['b_obrezje', 'makarska'], ['b_dragonja', 'pula']];
  return { fahrt, split, hac, bina, B, strecken };
}
const ort = (h: Helpers, id: string) => h.M.KNOTEN[id].n[h.lang];

export default defineGuide({
  id: 'maut-kroatien',
  group: 'maut',
  order: 22,
  tool: 'maut',
  laender: ['HR', 'SI'],
  von: 'b_obrezje',
  nach: 'split',
  related: ['maut-nach-kroatien', 'vignette-slowenien', 'spritpreise-kroatien', 'karawankentunnel', 'vignette-ungarn'],
  sources: ['hacA1', 'hacBregana', 'hacRupa', 'azm', 'bina'],
  de: {
    slug: 'maut-kroatien',
    nav: 'Maut Kroatien',
    card: 'Preislisten von HAC, AZM und BINA-Istra: Gruppen I, II und IA, Strecken bis Split und Pula.',
    title: 'Maut Kroatien 2026: Preise bis Split, Zadar und Istrien',
    description: 'Maut Kroatien 2026: Preise der HAC, AZM und BINA-Istra je Strecke, Gruppe I für Pkw, II für Wohnmobil und Gespann, IA fürs Motorrad, bis Split und Pula.',
    h1: 'Maut Kroatien 2026: was kostet die Autobahn bis ans Meer?',
    intro: 'Grenzübergang und Ziel wählen: der Rechner nimmt die Preise aus den Listen der kroatischen Betreiber und addiert Mautstellen und Abschnitte.',
    resume: (h) => {
      const { split, B } = D(h);
      return `Kroatien hat keine Vignette: Die Autobahnmaut wird je Abschnitt bezahlt, nach Ein- und Ausfahrt oder an offenen Mautstellen. Es gibt mehrere Betreiber. Die staatliche Hrvatske autoceste (HAC) betreibt die A1 von Zagreb nach Split und die A6 nach Rijeka sowie die Grenzmautstellen Bregana und Rupa, die Autocesta Zagreb–Macelj die A2 von der Grenze bei Macelj nach Zagreb, die BINA-Istra das Istrische Ypsilon. Der Preis hängt von der Gruppe ab: Gruppe I für Pkw bis 1,90 Meter Höhe, Gruppe II für höhere Fahrzeuge bis 3,5 Tonnen wie Wohnmobile und für jedes Fahrzeug mit Anhänger, Gruppe IA für Motorräder. Vom Grenzübergang Obrežje über Bregana und Zagreb bis Split (${h.num(split.pkw.km)} km) zahlt ein Pkw ${h.eur(split.pkw.s.geprueft, 2)}, ein Gespann oder Wohnmobil ${h.eur(split.ii.s.geprueft, 2)} und ein Motorrad ${h.eur(split.ia.s.geprueft, 2)}, davon ${h.eur(B.bregana.preis.pkw, 2)} an der Mautstelle Bregana. Die Brücke zur Insel Krk und die Küstenstraße von Split nach Makarska sind in unserem Netz mautfrei.`;
    },
    faqs: (h) => {
      const { split, hac } = D(h);
      const zs = hac.find((x) => x.bis.startsWith('Split'))!;
      return [
        { q: 'In welche Mautgruppe fällt ein Pkw mit Wohnwagen in Kroatien?', a: `In die Gruppe II, und zwar unabhängig von Höhe und Achszahl des Anhängers: Die HAC ordnet jedes Fahrzeug der Gruppen I und IA, das einen Anhänger zieht, der Gruppe II zu. Von Zagreb bis Split kostet das ${h.eur(zs.preis.gespann ?? 0, 2)} statt ${h.eur(zs.preis.pkw ?? 0, 2)}. Auch ein kleiner Gepäckanhänger hebt den Pkw also in die höhere Gruppe, anders als in Frankreich.` },
        { q: 'Braucht man für Kroatien eine Vignette?', a: `Nein. Kroatien rechnet nach gefahrener Strecke ab. Wer aber aus Deutschland, den Niederlanden oder Belgien anreist, durchquert fast immer Slowenien und Österreich und braucht dort Vignetten. Die Mautstellen an der Grenze, etwa Bregana, gehören schon zum kroatischen System. Für die ganze Anfahrt bis Split rechnet der Rechner oben in Kroatien mit ${h.eur(split.pkw.s.geprueft, 2)} für den Pkw.` },
        { q: 'Kostet die Brücke auf die Insel Krk Maut?', a: 'Nein, die Krk-Brücke ist in unserem Netz ohne Maut erfasst. Wer von Rijeka auf die Insel fährt, zahlt also nur die Autobahn bis Rijeka. Für Fähren zu anderen Inseln gelten eigene Fahrpreise der Reedereien, die diese Seite nicht rechnet. Auf dem Istrischen Ypsilon dagegen zahlt man je Abschnitt an die BINA-Istra, auch durch den Učka-Tunnel.' },
        { q: 'Wie teuer ist die Fahrt mit dem Motorrad bis Split?', a: `Motorräder fahren in Kroatien in der günstigsten Gruppe IA. Ab Obrežje über Bregana und Zagreb bis Split sind es ${h.eur(split.ia.s.geprueft, 2)} einfache Fahrt, gegenüber ${h.eur(split.pkw.s.geprueft, 2)} für den Pkw. Hin und zurück verdoppelt sich der Betrag. Dazu kommen auf der Anreise die Vignetten in Slowenien und Österreich, die für Motorräder ebenfalls günstiger sind.` },
      ];
    },
    body: (h) => {
      const { hac, bina, B, fahrt, strecken } = D(h);
      const z = (x: number | null) => (x == null ? '–' : h.eur(x, 2));
      const liste = [
        ...hac.map((x) => [`A1/A6 ${x.von} – ${x.bis}`, 'HAC', z(x.preis.pkw), z(x.preis.gespann), z(x.preis.motorrad)]),
        [B.bregana.name.de, 'HAC', z(B.bregana.preis.pkw), z(B.bregana.preis.gespann), z(B.bregana.preis.motorrad)],
        [B.rupa.name.de, 'HAC', z(B.rupa.preis.pkw), z(B.rupa.preis.gespann), z(B.rupa.preis.motorrad)],
        [B.macelj.name.de, 'AZM', z(B.macelj.preis.pkw), z(B.macelj.preis.gespann), z(B.macelj.preis.motorrad)],
        ...bina.map((x) => [`${x.von} – ${x.bis}`, 'BINA-Istra', z(x.preis.pkw), z(x.preis.gespann), z(x.preis.motorrad)]),
      ];
      const rows = strecken.map(([a, b]) => { const p = fahrt(a, b, 'pkw'), g = fahrt(a, b, 'gespann'); return [`${ort(h, a)} – ${ort(h, b)}`, `${h.num(p.km)} km`, h.eur(p.s.geprueft, 2), h.eur(g.s.geprueft, 2)]; });
      return `<h2>Gelesene Preise</h2>
${h.table(['Abschnitt', 'Betreiber', 'Gruppe I', 'Gruppe II', 'Gruppe IA'], liste, 'Einfache Fahrt, Euro, gültig beim Lesen', ['l', 'l', 'r', 'r', 'r'])}
<p>Quellen: ${h.src('hacA1')}, ${h.src('hacBregana')}, ${h.src('hacRupa')}, ${h.src('azm')} und ${h.src('bina')}, gelesen am ${h.date(h.P.retrieved_at)}. Die HAC nennt auf ihren Preislisten kein eigenes Datum, nur den rechtlichen Rahmen der Euro-Einführung. Die BINA-Istra gewährt mit ihrem elektronischen Mautgerät einen Nachlass; der Rechner zeigt den normalen Preis.</p>
<h2>Typische Anfahrten</h2>
${h.table(['Strecke', 'Länge', 'Pkw', 'Gespann, Wohnmobil'], rows, 'Einfache Fahrt, nur kroatische Maut', ['l', 'r', 'r', 'r'])}
<p>Die Route über Gruškovje und Macelj ist teurer als über Obrežje, weil die A2 der AZM bis Zagreb mehr kostet als die Mautstelle Bregana. Wer nach Makarska weiterfährt, zahlt ab Split nichts mehr: Der Rechner fährt dort die Küstenstraße ohne Maut. Für Istrien zählt nur der Abschnitt der BINA-Istra, die Küste von Umag bis Poreč und Rovinj ist in unserem Netz mautfrei.</p>
<h2>Gruppen und Fahrzeuge</h2>
<p>Gruppe I sind zweiachsige Fahrzeuge bis 1,90 Meter Höhe. Gruppe II umfasst zweiachsige Fahrzeuge über 1,90 Meter bis 3,5 Tonnen, also Wohnmobile und hohe Kastenwagen, sowie jedes Fahrzeug der Gruppen I oder IA mit Anhänger. Gruppe IA sind Motorräder, Dreiräder und Quads. Für eine Umstellung auf schrankenlose Maut oder für Sommerzuschläge haben wir keine amtliche Angabe gelesen; der Rechner nutzt die beim Lesen veröffentlichten Listen. Die Anreise durch Slowenien steht unter ${h.a('vignette-slowenien', 'Vignette Slowenien')}, die ganze Fahrt ab Deutschland unter ${h.a('maut-nach-kroatien', 'Maut nach Kroatien')}.</p>`;
    },
  },
  en: {
    slug: 'croatia-tolls',
    nav: 'Croatia tolls',
    card: 'HAC, AZM and BINA-Istra price lists: groups I, II and IA, routes to Split and Pula.',
    title: 'Croatian motorway tolls 2026: Split, Zadar and Istria',
    description: 'Croatian motorway tolls 2026: HAC, AZM and BINA-Istra prices per route, group I for cars, II for motorhomes and caravans, IA for motorbikes, to Split.',
    h1: 'Croatian motorway tolls 2026: what does the drive to the sea cost?',
    intro: 'Choose the border crossing and your destination: the calculator takes prices from the Croatian operators’ lists and adds up toll plazas and sections.',
    resume: (h) => {
      const { split, B } = D(h);
      return `Croatia has no vignette: motorway tolls are paid per section, by entry and exit or at open toll plazas. There are several operators. State-owned Hrvatske autoceste (HAC) runs the A1 from Zagreb to Split, the A6 to Rijeka and the border toll plazas at Bregana and Rupa; Autocesta Zagreb–Macelj runs the A2 from the border at Macelj to Zagreb; BINA-Istra runs the Istrian Y. The price depends on the group: group I for cars up to 1.90 metres high, group II for taller vehicles up to 3.5 tonnes such as motorhomes and for any vehicle towing a trailer, group IA for motorcycles. From the Obrežje border crossing via Bregana and Zagreb to Split (${h.num(split.pkw.km)} km) a car pays ${h.eur(split.pkw.s.geprueft, 2)}, a car with caravan or a motorhome ${h.eur(split.ii.s.geprueft, 2)} and a motorcycle ${h.eur(split.ia.s.geprueft, 2)}, of which ${h.eur(B.bregana.preis.pkw, 2)} at the Bregana toll plaza. The bridge to the island of Krk and the coast road from Split to Makarska are toll-free in our network.`;
    },
    faqs: (h) => {
      const { split, hac } = D(h);
      const zs = hac.find((x) => x.bis.startsWith('Split'))!;
      return [
        { q: 'Which toll group is a car with a caravan in Croatia?', a: `Group II, whatever the trailer’s height or number of axles: HAC places every group I or IA vehicle that tows a trailer in group II. From Zagreb to Split that costs ${h.eur(zs.preis.gespann ?? 0, 2)} instead of ${h.eur(zs.preis.pkw ?? 0, 2)}. Even a small luggage trailer therefore moves a car into the higher group, unlike in France.` },
        { q: 'Do you need a vignette for Croatia?', a: `No. Croatia charges by distance driven. But if you come from Germany, the Netherlands or Belgium, you almost always cross Slovenia and Austria and need vignettes there. The toll plazas at the border, such as Bregana, are already part of the Croatian system. For the whole approach to Split, the calculator above counts ${h.eur(split.pkw.s.geprueft, 2)} in Croatia for a car.` },
        { q: 'Is there a toll on the bridge to the island of Krk?', a: 'No, the Krk bridge is recorded without a toll in our network. Driving from Rijeka onto the island, you only pay the motorway as far as Rijeka. Ferries to other islands have their own fares set by the shipping lines, which this site does not calculate. On the Istrian Y, by contrast, you pay BINA-Istra per section, including through the Učka tunnel.' },
        { q: 'How much is the ride to Split on a motorcycle?', a: `Motorcycles travel in Croatia’s cheapest group, IA. From Obrežje via Bregana and Zagreb to Split it is ${h.eur(split.ia.s.geprueft, 2)} one way, against ${h.eur(split.pkw.s.geprueft, 2)} for a car. A return trip doubles the amount. On the way there you also need the Slovenian and Austrian vignettes, which are cheaper for motorcycles too.` },
      ];
    },
    body: (h) => {
      const { hac, bina, B, fahrt, strecken } = D(h);
      const z = (x: number | null) => (x == null ? '–' : h.eur(x, 2));
      const liste = [
        ...hac.map((x) => [`A1/A6 ${x.von} – ${x.bis}`, 'HAC', z(x.preis.pkw), z(x.preis.gespann), z(x.preis.motorrad)]),
        [B.bregana.name.en, 'HAC', z(B.bregana.preis.pkw), z(B.bregana.preis.gespann), z(B.bregana.preis.motorrad)],
        [B.rupa.name.en, 'HAC', z(B.rupa.preis.pkw), z(B.rupa.preis.gespann), z(B.rupa.preis.motorrad)],
        [B.macelj.name.en, 'AZM', z(B.macelj.preis.pkw), z(B.macelj.preis.gespann), z(B.macelj.preis.motorrad)],
        ...bina.map((x) => [`${x.von} – ${x.bis}`, 'BINA-Istra', z(x.preis.pkw), z(x.preis.gespann), z(x.preis.motorrad)]),
      ];
      const rows = strecken.map(([a, b]) => { const p = fahrt(a, b, 'pkw'), g = fahrt(a, b, 'gespann'); return [`${ort(h, a)} – ${ort(h, b)}`, `${h.num(p.km)} km`, h.eur(p.s.geprueft, 2), h.eur(g.s.geprueft, 2)]; });
      return `<h2>Prices read</h2>
${h.table(['Section', 'Operator', 'Group I', 'Group II', 'Group IA'], liste, 'One way, euros, valid when read', ['l', 'l', 'r', 'r', 'r'])}
<p>Sources: ${h.src('hacA1')}, ${h.src('hacBregana')}, ${h.src('hacRupa')}, ${h.src('azm')} and ${h.src('bina')}, read on ${h.date(h.P.retrieved_at)}. HAC gives no date of its own on its price lists, only the legal framework of the euro changeover. BINA-Istra grants a discount with its electronic toll device; the calculator shows the standard price.</p>
<h2>Typical approaches</h2>
${h.table(['Route', 'Distance', 'Car', 'Caravan, motorhome'], rows, 'One way, Croatian tolls only', ['l', 'r', 'r', 'r'])}
<p>The route via Gruškovje and Macelj is dearer than via Obrežje, because AZM’s A2 into Zagreb costs more than the Bregana toll plaza. If you continue to Makarska you pay nothing beyond Split: the calculator takes the toll-free coast road there. For Istria only the BINA-Istra section counts; the coast from Umag to Poreč and Rovinj is toll-free in our network.</p>
<h2>Groups and vehicles</h2>
<p>Group I is two-axle vehicles up to 1.90 metres high. Group II covers two-axle vehicles above 1.90 metres and up to 3.5 tonnes, which means motorhomes and high vans, and any group I or IA vehicle with a trailer. Group IA is motorcycles, tricycles and quads. We have read no official statement on a switch to barrier-free tolling or on summer surcharges; the calculator uses the lists published when we read them. The approach through Slovenia is on ${h.a('vignette-slowenien', 'Slovenian vignette')}, the whole trip from Germany on ${h.a('maut-nach-kroatien', 'tolls to Croatia')}.</p>`;
    },
  },
  nl: {
    slug: 'tol-kroatie',
    nav: 'Tol Kroatië',
    card: 'Prijslijsten van HAC, AZM en BINA-Istra: groepen I, II en IA, routes naar Split en Pula.',
    title: 'Tol Kroatië 2026: prijzen tot Split, Zadar en Istrië',
    description: 'Tol Kroatië 2026: prijzen van HAC, AZM en BINA-Istra per traject, groep I voor de auto, II voor camper en caravan, IA voor de motor, tot Split en Pula.',
    h1: 'Tol Kroatië 2026: wat kost de snelweg naar zee?',
    intro: 'Kies grensovergang en bestemming: de rekenhulp neemt de prijzen uit de lijsten van de Kroatische exploitanten en telt tolposten en trajecten op.',
    resume: (h) => {
      const { split, B } = D(h);
      return `Kroatië heeft geen vignet: de snelwegtol betaalt u per traject, volgens op- en afrit of bij open tolposten. Er zijn meerdere exploitanten. Het staatsbedrijf Hrvatske autoceste (HAC) beheert de A1 van Zagreb naar Split, de A6 naar Rijeka en de grenstolposten Bregana en Rupa; Autocesta Zagreb–Macelj beheert de A2 van de grens bij Macelj naar Zagreb; BINA-Istra de Istrische Y. De prijs hangt af van de groep: groep I voor auto’s tot 1,90 meter hoog, groep II voor hogere voertuigen tot 3,5 ton zoals campers en voor elk voertuig met aanhanger, groep IA voor motoren. Van grensovergang Obrežje via Bregana en Zagreb tot Split (${h.num(split.pkw.km)} km) betaalt een auto ${h.eur(split.pkw.s.geprueft, 2)}, een auto met caravan of een camper ${h.eur(split.ii.s.geprueft, 2)} en een motor ${h.eur(split.ia.s.geprueft, 2)}, waarvan ${h.eur(B.bregana.preis.pkw, 2)} bij de tolpost Bregana. De brug naar het eiland Krk en de kustweg van Split naar Makarska zijn in ons netwerk tolvrij.`;
    },
    faqs: (h) => {
      const { split, hac } = D(h);
      const zs = hac.find((x) => x.bis.startsWith('Split'))!;
      return [
        { q: 'In welke tolgroep valt een auto met caravan in Kroatië?', a: `In groep II, ongeacht hoogte of aantal assen van de aanhanger: HAC deelt elk voertuig van groep I of IA dat een aanhanger trekt in bij groep II in. Van Zagreb tot Split kost dat ${h.eur(zs.preis.gespann ?? 0, 2)} in plaats van ${h.eur(zs.preis.pkw ?? 0, 2)}. Ook een kleine bagageaanhanger brengt de auto dus in de hogere groep, anders dan in Frankrijk.` },
        { q: 'Heb je voor Kroatië een vignet nodig?', a: `Nee. Kroatië rekent af per gereden traject. Wie uit Nederland, België of Duitsland komt, doorkruist echter bijna altijd Slovenië en Oostenrijk en heeft daar vignetten nodig. De tolposten aan de grens, zoals Bregana, horen al bij het Kroatische systeem. Voor de hele aanrit tot Split rekent de rekenhulp hierboven in Kroatië ${h.eur(split.pkw.s.geprueft, 2)} voor een auto.` },
        { q: 'Kost de brug naar het eiland Krk tol?', a: 'Nee, de Krk-brug staat in ons netwerk zonder tol. Wie van Rijeka het eiland op rijdt, betaalt dus alleen de snelweg tot Rijeka. Veerboten naar andere eilanden hebben eigen tarieven van de rederijen, die deze site niet rekent. Op de Istrische Y betaalt u daarentegen per traject aan BINA-Istra, ook door de Učkatunnel.' },
        { q: 'Hoe duur is de rit naar Split met de motor?', a: `Motoren rijden in Kroatië in de goedkoopste groep, IA. Vanaf Obrežje via Bregana en Zagreb tot Split is het ${h.eur(split.ia.s.geprueft, 2)} enkele reis, tegenover ${h.eur(split.pkw.s.geprueft, 2)} voor een auto. Heen en terug verdubbelt het bedrag. Onderweg hebt u ook de vignetten van Slovenië en Oostenrijk nodig, die voor motoren eveneens goedkoper zijn.` },
      ];
    },
    body: (h) => {
      const { hac, bina, B, fahrt, strecken } = D(h);
      const z = (x: number | null) => (x == null ? '–' : h.eur(x, 2));
      const liste = [
        ...hac.map((x) => [`A1/A6 ${x.von} – ${x.bis}`, 'HAC', z(x.preis.pkw), z(x.preis.gespann), z(x.preis.motorrad)]),
        [B.bregana.name.nl, 'HAC', z(B.bregana.preis.pkw), z(B.bregana.preis.gespann), z(B.bregana.preis.motorrad)],
        [B.rupa.name.nl, 'HAC', z(B.rupa.preis.pkw), z(B.rupa.preis.gespann), z(B.rupa.preis.motorrad)],
        [B.macelj.name.nl, 'AZM', z(B.macelj.preis.pkw), z(B.macelj.preis.gespann), z(B.macelj.preis.motorrad)],
        ...bina.map((x) => [`${x.von} – ${x.bis}`, 'BINA-Istra', z(x.preis.pkw), z(x.preis.gespann), z(x.preis.motorrad)]),
      ];
      const rows = strecken.map(([a, b]) => { const p = fahrt(a, b, 'pkw'), g = fahrt(a, b, 'gespann'); return [`${ort(h, a)} – ${ort(h, b)}`, `${h.num(p.km)} km`, h.eur(p.s.geprueft, 2), h.eur(g.s.geprueft, 2)]; });
      return `<h2>Gelezen prijzen</h2>
${h.table(['Traject', 'Exploitant', 'Groep I', 'Groep II', 'Groep IA'], liste, 'Enkele reis, euro, geldig bij het lezen', ['l', 'l', 'r', 'r', 'r'])}
<p>Bronnen: ${h.src('hacA1')}, ${h.src('hacBregana')}, ${h.src('hacRupa')}, ${h.src('azm')} en ${h.src('bina')}, gelezen op ${h.date(h.P.retrieved_at)}. HAC vermeldt op zijn prijslijsten geen eigen datum, alleen het wettelijke kader van de overgang naar de euro. BINA-Istra geeft korting met haar elektronische tolkastje; de rekenhulp toont de gewone prijs.</p>
<h2>Gangbare aanritten</h2>
${h.table(['Route', 'Afstand', 'Auto', 'Caravan, camper'], rows, 'Enkele reis, alleen Kroatische tol', ['l', 'r', 'r', 'r'])}
<p>De route via Gruškovje en Macelj is duurder dan via Obrežje, omdat de A2 van AZM tot Zagreb meer kost dan de tolpost Bregana. Wie doorrijdt naar Makarska, betaalt na Split niets meer: de rekenhulp neemt daar de tolvrije kustweg. Voor Istrië telt alleen het traject van BINA-Istra; de kust van Umag tot Poreč en Rovinj is in ons netwerk tolvrij.</p>
<h2>Groepen en voertuigen</h2>
<p>Groep I zijn tweeassige voertuigen tot 1,90 meter hoog. Groep II omvat tweeassige voertuigen boven 1,90 meter en tot 3,5 ton, dus campers en hoge bestelbussen, en elk voertuig van groep I of IA met aanhanger. Groep IA zijn motoren, driewielers en quads. Over een overstap op tol zonder slagbomen of over zomertoeslagen hebben wij geen officiële mededeling gelezen; de rekenhulp gebruikt de lijsten die bij het lezen gepubliceerd waren. De aanrit door Slovenië staat op ${h.a('vignette-slowenien', 'vignet Slovenië')}, de hele rit vanuit Nederland op ${h.a('maut-nach-kroatien', 'tol naar Kroatië')}.</p>`;
    },
  },
});
