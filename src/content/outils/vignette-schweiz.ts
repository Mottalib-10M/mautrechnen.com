import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Vignette Schweiz : eine Jahresvignette zu 40 CHF, 14 Monate gültig, zweite Vignette für den Anhänger. */
function D(h: Helpers) {
  const V = h.P.vignetten.CH;
  const chf = V.produkte.kfz[0].preis;
  const eur = h.M.inEuro(chf, 'CHF');
  const ab = h.M.addDays(h.today, 7);
  const tage = h.M.fahrtage(ab, 14, true, false);
  const fz = (f: 'pkw' | 'wohnmobil' | 'gespann' | 'motorrad') => h.M.vignette('CH', f, tage);
  const pkw = fz('pkw'), gespann = fz('gespann');
  const bis = h.M.produkte('CH', 'pkw', ab)[0]?.bis ?? '';
  // Vignette des Folgejahres : ab 1. Dezember erhältlich, gültig bis 31. Januar zwei Jahre später.
  const dez = `${Number(h.today.slice(0, 4))}-12-01`;
  const bisDez = h.M.produkte('CH', 'pkw', dez)[0]?.bis ?? '';
  const gsb = h.P.tunnel.gsb;
  return { V, chf, eur, ab, pkw, gespann, fz, bis, dez, bisDez, gsb, stand: h.M.KURSE.stand };
}

