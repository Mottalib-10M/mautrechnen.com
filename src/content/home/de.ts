import type { Helpers } from '../../lib/guide-types';
import { route } from '../../i18n/routes';
import { daten, linkliste } from './daten';

const NAMEN: Record<string, string> = {
  'vignette-oesterreich': 'Vignette Österreich: Preise und günstigste Laufzeit',
  'digitale-vignette': 'Digitale Vignette Österreich: Ende der Klebevignette 2027',
  'vignette-schweiz': 'Vignette Schweiz: Jahresvignette und Anhänger',
  'vignette-slowenien': 'Vignette Slowenien: Klassen 2A und 2B',
  'vignette-tschechien': 'Vignette Tschechien: Preise in Kronen',
  'vignette-ungarn': 'Vignette Ungarn: e-matrica D1',
  'maut-italien': 'Maut Italien: Kilometertarife und Schätzung',
  'maut-frankreich': 'Maut Frankreich: Klassen und Tarifblätter',
  'maut-kroatien': 'Maut Kroatien: Preise bis Split und Istrien',
  'maut-spanien': 'Maut Spanien: AP-7, Costa del Sol, AP-6',
  'maut-oesterreich': 'Maut Österreich: Vignette und Streckenmaut',
  brennermaut: 'Brennermaut: A13 und A22',
  tauerntunnel: 'Tauerntunnel: A10 je Richtung',
  karawankentunnel: 'Karawankentunnel: Maut nach Slowenien',
  'spritpreise-oesterreich': 'Spritpreise Österreich',
  'spritpreise-italien': 'Spritpreise Italien',
  'spritpreise-kroatien': 'Spritpreise Kroatien',
  'spritpreise-slowenien': 'Benzinpreis Slowenien',
  'benzinpreis-frankreich': 'Benzinpreis Frankreich',
  'maut-nach-kroatien': 'Maut nach Kroatien: die ganze Fahrt',
  'maut-nach-italien': 'Maut nach Italien: Brenner oder Gotthard',
};

