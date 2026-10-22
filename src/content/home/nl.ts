import type { Helpers } from '../../lib/guide-types';
import { route } from '../../i18n/routes';
import { daten, linkliste } from './daten';

const NAMEN: Record<string, string> = {
  'vignette-oesterreich': 'Vignet Oostenrijk: prijzen en goedkoopste looptijd',
  'digitale-vignette': 'Digitaal vignet Oostenrijk: einde van de sticker in 2027',
  'vignette-schweiz': 'Vignet Zwitserland: jaarvignet en aanhanger',
  'vignette-slowenien': 'Vignet Slovenië: klassen 2A en 2B',
  'vignette-tschechien': 'Vignet Tsjechië: prijzen in kronen',
  'vignette-ungarn': 'Vignet Hongarije: e-matrica D1',
  'maut-italien': 'Tol Italië: kilometertarieven en schatting',
  'maut-frankreich': 'Tol Frankrijk: klassen en tariefbladen',
  'maut-kroatien': 'Tol Kroatië: prijzen tot Split en Istrië',
  'maut-spanien': 'Tol Spanje: AP-7, Costa del Sol, AP-6',
  'benzinpreis-frankreich': 'Benzineprijs Frankrijk',
  'benzineprijs-duitsland': 'Benzineprijs Duitsland',
  'benzineprijs-belgie': 'Benzineprijs België',
  'tanken-luxemburg': 'Tanken in Luxemburg',
  'maut-nach-kroatien': 'Tol naar Kroatië: de hele rit',
  'maut-nach-italien': 'Tol naar Italië: via Zwitserland of Oostenrijk',
};