export default defineGuide({
  id: 'vignette-schweiz',
  group: 'vignette',
  order: 12,
  tool: 'vignette',
  land: 'CH',
  related: ['vignette-oesterreich', 'maut-italien', 'maut-frankreich', 'digitale-vignette', 'vignette-slowenien'],
  sources: ['bazgVignette', 'bazgEvignette', 'ezb', 'gsb'],
  de: {
    slug: 'vignette-schweiz',
    nav: 'Vignette Schweiz',
    card: 'Eine Jahresvignette für 14 Monate, zweite Vignette für den Wohnwagen, Umrechnung in Euro.',
    title: 'Vignette Schweiz 2026: Preis, E-Vignette und Wohnwagen',
    description: 'Vignette Schweiz 2026: nur als Jahresvignette, 14 Monate gültig, auch als E-Vignette. Wann der Wohnwagen eine zweite braucht und was die Durchreise kostet.',
    h1: 'Vignette Schweiz 2026: eine Vignette, 14 Monate',
    intro: 'Die Schweiz kennt keine Kurzzeitvignette: der Rechner zeigt, was die Jahresvignette für Ihr Fahrzeug in Euro kostet und bis wann sie gilt.',
    resume: (h) => {
      const { chf, eur, gespann, stand, bis } = D(h);
      return `Für die Schweizer Nationalstraßen gibt es nur eine Vignette: die Jahresvignette zu ${h.geld(chf, 'CHF')}, umgerechnet etwa ${h.eur(eur, 2)} zum EZB-Kurs vom ${h.date(stand)}. Sie gilt 14 Monate, vom 1. Dezember des Vorjahres bis zum 31. Januar des Folgejahres; eine jetzt gekaufte Vignette 2026 reicht also bis zum ${h.date(bis)}. Kurzzeitvignetten sieht das Gesetz nicht vor, auch wer die Schweiz nur einmal auf dem Weg nach Italien durchquert, zahlt den vollen Preis. Die Vignette gibt es als Aufkleber oder als E-Vignette, die an das Kennzeichen gebunden ist und sofort nach dem Kauf gilt; beide kosten gleich viel. Pkw, Motorrad und Wohnmobil bis 3,5 Tonnen brauchen je eine Vignette. Ein Wohnwagen oder Anhänger braucht eine zweite, sodass ein Gespann ${h.geld(gespann.summe, 'CHF')} oder rund ${h.eur(gespann.summeEur, 2)} bezahlt; ausgenommen sind Anhänger von Motorrädern. Wer ohne gültige Vignette erwischt wird, zahlt eine Busse von ${h.geld(h.P.vignetten.CH.strafe.betrag, 'CHF')} und kauft die Vignette dazu.`;
    },
    faqs: (h) => {
      const { chf, gespann, dez, bisDez, V } = D(h);
      return [
        { q: 'Gibt es für die Durchreise durch die Schweiz eine Kurzzeitvignette?', a: `Nein. Das Nationalstraßenabgabegesetz sieht keine Kurzzeitvignetten vor, das bestätigt das BAZG ausdrücklich. Auch für eine einzige Durchfahrt von Basel nach Chiasso kaufen Sie die Jahresvignette zu ${h.geld(chf, 'CHF')}. Eine Vignette für eine einzelne Fahrt oder für wenige Tage lässt sich weder im Portal noch an der Grenze kaufen. Der Rechner oben zeigt deshalb für jede Reisedauer denselben Betrag, solange die Fahrt in eine einzige Vignettenperiode fällt.` },
        { q: 'Braucht der Wohnwagen in der Schweiz eine eigene Vignette?', a: `Ja. Für Anhänger und Wohnwagen verlangt die Schweiz eine zweite Vignette zum selben Preis, das Gespann zahlt also ${h.geld(gespann.summe, 'CHF')}. Ausgenommen sind laut Richtlinie des BAZG nur Anhänger, die von Motorrädern gezogen werden, starre Anhänger und Seitenwagen. Der Rechner oben zählt beim Gespann deshalb zwei Vignetten, in Österreich dagegen bleibt der Wohnwagen frei.` },
        { q: 'Darf ich ab der Grenze bei Basel ohne Vignette fahren?', a: 'Nur an drei Zollstellen und nur bis zur ersten Ausfahrt: Wer über Basel St. Louis, Rheinfelden oder Kreuzlingen einreist und die Autobahn bei der ersten Ausfahrt wieder verlässt, braucht keine Vignette. Das ist gedacht für Fahrten in die Grenzstädte. Wer weiter in Richtung Luzern, Gotthard oder Bern fährt, braucht ab dem ersten Meter nach dieser Ausfahrt eine gültige Vignette.' },
        { q: 'Welche Schweizer Vignette gilt bei einer Reise im Dezember?', a: `Ab dem 1. Dezember gilt bereits die Vignette des Folgejahres, die Vignette des laufenden Jahres aber noch bis Ende Januar. Wer am ${h.date(dez)} kauft, bekommt die Vignette ${Number(dez.slice(0, 4)) + 1}, die bis zum ${h.date(bisDez)} gilt, also volle 14 Monate. Für eine Winterreise lohnt deshalb ab Dezember die neue Vignette, weil sie für ${h.geld(V.produkte.kfz[0].preis, 'CHF')} gut ein Jahr länger reicht.` },
      ];
    },
    body: (h) => {
      const { fz, gsb, stand, ab, bis } = D(h);
      const name: Record<string, string> = { pkw: 'Pkw', wohnmobil: 'Wohnmobil bis 3,5 t', gespann: 'Pkw mit Wohnwagen', motorrad: 'Motorrad' };
      const rows = (['pkw', 'wohnmobil', 'gespann', 'motorrad'] as const).map((f) => { const v = fz(f); return [name[f], String(v.wahl[0]?.anzahl ?? 0), h.geld(v.summe, 'CHF'), h.eur(v.summeEur, 2)]; });
      return `<h2>Was die Vignette je Fahrzeug kostet</h2>
${h.table(['Fahrzeug', 'Vignetten', 'Preis', 'in Euro'], rows, `Umrechnung zum EZB-Kurs vom ${h.date(stand)}; gekauft für eine Fahrt ab dem ${h.date(ab)}, gültig bis ${h.date(bis)}`, ['l', 'r', 'r', 'r'])}
<p>Den Preis legt das BAZG in seiner Richtlinie fest, beim Aufkleber und bei der E-Vignette gleich (${h.src('bazgVignette')}). Der Eurobetrag ist eine Umrechnung zum Referenzkurs der Europäischen Zentralbank (${h.src('ezb', 'EZB')}). An der Grenze oder an der Tankstelle kann der in Euro verlangte Betrag davon abweichen.</p>
<h2>Aufkleber oder E-Vignette?</h2>
<p>Die E-Vignette wird im Portal des BAZG mit dem Kennzeichen gekauft und gilt mit dem erfolgreichen Kauf, ohne Wartefrist (${h.src('bazgEvignette')}). Sie hat dieselbe Laufzeit von 14 Monaten wie der Aufkleber. Der Unterschied liegt im Alltag: Der Aufkleber gehört zur Windschutzscheibe, die E-Vignette zum Kennzeichen. Wer die Scheibe tauschen lässt, verliert den Aufkleber; wer mit einem anderen Auto fährt, braucht für dessen Kennzeichen eine eigene E-Vignette. Anders als bei der ${h.a('digitale-vignette', 'digitalen Vignette in Österreich')} gibt es in der Schweiz keine Frist von 18 Tagen.</p>
<h2>Wohnmobil, Gespann und Motorrad</h2>
<p>Ein Wohnmobil bis 3,5 Tonnen zulässigem Gesamtgewicht braucht eine Vignette wie ein Pkw; darüber gilt die Vignette nicht, dieser Fall wird hier nicht gerechnet. Das Gespann aus Pkw und Wohnwagen braucht zwei Vignetten. Das Motorrad zahlt den vollen Preis, sein Anhänger ist befreit. Bei einer kurzen Durchreise ist die Schweiz damit für ein Gespann deutlich teurer als ${h.a('vignette-oesterreich', 'Österreich')}, wo der Wohnwagen frei bleibt.</p>
<h2>Tunnel mit eigener Maut</h2>
<p>Eine eigene Maut verlangt der Tunnel des Großen St. Bernhard zwischen Wallis und Aostatal: ${h.eur(gsb.einfach.pkw, 2)} einfach und ${h.eur(gsb.hinzurueck.pkw, 2)} hin und zurück für den Pkw (${h.src('gsb')}). Wer über Chiasso nach Italien weiterfährt, zahlt dort die italienische Autobahnmaut, siehe ${h.a('maut-italien', 'Maut Italien')}.</p>`;
    },
  },
  en: {
    slug: 'switzerland-vignette',
    nav: 'Switzerland vignette',
    card: 'One annual vignette for 14 months, a second one for the caravan, converted to euros.',
    title: 'Vignette for Switzerland 2026: price, e-vignette, caravans',
    description: 'Swiss vignette 2026: annual only, valid 14 months, also as an e-vignette. When a caravan needs a second vignette and what one transit through the country costs.',
    h1: 'Swiss vignette 2026: one vignette, 14 months',
    intro: 'Switzerland has no short-term vignette: the calculator shows what the annual vignette costs in euros for your vehicle and how long it lasts.',
    resume: (h) => {
      const { chf, eur, gespann, stand, bis } = D(h);
      return `There is only one vignette for Swiss national roads: the annual vignette at ${h.geld(chf, 'CHF')}, about ${h.eur(eur, 2)} at the ECB rate of ${h.date(stand)}. It is valid for 14 months, from 1 December of the previous year to 31 January of the following year, so a 2026 vignette bought now lasts until ${h.date(bis)}. The law provides for no short-term vignettes: even if you only cross Switzerland once on the way to Italy, you pay the full price. The vignette comes as a sticker or as an e-vignette tied to the number plate, which is valid as soon as you buy it; both cost the same. A car, a motorcycle and a motorhome up to 3.5 tonnes each need one vignette. A caravan or trailer needs a second one, so a car with caravan pays ${h.geld(gespann.summe, 'CHF')}, roughly ${h.eur(gespann.summeEur, 2)}; trailers pulled by motorcycles are exempt. If you are caught without a valid vignette, the fine is ${h.geld(h.P.vignetten.CH.strafe.betrag, 'CHF')} and you buy the vignette on top.`;
    },
    faqs: (h) => {
      const { chf, gespann, dez, bisDez, V } = D(h);
      return [
        { q: 'Is there a short-term vignette for driving through Switzerland?', a: `No. The national roads levy act provides for no short-term vignettes, as the Swiss customs authority states explicitly. Even for a single transit from Basel to Chiasso you buy the annual vignette at ${h.geld(chf, 'CHF')}. A vignette for a single trip or a few days cannot be bought, neither on the portal nor at the border. The calculator above therefore shows the same amount for any trip length, as long as the trip falls within one vignette period.` },
        { q: 'Does a caravan need its own vignette in Switzerland?', a: `Yes. Switzerland requires a second vignette at the same price for trailers and caravans, so the combination pays ${h.geld(gespann.summe, 'CHF')}. According to the customs directive the only exemptions are trailers pulled by motorcycles, rigid trailers and sidecars. The calculator above therefore counts two vignettes for a car with caravan, whereas in Austria the caravan goes free.` },
        { q: 'Can I drive from the Basel border without a vignette?', a: 'Only at three customs points and only as far as the first exit: if you enter via Basel St. Louis, Rheinfelden or Kreuzlingen and leave the motorway again at the first exit, you need no vignette. This is meant for trips into the border towns. If you carry on towards Lucerne, the Gotthard or Bern, you need a valid vignette from the first metre after that exit.' },
        { q: 'Which Swiss vignette applies to a trip in December?', a: `From 1 December the following year’s vignette is already valid, while the current year’s vignette still runs until the end of January. If you buy on ${h.date(dez)}, you get the ${Number(dez.slice(0, 4)) + 1} vignette, valid until ${h.date(bisDez)}, a full 14 months. For a winter trip from December the new vignette is therefore better value, because for ${h.geld(V.produkte.kfz[0].preis, 'CHF')} it lasts a good year longer.` },
      ];
    },
    body: (h) => {
      const { fz, gsb, stand, ab, bis } = D(h);
      const name: Record<string, string> = { pkw: 'Car', wohnmobil: 'Motorhome up to 3.5 t', gespann: 'Car with caravan', motorrad: 'Motorcycle' };
      const rows = (['pkw', 'wohnmobil', 'gespann', 'motorrad'] as const).map((f) => { const v = fz(f); return [name[f], String(v.wahl[0]?.anzahl ?? 0), h.geld(v.summe, 'CHF'), h.eur(v.summeEur, 2)]; });
      return `<h2>What the vignette costs per vehicle</h2>
${h.table(['Vehicle', 'Vignettes', 'Price', 'in euros'], rows, `Converted at the ECB rate of ${h.date(stand)}; bought for a trip from ${h.date(ab)}, valid until ${h.date(bis)}`, ['l', 'r', 'r', 'r'])}
<p>The price is set in the customs authority’s directive and is the same for the sticker and the e-vignette (${h.src('bazgVignette')}). The euro figure is a conversion at the ${h.src('ezb', 'European Central Bank')} reference rate: the amount charged in euros at the border or a petrol station may differ.</p>
<h2>Sticker or e-vignette?</h2>
<p>The e-vignette is bought on the customs portal using the number plate and is valid once the purchase succeeds, with no waiting period (${h.src('bazgEvignette')}). It runs for the same 14 months as the sticker. The practical difference: the sticker belongs to the windscreen, the e-vignette to the number plate. Replace the windscreen and the sticker is gone; drive a different car and you need an e-vignette for its plate. Unlike the ${h.a('digitale-vignette', 'Austrian digital vignette')}, Switzerland has no 18-day rule.</p>
<h2>Motorhome, caravan and motorcycle</h2>
<p>A motorhome with a permitted total weight up to 3.5 tonnes needs one vignette, like a car; above that the vignette does not apply, and this site does not calculate that case. A car towing a caravan needs two vignettes. A motorcycle pays the full price, while its trailer is exempt. On a short transit Switzerland is therefore much dearer for a caravan than ${h.a('vignette-oesterreich', 'Austria')}, where the caravan pays nothing.</p>
<h2>Tunnels with their own toll</h2>
<p>The Great St Bernard tunnel between Valais and the Aosta Valley charges its own toll: ${h.eur(gsb.einfach.pkw, 2)} one way and ${h.eur(gsb.hinzurueck.pkw, 2)} return for a car (${h.src('gsb')}). If you continue into Italy via Chiasso, Italian motorway tolls apply; see ${h.a('maut-italien', 'Italian tolls')}.</p>`;
    },
  },
  nl: {
    slug: 'vignet-zwitserland',
    nav: 'Vignet Zwitserland',
    card: 'Eén jaarvignet voor 14 maanden, een tweede voor de caravan, omgerekend naar euro.',
    title: 'Vignet Zwitserland 2026: prijs, e-vignet en caravan',
    description: 'Vignet Zwitserland 2026: alleen als jaarvignet, 14 maanden geldig, ook als e-vignet. Wanneer de caravan een tweede vignet nodig heeft en wat de doorreis kost.',
    h1: 'Vignet Zwitserland 2026: één vignet, 14 maanden',
    intro: 'Zwitserland kent geen kortlopend vignet: de rekenhulp toont wat het jaarvignet voor uw voertuig in euro kost en tot wanneer het geldt.',
    resume: (h) => {
      const { chf, eur, gespann, stand, bis } = D(h);
      return `Voor de Zwitserse snelwegen bestaat maar één vignet: het jaarvignet van ${h.geld(chf, 'CHF')}, omgerekend ongeveer ${h.eur(eur, 2)} tegen de ECB-koers van ${h.date(stand)}. Het geldt 14 maanden, van 1 december van het vorige jaar tot 31 januari van het volgende jaar; een vignet 2026 dat u nu koopt, loopt dus tot ${h.date(bis)}. Kortlopende vignetten voorziet de wet niet: ook wie Zwitserland maar één keer doorkruist op weg naar Italië, betaalt de volle prijs. Het vignet bestaat als sticker of als e-vignet, gekoppeld aan de nummerplaat en geldig meteen na de aankoop; beide kosten evenveel. Een auto, een motor en een camper tot 3,5 ton hebben elk één vignet nodig. Een caravan of aanhanger heeft een tweede nodig, zodat een auto met caravan ${h.geld(gespann.summe, 'CHF')} of ongeveer ${h.eur(gespann.summeEur, 2)} betaalt; aanhangers achter een motor zijn vrijgesteld. Wie zonder geldig vignet wordt betrapt, krijgt een boete van ${h.geld(h.P.vignetten.CH.strafe.betrag, 'CHF')} en koopt het vignet er nog bij.`;
    },
    faqs: (h) => {
      const { chf, gespann, dez, bisDez, V } = D(h);
      return [
        { q: 'Bestaat er een kortlopend vignet voor de doorreis door Zwitserland?', a: `Nee. De Zwitserse wet op de snelwegheffing voorziet geen kortlopende vignetten, dat bevestigt de Zwitserse douane uitdrukkelijk. Ook voor één doorrit van Bazel naar Chiasso koopt u het jaarvignet van ${h.geld(chf, 'CHF')}. Een vignet voor één rit of voor enkele dagen is niet te koop, niet op het portaal en niet aan de grens. De rekenhulp hierboven toont daarom voor elke reisduur hetzelfde bedrag, zolang de rit binnen één vignetperiode valt.` },
        { q: 'Heeft een caravan in Zwitserland een eigen vignet nodig?', a: `Ja. Voor aanhangers en caravans vraagt Zwitserland een tweede vignet tegen dezelfde prijs, de combinatie betaalt dus ${h.geld(gespann.summe, 'CHF')}. Volgens de richtlijn van de douane zijn alleen aanhangers achter een motor, starre aanhangers en zijspannen vrijgesteld. De rekenhulp hierboven telt voor een auto met caravan daarom twee vignetten, terwijl de caravan in Oostenrijk vrij blijft.` },
        { q: 'Mag ik vanaf de grens bij Bazel zonder vignet rijden?', a: 'Alleen bij drie douaneposten en alleen tot de eerste afrit: wie via Basel St. Louis, Rheinfelden of Kreuzlingen binnenkomt en de snelweg bij de eerste afrit weer verlaat, heeft geen vignet nodig. Dat is bedoeld voor ritten naar de grenssteden. Wie verder rijdt richting Luzern, Gotthard of Bern, heeft vanaf de eerste meter na die afrit een geldig vignet nodig.' },
        { q: 'Welk Zwitsers vignet geldt bij een reis in december?', a: `Vanaf 1 december geldt al het vignet van het volgende jaar, terwijl het vignet van het lopende jaar nog tot eind januari loopt. Wie op ${h.date(dez)} koopt, krijgt het vignet ${Number(dez.slice(0, 4)) + 1}, geldig tot ${h.date(bisDez)}, dus volle 14 maanden. Voor een winterreis is vanaf december het nieuwe vignet daarom voordeliger, want voor ${h.geld(V.produkte.kfz[0].preis, 'CHF')} gaat het ruim een jaar langer mee.` },
      ];
    },
    body: (h) => {
      const { fz, gsb, stand, ab, bis } = D(h);
      const name: Record<string, string> = { pkw: 'Auto', wohnmobil: 'Camper tot 3,5 t', gespann: 'Auto met caravan', motorrad: 'Motor' };
      const rows = (['pkw', 'wohnmobil', 'gespann', 'motorrad'] as const).map((f) => { const v = fz(f); return [name[f], String(v.wahl[0]?.anzahl ?? 0), h.geld(v.summe, 'CHF'), h.eur(v.summeEur, 2)]; });
      return `<h2>Wat het vignet per voertuig kost</h2>
${h.table(['Voertuig', 'Vignetten', 'Prijs', 'in euro'], rows, `Omgerekend tegen de ECB-koers van ${h.date(stand)}; gekocht voor een rit vanaf ${h.date(ab)}, geldig tot ${h.date(bis)}`, ['l', 'r', 'r', 'r'])}
<p>De prijs staat in de richtlijn van de Zwitserse douane en is gelijk voor de sticker en het e-vignet (${h.src('bazgVignette')}). Het eurobedrag is een omrekening tegen de referentiekoers van de Europese Centrale Bank (${h.src('ezb', 'ECB')}). Aan de grens of bij een tankstation kan het in euro gevraagde bedrag afwijken.</p>
<h2>Sticker of e-vignet?</h2>
<p>Het e-vignet koopt u op het portaal van de douane met de nummerplaat, en het geldt zodra de aankoop gelukt is, zonder wachttijd (${h.src('bazgEvignette')}). Het loopt even lang als de sticker, 14 maanden. Het verschil zit in de praktijk: de sticker hoort bij de voorruit, het e-vignet bij de nummerplaat. Laat u de ruit vervangen, dan is de sticker weg; rijdt u met een andere auto, dan hebt u voor die nummerplaat een eigen e-vignet nodig. Anders dan bij het ${h.a('digitale-vignette', 'digitale vignet in Oostenrijk')} kent Zwitserland geen termijn van 18 dagen.</p>
<h2>Camper, caravan en motor</h2>
<p>Een camper tot 3,5 ton toegelaten totaalgewicht heeft één vignet nodig, net als een auto; daarboven geldt het vignet niet, en dat geval rekent deze site niet. Een auto met caravan heeft twee vignetten nodig. Een motor betaalt de volle prijs, zijn aanhanger is vrijgesteld. Bij een korte doorreis is Zwitserland voor een caravan daarmee flink duurder dan ${h.a('vignette-oesterreich', 'Oostenrijk')}, waar de caravan niets betaalt.</p>
<h2>Tunnels met eigen tol</h2>
<p>Een eigen tol vraagt de tunnel van de Grote Sint-Bernard tussen Wallis en het Aostadal: ${h.eur(gsb.einfach.pkw, 2)} enkele reis en ${h.eur(gsb.hinzurueck.pkw, 2)} heen en terug voor een auto (${h.src('gsb')}). Wie via Chiasso Italië in rijdt, betaalt daar Italiaanse snelwegtol; zie ${h.a('maut-italien', 'tol Italië')}.</p>`;
    },
  },
});
