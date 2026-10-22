import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Maut Spanien : AP-7 im Norden ohne veröffentlichte Tarife mehr, Ausol und AP-6 mit Tarifblatt 2026, Anreise durch Frankreich. */
function D(h: Helpers) {
  const fahrt = (von: string, nach: string, fz: 'pkw' | 'wohnmobil' | 'gespann' | 'motorrad') => {
    const r = h.M.route(von, nach);
    const p = r ? h.M.maut(r.schritte, fz) : [];
    const s = h.M.mautSumme(p);
    const es = r ? r.laender.filter((x) => x.c === 'ES').reduce((a, x) => a + x.km, 0) : 0;
    const fr = r ? r.laender.filter((x) => x.c === 'FR').reduce((a, x) => a + x.km, 0) : 0;
    return { km: r?.km ?? 0, es, fr, s, offen: s.offen.length };
  };
  const S = h.P.spanien;
  const ap7 = fahrt('b_lejonquera', 'valencia', 'pkw');
  const lyon = { pkw: fahrt('lyon', 'b_lejonquera', 'pkw'), wm: fahrt('lyon', 'b_lejonquera', 'wohnmobil'), mo: fahrt('lyon', 'b_lejonquera', 'motorrad') };
  const ziele: Array<[string, string]> = [['b_lejonquera', 'lloret'], ['b_lejonquera', 'barcelona'], ['b_lejonquera', 'salou'], ['b_lejonquera', 'valencia'], ['lyon', 'barcelona'], ['bruessel', 'lloret'], ['koeln', 'salou'], ['amsterdam', 'valencia']];
  return { fahrt, S, ap7, lyon, ziele };
}
const ort = (h: Helpers, id: string) => h.M.KNOTEN[id].n[h.lang];