export const nl = {
  start: 'utrecht', ziel: 'nizza',
  title: 'Tol berekenen 2026: tol, vignetten en brandstof per land',
  description: 'Tol berekenen 2026 voor de vakantierit: vignetten, tol, tunnels en brandstof voor elk land op de route, volgens de tarieven van de beheerders, zonder account.',
  h1: 'Tol berekenen 2026: wat kost de rit naar uw vakantie?',
  intro: 'Kies vertrek, bestemming en voertuig: vignetten, tol, tunnels en brandstof voor elk land op de route, heen en terug.',
  resume: (h: Helpers) => {
    const { haupt: r } = daten(h);
    if (!r) return '';
    return `Deze rekenhulp telt de kosten van een vakantierit met auto, camper, auto met caravan of motor op voor elk land op de route: de vignetten van Oostenrijk, Zwitserland, Slovenië, Tsjechië, Hongarije en Slowakije in de looptijd die voor uw reisdata het goedkoopst is, de tol per traject in Frankrijk, Italië, Kroatië en Spanje, de trajecttol van de Oostenrijkse Alpentunnels en de brandstof tegen de officiële gemiddelde prijs van elk land. Alle tarieven komen uit de prijslijsten van de beheerders en zijn gedateerd; wat wij niet konden lezen, staat als “niet geverifieerd” zonder bedrag, en de Italiaanse tol verschijnt apart als schatting. Voor een rit met de auto van Utrecht naar Nice, vertrek op ${h.date(h.M.addDays(h.today, 7))} en terugreis veertien dagen later, komt de rekenhulp op ${h.eur(r.summen.vignetten, 2)} aan vignetten, ${h.eur(r.summen.mautGeprueft, 2)} aan gelezen tol en ${h.eur(r.summen.sprit, 2)} aan brandstof, samen ${h.eur(r.summen.gesamt, 2)} heen en terug${r.offen.length ? `, zonder ${r.offen.length} niet-geverifieerde trajecten` : ''}. Alles rekent in uw browser, zonder account.`;
  },
  faqs: (h: Helpers) => {
    const { vignetten } = daten(h);
    const at = vignetten.find((v) => v.c === 'AT')!;
    return [
      { q: 'Waarom telt de rekenhulp voor het vignet maar twee dagen?', a: `Omdat u een land waar u alleen doorheen rijdt op twee dagen gebruikt: de dag van de heenreis en de dag van de terugreis. Voor Oostenrijk zijn bij veertien dagen vakantie daarom vaak twee dagvignetten goedkoper dan een langere looptijd, samen nu ${at.pkw.verfuegbar ? h.eur(at.pkw.summeEur, 2) : 'een nog niet gepubliceerd bedrag'}. Rijdt u in het vakantieland ook tijdens het verblijf op de snelweg, vink dat dan aan; het vignet dekt dan alle dagen.` },
      { q: 'Wat betekent “niet geverifieerd” in de uitkomst?', a: 'Op uw route ligt een traject waarvan wij de prijs niet bij de beheerder konden lezen, bijvoorbeeld bij Sanef in Noord-Frankrijk of bij enkele Italiaanse concessiehouders. In plaats van een bedrag te verzinnen, toont de rekenhulp het traject zonder prijs en telt het niet mee. Het totaal is dan een ondergrens. Zodra een tariefblad leesbaar is, nemen wij het op met datum en bron.' },
      { q: 'Hoe actueel zijn de brandstofprijzen in de rekenhulp?', a: `Ze komen uit de Weekly Oil Bulletin van de Europese Commissie, die elke week de gemiddelde prijzen inclusief belastingen voor elke lidstaat publiceert. De rekenhulp gebruikt nu de stand van ${h.date(h.M.SPRIT_STAND)}. Een script leest de bulletin elke dinsdag en donderdag opnieuw in. Voor Zwitserland bestaat in deze reeks geen cijfer; daar vult u de literprijs zelf in.` },
      { q: 'Kost de rekenhulp iets of heb je een account nodig?', a: 'Nee. De rekenhulp is gratis, vraagt geen registratie of e-mailadres en rekent volledig in uw browser; uw route en data worden niet naar ons gestuurd. Er staan geen links naar vignetverkopers of tolkastjes in. Een vignet koopt u bij het officiële verkooppunt van het land, waarvan wij de pagina als bron vermelden.' },
      { q: 'Kan ik de reiskostenrekenhulp op mijn eigen website plaatsen?', a: 'Ja. Op de pagina “Widget” staat een korte code waarmee u de rekenhulp in een blog, op de site van een camping of in een reisforum kunt inbouwen. Hij toont dezelfde tarieven als deze site en wordt samen met haar bijgewerkt. In de widget staat geen reclame en hij kost niets; een link naar de bron blijft zichtbaar.' },
      { q: 'Hoe weet ik of een prijs in de rekenhulp nog geldt?', a: `Elk tarief staat met bron en leesdatum in ons parameterbestand, het laatst gelezen op ${h.date(h.P.retrieved_at)}. Bij vignetten kennen wij ook het einde van de prijsperiode; valt uw reis daarna en heeft de beheerder nog geen nieuwe prijzen gepubliceerd, dan toont de rekenhulp “prijzen 2027 nog niet gepubliceerd” in plaats van een oud bedrag. De methode beschrijft elke stap.` },
      { q: 'Wie zit er achter deze tolrekenhulp?', a: 'De site wordt beheerd door het bedrijf Radif Partners. Het is geen overheid en geen tolbeheerder en spreekt niet namens ASFINAG, de Zwitserse douane, DARS of een andere instantie. Wij lezen de openbare tariefbladen, rekenen ze na en vermelden bij elk bedrag de bron. Fouten kunt u via de contactpagina melden; wij verbeteren ze met datum.' },
    ];
  },
  body: (h: Helpers) => {
    const { fahrten, vignetten, vz, sprit, T, ab, go } = daten(h);
    const kopf = ['Route', 'Afstand', 'Vignetten', 'Tol (gelezen)', 'Tol (schatting)', 'Brandstof', 'Totaal'];
    const vRows = vignetten.map((v) => [h.land(v.c), vz(v.pkw), vz(v.wm), vz(v.mo)]);
    const sRows = sprit.map((s) => [h.land(s.c), h.l3(s.e95), s.diesel != null ? h.l3(s.diesel) : '–']);
    const g = go('utrecht', 'split', 'gespann'), w = go('utrecht', 'split', 'wohnmobil'), p = go('utrecht', 'split');
    return `<h2>Waarom deze rekenhulp</h2>
<p>Deze site doet het beter dan het eerste resultaat in Google omdat hij berekent wat de pagina van alpacacamping.de alleen doorschuift naar andere hulpmiddelen: de volledige kosten van de heen- en terugreis, met het vignet van de goedkoopste duur voor uw data, elke tol volgens het tariefblad 2026 van de beheerder (en met “schatting” of “niet geverifieerd” als dat niet zo is) en de brandstof tegen de officiële prijs van elk doorreisland, zonder registratie en zonder link naar een verkoper.</p>
<p>De meeste pagina’s over tol behandelen het ene land na het andere. Bij het plannen van een vakantie telt echter het totaal: wie naar Kroatië rijdt, heeft twee vignetten nodig, betaalt twee tunnels in Oostenrijk en de Kroatische snelweg, en tankt in vijf landen tegen vijf prijzen. De rekenhulp hierboven legt de route door een netwerk van ongeveer 130 plaatsen en grensovergangen, zoekt de snelste verbinding en wijst elke kilometer toe aan een land en een soort heffing. Hoe dat precies gaat, staat in de <a href="${route('method', 'nl')}">methode</a>. Wie achter de site zit, leest u op <a href="${route('about', 'nl')}">over ons</a>.</p>
<h2>Zo gebruikt u de rekenhulp</h2>
<p>Kies hierboven vertrek en bestemming, dan het voertuig, de brandstofsoort en uw verbruik per 100 kilometer. Vul de dag van vertrek in en het aantal dagen tot de terugreis, en kies of u heen en terug rijdt. Rijdt u in het vakantieland ook tijdens het verblijf over de snelweg, vink dat dan aan, zodat het vignet alle dagen dekt. Wilt u een land vermijden, sluit het dan uit; de rekenhulp zoekt een andere route en laat zien wat die kost. De uitkomst toont elk land met zijn posten apart, met de bron van elk tarief, zodat u elk bedrag zelf kunt nagaan.</p>
<h2>Voorbeelden: wat gangbare vakantieritten kosten</h2>
${fahrten([['utrecht', 'nizza'], ['amsterdam', 'split'], ['rotterdam', 'gardasee'], ['eindhoven', 'rimini'], ['groningen', 'venedig'], ['antwerpen', 'lloret'], ['bruessel', 'orange'], ['gent', 'pula']], kopf, `Auto, Euro 95, heen en terug, vertrek ${h.date(ab)}, 14 dagen verblijf`)}
<p>De kolom “Tol (gelezen)” bevat alleen bedragen die wij op een tariefblad hebben gelezen. De Italiaanse tol staat ernaast als schatting, omdat Italië wel kilometertarieven publiceert maar geen vrij leesbare afstanden tussen tolstations. “nv” telt de trajecten waarvan wij de prijs niet kennen; ze ontbreken in het totaal. Routes via Noord-Frankrijk komen vaak langs snelwegen van Sanef, waarvan wij de tarieven niet konden lezen. De brandstof is berekend met ${h.num(h.P.verbrauch_vorgabe.pkw)} liter per 100 km en het landelijke gemiddelde van elk land onderweg. Verandert u in de rekenhulp voertuig, verbruik, data of brandstof, dan verandert elke regel mee.</p>
<h2>Vignetten: welke looptijd voor een doorreis?</h2>
${h.table(['Land', 'Auto', 'Camper', 'Motor'], vRows, `Goedkoopste combinatie bij vertrek op ${h.date(ab)} en terugreis 14 dagen later, in euro`, ['l', 'r', 'r', 'r'])}
<p>Zes landen op de vakantieroutes vragen een vignet met een looptijd. Per land bekijkt de rekenhulp alle producten en kiest de goedkoopste combinatie die uw rijdagen dekt: in Oostenrijk vaak twee dagvignetten, in Slovenië afhankelijk van de tussenperiode twee weekvignetten of een maandvignet, in Zwitserland altijd het jaarvignet, omdat er niets korters bestaat. Prijzen in kronen, forint of franken rekent hij om tegen de referentiekoers van de Europese Centrale Bank. Een streepje betekent dat er voor die data nog geen prijzen zijn gepubliceerd. Meer op de pagina’s over ${h.a('vignette-oesterreich', 'Oostenrijk')}, ${h.a('vignette-schweiz', 'Zwitserland')}, ${h.a('vignette-slowenien', 'Slovenië')}, ${h.a('vignette-tschechien', 'Tsjechië')} en ${h.a('vignette-ungarn', 'Hongarije')}.</p>
<p>In Tsjechië en Slowakije zijn motoren vrijgesteld, in Zwitserland heeft een aanhanger of caravan een eigen vignet nodig, in Oostenrijk niet. In Slovenië bepaalt de hoogte boven de vooras of een voertuig in klasse 2A of 2B valt; de regel voor caravans hebben wij bij DARS niet gevonden, dus de rekenhulp telt daar alleen het vignet van de trekkende auto en meldt dat.</p>
<h2>Tol per traject: Frankrijk, Italië, Kroatië, Spanje</h2>
<p>In Frankrijk betaalt u volgens op- en afrit binnen gesloten systemen. Wij hebben de tariefbladen 2026 van APRR, ASF en Escota gelezen, die sinds 1 februari 2026 gelden, en de rekenhulp rekent uw route systeem per systeem door. Sanef, dat vooral de snelwegen in het noorden en oosten beheert, blokkeert het automatisch opvragen van zijn lijst; die trajecten verschijnen als “niet geverifieerd”. Campers boven twee meter en auto’s met caravan betalen in Frankrijk klasse 2, motoren klasse 5. Meer op ${h.a('maut-frankreich', 'tol Frankrijk')}.</p>
<p>Italië rekent per kilometer tussen op- en afrit, met tarieven per beheerder voor vlakke en bergachtige trajecten. De kilometertarieven 2026 van Autostrade per l’Italia en de Brennersnelweg A22 zijn gepubliceerd, de precieze afstanden tussen de tolstations niet. Ons bedrag is daarom een schatting, afgerond op 10 cent zoals bij de tolpoort. Voor enkele concessies, waaronder de A4 tussen Brescia en Padua en Autostrade Alto Adriatico, hebben wij geen tarief gelezen. De klassen en de formule staan op ${h.a('maut-italien', 'tol Italië')}.</p>
<p>Kroatië heeft geen vignet maar prijslijsten per traject bij HAC, Autocesta Zagreb–Macelj en BINA-Istra; elk voertuig met aanhanger valt daar in groep II. In Spanje staat de AP-7 van de Franse grens tot Valencia niet meer in de tariefbladen 2026; betalen doet u nog aan de Costa del Sol en op de AP-6 bij Madrid. De pagina’s ${h.a('maut-kroatien', 'tol Kroatië')} en ${h.a('maut-spanien', 'tol Spanje')} geven alle gelezen prijzen.</p>
<h2>Alpentunnels en trajecttol</h2>
<p>Naast het vignet heft Oostenrijk trajecttol op vijf Alpenroutes: Brenner, Tauern, Karawanken, Pyhrn en Arlberg. Elke enkele rit geldt voor één richting; auto, camper tot 3,5 ton en motor betalen hetzelfde, een aanhanger niets. Op weg naar Kroatië passeert u meestal de Tauern en de Karawanken, op weg naar Italië de Brenner. Daarnaast zijn er de grote tunnels tussen Frankrijk, Zwitserland en Italië: de Mont-Blanctunnel kost een auto ${h.eur(T.montblanc.einfach.pkw, 2)} enkele reis en ${h.eur(T.montblanc.hinzurueck.pkw, 2)} heen en terug, de Fréjustunnel hetzelfde, de Grote Sint-Bernhard ${h.eur(T.gsb.einfach.pkw, 2)} enkele reis. Wie via Zwitserland rijdt, vindt het jaarvignet op ${h.a('vignette-schweiz', 'vignet Zwitserland')}.</p>
<h2>Camper, caravan, motor</h2>
<p>Elk land deelt de voertuigklassen anders in, en daarom loont het om in de rekenhulp het juiste voertuig te kiezen. Voor Utrecht–Split en terug rekenen wij ${p ? h.eur(p.summen.gesamt, 2) : '–'} met de auto, ${w ? h.eur(w.summen.gesamt, 2) : '–'} met de camper en ${g ? h.eur(g.summen.gesamt, 2) : '–'} met auto en caravan, telkens met het standaardverbruik. De verschillen ontstaan vooral in Slovenië (klasse 2B voor de meeste campers), in Kroatië (groep II voor camper en caravan) en in Italië (klassen B en 3). In Oostenrijk betalen alle voertuigen tot 3,5 ton hetzelfde vignet en dezelfde trajecttol. Voertuigen boven 3,5 ton rekent de rekenhulp niet, omdat daar kilometerheffingen zoals de Oostenrijkse GO-tol gelden.</p>
<h2>Brandstof: waar de liter het minst kost</h2>
${h.table(['Land', 'Euro 95', 'Diesel'], sRows, `Landelijk gemiddelde inclusief belastingen, Weekly Oil Bulletin, stand ${h.date(h.M.SPRIT_STAND)}`, ['l', 'r', 'r'])}
<p>De tabel is gesorteerd op de prijs van Euro 95 en verandert elke week. Voor elke rit toont de rekenhulp in welk doorreisland de liter het goedkoopst is; wie daar voltankt, bespaart het verschil per liter op de hele tank. Het zijn landelijke gemiddelden: langs de snelweg betaalt u vaak meer. Landpagina’s: ${h.a('benzineprijs-duitsland', 'Duitsland')}, ${h.a('benzineprijs-belgie', 'België')}, ${h.a('tanken-luxemburg', 'Luxemburg')} en ${h.a('benzinpreis-frankreich', 'Frankrijk')}.</p>
<h2>Wat er in 2027 verandert</h2>
<p>Oostenrijk schaft het plakvignet af: het vignet 2026 is het laatste om op de ruit te plakken, het geldt tot 31 januari 2027, en daarna bestaat alleen nog het digitale vignet dat aan het kenteken gekoppeld is. Toen wij de pagina’s van ASFINAG lazen, waren de prijzen voor 2027 nog niet gepubliceerd. Ook Slovenië, Tsjechië, Hongarije en Slowakije maken hun prijzen voor het volgende jaar meestal pas kort voor de jaarwisseling bekend. Valt uw reis in die periode, dan toont de rekenhulp “nog niet gepubliceerd” en rekent hij niet verder met een oude prijs. Waar u bij de overgang op moet letten, staat op ${h.a('digitale-vignette', 'digitaal vignet Oostenrijk')}.</p>
<h2>Wat de rekenhulp niet doet</h2>
<p>De rekenhulp kent geen veerboten, parkeergeld, milieuzones of stadstol, en ook geen kortingen voor tolkastjes of abonnementen voor veelrijders. Hij neemt altijd de snelste route in zijn netwerk; de afstanden komen uit OpenStreetMap en kunnen afwijken van uw navigatie. Duitse snelwegen zijn voor personenauto’s tolvrij en verschijnen daarom alleen bij de brandstof. Waar wij een regel niet bij de beheerder hebben gelezen, zeggen wij dat in plaats van te gokken.</p>
<h2>Alle pagina’s op een rij</h2>
${linkliste(h, NAMEN)}
<p>Twee overzichten behandelen de hele reis: ${h.a('maut-nach-kroatien', 'tol naar Kroatië')} en ${h.a('maut-nach-italien', 'tol naar Italië')}. Bronnen, rekenstappen en de grenzen van de gegevens staan in de <a href="${route('method', 'nl')}">methode</a>.</p>`;
  },
};
