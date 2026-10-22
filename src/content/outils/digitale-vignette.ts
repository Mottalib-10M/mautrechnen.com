import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Digitale Vignette Österreich : Ende der Klebevignette, 18-Tage-Frist, Kontrolle über das Kennzeichen. */
function D(h: Helpers) {
  const V = h.P.vignetten.AT;
  const kfz = Object.fromEntries(V.produkte.kfz.map((p) => [p.id, p.preis])) as Record<string, number>;
  const moto = Object.fromEntries(V.produkte.moto.map((p) => [p.id, p.preis])) as Record<string, number>;
  const ab = h.M.addDays(h.today, 7);
  // Durchreise in einer Woche, Rückfahrt 14 Tage später : was kauft man kurzfristig ?
  const durch = h.M.vignette('AT', 'pkw', h.M.fahrtage(ab, 14, true, false));
  // Fahrt nach dem letzten Tag mit veröffentlichten Preisen : noch kein Betrag.
  const spaet = h.M.vignette('AT', 'pkw', h.M.fahrtage(h.M.addDays(V.preise_bis, 10), 7, true, false));
  const ende = V.ende_klebevignette, digital = V.nur_digital_ab, frist = V.frist_online_tage;
  return { V, kfz, moto, ab, durch, spaet, ende, digital, frist };
}

