import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Vignette Tschechien : eDálnice, Preise 2026 in CZK, Jahresvignette 365 Tage, Motorrad und Anhänger frei. */
function D(h: Helpers) {
  const V = h.P.vignetten.CZ;
  const k = Object.fromEntries(V.produkte.kfz.map((p) => [p.id, p.preis])) as Record<string, number>;
  const e = (n: number) => h.M.inEuro(n, 'CZK');
  const ab = h.M.addDays(h.today, 7);
  const lang = h.M.vignette('CZ', 'pkw', h.M.fahrtage(ab, 14, true, false));
  const kurz = h.M.vignette('CZ', 'pkw', h.M.fahrtage(ab, 7, true, false));
  const urlaub = h.M.vignette('CZ', 'pkw', h.M.fahrtage(ab, 14, true, true));
  const jahrBis = h.M.produkte('CZ', 'pkw', ab).find((p) => p.id === 'jahr')?.bis ?? '';
  return { V, k, e, ab, lang, kurz, urlaub, jahrBis, stand: h.M.KURSE.stand };
}
type W = ReturnType<Helpers['M']['vignette']>;
const wahl = (h: Helpers, v: W) => {
  const ids = v.wahl.map((w) => w.id);
  if (ids.length === 2 && ids.every((x) => x === '1t')) return h.T('zwei 1-Tages-Vignetten', 'two 1-day vignettes', 'twee dagvignetten');
  const n: Record<string, [string, string, string]> = { '1t': ['eine 1-Tages-Vignette', 'one 1-day vignette', 'één dagvignet'], '10t': ['eine 10-Tages-Vignette', 'one 10-day vignette', 'één 10-dagenvignet'], '30t': ['eine 30-Tages-Vignette', 'one 30-day vignette', 'één 30-dagenvignet'], jahr: ['die Jahresvignette', 'the annual vignette', 'het jaarvignet'] };
  return h.T(...(n[ids[0]] ?? n['1t']));
};