export default defineGuide({
  id: 'maut-spanien',
  group: 'maut',
  order: 23,
  tool: 'maut',
  laender: ['ES', 'FR'],
  von: 'b_lejonquera',
  nach: 'valencia',
  related: ['maut-frankreich', 'benzinpreis-frankreich', 'vignette-schweiz', 'maut-italien', 'tanken-luxemburg'],
  sources: ['ausol', 'ap6', 'asfGuide', 'vinciLiaisons'],
  de: {
    slug: 'maut-spanien',
    nav: 'Maut Spanien',
    card: 'AP-7 an der Costa Brava ohne Tarif, Costa del Sol und AP-6 mit Preisen 2026.',
    title: 'Maut Spanien 2026: AP-7, Costa del Sol und AP-6 im Überblick',
    description: 'Maut Spanien 2026: was die AP-7 von La Jonquera bis Valencia noch kostet, Preise der Ausol an der Costa del Sol und der AP-6, dazu die Anreise über Frankreich.',
    h1: 'Maut Spanien 2026: wo zahlt man noch, wo nicht mehr?',
    intro: 'Grenze und Ziel wählen: der Rechner zeigt, welche spanischen Abschnitte auf der Strecke noch Maut kosten und was Frankreich davor verlangt.',
    resume: (h) => {
      const { S, ap7, lyon } = D(h);
      return `Spanien hat keine Vignette, und auf dem Weg an die Mittelmeerküste ist die Autobahn heute zum größten Teil gebührenfrei. Die AP-7 von der französischen Grenze bei La Jonquera über Girona und Barcelona bis Tarragona und Valencia war jahrzehntelang mautpflichtig; die Konzessionen sind ausgelaufen, und der Betreiber Abertis veröffentlicht für diese Strecke 2026 keine Tarife mehr. Der Rechner fährt die ${h.num(ap7.km)} km von der Grenze bis Valencia deshalb ohne spanische Maut. Wer weiter in den Süden fährt, zahlt wieder: Die Autopista del Sol (Ausol) zwischen Málaga und Guadiaro kostet einen Pkw ${h.eur(S.ausol_normal, 2)} in der Normalsaison und ${h.eur(S.ausol_saison, 2)} in der Hochsaison, die AP-6 von Villalba nach Adanero nördlich von Madrid ${h.eur(S.ap6_villalba_adanero, 2)}. Teurer als Spanien ist meist die Anreise: Allein die französische Autobahn von Lyon bis zur Grenze kostet einen Pkw ${h.eur(lyon.pkw.s.geprueft, 2)} je Richtung.`;
    },
    faqs: (h) => {
      const { S, ap7, lyon } = D(h);
      return [
        { q: 'Ist die AP-7 von La Jonquera nach Barcelona wirklich mautfrei?', a: `Für Pkw, Wohnmobile und Motorräder rechnen wir sie so: Abertis führt die Strecke in seinen Tarifblättern 2026 nicht mehr, dort stehen nur noch AP-6, AP-51, AP-61, AP-68, AP-71 und C-32. Eine Bestätigung des Verkehrsministeriums haben wir nicht gelesen. Der Rechner zeigt für die ${h.num(ap7.km)} km bis Valencia deshalb ${h.eur(0)}, und wir prüfen die Lage bei jeder Aktualisierung neu.` },
        { q: 'Wann gilt an der Costa del Sol der teurere Saisontarif?', a: `Laut der Tarifseite der Ausol in den Monaten Juni bis September und an 17 Tagen rund um Ostern. Dann kostet die ganze Strecke Málaga–Guadiaro über die drei Hauptmautstellen Calahonda, San Pedro und Manilva ${h.eur(S.ausol_saison, 2)} statt ${h.eur(S.ausol_normal, 2)}. Der Tarif gilt für leichte Fahrzeuge, zu denen auch das Motorrad und der Pkw mit Wohnwagen ohne Zwillingsreifen gehören.` },
        { q: 'Zahlt ein Wohnmobil auf der Anreise durch Frankreich mehr?', a: `Ja, deutlich. Auf den französischen Autobahnen fallen Wohnmobile über 2 Meter Höhe in die Klasse 2. Von Lyon bis zur spanischen Grenze kostet das nach der Liste von Vinci Autoroutes ${h.eur(lyon.wm.s.geprueft, 2)} je Richtung statt ${h.eur(lyon.pkw.s.geprueft, 2)} für den Pkw; das Motorrad zahlt ${h.eur(lyon.mo.s.geprueft, 2)}. In Spanien selbst macht der Unterschied auf unserer Strecke nichts aus, weil dort keine Maut anfällt.` },
        { q: 'Gibt es Maut auf dem Weg von Madrid nach Norden?', a: `Ja, auf der AP-6 durch die Sierra de Guadarrama. Von Villalba nach Adanero kostet ein leichtes Fahrzeug nach dem Tarifblatt 2026 der Betreibergesellschaft ${h.eur(S.ap6_villalba_adanero, 2)} zum Normaltarif. Die Abzweige AP-61 nach Segovia und AP-51 nach Ávila haben eigene Preise. Diese Strecken liegen nicht in unserem Netz, der Rechner kennt sie also nicht, sie stehen nur hier zur Orientierung.` },
      ];
    },
    body: (h) => {
      const { fahrt, ziele, S } = D(h);
      const rows = ziele.map(([a, b]) => { const p = fahrt(a, b, 'pkw'), w = fahrt(a, b, 'wohnmobil'); return [`${ort(h, a)} – ${ort(h, b)}`, `${h.num(p.km)} km`, `${h.num(p.es)} km`, h.eur(p.s.geprueft, 2), h.eur(w.s.geprueft, 2)]; });
      return `<h2>Strecken an die spanische Mittelmeerküste</h2>
${h.table(['Strecke', 'Länge', 'davon Spanien', 'Maut Pkw', 'Maut Wohnmobil'], rows, 'Einfache Fahrt; Maut auf der ganzen Strecke, auch in Frankreich', ['l', 'r', 'r', 'r', 'r'])}
<p>Die ersten vier Zeilen zeigen: Ab der Grenze kostet die Küstenautobahn in unserem Netz nichts. Was die längeren Strecken teuer macht, sind die französischen Abschnitte. Wer aus Belgien oder den Niederlanden über Paris und Lyon fährt, durchquert mehrere geschlossene Mautsysteme; einige davon, vor allem im Norden, betreibt die Sanef, deren Tarife wir nicht lesen konnten. Solche Abschnitte zeigt der Rechner als „nicht verifiziert“ ohne Betrag.</p>
<h2>Was in Spanien 2026 noch kostet</h2>
${h.table(['Abschnitt', 'Normaltarif', 'Hochsaison'], [['AP-7 Ausol Málaga – Guadiaro', h.eur(S.ausol_normal, 2), h.eur(S.ausol_saison, 2)], ['AP-6 Villalba – Adanero', h.eur(S.ap6_villalba_adanero, 2), '–']], 'Leichte Fahrzeuge, einfache Fahrt', ['l', 'r', 'r'])}
<p>Quellen: ${h.src('ausol')} und ${h.src('ap6')}, gelesen am ${h.date(h.P.retrieved_at)}. Die Tarife gelten seit dem 1. Januar 2026 nach der Ministerialverordnung vom 18. Dezember 2025. Weitere mautpflichtige Strecken gibt es in Galicien (AP-9), im Ebrotal (AP-68) und südlich von Alicante; ihre Preise haben wir nicht gelesen, und sie liegen nicht auf den Urlaubsrouten, die der Rechner kennt.</p>
<h2>Fahrzeugklassen in Spanien</h2>
<p>Spanien unterscheidet nur „ligeros“ und schwere Fahrzeuge. Zu den leichten zählen Pkw, Motorräder und Pkw mit Wohnwagen, solange keine Zwillingsreifen montiert sind. Für Wohnmobile nennt die Tarifseite der Ausol keinen eigenen Betrag; wir haben ihn nicht verifiziert und zeigen ihn deshalb nicht. Das ist großzügiger als in Frankreich, wo Höhe und Anhänger die Klasse bestimmen; die Regeln dort stehen unter ${h.a('maut-frankreich', 'Maut Frankreich')}. Tankstellenpreise entlang der französischen Strecke vergleicht ${h.a('benzinpreis-frankreich', 'Benzinpreis Frankreich')}.</p>`;
    },
  },
  en: {
    slug: 'spain-tolls',
    nav: 'Spain tolls',
    card: 'AP-7 on the Costa Brava without a tariff, Costa del Sol and AP-6 with 2026 prices.',
    title: 'Motorway tolls in Spain 2026: AP-7, Costa del Sol, AP-6',
    description: 'Spanish motorway tolls 2026: what the AP-7 from La Jonquera to Valencia still costs, Ausol prices on the Costa del Sol and AP-6, plus the trip through France.',
    h1: 'Spanish motorway tolls 2026: where do you still pay?',
    intro: 'Choose the border and your destination: the calculator shows which Spanish sections on the route still charge a toll and what France asks before them.',
    resume: (h) => {
      const { S, ap7, lyon } = D(h);
      return `Spain has no vignette, and on the way to the Mediterranean coast the motorway is now mostly free. The AP-7 from the French border at La Jonquera through Girona and Barcelona to Tarragona and Valencia was tolled for decades; the concessions have ended, and the operator Abertis publishes no tariff for this road in 2026. The calculator therefore drives the ${h.num(ap7.km)} km from the border to Valencia without any Spanish toll. Head further south and you pay again: the Autopista del Sol (Ausol) between Málaga and Guadiaro costs a car ${h.eur(S.ausol_normal, 2)} in the normal season and ${h.eur(S.ausol_saison, 2)} in high season, and the AP-6 from Villalba to Adanero north of Madrid costs ${h.eur(S.ap6_villalba_adanero, 2)}. The approach is usually dearer than Spain itself: the French motorway from Lyon to the border alone costs a car ${h.eur(lyon.pkw.s.geprueft, 2)} each way.`;
    },
    faqs: (h) => {
      const { S, ap7, lyon } = D(h);
      return [
        { q: 'Is the AP-7 from La Jonquera to Barcelona really toll-free?', a: `For cars, motorhomes and motorcycles we treat it that way: Abertis no longer lists the road in its 2026 rate sheets, which only show the AP-6, AP-51, AP-61, AP-68, AP-71 and C-32. We have not read a confirmation from the transport ministry. The calculator therefore shows ${h.eur(0)} for the ${h.num(ap7.km)} km to Valencia, and we check the position again at every update.` },
        { q: 'When does the higher seasonal rate apply on the Costa del Sol?', a: `According to the Ausol rates page, from June to September and on 17 days around Easter. The whole Málaga to Guadiaro stretch through the three main toll plazas of Calahonda, San Pedro and Manilva then costs ${h.eur(S.ausol_saison, 2)} instead of ${h.eur(S.ausol_normal, 2)}. The rate applies to light vehicles, which include motorcycles and cars towing a caravan without twin tyres.` },
        { q: 'Does a motorhome pay more on the way through France?', a: `Yes, considerably. On French motorways, motorhomes over 2 metres high fall into class 2. From Lyon to the Spanish border that costs ${h.eur(lyon.wm.s.geprueft, 2)} each way on the Vinci Autoroutes list, against ${h.eur(lyon.pkw.s.geprueft, 2)} for a car; a motorcycle pays ${h.eur(lyon.mo.s.geprueft, 2)}. In Spain itself the difference does not matter on our route, because no toll is charged there.` },
        { q: 'Is there a toll on the way north out of Madrid?', a: `Yes, on the AP-6 through the Sierra de Guadarrama. From Villalba to Adanero a light vehicle pays ${h.eur(S.ap6_villalba_adanero, 2)} at the normal rate, according to the operator’s 2026 rate sheet. The AP-61 branch to Segovia and the AP-51 to Ávila have prices of their own. These roads are not in our network, so the calculator does not know them; they appear here for reference only.` },
      ];
    },
    body: (h) => {
      const { fahrt, ziele, S } = D(h);
      const rows = ziele.map(([a, b]) => { const p = fahrt(a, b, 'pkw'), w = fahrt(a, b, 'wohnmobil'); return [`${ort(h, a)} – ${ort(h, b)}`, `${h.num(p.km)} km`, `${h.num(p.es)} km`, h.eur(p.s.geprueft, 2), h.eur(w.s.geprueft, 2)]; });
      return `<h2>Routes to the Spanish Mediterranean coast</h2>
${h.table(['Route', 'Distance', 'of which Spain', 'Toll, car', 'Toll, motorhome'], rows, 'One way; tolls on the whole route, including France', ['l', 'r', 'r', 'r', 'r'])}
<p>The first four rows show that from the border the coastal motorway costs nothing in our network. What makes the longer routes expensive is France. Driving from Belgium or the Netherlands via Paris and Lyon, you cross several closed toll systems; some of them, mainly in the north, are run by Sanef, whose rates we could not read. The calculator shows such sections as “not verified”, without an amount.</p>
<h2>What still costs money in Spain in 2026</h2>
${h.table(['Section', 'Normal rate', 'High season'], [['AP-7 Ausol Málaga – Guadiaro', h.eur(S.ausol_normal, 2), h.eur(S.ausol_saison, 2)], ['AP-6 Villalba – Adanero', h.eur(S.ap6_villalba_adanero, 2), '–']], 'Light vehicles, one way', ['l', 'r', 'r'])}
<p>Sources: ${h.src('ausol')} and ${h.src('ap6')}, read on ${h.date(h.P.retrieved_at)}. The rates have applied since 1 January 2026 under the ministerial order of 18 December 2025. Other tolled roads exist in Galicia (AP-9), the Ebro valley (AP-68) and south of Alicante; we have not read their prices, and they are not on the holiday routes the calculator knows.</p>
<h2>Vehicle classes in Spain</h2>
<p>Spain only distinguishes “ligeros” from heavy vehicles. Light vehicles include cars, motorcycles and cars with a caravan, as long as there are no twin tyres. The Ausol rates page gives no separate amount for motorhomes; we have not verified one and therefore do not show it. That is more generous than France, where height and trailers set the class; the rules there are on ${h.a('maut-frankreich', 'French motorway tolls')}. Pump prices along the French stretch are compared on ${h.a('benzinpreis-frankreich', 'fuel prices in France')}.</p>`;
    },
  },
  nl: {
    slug: 'tol-spanje',
    nav: 'Tol Spanje',
    card: 'AP-7 aan de Costa Brava zonder tarief, Costa del Sol en AP-6 met prijzen 2026.',
    title: 'Tol Spanje 2026: AP-7, Costa del Sol en AP-6 op een rij',
    description: 'Tol Spanje 2026: wat de AP-7 van La Jonquera tot Valencia nog kost, de prijzen van Ausol aan de Costa del Sol en van de AP-6, en de heenrit door Frankrijk.',
    h1: 'Tol Spanje 2026: waar betaal je nog, waar niet meer?',
    intro: 'Kies grens en bestemming: de rekenhulp toont welke Spaanse trajecten op de route nog tol kosten en wat Frankrijk daarvoor vraagt.',
    resume: (h) => {
      const { S, ap7, lyon } = D(h);
      return `Spanje heeft geen vignet, en op weg naar de Middellandse Zeekust is de snelweg tegenwoordig grotendeels gratis. De AP-7 van de Franse grens bij La Jonquera via Girona en Barcelona naar Tarragona en Valencia was tientallen jaren tolplichtig; de concessies zijn afgelopen, en beheerder Abertis publiceert voor deze weg in 2026 geen tarieven meer. De rekenhulp rijdt de ${h.num(ap7.km)} km van de grens tot Valencia daarom zonder Spaanse tol. Wie verder naar het zuiden rijdt, betaalt weer: de Autopista del Sol (Ausol) tussen Málaga en Guadiaro kost een auto ${h.eur(S.ausol_normal, 2)} in het gewone seizoen en ${h.eur(S.ausol_saison, 2)} in het hoogseizoen, de AP-6 van Villalba naar Adanero ten noorden van Madrid ${h.eur(S.ap6_villalba_adanero, 2)}. Duurder dan Spanje is meestal de heenrit: alleen al de Franse snelweg van Lyon tot de grens kost een auto ${h.eur(lyon.pkw.s.geprueft, 2)} per richting.`;
    },
    faqs: (h) => {
      const { S, ap7, lyon } = D(h);
      return [
        { q: 'Is de AP-7 van La Jonquera naar Barcelona echt tolvrij?', a: `Voor auto’s, campers en motoren rekenen wij hem zo: Abertis vermeldt de weg niet meer in zijn tariefbladen 2026, waar alleen nog de AP-6, AP-51, AP-61, AP-68, AP-71 en C-32 staan. Een bevestiging van het ministerie van Verkeer hebben wij niet gelezen. De rekenhulp toont voor de ${h.num(ap7.km)} km tot Valencia daarom ${h.eur(0)}, en wij controleren dit bij elke bijwerking opnieuw.` },
        { q: 'Wanneer geldt aan de Costa del Sol het duurdere seizoenstarief?', a: `Volgens de tariefpagina van Ausol van juni tot en met september en op 17 dagen rond Pasen. Het hele traject Málaga–Guadiaro langs de drie hoofdtolposten Calahonda, San Pedro en Manilva kost dan ${h.eur(S.ausol_saison, 2)} in plaats van ${h.eur(S.ausol_normal, 2)}. Het tarief geldt voor lichte voertuigen, waaronder ook de motor en de auto met caravan zonder dubbellucht.` },
        { q: 'Betaalt een camper meer op de heenrit door Frankrijk?', a: `Ja, flink meer. Op de Franse snelwegen vallen campers hoger dan 2 meter in klasse 2. Van Lyon tot de Spaanse grens kost dat volgens de lijst van Vinci Autoroutes ${h.eur(lyon.wm.s.geprueft, 2)} per richting, tegen ${h.eur(lyon.pkw.s.geprueft, 2)} voor een auto; een motor betaalt ${h.eur(lyon.mo.s.geprueft, 2)}. In Spanje zelf maakt het verschil op onze route niets uit, omdat daar geen tol wordt geheven.` },
        { q: 'Is er tol op de weg van Madrid naar het noorden?', a: `Ja, op de AP-6 door de Sierra de Guadarrama. Van Villalba naar Adanero betaalt een licht voertuig volgens het tariefblad 2026 van de beheerder ${h.eur(S.ap6_villalba_adanero, 2)} tegen het gewone tarief. De aftakkingen AP-61 naar Segovia en AP-51 naar Ávila hebben eigen prijzen. Deze wegen liggen niet in ons netwerk, de rekenhulp kent ze dus niet; ze staan hier alleen ter oriëntatie.` },
      ];
    },
    body: (h) => {
      const { fahrt, ziele, S } = D(h);
      const rows = ziele.map(([a, b]) => { const p = fahrt(a, b, 'pkw'), w = fahrt(a, b, 'wohnmobil'); return [`${ort(h, a)} – ${ort(h, b)}`, `${h.num(p.km)} km`, `${h.num(p.es)} km`, h.eur(p.s.geprueft, 2), h.eur(w.s.geprueft, 2)]; });
      return `<h2>Routes naar de Spaanse Middellandse Zeekust</h2>
${h.table(['Route', 'Afstand', 'waarvan Spanje', 'Tol auto', 'Tol camper'], rows, 'Enkele reis; tol op de hele route, ook in Frankrijk', ['l', 'r', 'r', 'r', 'r'])}
<p>De eerste vier regels laten zien dat de kustsnelweg vanaf de grens in ons netwerk niets kost. Wat de langere routes duur maakt, is Frankrijk. Wie uit Nederland of België via Parijs en Lyon rijdt, doorkruist meerdere gesloten tolsystemen; een deel daarvan, vooral in het noorden, beheert Sanef, waarvan wij de tarieven niet konden lezen. De rekenhulp toont zulke trajecten als “niet geverifieerd”, zonder bedrag.</p>
<h2>Wat in Spanje in 2026 nog geld kost</h2>
${h.table(['Traject', 'Gewoon tarief', 'Hoogseizoen'], [['AP-7 Ausol Málaga – Guadiaro', h.eur(S.ausol_normal, 2), h.eur(S.ausol_saison, 2)], ['AP-6 Villalba – Adanero', h.eur(S.ap6_villalba_adanero, 2), '–']], 'Lichte voertuigen, enkele reis', ['l', 'r', 'r'])}
<p>Bronnen: ${h.src('ausol')} en ${h.src('ap6')}, gelezen op ${h.date(h.P.retrieved_at)}. De tarieven gelden sinds 1 januari 2026 volgens de ministeriële regeling van 18 december 2025. Andere tolwegen liggen in Galicië (AP-9), in het Ebrodal (AP-68) en ten zuiden van Alicante; hun prijzen hebben wij niet gelezen, en ze liggen niet op de vakantieroutes die de rekenhulp kent.</p>
<h2>Voertuigklassen in Spanje</h2>
<p>Spanje kent alleen “ligeros” en zware voertuigen. Tot de lichte horen auto’s, motoren en auto’s met caravan, zolang er geen dubbellucht is. Voor campers noemt de tariefpagina van Ausol geen eigen bedrag; wij hebben het niet geverifieerd en tonen het daarom niet. Dat is ruimer dan in Frankrijk, waar hoogte en aanhanger de klasse bepalen; de regels daar staan op ${h.a('maut-frankreich', 'tol Frankrijk')}. Pompprijzen langs het Franse traject vergelijkt ${h.a('benzinpreis-frankreich', 'benzineprijs Frankrijk')}.</p>`;
    },
  },
});