export default defineGuide({
  id: 'digitale-vignette',
  group: 'vignette',
  order: 11,
  tool: 'vignette',
  land: 'AT',
  related: ['vignette-oesterreich', 'maut-oesterreich', 'brennermaut', 'vignette-schweiz', 'vignette-slowenien'],
  sources: ['asfinagVignette', 'asfinagDigital', 'asfinagPresse', 'asfinagHelp'],
  de: {
    slug: 'digitale-vignette-oesterreich',
    nav: 'Digitale Vignette',
    card: 'Ende der Klebevignette, 18-Tage-Frist beim Onlinekauf, Kontrolle über das Kennzeichen.',
    title: 'Digitale Vignette 2026: Ende des Pickerls und 18-Tage-Frist',
    description: 'Digitale Vignette Österreich: ab Februar 2027 gibt es kein Pickerl mehr. Was die 18-Tage-Frist beim Onlinekauf bedeutet und welche Vignette sofort gilt.',
    h1: 'Digitale Vignette Österreich: was sich 2027 ändert',
    intro: 'Die Klebevignette 2026 ist die letzte: hier steht, ab wann nur noch die digitale Vignette gilt und welche Fristen beim Onlinekauf laufen.',
    resume: (h) => {
      const { kfz, ende, digital, frist } = D(h);
      return `Die digitale Vignette ist in Österreich keine Neuheit, sie wird aber zur einzigen Form: Die ASFINAG verkauft für das Jahr 2026 zum letzten Mal die rote Klebevignette, nennt den ${h.date(ende)} als Tag der Umstellung und bietet ab dem ${h.date(digital)} nur noch digitale Vignetten an, die an das Kennzeichen gebunden sind. Kontrolliert wird über das Kennzeichen, an der Windschutzscheibe klebt nichts mehr. Wichtig für kurzfristige Reisen ist die Frist beim Onlinekauf: Wer als Verbraucher die 2-Monats-Vignette (${h.eur(kfz['2m'], 2)}) oder die Jahresvignette (${h.eur(kfz.jahr, 2)}) im Webshop kauft, fährt damit erst ab dem ${frist}. Tag nach dem Kauf, weil 14 Tage Rücktrittsrecht und drei Tage für einen möglichen Postweg abgewartet werden. Die 1-Tages-Vignette (${h.eur(kfz['1t'], 2)}) und die 10-Tages-Vignette (${h.eur(kfz['10t'], 2)}) gelten dagegen sofort. Die Preise für das Vignettenjahr 2027 hat die ASFINAG noch nicht veröffentlicht.`;
    },
    faqs: (h) => {
      const { ende, kfz, spaet } = D(h);
      return [
        { q: 'Muss ich die digitale Vignette bei einer Kontrolle vorzeigen?', a: `Nein. Die digitale Vignette ist an das Kennzeichen gebunden, und die ASFINAG prüft genau dieses Kennzeichen. Ein Ausdruck oder ein Aufkleber ist deshalb nicht nötig. Entscheidend ist, dass das beim Kauf angegebene Kennzeichen genau dem am Fahrzeug entspricht und dass die Gültigkeit am Fahrtag bereits begonnen hat. Bei der 1-Tages-Vignette für ${h.eur(kfz['1t'], 2)} ist das sofort der Fall.` },
        { q: 'Bis wann darf ich mit der Klebevignette 2026 noch fahren?', a: `Die Jahres-Klebevignette 2026 gilt laut ASFINAG bis einschließlich ${h.date(ende)}, 23:59 Uhr. Das ist zugleich der Tag, den die ASFINAG für die Umstellung nennt. Wer danach noch auf österreichischen Autobahnen fährt, braucht eine digitale Vignette für das neue Vignettenjahr. Eine Klebevignette für 2027 wird es nicht geben, auch nicht an Tankstellen oder an der Grenze.` },
        { q: 'Welche Vignette kann ich am Abreisetag noch online kaufen?', a: `Ohne Wartezeit nur die 1-Tages- und die 10-Tages-Vignette, denn die Frist von 18 Tagen betrifft im Webshop allein die 2-Monats- und die Jahresvignette. Für eine Durchreise mit Hin- und Rückfahrt reichen ohnehin meist zwei 1-Tages-Vignetten oder eine 10-Tages-Vignette. Wer kurzfristig eine lange Laufzeit braucht, kauft sie an einer Verkaufsstelle, wo die Rücktrittsfrist des Onlinekaufs nicht greift.` },
        { q: 'Was kostet die digitale Vignette für das Jahr 2027?', a: `Das steht am ${h.date(h.today)} noch nicht fest: Die ASFINAG hat die Preise für das Vignettenjahr 2027 noch nicht veröffentlicht, und auch die Streckenmaut 2027 ist offen. Unser Rechner zeigt für Fahrten ab dem 1. Dezember 2026 deshalb ${spaet.verfuegbar ? 'nur die Preise 2026' : 'keinen Betrag'}, statt eine Schätzung als Preis auszugeben. Sobald die neuen Tarife amtlich sind, werden sie hier eingetragen.` },
      ];
    },
    body: (h) => {
      const { kfz, moto, ab, durch, ende, digital, frist } = D(h);
      const rows = [
        ['1-Tages-Vignette', h.eur(kfz['1t'], 2), h.eur(moto['1t'], 2), 'sofort'],
        ['10-Tages-Vignette', h.eur(kfz['10t'], 2), h.eur(moto['10t'], 2), 'sofort'],
        ['2-Monats-Vignette', h.eur(kfz['2m'], 2), h.eur(moto['2m'], 2), `ab dem ${frist}. Tag`],
        ['Jahresvignette 2026', h.eur(kfz.jahr, 2), h.eur(moto.jahr, 2), `ab dem ${frist}. Tag`],
      ];
      return `<h2>Der Zeitplan der Umstellung</h2>
<p>Die ASFINAG hat im Oktober 2025 angekündigt, dass die feuerrote Klebevignette 2026 die letzte ihrer Art ist (${h.src('asfinagPresse')}). Die Jahresvignette 2026 gilt vom 1. Dezember 2025 bis zum ${h.date(ende)}. Ab dem ${h.date(digital)} gibt es ausschließlich digitale Varianten, für alle Laufzeiten vom einen Tag bis zum ganzen Jahr. Für Reisende ändert sich dadurch vor allem eines: Man kauft vor der Fahrt mit dem Kennzeichen statt einen Aufkleber an die Scheibe zu kleben.</p>
<h2>Gültigkeit beim Onlinekauf</h2>
${h.table(['Produkt', 'Pkw, Wohnmobil bis 3,5 t', 'Motorrad', 'gültig im Webshop (Verbraucher)'], rows, undefined, ['l', 'r', 'r', 'l'])}
<p>Die Frist von ${frist} Tagen ergibt sich aus 14 Tagen Rücktrittsrecht und drei weiteren Tagen für einen möglichen Postweg (${h.src('asfinagDigital')}). Sie gilt für Verbraucher, die im Webshop eine 2-Monats- oder Jahresvignette kaufen. Wer also erst am Wochenende vor der Abfahrt bestellt, hat am Reisetag womöglich noch keine gültige lange Vignette, obwohl der Kauf bezahlt ist.</p>
<h2>Was das für eine Urlaubsfahrt heißt</h2>
<p>Für die typische Durchreise nach Italien, Slowenien oder Kroatien ist die Frist meist ohne Bedeutung, weil man nur zwei Tage in Österreich fährt. Bei einer Abfahrt am ${h.date(ab)} und Rückfahrt zwei Wochen später ergibt der Rechner oben ${durch.verfuegbar ? `${h.eur(durch.summeEur, 2)} für ${durch.wahl.length === 2 ? 'zwei 1-Tages-Vignetten' : 'die günstigste Kombination'}` : 'noch keinen Betrag, weil die Preise 2027 fehlen'}: beide gelten sofort. Erst wer Österreich häufig durchfährt oder dort Urlaub mit vielen Autobahntagen macht, braucht eine lange Laufzeit und sollte die Frist einplanen. Die Preise im Überblick stehen auf der Seite ${h.a('vignette-oesterreich', 'Vignette Österreich')}.</p>
<h2>Kennzeichen statt Pickerl</h2>
<p>Die Kontrolle läuft über das Kennzeichen, deshalb muss es beim Kauf vollständig und richtig eingegeben werden, mit dem Land der Zulassung. Ein Wohnwagen braucht keine eigene Vignette, solange das Zugfahrzeug höchstens 3,5 Tonnen hat (${h.src('asfinagHelp')}). Auf den Streckenmaut-Abschnitten, etwa am Brenner oder am Tauern, zahlt man unabhängig von der Vignette, siehe ${h.a('maut-oesterreich', 'Maut Österreich')}.</p>
<p>Wo kaufen? Im Webshop der ASFINAG oder an den Verkaufsstellen der ASFINAG und ihrer Partner. Andere Anbieter im Netz verlangen für dieselbe Vignette häufig eine Servicegebühr.</p>`;
    },
  },
  en: {
    slug: 'austria-digital-vignette',
    nav: 'Digital vignette',
    card: 'End of the sticker, the 18-day rule for online purchases, checks by number plate.',
    title: 'Digital vignette for Austria 2026: end of the sticker',
    description: 'Digital vignette Austria: from February 2027 there is no sticker any more. What the 18-day rule for online purchases means and which vignette is valid at once.',
    h1: 'Austria’s digital vignette: what changes in 2027',
    intro: 'The 2026 sticker is the last one: here is when only the digital vignette remains, and which waiting periods apply when you buy online.',
    resume: (h) => {
      const { kfz, ende, digital, frist } = D(h);
      return `The digital vignette is not new in Austria, but it is about to become the only kind: ASFINAG is selling the red sticker vignette for the last time for 2026, names ${h.date(ende)} as the switch-over day and from ${h.date(digital)} offers only digital vignettes, which are tied to the number plate. Checks run on the number plate, so nothing is stuck to the windscreen any more. What matters for short-notice trips is the waiting period when you buy online: as a consumer, a 2-month vignette (${h.eur(kfz['2m'], 2)}) or an annual vignette (${h.eur(kfz.jahr, 2)}) bought in the web shop is only valid from the ${frist}th day after purchase, because 14 days for withdrawal and three days for possible postal delivery have to pass first. The 1-day vignette (${h.eur(kfz['1t'], 2)}) and the 10-day vignette (${h.eur(kfz['10t'], 2)}) are valid straight away. ASFINAG has not yet published the prices for the 2027 vignette year.`;
    },
    faqs: (h) => {
      const { ende, kfz, spaet } = D(h);
      return [
        { q: 'Do I have to show my digital vignette at a check?', a: `No. The digital vignette is linked to your number plate, and ASFINAG checks exactly that plate. You need no printout and no sticker. What counts is that the plate you entered when buying matches the one on the vehicle and that validity has already started on the day you drive. With the 1-day vignette at ${h.eur(kfz['1t'], 2)} that is the case immediately.` },
        { q: 'Until when can I keep using the 2026 sticker vignette?', a: `According to ASFINAG the 2026 annual sticker is valid up to and including ${h.date(ende)}, 23:59. That is also the day ASFINAG gives for the switch-over. Anyone driving on Austrian motorways after that needs a digital vignette for the new vignette year. There will be no 2027 sticker, neither at petrol stations nor at the border.` },
        { q: 'Which vignette can I still buy online on the day I leave?', a: 'Without any wait, only the 1-day and the 10-day vignettes, because the 18-day period in the web shop applies only to the 2-month and annual vignettes. For a transit trip out and back, two 1-day vignettes or one 10-day vignette are usually enough anyway. If you need a long duration at short notice, buy it at a sales outlet, where the online withdrawal period does not apply.' },
        { q: 'How much will the digital vignette cost for 2027?', a: `That is not known as of ${h.date(h.today)}: ASFINAG has not yet published the prices for the 2027 vignette year, and the 2027 section tolls are open too. Our calculator therefore shows ${spaet.verfuegbar ? 'only 2026 prices' : 'no amount'} for trips from 1 December 2026, rather than passing off an estimate as a price. The new rates will be added once they are official.` },
      ];
    },
    body: (h) => {
      const { kfz, moto, ab, durch, ende, digital, frist } = D(h);
      const rows = [
        ['1-day vignette', h.eur(kfz['1t'], 2), h.eur(moto['1t'], 2), 'at once'],
        ['10-day vignette', h.eur(kfz['10t'], 2), h.eur(moto['10t'], 2), 'at once'],
        ['2-month vignette', h.eur(kfz['2m'], 2), h.eur(moto['2m'], 2), `from day ${frist}`],
        ['2026 annual vignette', h.eur(kfz.jahr, 2), h.eur(moto.jahr, 2), `from day ${frist}`],
      ];
      return `<h2>The switch-over timetable</h2>
<p>In October 2025 ASFINAG announced that the bright red 2026 sticker would be the last of its kind (${h.src('asfinagPresse')}). The 2026 annual vignette runs from 1 December 2025 to ${h.date(ende)}. From ${h.date(digital)} only digital versions exist, for every duration from one day to a full year. For travellers one thing changes above all: you register the number plate before the trip instead of sticking a label on the windscreen.</p>
<h2>When an online purchase becomes valid</h2>
${h.table(['Product', 'Car, motorhome up to 3.5 t', 'Motorcycle', 'valid in the web shop (consumers)'], rows, undefined, ['l', 'r', 'r', 'l'])}
<p>The ${frist}-day period comes from 14 days of withdrawal rights plus three more days for possible postal delivery (${h.src('asfinagDigital')}). It applies to consumers buying a 2-month or annual vignette in the web shop. If you only order at the weekend before you leave, you may not yet have a valid long vignette on the day you travel, even though you have paid.</p>
<h2>What it means for a holiday drive</h2>
<p>For the usual transit to Italy, Slovenia or Croatia the waiting period rarely matters, because you only drive in Austria on two days. Leaving on ${h.date(ab)} and returning two weeks later, the calculator above gives ${durch.verfuegbar ? `${h.eur(durch.summeEur, 2)} for ${durch.wahl.length === 2 ? 'two 1-day vignettes' : 'the cheapest combination'}` : 'no amount yet, because 2027 prices are missing'}, and both are valid at once. Only if you cross Austria often, or spend a holiday there with many motorway days, do you need a long duration and should plan for the wait. All prices are on the ${h.a('vignette-oesterreich', 'Austria vignette')} page.</p>
<h2>Number plate instead of sticker</h2>
<p>Enforcement uses the number plate, so enter it completely and correctly when buying, including the country of registration. A caravan needs no vignette of its own as long as the towing vehicle weighs no more than 3.5 tonnes (${h.src('asfinagHelp')}). On the section-toll stretches, such as the Brenner or the Tauern, you pay regardless of the vignette; see ${h.a('maut-oesterreich', 'Austrian tolls')}.</p>
<p>Where to buy? In ASFINAG’s web shop or at the sales outlets of ASFINAG and its partners. Other online sellers often add a service fee for the same vignette.</p>`;
    },
  },
  nl: {
    slug: 'digitaal-vignet-oostenrijk',
    nav: 'Digitaal vignet',
    card: 'Einde van het plakvignet, regel van 18 dagen bij online kopen, controle op de nummerplaat.',
    title: 'Digitaal vignet Oostenrijk 2026: einde plakvignet, 18 dagen',
    description: 'Digitaal vignet Oostenrijk: vanaf februari 2027 bestaat geen plakvignet meer. Wat de regel van 18 dagen bij online kopen betekent en welk vignet direct geldt.',
    h1: 'Digitaal vignet Oostenrijk: wat er in 2027 verandert',
    intro: 'Het plakvignet van 2026 is het laatste: hier leest u vanaf wanneer alleen nog het digitale vignet geldt en welke termijnen gelden bij online kopen.',
    resume: (h) => {
      const { kfz, ende, digital, frist } = D(h);
      return `Het digitale vignet is in Oostenrijk niet nieuw, maar het wordt de enige vorm: ASFINAG verkoopt voor 2026 voor het laatst het rode plakvignet, noemt ${h.date(ende)} als dag van de overstap en biedt vanaf ${h.date(digital)} alleen nog digitale vignetten aan, gekoppeld aan de nummerplaat. De controle gebeurt op de nummerplaat, op de voorruit kleeft niets meer. Belangrijk bij een reis op korte termijn is de wachttijd bij online kopen: wie als consument het 2-maandenvignet (${h.eur(kfz['2m'], 2)}) of het jaarvignet (${h.eur(kfz.jahr, 2)}) in de webwinkel koopt, mag er pas vanaf de ${frist}e dag na de aankoop mee rijden, omdat eerst 14 dagen bedenktijd en drie dagen voor een eventuele verzending per post verstrijken. Het dagvignet (${h.eur(kfz['1t'], 2)}) en het 10-dagenvignet (${h.eur(kfz['10t'], 2)}) gelden daarentegen meteen. De prijzen voor het vignetjaar 2027 heeft ASFINAG nog niet gepubliceerd.`;
    },
    faqs: (h) => {
      const { ende, kfz, spaet } = D(h);
      return [
        { q: 'Moet ik het digitale vignet bij een controle laten zien?', a: `Nee. Het digitale vignet is gekoppeld aan uw nummerplaat en ASFINAG controleert precies die plaat. Een afdruk of sticker is dus niet nodig. Wat telt, is dat de nummerplaat die u bij de aankoop invulde exact overeenkomt met die op het voertuig, en dat de geldigheid op de rijdag al begonnen is. Bij het dagvignet van ${h.eur(kfz['1t'], 2)} is dat meteen zo.` },
        { q: 'Tot wanneer mag ik nog met het plakvignet van 2026 rijden?', a: `Volgens ASFINAG geldt het jaarplakvignet van 2026 tot en met ${h.date(ende)}, 23:59 uur. Dat is ook de dag die ASFINAG voor de overstap noemt. Wie daarna nog op de Oostenrijkse snelwegen rijdt, heeft een digitaal vignet voor het nieuwe vignetjaar nodig. Een plakvignet voor 2027 komt er niet, ook niet bij tankstations of aan de grens.` },
        { q: 'Welk vignet kan ik op de dag van vertrek nog online kopen?', a: 'Zonder wachttijd alleen het dagvignet en het 10-dagenvignet, want de termijn van 18 dagen in de webwinkel geldt alleen voor het 2-maanden- en het jaarvignet. Voor een doorreise heen en terug volstaan meestal toch twee dagvignetten of één 10-dagenvignet. Wie op korte termijn een lange duur nodig heeft, koopt die in een verkooppunt, waar de bedenktijd van de online aankoop niet speelt.' },
        { q: 'Wat gaat het digitale vignet voor 2027 kosten?', a: `Dat staat op ${h.date(h.today)} nog niet vast: ASFINAG heeft de prijzen voor het vignetjaar 2027 nog niet gepubliceerd, en ook de trajecttol voor 2027 is nog open. Onze rekenhulp toont voor ritten vanaf 1 december 2026 daarom ${spaet.verfuegbar ? 'alleen de prijzen van 2026' : 'geen bedrag'}, in plaats van een schatting als prijs te presenteren. Zodra de nieuwe tarieven officieel zijn, komen ze hier.` },
      ];
    },
    body: (h) => {
      const { kfz, moto, ab, durch, ende, digital, frist } = D(h);
      const rows = [
        ['Dagvignet', h.eur(kfz['1t'], 2), h.eur(moto['1t'], 2), 'meteen'],
        ['10-dagenvignet', h.eur(kfz['10t'], 2), h.eur(moto['10t'], 2), 'meteen'],
        ['2-maandenvignet', h.eur(kfz['2m'], 2), h.eur(moto['2m'], 2), `vanaf dag ${frist}`],
        ['Jaarvignet 2026', h.eur(kfz.jahr, 2), h.eur(moto.jahr, 2), `vanaf dag ${frist}`],
      ];
      return `<h2>Het tijdschema van de overstap</h2>
<p>In oktober 2025 maakte ASFINAG bekend dat het knalrode plakvignet van 2026 het laatste in zijn soort is (${h.src('asfinagPresse')}). Het jaarvignet 2026 loopt van 1 december 2025 tot ${h.date(ende)}. Vanaf ${h.date(digital)} bestaan alleen nog digitale varianten, voor elke duur van één dag tot een heel jaar. Voor reizigers verandert vooral één ding: u registreert vóór de rit uw nummerplaat in plaats van een sticker op de ruit te plakken.</p>
<h2>Wanneer een online aankoop geldig wordt</h2>
${h.table(['Product', 'Auto, camper tot 3,5 t', 'Motor', 'geldig in de webwinkel (consument)'], rows, undefined, ['l', 'r', 'r', 'l'])}
<p>De termijn van ${frist} dagen bestaat uit 14 dagen herroepingsrecht en drie extra dagen voor een eventuele verzending per post (${h.src('asfinagDigital')}). Hij geldt voor consumenten die in de webwinkel een 2-maanden- of jaarvignet kopen. Wie pas in het weekend vóór vertrek bestelt, heeft op de reisdag dus mogelijk nog geen geldig lang vignet, ook al is er betaald.</p>
<h2>Wat dat betekent voor een vakantierit</h2>
<p>Voor de gewone doorreis naar Italië, Slovenië of Kroatië speelt de termijn zelden een rol, want u rijdt maar op twee dagen in Oostenrijk. Bij vertrek op ${h.date(ab)} en terugkeer twee weken later geeft de rekenhulp hierboven ${durch.verfuegbar ? `${h.eur(durch.summeEur, 2)} voor ${durch.wahl.length === 2 ? 'twee dagvignetten' : 'de goedkoopste combinatie'}` : 'nog geen bedrag, omdat de prijzen van 2027 ontbreken'}, en die gelden allebei meteen. Pas wie vaak door Oostenrijk rijdt of er vakantie houdt met veel snelwegdagen, heeft een lange duur nodig en moet de wachttijd inplannen. Alle prijzen staan op de pagina ${h.a('vignette-oesterreich', 'vignet Oostenrijk')}.</p>
<h2>Nummerplaat in plaats van sticker</h2>
<p>De controle verloopt via de nummerplaat, dus vul die bij de aankoop volledig en juist in, met het land van inschrijving. Een caravan heeft geen eigen vignet nodig zolang het trekkende voertuig hoogstens 3,5 ton weegt (${h.src('asfinagHelp')}). Op de trajecten met trajecttol, zoals de Brenner of de Tauern, betaalt u los van het vignet; zie ${h.a('maut-oesterreich', 'tol Oostenrijk')}.</p>
<p>Waar kopen? In de webwinkel van ASFINAG of in de verkooppunten van ASFINAG en haar partners. Andere verkopers op het internet rekenen voor hetzelfde vignet vaak servicekosten.</p>`;
    },
  },
});