export default defineGuide({
  id: 'vignette-tschechien',
  group: 'vignette',
  order: 14,
  tool: 'vignette',
  land: 'CZ',
  related: ['vignette-ungarn', 'vignette-oesterreich', 'vignette-slowenien', 'digitale-vignette', 'maut-kroatien'],
  sources: ['edalnice', 'edalniceFaq', 'ezb'],
  de: {
    slug: 'vignette-tschechien',
    nav: 'Vignette Tschechien',
    card: 'eDálnice 2026: Preise in Kronen und Euro, 365-Tage-Jahresvignette, Motorrad frei.',
    title: 'Vignette Tschechien 2026: Preise in Kronen und Euro',
    description: 'Vignette Tschechien 2026: elektronische Dálniční známka für 1, 10 oder 30 Tage oder ein Jahr ab Starttag. Preise in Kronen und Euro, Motorrad und Anhänger frei.',
    h1: 'Vignette Tschechien 2026: Preise und Laufzeiten',
    intro: 'Die tschechische Vignette ist elektronisch und gilt ab dem gewählten Tag: der Rechner nennt die billigste Laufzeit für Ihre Fahrtage.',
    resume: (h) => {
      const { k, e, lang, kurz, stand } = D(h);
      return `Für die tschechischen Autobahnen und Schnellstraßen braucht ein Fahrzeug bis 3,5 Tonnen die elektronische Vignette eDálnice, die an das Kennzeichen gebunden ist. Die Preisliste gilt seit dem 1. Januar 2026: ${h.geld(k['1t'], 'CZK')} für einen Tag, ${h.geld(k['10t'], 'CZK')} für zehn Tage, ${h.geld(k['30t'], 'CZK')} für dreißig Tage und ${h.geld(k.jahr, 'CZK')} für ein Jahr. Zum EZB-Kurs vom ${h.date(stand)} sind das etwa ${h.eur(e(k['1t']), 2)}, ${h.eur(e(k['10t']), 2)}, ${h.eur(e(k['30t']), 2)} und ${h.eur(e(k.jahr), 2)}. Die Jahresvignette gilt 365 Tage ab dem gewählten Datum, nicht bis zum Jahresende. Motorräder und Anhänger sind von der Vignettenpflicht ausgenommen, ein Wohnwagen kostet also nichts extra; ein Wohnmobil bis 3,5 Tonnen zahlt wie ein Pkw. Für Fahrzeuge mit Erdgas, Plug-in-Hybride mit höchstens 50 g CO₂ je Kilometer und Elektroautos gelten ermäßigte Tarife oder eine Befreiung. Bei einer Durchreise mit zwei Wochen Urlaub reichen ${wahl(h, lang)} für ${h.geld(lang.summe, 'CZK')}; liegen nur sieben Tage dazwischen, ist es ${wahl(h, kurz)} für ${h.geld(kurz.summe, 'CZK')}.`;
    },
    faqs: (h) => {
      const { V, jahrBis, ab, urlaub } = D(h);
      return [
        { q: 'Gilt die tschechische Jahresvignette bis zum 31. Dezember?', a: `Nein. Die Jahresvignette der eDálnice gilt 365 Tage ab dem Tag, den Sie beim Kauf als Beginn wählen. Eine ab dem ${h.date(ab)} gültige Vignette läuft bis zum ${h.date(jahrBis)}. Es lohnt also nicht, mit dem Kauf bis Januar zu warten: wer im Sommer zum ersten Mal fährt, hat die volle Laufzeit bis zum Sommer des Folgejahres.` },
        { q: 'Brauchen Motorräder und Wohnwagen in Tschechien eine Vignette?', a: 'Nein. Laut den häufigen Fragen der eDálnice umfasst die Pflicht weder gezogene Fahrzeuge noch Motorräder. Ein Gespann aus Pkw und Wohnwagen zahlt also nur die Vignette des Pkw, und mit dem Motorrad fahren Sie ohne Vignette auf der Autobahn. Ein Wohnmobil bis 3,5 Tonnen braucht dagegen die normale Vignette wie jedes vierrädrige Fahrzeug dieser Gewichtsklasse.' },
        { q: 'Was zahlt ein Elektroauto mit ausländischem Kennzeichen in Tschechien?', a: 'Elektro- und Wasserstoffautos sind in Tschechien von der Vignettengebühr befreit. Für ein im Ausland zugelassenes Fahrzeug muss die Befreiung aber vorher im System der eDálnice gemeldet werden; die Befreiung setzt diese Meldung voraus. Plug-in-Hybride bis 50 g CO₂ je Kilometer und Fahrzeuge mit Erdgas (CNG, LNG, nicht LPG) zahlen ermäßigte Preise.' },
        { q: 'Mit welcher Strafe muss man ohne tschechische Vignette rechnen?', a: `Die eDálnice nennt eine Geldbuße von bis zu ${h.geld(V.strafe.betrag, 'CZK')} an Ort und Stelle; im Verwaltungsverfahren kann sie höher ausfallen. Kontrolliert wird über das Kennzeichen, eine Vignette an der Scheibe gibt es nicht. Wer im Urlaub öfter Autobahn fährt, sollte die Laufzeit danach wählen: für vierzehn Urlaubstage mit täglichen Fahrten kostet es ${h.geld(urlaub.summe, 'CZK')}.` },
      ];
    },
    body: (h) => {
      const { k, e, ab, lang, kurz, stand } = D(h);
      const rows = h.M.produkte('CZ', 'pkw', ab).map((p) => [{ '1t': '1 Tag', '10t': '10 Tage', '30t': '30 Tage', jahr: '365 Tage' }[p.id] ?? p.id, h.geld(p.preis, 'CZK'), h.eur(p.preisEur, 2), p.bis ? h.date(p.bis) : '–']);
      return `<h2>Preise ab dem 1. Januar 2026</h2>
${h.table(['Laufzeit', 'Preis', 'in Euro', `gültig bis (Beginn ${h.date(ab)})`], rows, `Normaler Kraftstoff, Fahrzeuge bis 3,5 t; Euro zum EZB-Kurs vom ${h.date(stand)}`, ['l', 'r', 'r', 'r'])}
<p>Quelle: ${h.src('edalnice')}, gelesen am ${h.date(h.P.retrieved_at)}. Auf der Startseite und in den häufigen Fragen der eDálnice standen beim Lesen noch niedrigere Beträge, die nicht zur Preisliste passen; maßgeblich ist die Preisliste mit Gültigkeit ab dem 1. Januar 2026. Preise für 2027 sind nicht veröffentlicht.</p>
<h2>Welche Laufzeit für die Durchreise?</h2>
<p>Wer Tschechien auf dem Weg nach Österreich, Ungarn oder Kroatien durchquert, braucht die Vignette meist nur an zwei Tagen. Zwei 1-Tages-Vignetten kosten ${h.geld(k['1t'] * 2, 'CZK')}, die 10-Tages-Vignette ${h.geld(k['10t'], 'CZK')}: Liegen Hin- und Rückfahrt höchstens zehn Tage auseinander, ist die 10-Tages-Vignette günstiger, sonst die beiden Tagesvignetten. Für die Abfahrt am ${h.date(ab)} wählt der Rechner bei zwei Wochen ${wahl(h, lang)} (${h.eur(lang.summeEur, 2)}), bei einer Woche ${wahl(h, kurz)} (${h.eur(kurz.summeEur, 2)}). Die 30-Tages-Vignette für ${h.geld(k['30t'], 'CZK')} lohnt sich erst, wenn Sie im Land selbst an vielen Tagen Autobahn fahren.</p>
<h2>Kronen und Euro</h2>
<p>Die Preise sind in Kronen festgelegt. Der Eurobetrag folgt dem Referenzkurs der EZB (${h.src('ezb')}) und ändert sich mit ihm; der Betrag auf Ihrer Kartenabrechnung kann leicht abweichen. Zum Kurs vom ${h.date(stand)} kostet die Jahresvignette etwa ${h.eur(e(k.jahr), 2)}.</p>
<h2>Ermäßigungen und Ausnahmen</h2>
<p>Die Preisliste kennt neben dem normalen Kraftstoff ermäßigte Tarife für Erdgas und Biomethan (CNG und LNG, nicht Autogas) sowie für Plug-in-Hybride mit höchstens 50 g CO₂ je Kilometer. Elektro- und Wasserstoffautos zahlen nichts, ausländische Fahrzeuge melden die Befreiung vorab an (${h.src('edalniceFaq')}). Der Rechner zeigt nur den Tarif für normalen Kraftstoff. Weiter südlich gelten andere Regeln: In ${h.a('vignette-ungarn', 'Ungarn')} ist der Anhänger in der Klasse D1 enthalten, in ${h.a('vignette-oesterreich', 'Österreich')} ebenfalls frei.</p>`;
    },
  },
  en: {
    slug: 'czech-vignette',
    nav: 'Czech vignette',
    card: 'eDálnice 2026: prices in koruna and euros, 365-day annual vignette, motorcycles free.',
    title: 'Czech vignette 2026: prices in koruna and in euros',
    description: 'Czech vignette 2026: the electronic dálniční známka for 1, 10 or 30 days or a year from your start date. Prices in koruna and euros; motorcycles, trailers free.',
    h1: 'Czech vignette 2026: prices and durations',
    intro: 'The Czech vignette is electronic and starts on the day you choose: the calculator names the cheapest duration for your travel days.',
    resume: (h) => {
      const { k, e, lang, kurz, stand } = D(h);
      return `On Czech motorways and expressways a vehicle up to 3.5 tonnes needs the eDálnice electronic vignette, which is tied to the number plate. The price list has applied since 1 January 2026: ${h.geld(k['1t'], 'CZK')} for one day, ${h.geld(k['10t'], 'CZK')} for ten days, ${h.geld(k['30t'], 'CZK')} for thirty days and ${h.geld(k.jahr, 'CZK')} for a year. At the ECB rate of ${h.date(stand)} that is about ${h.eur(e(k['1t']), 2)}, ${h.eur(e(k['10t']), 2)}, ${h.eur(e(k['30t']), 2)} and ${h.eur(e(k.jahr), 2)}. The annual vignette lasts 365 days from the date you choose, not to the end of the calendar year. Motorcycles and trailers are exempt, so a caravan costs nothing extra; a motorhome up to 3.5 tonnes pays like a car. Natural-gas vehicles, plug-in hybrids emitting at most 50 g of CO₂ per kilometre and electric cars get reduced rates or an exemption. For a transit with a two-week holiday, ${wahl(h, lang)} at ${h.geld(lang.summe, 'CZK')} will do; with only seven days in between, it is ${wahl(h, kurz)} at ${h.geld(kurz.summe, 'CZK')}.`;
    },
    faqs: (h) => {
      const { V, jahrBis, ab, urlaub } = D(h);
      return [
        { q: 'Does the Czech annual vignette expire on 31 December?', a: `No. The eDálnice annual vignette runs for 365 days from the start date you choose when buying. A vignette starting on ${h.date(ab)} is valid until ${h.date(jahrBis)}. There is no point waiting until January to buy: if your first trip is in summer, you get the full term until the following summer.` },
        { q: 'Do motorcycles and caravans need a vignette in Czechia?', a: 'No. According to the eDálnice FAQ, the obligation covers neither towed vehicles nor motorcycles. A car with a caravan therefore pays only the car’s vignette, and on a motorcycle you can use the motorway without one. A motorhome up to 3.5 tonnes, however, needs the normal vignette like any four-wheeled vehicle in that weight class.' },
        { q: 'What does an electric car with foreign plates pay in Czechia?', a: 'Electric and hydrogen cars are exempt from the vignette charge in Czechia. For a vehicle registered abroad, however, the exemption must be notified in the eDálnice system beforehand; the exemption depends on that notification. Plug-in hybrids up to 50 g of CO₂ per kilometre and natural-gas vehicles (CNG, LNG, not LPG) pay reduced prices.' },
        { q: 'What penalty applies without a Czech vignette?', a: `eDálnice states an on-the-spot fine of up to ${h.geld(V.strafe.betrag, 'CZK')}; in administrative proceedings it can be higher. Checks run on the number plate; there is nothing to display on the windscreen. If you use motorways often during your stay, choose the duration accordingly: fourteen holiday days with daily drives cost ${h.geld(urlaub.summe, 'CZK')}.` },
      ];
    },
    body: (h) => {
      const { k, e, ab, lang, kurz, stand } = D(h);
      const rows = h.M.produkte('CZ', 'pkw', ab).map((p) => [{ '1t': '1 day', '10t': '10 days', '30t': '30 days', jahr: '365 days' }[p.id] ?? p.id, h.geld(p.preis, 'CZK'), h.eur(p.preisEur, 2), p.bis ? h.date(p.bis) : '–']);
      return `<h2>Prices from 1 January 2026</h2>
${h.table(['Duration', 'Price', 'in euros', `valid until (start ${h.date(ab)})`], rows, `Standard fuel, vehicles up to 3.5 t; euros at the ECB rate of ${h.date(stand)}`, ['l', 'r', 'r', 'r'])}
<p>Source: ${h.src('edalnice')}, read on ${h.date(h.P.retrieved_at)}. When we read it, the eDálnice home page and FAQ still showed lower amounts that do not match the price list; the price list valid from 1 January 2026 is the one that counts. No 2027 prices have been published.</p>
<h2>Which duration for a transit?</h2>
<p>If you cross Czechia on the way to Austria, Hungary or Croatia, you usually need the vignette on two days only. Two 1-day vignettes cost ${h.geld(k['1t'] * 2, 'CZK')}, the 10-day vignette ${h.geld(k['10t'], 'CZK')}: if the drive out and back are at most ten days apart, the 10-day vignette is cheaper, otherwise the two day vignettes. Leaving on ${h.date(ab)}, the calculator picks ${wahl(h, lang)} (${h.eur(lang.summeEur, 2)}) for two weeks and ${wahl(h, kurz)} (${h.eur(kurz.summeEur, 2)}) for one week. The 30-day vignette at ${h.geld(k['30t'], 'CZK')} only pays off if you drive on motorways on many days within the country.</p>
<h2>Koruna and euros</h2>
<p>Prices are set in koruna. The euro figure follows the ECB reference rate (${h.src('ezb')}) and moves with it; the amount on your card statement may differ slightly. At the rate of ${h.date(stand)} the annual vignette costs about ${h.eur(e(k.jahr), 2)}.</p>
<h2>Reductions and exemptions</h2>
<p>Besides standard fuel, the price list has reduced rates for natural gas and biomethane (CNG and LNG, not LPG) and for plug-in hybrids emitting at most 50 g of CO₂ per kilometre. Electric and hydrogen cars pay nothing, and foreign vehicles register the exemption in advance (${h.src('edalniceFaq')}). The calculator shows the standard-fuel rate only. Further south the rules differ: in ${h.a('vignette-ungarn', 'Hungary')} the trailer is included in class D1, and in ${h.a('vignette-oesterreich', 'Austria')} it is free as well.</p>`;
    },
  },
  nl: {
    slug: 'vignet-tsjechie',
    nav: 'Vignet Tsjechië',
    card: 'eDálnice 2026: prijzen in kronen en euro, jaarvignet van 365 dagen, motor vrij.',
    title: 'Vignet Tsjechië 2026: prijzen in kronen en in euro',
    description: 'Vignet Tsjechië 2026: elektronische dálniční známka voor 1, 10 of 30 dagen of een jaar vanaf uw startdatum. Prijzen in kronen en euro, motor en aanhanger vrij.',
    h1: 'Vignet Tsjechië 2026: prijzen en looptijden',
    intro: 'Het Tsjechische vignet is elektronisch en begint op de dag die u kiest: de rekenhulp noemt de goedkoopste looptijd voor uw rijdagen.',
    resume: (h) => {
      const { k, e, lang, kurz, stand } = D(h);
      return `Op de Tsjechische snelwegen en autowegen heeft een voertuig tot 3,5 ton het elektronische vignet eDálnice nodig, gekoppeld aan de nummerplaat. De prijslijst geldt sinds 1 januari 2026: ${h.geld(k['1t'], 'CZK')} voor één dag, ${h.geld(k['10t'], 'CZK')} voor tien dagen, ${h.geld(k['30t'], 'CZK')} voor dertig dagen en ${h.geld(k.jahr, 'CZK')} voor een jaar. Tegen de ECB-koers van ${h.date(stand)} is dat ongeveer ${h.eur(e(k['1t']), 2)}, ${h.eur(e(k['10t']), 2)}, ${h.eur(e(k['30t']), 2)} en ${h.eur(e(k.jahr), 2)}. Het jaarvignet geldt 365 dagen vanaf de gekozen datum, niet tot het einde van het kalenderjaar. Motoren en aanhangers zijn vrijgesteld, een caravan kost dus niets extra; een camper tot 3,5 ton betaalt als een auto. Voor voertuigen op aardgas, plug-in hybrides met hoogstens 50 g CO₂ per kilometer en elektrische auto’s gelden lagere tarieven of een vrijstelling. Voor een doorreis met twee weken vakantie volstaan ${wahl(h, lang)} voor ${h.geld(lang.summe, 'CZK')}; liggen er maar zeven dagen tussen, dan is het ${wahl(h, kurz)} voor ${h.geld(kurz.summe, 'CZK')}.`;
    },
    faqs: (h) => {
      const { V, jahrBis, ab, urlaub } = D(h);
      return [
        { q: 'Loopt het Tsjechische jaarvignet af op 31 december?', a: `Nee. Het jaarvignet van eDálnice geldt 365 dagen vanaf de startdatum die u bij de aankoop kiest. Een vignet dat op ${h.date(ab)} begint, geldt tot ${h.date(jahrBis)}. Wachten met kopen tot januari heeft dus geen zin: wie in de zomer voor het eerst rijdt, heeft de volle looptijd tot de zomer van het jaar erna.` },
        { q: 'Hebben motoren en caravans in Tsjechië een vignet nodig?', a: 'Nee. Volgens de veelgestelde vragen van eDálnice geldt de plicht niet voor getrokken voertuigen en niet voor motoren. Een auto met caravan betaalt dus alleen het vignet van de auto, en met de motor rijdt u zonder vignet over de snelweg. Een camper tot 3,5 ton heeft wel het gewone vignet nodig, zoals elk vierwielig voertuig in die gewichtsklasse.' },
        { q: 'Wat betaalt een elektrische auto met buitenlandse nummerplaat in Tsjechië?', a: 'Elektrische auto’s en waterstofauto’s zijn in Tsjechië vrijgesteld van de vignetheffing. Voor een in het buitenland ingeschreven voertuig moet die vrijstelling wel vooraf in het systeem van eDálnice gemeld worden; de vrijstelling hangt van die melding af. Plug-in hybrides tot 50 g CO₂ per kilometer en voertuigen op aardgas (CNG, LNG, geen LPG) betalen lagere prijzen.' },
        { q: 'Welke boete riskeert u zonder Tsjechisch vignet?', a: `eDálnice noemt een boete ter plaatse tot ${h.geld(V.strafe.betrag, 'CZK')}; in een administratieve procedure kan die hoger uitvallen. De controle gebeurt op de nummerplaat; op de ruit hoeft niets te kleven. Wie tijdens de vakantie vaak snelweg rijdt, kiest de looptijd daarop: veertien vakantiedagen met dagelijkse ritten kosten ${h.geld(urlaub.summe, 'CZK')}.` },
      ];
    },
    body: (h) => {
      const { k, e, ab, lang, kurz, stand } = D(h);
      const rows = h.M.produkte('CZ', 'pkw', ab).map((p) => [{ '1t': '1 dag', '10t': '10 dagen', '30t': '30 dagen', jahr: '365 dagen' }[p.id] ?? p.id, h.geld(p.preis, 'CZK'), h.eur(p.preisEur, 2), p.bis ? h.date(p.bis) : '–']);
      return `<h2>Prijzen vanaf 1 januari 2026</h2>
${h.table(['Looptijd', 'Prijs', 'in euro', `geldig tot (start ${h.date(ab)})`], rows, `Gewone brandstof, voertuigen tot 3,5 t; euro tegen de ECB-koers van ${h.date(stand)}`, ['l', 'r', 'r', 'r'])}
<p>Bron: ${h.src('edalnice')}, gelezen op ${h.date(h.P.retrieved_at)}. Op de startpagina en in de veelgestelde vragen van eDálnice stonden bij het lezen nog lagere bedragen die niet met de prijslijst overeenkomen; de prijslijst die geldt vanaf 1 januari 2026 is bepalend. Prijzen voor 2027 zijn niet gepubliceerd.</p>
<h2>Welke looptijd voor een doorreis?</h2>
<p>Wie Tsjechië doorkruist op weg naar Oostenrijk, Hongarije of Kroatië, heeft het vignet meestal maar op twee dagen nodig. Twee dagvignetten kosten ${h.geld(k['1t'] * 2, 'CZK')}, het 10-dagenvignet ${h.geld(k['10t'], 'CZK')}: liggen heen- en terugreis hoogstens tien dagen uit elkaar, dan is het 10-dagenvignet goedkoper, anders de twee dagvignetten. Bij vertrek op ${h.date(ab)} kiest de rekenhulp bij twee weken ${wahl(h, lang)} (${h.eur(lang.summeEur, 2)}), bij één week ${wahl(h, kurz)} (${h.eur(kurz.summeEur, 2)}). Het 30-dagenvignet van ${h.geld(k['30t'], 'CZK')} loont pas als u in het land zelf op veel dagen snelweg rijdt.</p>
<h2>Kronen en euro</h2>
<p>De prijzen liggen vast in kronen. Het eurobedrag volgt de referentiekoers van de ECB (${h.src('ezb')}) en beweegt daarmee mee; het bedrag op uw kaartafschrift kan licht afwijken. Tegen de koers van ${h.date(stand)} kost het jaarvignet ongeveer ${h.eur(e(k.jahr), 2)}.</p>
<h2>Kortingen en vrijstellingen</h2>
<p>Naast gewone brandstof kent de prijslijst lagere tarieven voor aardgas en biomethaan (CNG en LNG, geen LPG) en voor plug-in hybrides met hoogstens 50 g CO₂ per kilometer. Elektrische en waterstofauto’s betalen niets, buitenlandse voertuigen melden de vrijstelling vooraf (${h.src('edalniceFaq')}). De rekenhulp toont alleen het tarief voor gewone brandstof. Verder naar het zuiden gelden andere regels: in ${h.a('vignette-ungarn', 'Hongarije')} zit de aanhanger in klasse D1 inbegrepen, en in ${h.a('vignette-oesterreich', 'Oostenrijk')} is hij eveneens vrij.</p>`;
    },
  },
});