export const de = {
  start: 'muenchen', ziel: 'split',
  title: 'Mautrechner 2026: Maut, Vignetten und Sprit der Urlaubsfahrt',
  description: 'Mautrechner 2026 für die Urlaubsfahrt: Vignetten, Maut, Tunnel und Sprit für jedes Land der Strecke, nach den Tarifblättern der Betreiber, ohne Anmeldung.',
  h1: 'Mautrechner 2026: was kostet die Fahrt in den Urlaub?',
  intro: 'Start, Ziel und Fahrzeug wählen: Vignetten, Maut, Tunnel und Sprit für jedes Land der Strecke, hin und zurück.',
  resume: (h: Helpers) => {
    const { haupt: r } = daten(h);
    if (!r) return '';
    return `Der Mautrechner rechnet die Kosten einer Urlaubsfahrt mit dem Auto, dem Wohnmobil, dem Gespann oder dem Motorrad für jedes Land der Strecke zusammen: die Vignetten in Österreich, der Schweiz, Slowenien, Tschechien, Ungarn und der Slowakei in der für Ihre Reisedaten günstigsten Laufzeit, die Maut nach Abschnitten in Frankreich, Italien, Kroatien und Spanien, die Streckenmaut der österreichischen Alpentunnel und den Sprit zum amtlichen Durchschnittspreis jedes Landes. Alle Tarife stammen aus den Preislisten der Betreiber und sind datiert; was wir nicht lesen konnten, steht als „nicht verifiziert“ ohne Betrag, und die italienische Maut erscheint getrennt als Schätzung. Für eine Fahrt von München nach Split mit dem Pkw, Abfahrt am ${h.date(h.M.addDays(h.today, 7))} und Rückfahrt vierzehn Tage später, kommen ${h.eur(r.summen.vignetten, 2)} für Vignetten, ${h.eur(r.summen.mautGeprueft, 2)} für Maut und Tunnel und ${h.eur(r.summen.sprit, 2)} für Sprit zusammen, insgesamt ${h.eur(r.summen.gesamt, 2)} hin und zurück. Der Rechner läuft im Browser, ohne Anmeldung und ohne Weitergabe Ihrer Eingaben.`;
  },
  faqs: (h: Helpers) => {
    const { haupt: r, vignetten } = daten(h);
    const at = vignetten.find((v) => v.c === 'AT')!;
    return [
      { q: 'Warum rechnet der Mautrechner bei der Vignette nur zwei Tage?', a: `Weil Sie ein Land, durch das Sie nur hindurchfahren, an zwei Tagen benutzen: am Tag der Hinfahrt und am Tag der Rückfahrt. Für Österreich reichen bei vierzehn Tagen Urlaub deshalb oft zwei 1-Tages-Vignetten statt einer längeren Laufzeit, zusammen derzeit ${at.pkw.verfuegbar ? h.eur(at.pkw.summeEur, 2) : 'ein noch nicht veröffentlichter Betrag'}. Machen Sie im Zielland Ausflüge auf der Autobahn, setzen Sie im Rechner den Haken für den Aufenthalt; dann deckt die Vignette alle Tage ab.` },
      { q: 'Was bedeutet „nicht verifiziert“ im Ergebnis?', a: 'Auf Ihrer Strecke liegt ein Abschnitt, dessen Preis wir beim Betreiber nicht lesen konnten, etwa bei der Sanef in Nordfrankreich oder bei einigen italienischen Konzessionären. Statt einen Betrag zu erfinden, zeigt der Rechner den Abschnitt ohne Preis und zählt ihn nicht mit. Die Summe ist dann eine Untergrenze. Sobald ein Tarifblatt lesbar ist, nehmen wir es mit Datum und Quelle auf.' },
      { q: 'Wie aktuell sind die Spritpreise im Mautrechner?', a: `Sie stammen aus dem Weekly Oil Bulletin der EU-Kommission, das jede Woche die durchschnittlichen Preise mit Steuern für jedes Mitgliedsland veröffentlicht. Der Stand im Rechner ist der ${h.date(h.M.SPRIT_STAND)}. Ein Skript liest das Bulletin jeden Dienstag und Donnerstag neu ein. Für die Schweiz gibt es keine amtliche Wochenzahl in dieser Reihe; dort tragen Sie den Literpreis selbst ein.` },
      { q: 'Kostet der Mautrechner etwas oder braucht man ein Konto?', a: 'Nein. Der Rechner ist kostenlos, verlangt weder Anmeldung noch E-Mail-Adresse und rechnet vollständig in Ihrem Browser; Ihre Strecke und Ihre Daten werden nicht an uns übertragen. Er enthält keine Links zu Vignettenhändlern oder Mautboxen. Gekauft wird die Vignette bei der jeweiligen Stelle des Landes, deren Seite wir als Quelle nennen.' },
      { q: 'Kann ich den Reisekostenrechner auf meiner eigenen Seite einbinden?', a: 'Ja. Auf der Seite „Widget“ steht ein kurzer Code, mit dem Sie den Rechner in einen Blog, eine Campingplatz-Seite oder ein Reiseforum einbauen können. Er zeigt dieselben Tarife wie diese Seite und wird mit ihr aktualisiert. Es gibt keine Werbung im Widget und keine Kosten; ein Link auf die Quelle bleibt sichtbar.' },
      { q: 'Woher weiß ich, ob ein Preis im Rechner noch gilt?', a: `Jeder Tarif steht mit Quelle und Lesedatum in unserer Parameterdatei, zuletzt gelesen am ${h.date(h.P.retrieved_at)}. Bei den Vignetten kennen wir zudem das Ende der Preisperiode; liegt Ihre Reise danach und hat der Betreiber noch keine neuen Preise veröffentlicht, zeigt der Rechner „Preise 2027 noch nicht veröffentlicht“ statt eines alten Betrags. Die Methode beschreibt jeden Schritt.` },
      { q: 'Wer betreibt den Mautrechner?', a: 'Die Seite wird von der Firma Radif Partners betrieben. Sie ist keine Behörde und kein Mautbetreiber und spricht nicht im Namen der ASFINAG, des BAZG, der DARS oder einer anderen Stelle. Wir lesen die öffentlichen Tarifblätter, rechnen sie nach und nennen bei jedem Betrag die Quelle. Fehler können Sie uns über die Kontaktseite melden; wir korrigieren sie mit Datum.' },
    ];
  },
  body: (h: Helpers) => {
    const { fahrten, vignetten, vz, sprit, T, ab, go } = daten(h);
    const kopf = ['Strecke', 'Länge', 'Vignetten', 'Maut (gelesen)', 'Maut (Schätzung)', 'Sprit', 'Summe'];
    const vRows = vignetten.map((v) => [h.land(v.c), vz(v.pkw), vz(v.wm), vz(v.mo)]);
    const sRows = sprit.map((s) => [h.land(s.c), h.l3(s.e95), s.diesel != null ? h.l3(s.diesel) : '–']);
    const g = go('muenchen', 'split', 'gespann'), w = go('muenchen', 'split', 'wohnmobil'), p = go('muenchen', 'split');
    return `<h2>Warum dieser Mautrechner</h2>
<p>Diese Seite macht es besser als das erste Ergebnis bei Google, weil sie berechnet, was die Seite von alpacacamping.de nur an andere Werkzeuge weiterreicht: die vollen Kosten der Hin- und Rückfahrt, mit der für Ihre Daten günstigsten Vignette, jeder Maut nach dem Tarifblatt 2026 des Betreibers (und mit „Schätzung“ oder „nicht verifiziert“, wenn sie das nicht ist) und dem Sprit zum amtlichen Preis jedes Durchreiselandes, ohne Anmeldung und ohne Link zu einem Händler.</p>
<p>Die meisten Seiten zum Thema Maut beschreiben ein Land nach dem anderen. Für die Urlaubsplanung zählt aber die Summe: Wer nach Kroatien fährt, braucht zwei Vignetten, zahlt zwei Tunnel in Österreich und die kroatische Autobahn, und tankt in vier Ländern zu vier Preisen. Der Rechner oben legt die Strecke durch ein Netz von rund 130 Orten und Grenzübergängen, sucht die schnellste Verbindung und ordnet jeden Kilometer einem Land und einer Mautart zu. Wie das genau geschieht, steht in der <a href="${route('method', 'de')}">Methode</a>. Wer hinter der Seite steht, erfahren Sie unter <a href="${route('about', 'de')}">Über uns</a>.</p>
<h2>So benutzen Sie den Rechner</h2>
<p>Wählen Sie oben Start und Ziel, dann das Fahrzeug, die Spritsorte und Ihren Verbrauch auf 100 Kilometer. Tragen Sie den Tag der Abreise und die Zahl der Urlaubstage ein und entscheiden Sie, ob Sie hin und zurück fahren. Wer im Zielland auch während des Aufenthalts Autobahn fährt, setzt den entsprechenden Haken, damit die Vignette alle Tage abdeckt. Wollen Sie ein Land umfahren, schließen Sie es aus; der Rechner sucht dann eine andere Strecke und zeigt, was sie kostet. Das Ergebnis listet jedes Land mit seinen Posten einzeln auf, mit der Quelle jedes Tarifs, damit Sie jeden Betrag selbst nachprüfen können.</p>
<h2>Beispiele: was typische Urlaubsfahrten kosten</h2>
${fahrten([['muenchen', 'split'], ['koeln', 'gardasee'], ['frankfurt', 'rom'], ['stuttgart', 'nizza'], ['berlin', 'budapest'], ['hamburg', 'venedig'], ['duesseldorf', 'lloret'], ['nuernberg', 'pula']], kopf, `Pkw, Super, hin und zurück, Abfahrt ${h.date(ab)}, 14 Tage Aufenthalt`)}
<p>Die Spalte „Maut (gelesen)“ enthält nur Beträge, die wir auf einem Tarifblatt gelesen haben. Die italienische Maut steht daneben als Schätzung, weil Italien zwar Kilometertarife, aber keine frei lesbaren Entfernungen von Mautstelle zu Mautstelle veröffentlicht. „nv“ zählt die Abschnitte, deren Preis wir nicht kennen; sie fehlen in der Summe. Der Sprit ist mit ${h.num(h.P.verbrauch_vorgabe.pkw)} Litern auf 100 km und dem Landesdurchschnitt jedes Durchreiselandes gerechnet. Ändern Sie im Rechner Fahrzeug, Verbrauch, Daten oder Sorte, ändern sich alle Zeilen mit.</p>
<h2>Vignetten: welche Laufzeit für eine Durchreise?</h2>
${h.table(['Land', 'Pkw', 'Wohnmobil', 'Motorrad'], vRows, `Günstigste Kombination für Hinfahrt am ${h.date(ab)} und Rückfahrt 14 Tage später, in Euro`, ['l', 'r', 'r', 'r'])}
<p>Sechs Länder auf den Urlaubsrouten verlangen eine zeitabhängige Vignette. Der Rechner prüft für jedes Land alle Produkte und wählt die billigste Kombination, die Ihre Fahrtage abdeckt: in Österreich oft zwei 1-Tages-Vignetten, in Slowenien je nach Abstand zwei Wochenvignetten oder eine Monatsvignette, in der Schweiz immer die Jahresvignette, weil es keine kürzere gibt. Preise in Kronen, Forint oder Franken rechnet er mit dem Referenzkurs der Europäischen Zentralbank in Euro um. Ein Strich bedeutet, dass für diese Daten noch keine Preise veröffentlicht sind. Einzelheiten stehen auf den Seiten zu ${h.a('vignette-oesterreich', 'Österreich')}, ${h.a('vignette-schweiz', 'Schweiz')}, ${h.a('vignette-slowenien', 'Slowenien')}, ${h.a('vignette-tschechien', 'Tschechien')} und ${h.a('vignette-ungarn', 'Ungarn')}.</p>
<p>In Tschechien und der Slowakei sind Motorräder von der Vignette befreit, in der Schweiz braucht ein Anhänger eine eigene Vignette, in Österreich nicht. In Slowenien entscheidet die Höhe über der Vorderachse zwischen den Klassen 2A und 2B; die Regel für Wohnwagen haben wir bei der DARS nicht gefunden, der Rechner rechnet dort nur die Vignette des Zugfahrzeugs und sagt das dazu.</p>
<h2>Maut nach Abschnitten: Frankreich, Italien, Kroatien, Spanien</h2>
<p>In Frankreich bezahlt man nach Ein- und Ausfahrt in geschlossenen Systemen. Wir haben die Tarifblätter 2026 von APRR, ASF und Escota gelesen, die seit dem 1. Februar 2026 gelten, und rechnen die Strecke im Rechner System für System. Die Sanef, die vor allem die Autobahnen im Norden und Osten betreibt, verweigert den automatischen Abruf ihrer Liste; ihre Abschnitte erscheinen als „nicht verifiziert“. Wohnmobile über zwei Meter und Gespanne zahlen in Frankreich die Klasse 2, Motorräder die Klasse 5. Mehr dazu unter ${h.a('maut-frankreich', 'Maut Frankreich')}.</p>
<p>Italien rechnet nach Kilometern zwischen Ein- und Ausfahrt mit Tarifen je Betreiber, getrennt nach Flach- und Gebirgsstrecken. Die Kilometertarife 2026 von Autostrade per l’Italia und der Brennerautobahn A22 sind veröffentlicht, die genauen Kilometer zwischen den Mautstellen nicht. Unser Betrag ist deshalb eine Schätzung, auf 10 Cent gerundet wie an der Mautstelle. Für einige Konzessionen, darunter die A4 zwischen Brescia und Padua und die Autostrade Alto Adriatico, haben wir keinen Tarif gelesen. Die Klassen und die Formel erklärt ${h.a('maut-italien', 'Maut Italien')}.</p>
<p>Kroatien hat keine Vignette, sondern Preislisten je Abschnitt bei der HAC, der Autocesta Zagreb–Macelj und der BINA-Istra; jedes Fahrzeug mit Anhänger fällt dort in die Gruppe II. In Spanien ist die AP-7 von der französischen Grenze bis Valencia in den Tarifblättern 2026 nicht mehr enthalten, bezahlt wird noch an der Costa del Sol und auf der AP-6 bei Madrid. Die Seiten ${h.a('maut-kroatien', 'Maut Kroatien')} und ${h.a('maut-spanien', 'Maut Spanien')} nennen alle gelesenen Preise.</p>
<h2>Alpentunnel und Streckenmaut</h2>
<p>Österreich verlangt neben der Vignette eine Streckenmaut auf fünf Alpenstrecken: Brenner, Tauern, Karawanken, Pyhrn und Arlberg. Jede Einzelfahrt gilt für eine Richtung; Pkw, Wohnmobil bis 3,5 Tonnen und Motorrad zahlen gleich, der Anhänger nichts. Auf der Fahrt nach Kroatien fallen meist Tauern und Karawanken an, auf dem Weg nach Italien der Brenner. Dazu kommen die großen Tunnel zwischen Frankreich, der Schweiz und Italien: Der Mont-Blanc-Tunnel kostet einen Pkw ${h.eur(T.montblanc.einfach.pkw, 2)} einfach und ${h.eur(T.montblanc.hinzurueck.pkw, 2)} hin und zurück, der Fréjus-Tunnel dasselbe, der Große St. Bernhard ${h.eur(T.gsb.einfach.pkw, 2)} einfach. Seiten dazu: ${h.a('maut-oesterreich', 'Maut Österreich')}, ${h.a('brennermaut', 'Brennermaut')}, ${h.a('tauerntunnel', 'Tauerntunnel')}, ${h.a('karawankentunnel', 'Karawankentunnel')}.</p>
<h2>Wohnmobil, Gespann, Motorrad</h2>
<p>Jedes Land zieht die Fahrzeugklassen anders, und darum lohnt es sich, im Rechner das richtige Fahrzeug zu wählen. Für München–Split hin und zurück rechnen wir ${p ? h.eur(p.summen.gesamt, 2) : '–'} mit dem Pkw, ${w ? h.eur(w.summen.gesamt, 2) : '–'} mit dem Wohnmobil und ${g ? h.eur(g.summen.gesamt, 2) : '–'} mit Pkw und Wohnwagen, jeweils mit dem voreingestellten Verbrauch. Die Unterschiede entstehen vor allem in Slowenien (Klasse 2B für die meisten Wohnmobile), in Kroatien (Gruppe II für Wohnmobil und Gespann) und in Italien (Klassen B und 3). In Österreich zahlen alle Fahrzeuge bis 3,5 Tonnen dieselbe Vignette und Streckenmaut. Fahrzeuge über 3,5 Tonnen rechnet der Rechner nicht, weil dort fahrleistungsabhängige Systeme wie die österreichische GO-Maut gelten.</p>
<h2>Sprit: wo der Liter am wenigsten kostet</h2>
${h.table(['Land', 'Super 95', 'Diesel'], sRows, `Landesdurchschnitt mit Steuern, Weekly Oil Bulletin, Stand ${h.date(h.M.SPRIT_STAND)}`, ['l', 'r', 'r'])}
<p>Die Tabelle ist nach dem Preis für Super sortiert und ändert sich jede Woche. Für jede Fahrt zeigt der Rechner, in welchem Durchreiseland der Liter am günstigsten ist; wer dort volltankt, spart den Unterschied je Liter auf der ganzen Tankfüllung. Die Preise sind Landesdurchschnitte: An Autobahntankstellen zahlt man häufig mehr. Seiten zu einzelnen Ländern: ${h.a('spritpreise-oesterreich', 'Österreich')}, ${h.a('spritpreise-italien', 'Italien')}, ${h.a('spritpreise-kroatien', 'Kroatien')}, ${h.a('spritpreise-slowenien', 'Slowenien')} und ${h.a('benzinpreis-frankreich', 'Frankreich')}.</p>
<h2>Was sich 2027 ändert</h2>
<p>Österreich schafft die Klebevignette ab: Die Vignette 2026 ist die letzte zum Aufkleben, sie gilt bis zum 31. Januar 2027, danach gibt es nur noch die digitale Vignette, die an das Kennzeichen gebunden ist. Ihre Preise für 2027 hat die ASFINAG beim Lesen noch nicht veröffentlicht. Auch Slowenien, Tschechien, Ungarn und die Slowakei geben ihre Preise für das nächste Jahr meist erst kurz vor Jahresende bekannt. Fällt Ihre Reise in diese Zeit, zeigt der Rechner „noch nicht veröffentlicht“ und rechnet keinen alten Preis weiter. Was beim Wechsel zu beachten ist, beschreibt ${h.a('digitale-vignette', 'Digitale Vignette')}.</p>
<h2>Was der Rechner nicht kann</h2>
<p>Der Rechner kennt Fähren, Parkgebühren, Umweltzonen und Stadtmauten nicht, ebenso wenig Rabatte für Mautboxen oder Vielfahrerkarten. Er fährt immer die schnellste Strecke in seinem Netz; die Länge stammt aus OpenStreetMap und kann von Ihrem Navigationsgerät abweichen. Deutsche Autobahnen sind für Pkw mautfrei und erscheinen deshalb nur beim Sprit. Wo wir eine Regel nicht beim Betreiber gelesen haben, sagen wir das, statt sie zu raten.</p>
<h2>Alle Seiten im Überblick</h2>
${linkliste(h, NAMEN)}
<p>Zu den ganzen Fahrten gibt es zwei Übersichten: ${h.a('maut-nach-kroatien', 'Maut nach Kroatien')} und ${h.a('maut-nach-italien', 'Maut nach Italien')}. Quellen, Rechenweg und Grenzen der Daten stehen in der <a href="${route('method', 'de')}">Methode</a>.</p>`;
  },
};
