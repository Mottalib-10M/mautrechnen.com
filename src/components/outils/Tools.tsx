/**
 * Die vier Rechner der Seite, alle aus demselben Motor (lib/engine) :
 *   ReiseCalc    Gesamtkosten der Fahrt (Startseiten, Strecken-Seiten, Widget)
 *   MautCalc     Maut und Vignetten einer Strecke, ohne Sprit (Maut-Seiten)
 *   VignetteCalc günstigste Vignette eines Landes für die Reisedaten (Vignetten-Seiten)
 *   SpritCalc    Tankfüllung im Land gegen das Heimatland (Sprit-Seiten)
 * Erste Darstellung = Werte des Build-Tages (refDay), damit Server und Browser dasselbe zeigen (§17.5).
 */
import { useMemo, useState, type ReactNode } from 'react';
import * as M from '../../lib/engine';
import { P, type Fz, type Sorte, type SourceKey } from '../../lib/engine/params';
import { land, FZ_NAME, SORTE_NAME, PRODUKT_NAME } from '../../lib/laender';
import { formatMoney, formatNumber, displayDate } from '../../lib/format';
import { LANG_TAGS } from '../../data/site-config';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import { Shell, Head, Rows, Note, MethodLink, Row2, T, type L } from '../calc/kit';

const eur = (x: number, l: L, d = 2) => formatMoney(x, d, l);
const geld = (x: number, cur: string, l: L) => (cur === 'EUR' ? eur(x, l) : `${formatNumber(x, cur === 'CHF' ? 2 : 0, l)} ${cur}`);
const datum = (iso: string, l: L) => displayDate(iso, LANG_TAGS[l]);
const name = (id: string, l: L) => M.KNOTEN[id]?.n[l] ?? id;
const plus = (iso: string, n: number) => M.addDays(iso, n);
const Q = ({ k, l, children }: { k: SourceKey; l: L; children?: ReactNode }) => (
  <a href={P.sources[k].url} target="_blank" rel="nofollow noopener noreferrer" className="underline decoration-navy-300 hover:text-accent-700">{children ?? P.sources[k].label[l]}</a>
);

function fzOptions(l: L) { return M.FAHRZEUGE.map((f) => ({ value: f, label: FZ_NAME[f][l] })); }
function sorteOptions(l: L) { return M.SORTEN.map((s) => ({ value: s, label: SORTE_NAME[s][l] })); }
function knotenOptions(ids: string[], l: L) {
  return ids.map((id) => ({ value: id, label: `${name(id, l)} (${M.KNOTEN[id].c.join('/')})` }));
}
const ORT_ALLE = M.NETZ.nodes.filter((n) => !n.b).map((n) => n.id);

function DateField({ id, label, value, onChange, min }: { id: string; label: string; value: string; onChange: (v: string) => void; min?: string }) {
  return (
    <div className="grid grid-rows-subgrid row-span-3 content-start gap-y-0">
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-navy-700">{label}</label>
      <input id={id} type="date" value={value} min={min} onChange={(e) => { if (M.isIso(e.target.value)) onChange(e.target.value); }}
        className="h-12 w-full rounded-lg border border-navy-300 bg-white px-3 text-navy-900 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20" />
    </div>
  );
}

/* ------------------------------------------------------------------ Maut-Posten */
function mautName(p: M.MautPosten, l: L): string {
  if (p.typ === 'strecke') return (P.streckenmaut as Record<string, { name: Record<L, string> }>)[p.id].name[l];
  if (p.typ === 'barriere') return (P.barrieren as Record<string, { name: Record<L, string> }>)[p.id].name[l];
  if (p.typ === 'sys') return `${(P.systeme as Record<string, { name: Record<L, string> }>)[p.id].name[l]} : ${p.station ?? `${name(p.von, l)} – ${name(p.nach, l)}`}`;
  if (p.typ === 'it') return `${P.italien_tarife[p.id as keyof typeof P.italien_tarife].betreiber} : ${name(p.von, l)} – ${name(p.nach, l)}, ${formatNumber(p.km ?? 0, 0, l)} km`;
  return `${name(p.von, l)} – ${name(p.nach, l)}`;
}
function MautListe({ posten, l, fahrten }: { posten: M.MautPosten[]; l: L; fahrten: number }) {
  if (!posten.length) return <p className="text-sm text-navy-700">{T(l, 'Auf dieser Strecke fällt für Ihr Fahrzeug keine Maut an, die wir kennen: nur Vignetten (siehe oben) oder gar nichts.', 'No toll we know of applies to your vehicle on this route: only vignettes (see above) or nothing at all.', 'Op deze route betaalt uw voertuig geen tol die wij kennen: alleen vignetten (zie hierboven) of niets.')}</p>;
  return (
    <ul className="space-y-2 text-sm">
      {posten.map((p, i) => (
        <li key={i} className="flex items-start justify-between gap-3 border-b border-navy-100 pb-2">
          <span className="text-navy-800">
            <span className="font-medium">{land(p.land, l)}</span> · {mautName(p, l)}
            {p.preis == null && <span className="block text-xs text-amber-800">{T(l, 'Nicht verifiziert, nicht in der Summe', 'Not verified, not in the total', 'Niet geverifieerd, niet in het totaal')} : {(P.nv_gruende as Record<string, Record<L, string>>)[p.grund ?? 'fr_paar'][l]}</span>}
            {p.schaetzung && <span className="block text-xs text-navy-600">{T(l, 'Schätzung: Kilometertarif 2026 × Kilometer, auf 10 Cent gerundet', 'Estimate: 2026 per-km rate × kilometres, rounded to 10 cents', 'Schatting: kilometertarief 2026 × kilometers, afgerond op 10 cent')}</span>}
            {p.quelle && <span className="block text-xs text-navy-600"><Q k={p.quelle} l={l} /></span>}
          </span>
          <span className="tabular-nums whitespace-nowrap font-medium text-navy-900">{p.preis == null ? '–' : `${fahrten > 1 ? '2 × ' : ''}${eur(p.preis, l)}`}{p.schaetzung ? ' *' : ''}</span>
        </li>
      ))}
    </ul>
  );
}
function VignettenListe({ v, l }: { v: M.VignettenErgebnis[]; l: L }) {
  if (!v.length) return <p className="text-sm text-navy-700">{T(l, 'Keine Vignette nötig auf dieser Strecke.', 'No vignette needed on this route.', 'Geen vignet nodig op deze route.')}</p>;
  return (
    <ul className="space-y-2 text-sm">
      {v.map((x) => (
        <li key={x.land} className="flex items-start justify-between gap-3 border-b border-navy-100 pb-2">
          <span className="text-navy-800"><span className="font-medium">{land(x.land, l)}</span> · {!x.pflicht ? T(l, 'für dieses Fahrzeug keine Vignettenpflicht', 'no vignette required for this vehicle', 'geen vignetplicht voor dit voertuig') : !x.verfuegbar ? T(l, 'Preise 2027 noch nicht veröffentlicht', '2027 prices not yet published', 'prijzen 2027 nog niet gepubliceerd') : x.wahl.map((w) => `${w.anzahl > 1 ? `${w.anzahl} × ` : ''}${PRODUKT_NAME[w.id][l]} (${datum(w.ab, l)}${w.bis !== w.ab ? ` – ${datum(w.bis, l)}` : ''})`).join(' + ')}
            {x.anhaengerNv && <span className="block text-xs text-navy-700">{T(l, 'Regel für den Anhänger beim Betreiber nicht verifiziert: Preis nur für das Zugfahrzeug.', 'Trailer rule not verified with the operator: price for the towing vehicle only.', 'Regel voor de aanhanger niet geverifieerd bij de beheerder: prijs alleen voor het trekkende voertuig.')}</span>}
            <span className="block text-xs text-navy-600"><Q k={(P.vignetten as Record<string, { quelle: SourceKey }>)[x.land].quelle} l={l} /></span>
          </span>
          <span className="tabular-nums whitespace-nowrap font-medium text-navy-900">{x.verfuegbar && x.pflicht ? (x.waehrung === 'EUR' ? eur(x.summeEur, l) : `${eur(x.summeEur, l)} (${geld(x.summe, x.waehrung, l)})`) : '–'}</span>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ Reise */
interface ReiseProps { lang: L; refDay: string; methodHref?: string; id: string; start?: string; ziel?: string; starts?: string[]; ziele?: string[] }
export function ReiseCalc({ lang: l, refDay, methodHref, id, start = 'muenchen', ziel = 'split', starts, ziele }: ReiseProps) {
  const [von, setVon] = useState(start);
  const [nach, setNach] = useState(ziel);
  const [fz, setFz] = useState<Fz>('pkw');
  const [sorte, setSorte] = useState<Sorte>('e95');
  const [verbrauch, setVerbrauch] = useState(7);
  const [ab, setAb] = useState(plus(refDay, 7));
  const [dauer, setDauer] = useState(14);
  const [hz, setHz] = useState('hz');
  const [vorOrt, setVorOrt] = useState('nein');
  const [meiden, setMeiden] = useState('');
  const [chf, setChf] = useState(0);
  const r = useMemo(() => M.reise({ start: von, ziel: nach, fz, sorte, verbrauch, ab, dauer, hinUndZurueck: hz === 'hz', aufenthalt: vorOrt === 'ja', meiden: meiden ? [meiden] : [], chfLiter: chf || null }), [von, nach, fz, sorte, verbrauch, ab, dauer, hz, vorOrt, meiden, chf]);
  const startIds = starts ?? M.START.map((n) => n.id);
  const zielIds = ziele ?? M.ZIELE.map((n) => n.id);
  const setFzV = (f: string) => { setFz(f as Fz); setVerbrauch(M.vorgabeVerbrauch(f as Fz)); };
  const durchCh = r?.route.laender.some((x) => x.c === 'CH');
  const meidOpt = [{ value: '', label: T(l, 'Schnellste Strecke', 'Fastest route', 'Snelste route') }, ...['CH', 'AT', 'IT', 'FR', 'SI'].map((c) => ({ value: c, label: T(l, `ohne ${land(c, l)}`, `avoid ${land(c, l)}`, `zonder ${land(c, l)}`) }))];
  const h = r ? Math.floor(r.route.min / 60) : 0, mi = r ? r.route.min % 60 : 0;
  const form = (
    <>
      <Row2>
        <SelectField id={`${id}-von`} label={T(l, 'Start', 'From', 'Vertrek')} value={von} onChange={setVon} options={knotenOptions(startIds, l)} />
        <SelectField id={`${id}-nach`} label={T(l, 'Ziel', 'To', 'Bestemming')} value={nach} onChange={setNach} options={knotenOptions(zielIds, l)} />
        <SelectField id={`${id}-fz`} label={T(l, 'Fahrzeug', 'Vehicle', 'Voertuig')} value={fz} onChange={setFzV} options={fzOptions(l)} />
        <SelectField id={`${id}-sorte`} label={T(l, 'Kraftstoff', 'Fuel', 'Brandstof')} value={sorte} onChange={(x) => setSorte(x as Sorte)} options={sorteOptions(l)} />
        <DateField id={`${id}-ab`} label={T(l, 'Abfahrt', 'Departure', 'Vertrek op')} value={ab} onChange={setAb} />
        <NumberField id={`${id}-dauer`} label={T(l, 'Urlaub (Tage bis zur Rückfahrt)', 'Holiday (days until return)', 'Vakantie (dagen tot terugreis)')} value={dauer} onChange={setDauer} unit={T(l, 'Tage', 'days', 'dagen')} max={365} />
      </Row2>
      <details className="rounded-lg border border-navy-200 px-3 py-2">
        <summary className="cursor-pointer text-sm font-medium text-navy-800">{T(l, 'Weitere Angaben: Verbrauch, Strecke, Rückfahrt', 'More options: consumption, route, return', 'Meer opties: verbruik, route, terugreis')}</summary>
        <div className="mt-3 space-y-4">
          <Row2>
            <NumberField id={`${id}-verbrauch`} label={T(l, 'Verbrauch', 'Consumption', 'Verbruik')} value={verbrauch} onChange={setVerbrauch} unit="L/100 km" max={40} decimals={1} />
            <SelectField id={`${id}-meiden`} label={T(l, 'Strecke', 'Route', 'Route')} value={meiden} onChange={setMeiden} options={meidOpt} />
            <SelectField id={`${id}-hz`} label={T(l, 'Fahrt', 'Trip', 'Rit')} value={hz} onChange={setHz} options={[{ value: 'hz', label: T(l, 'Hin und zurück', 'Return', 'Heen en terug') }, { value: 'h', label: T(l, 'Nur hin', 'One way', 'Enkel') }]} />
            <SelectField id={`${id}-vorort`} label={T(l, 'Autobahn im Urlaubsland', 'Motorway at destination', 'Snelweg op bestemming')} value={vorOrt} onChange={setVorOrt} options={[{ value: 'nein', label: T(l, 'Nein', 'No', 'Nee') }, { value: 'ja', label: T(l, 'Ja, täglich', 'Yes, daily', 'Ja, dagelijks') }]} />
          </Row2>
          {durchCh && <NumberField id={`${id}-chf`} label={T(l, 'Spritpreis in der Schweiz (nicht im EU-Bulletin)', 'Fuel price in Switzerland (not in the EU bulletin)', 'Brandstofprijs in Zwitserland (niet in het EU-bulletin)')} value={chf} onChange={setChf} unit="CHF/L" max={5} decimals={2} help={T(l, 'Leer lassen: der Schweizer Anteil wird nicht berechnet.', 'Leave empty: the Swiss part is not calculated.', 'Leeg laten: het Zwitserse deel wordt niet berekend.')} />}
        </div>
      </details>
    </>
  );
  if (!r) return <Shell id={id} form={form} result={<Note>{T(l, 'Keine Strecke gefunden.', 'No route found.', 'Geen route gevonden.')}</Note>} />;
  const fahrtTxt = r.fahrten > 1 ? T(l, 'hin und zurück', 'return trip', 'heen en terug') : T(l, 'einfache Fahrt', 'one way', 'enkele reis');
  const result = (
    <>
      <Head label={T(l, `Kosten der Fahrt, ${fahrtTxt}`, `Cost of the drive, ${fahrtTxt}`, `Kosten van de rit, ${fahrtTxt}`)} value={eur(r.summen.gesamt, l, 0)}
        sub={r.summen.mautSchaetzung > 0 ? T(l, `davon ${eur(r.summen.mautSchaetzung, l)} Maut in Italien (Schätzung)`, `of which ${eur(r.summen.mautSchaetzung, l)} Italian tolls (estimate)`, `waarvan ${eur(r.summen.mautSchaetzung, l)} tol in Italië (schatting)`) : undefined} />
      <Rows rows={[
        [T(l, 'Strecke (einfach)', 'Distance (one way)', 'Afstand (enkel)'), `${formatNumber(r.route.km, 0, l)} km · ${h} h ${String(mi).padStart(2, '0')}`],
        [T(l, 'Vignetten', 'Vignettes', 'Vignetten'), eur(r.summen.vignetten, l)],
        [T(l, 'Maut und Tunnel (Tarifblatt)', 'Tolls and tunnels (rate sheet)', 'Tol en tunnels (tariefblad)'), eur(r.summen.mautGeprueft, l)],
        ...(r.summen.mautSchaetzung > 0 ? [[T(l, 'Maut Italien (Schätzung)', 'Italian tolls (estimate)', 'Tol Italië (schatting)'), eur(r.summen.mautSchaetzung, l)] as [string, string]] : []),
        [T(l, 'Sprit', 'Fuel', 'Brandstof'), eur(r.summen.sprit, l)],
      ]} />
      {r.offen.length > 0 && <Note>{T(l, `${r.offen.length} Mautabschnitt(e) ohne verifizierten Preis, nicht in der Summe (Liste unten).`, `${r.offen.length} toll section(s) without a verified price, not in the total (list below).`, `${r.offen.length} toltraject(en) zonder geverifieerde prijs, niet in het totaal (lijst hieronder).`)}</Note>}
      {r.vignettenFehlen.length > 0 && <Note>{T(l, `Vignette ${r.vignettenFehlen.map((c) => land(c, l)).join(', ')} : Preise 2027 noch nicht veröffentlicht, nicht in der Summe.`, `Vignette ${r.vignettenFehlen.map((c) => land(c, l)).join(', ')}: 2027 prices not yet published, not in the total.`, `Vignet ${r.vignettenFehlen.map((c) => land(c, l)).join(', ')}: prijzen 2027 nog niet gepubliceerd, niet in het totaal.`)}</Note>}
      <MethodLink href={methodHref} lang={l} />
    </>
  );
  const after = (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <section>
        <h3 className="mb-2 text-base font-semibold text-navy-900">{T(l, 'Strecke', 'Route', 'Route')}</h3>
        <p className="text-sm text-navy-700">{r.route.knoten.map((k) => name(k, l)).join(' → ')}</p>
        <table className="mt-3 w-full text-sm"><thead><tr className="text-left text-navy-600"><th className="py-1 font-medium">{T(l, 'Land', 'Country', 'Land')}</th><th className="py-1 text-right font-medium">km</th><th className="py-1 text-right font-medium">{T(l, 'Preis/L', 'Price/L', 'Prijs/L')}</th><th className="py-1 text-right font-medium">{T(l, 'Sprit', 'Fuel', 'Brandstof')}</th></tr></thead>
          <tbody className="divide-y divide-navy-100">{r.sprit.map((s) => (
            <tr key={s.land}><td className="py-1.5">{land(s.land, l)}</td><td className="tabular-nums py-1.5 text-right">{formatNumber(s.km, 0, l)}</td><td className="tabular-nums py-1.5 text-right">{s.preis == null ? '–' : formatMoney(s.preis, 3, l)}</td><td className="tabular-nums py-1.5 text-right">{s.kosten == null ? T(l, 'nicht berechnet', 'not calculated', 'niet berekend') : eur(s.kosten * r.fahrten, l)}</td></tr>
          ))}</tbody></table>
        {r.tanken && <p className="mt-2 text-sm text-navy-700">{T(l, `Am günstigsten tanken Sie auf dieser Strecke in ${land(r.tanken.land, l)} (${formatMoney(r.tanken.preis, 3, l)} je Liter ${SORTE_NAME[sorte].de}, Landesdurchschnitt).`, `The cheapest fuel on this route is in ${land(r.tanken.land, l)} (${formatMoney(r.tanken.preis, 3, l)} per litre, national average).`, `Het goedkoopst tankt u op deze route in ${land(r.tanken.land, l)} (${formatMoney(r.tanken.preis, 3, l)} per liter, landelijk gemiddelde).`)}</p>}
        <p className="mt-2 text-xs text-navy-600">{T(l, 'Sprit: Landesdurchschnitt der Woche vom', 'Fuel: national average for the week of', 'Brandstof: landelijk gemiddelde van de week van')} {datum(M.SPRIT_STAND, l)}, <Q k="wob" l={l} />. {T(l, 'Strecke', 'Route', 'Route')} : <Q k="osm" l={l} />.</p>
      </section>
      <section>
        <h3 className="mb-2 text-base font-semibold text-navy-900">{T(l, 'Vignetten', 'Vignettes', 'Vignetten')}</h3>
        <VignettenListe v={r.vignetten} l={l} />
        <h3 className="mb-2 mt-5 text-base font-semibold text-navy-900">{T(l, 'Maut und Tunnel, je Fahrt', 'Tolls and tunnels, per trip', 'Tol en tunnels, per rit')}</h3>
        <MautListe posten={r.maut} l={l} fahrten={r.fahrten} />
        {r.summen.mautSchaetzung > 0 && <p className="mt-2 text-xs text-navy-600">* {T(l, 'Italien veröffentlicht die Preise von Mautstelle zu Mautstelle nicht frei: Kilometertarif des Betreibers × Kilometer laut Routing.', 'Italy does not publish station-to-station prices openly: operator per-km rate × routed kilometres.', 'Italië publiceert de prijzen van tolpost tot tolpost niet vrij: kilometertarief van de exploitant × kilometers volgens de routeplanner.')}</p>}
      </section>
    </div>
  );
  return <Shell id={id} form={form} result={result} after={after} />;
}

/* ------------------------------------------------------------------ Maut einer Strecke */
interface MautProps { lang: L; methodHref?: string; id: string; von: string; nach: string; laender: string[] }
export function MautCalc({ lang: l, methodHref, id, von: v0, nach: n0, laender }: MautProps) {
  const ids = ORT_ALLE.concat(M.NETZ.nodes.filter((n) => n.b).map((n) => n.id)).filter((x) => M.KNOTEN[x].c.some((c) => laender.includes(c)));
  const [von, setVon] = useState(v0);
  const [nach, setNach] = useState(n0);
  const [fz, setFz] = useState<Fz>('pkw');
  const [hz, setHz] = useState('h');
  const r = useMemo(() => M.route(von, nach), [von, nach]);
  const posten = useMemo(() => (r ? M.maut(r.schritte, fz) : []), [r, fz]);
  const s = M.mautSumme(posten);
  const n = hz === 'hz' ? 2 : 1;
  const vl = r ? M.vignettenLaender(r) : [];
  const form = (
    <Row2>
      <SelectField id={`${id}-von`} label={T(l, 'Von', 'From', 'Van')} value={von} onChange={setVon} options={knotenOptions(ids, l)} />
      <SelectField id={`${id}-nach`} label={T(l, 'Nach', 'To', 'Naar')} value={nach} onChange={setNach} options={knotenOptions(ids, l)} />
      <SelectField id={`${id}-fz`} label={T(l, 'Fahrzeug', 'Vehicle', 'Voertuig')} value={fz} onChange={(x) => setFz(x as Fz)} options={fzOptions(l)} />
      <SelectField id={`${id}-hz`} label={T(l, 'Fahrt', 'Trip', 'Rit')} value={hz} onChange={setHz} options={[{ value: 'h', label: T(l, 'Einfach', 'One way', 'Enkel') }, { value: 'hz', label: T(l, 'Hin und zurück', 'Return', 'Heen en terug') }]} />
    </Row2>
  );
  const result = von === nach || !r ? <Note>{T(l, 'Bitte zwei verschiedene Orte wählen.', 'Please choose two different places.', 'Kies twee verschillende plaatsen.')}</Note> : (
    <>
      <Head label={T(l, n > 1 ? 'Maut hin und zurück (Tarifblatt)' : 'Maut, einfache Fahrt (Tarifblatt)', n > 1 ? 'Tolls, return (rate sheet)' : 'Tolls, one way (rate sheet)', n > 1 ? 'Tol heen en terug (tariefblad)' : 'Tol, enkele reis (tariefblad)')} value={eur(s.geprueft * n, l)}
        sub={s.schaetzung > 0 ? T(l, `+ ${eur(s.schaetzung * n, l)} Italien (Schätzung)`, `+ ${eur(s.schaetzung * n, l)} Italy (estimate)`, `+ ${eur(s.schaetzung * n, l)} Italië (schatting)`) : undefined} />
      <Rows rows={[
        [T(l, 'Strecke', 'Distance', 'Afstand'), `${formatNumber(r.km, 0, l)} km`],
        [T(l, 'Mautstellen und Abschnitte', 'Toll plazas and sections', 'Tolposten en trajecten'), String(posten.length)],
        [T(l, 'Ohne verifizierten Preis', 'Without verified price', 'Zonder geverifieerde prijs'), String(s.offen.length)],
        [T(l, 'Vignette nötig in', 'Vignette needed in', 'Vignet nodig in'), vl.length ? vl.map((c) => land(c, l)).join(', ') : '–'],
      ]} />
      <MethodLink href={methodHref} lang={l} />
    </>
  );
  const after = r && von !== nach ? (
    <div className="mt-6">
      <p className="mb-3 text-sm text-navy-700">{r.knoten.map((k) => name(k, l)).join(' → ')}</p>
      <MautListe posten={posten} l={l} fahrten={n} />
    </div>
  ) : undefined;
  return <Shell id={id} form={form} result={result} after={after} />;
}

/* ------------------------------------------------------------------ Vignette eines Landes */
interface VigProps { lang: L; refDay: string; methodHref?: string; id: string; land: M.VLand }
export function VignetteCalc({ lang: l, refDay, methodHref, id, land: c }: VigProps) {
  const [fz, setFz] = useState<Fz>('pkw');
  const [ab, setAb] = useState(plus(refDay, 7));
  const [dauer, setDauer] = useState(14);
  const [art, setArt] = useState('durch');
  const [hz, setHz] = useState('hz');
  const tage = M.fahrtage(ab, dauer, hz === 'hz', art === 'urlaub');
  const v = useMemo(() => M.vignette(c, fz, tage), [c, fz, ab, dauer, art, hz]); // eslint-disable-line react-hooks/exhaustive-deps
  const liste = M.produkte(c, fz, ab);
  const def = P.vignetten[c] as unknown as { waehrung: string; quelle: SourceKey };
  const form = (
    <Row2>
      <SelectField id={`${id}-fz`} label={T(l, 'Fahrzeug', 'Vehicle', 'Voertuig')} value={fz} onChange={(x) => setFz(x as Fz)} options={fzOptions(l)} />
      <DateField id={`${id}-ab`} label={T(l, 'Erster Fahrtag im Land', 'First day in the country', 'Eerste rijdag in het land')} value={ab} onChange={setAb} />
      <NumberField id={`${id}-dauer`} label={T(l, 'Tage bis zur Rückfahrt', 'Days until the drive back', 'Dagen tot de terugreis')} value={dauer} onChange={setDauer} unit={T(l, 'Tage', 'days', 'dagen')} max={400} />
      <SelectField id={`${id}-art`} label={T(l, 'Im Land', 'In the country', 'In het land')} value={art} onChange={setArt} options={[{ value: 'durch', label: T(l, 'Durchreise', 'Transit', 'Doorreis') }, { value: 'urlaub', label: T(l, 'Urlaub', 'Holiday', 'Vakantie') }]} />
      <SelectField id={`${id}-hz`} label={T(l, 'Fahrt', 'Trip', 'Rit')} value={hz} onChange={setHz} options={[{ value: 'hz', label: T(l, 'Hin und zurück', 'Return', 'Heen en terug') }, { value: 'h', label: T(l, 'Nur hin', 'One way', 'Enkel') }]} />
    </Row2>
  );
  const result = !v.pflicht ? (
    <><Head label={T(l, `Vignette ${land(c, l)}`, `${land(c, l)} vignette`, `Vignet ${land(c, l)}`)} value={eur(0, l)} sub={T(l, 'Für dieses Fahrzeug keine Vignettenpflicht', 'No vignette required for this vehicle', 'Geen vignetplicht voor dit voertuig')} /><MethodLink href={methodHref} lang={l} /></>
  ) : !v.verfuegbar ? (
    <><Head label={T(l, `Vignette ${land(c, l)}`, `${land(c, l)} vignette`, `Vignet ${land(c, l)}`)} value="–" sub={T(l, 'Preise für diese Daten (Vignettenjahr 2027) noch nicht veröffentlicht', 'Prices for these dates (2027 vignette year) not yet published', 'Prijzen voor deze data (vignetjaar 2027) nog niet gepubliceerd')} /><MethodLink href={methodHref} lang={l} /></>
  ) : (
    <>
      <Head label={T(l, `Günstigste Vignette ${land(c, l)}`, `Cheapest ${land(c, l)} vignette`, `Goedkoopste vignet ${land(c, l)}`)} value={eur(v.summeEur, l)} sub={def.waehrung !== 'EUR' ? `${geld(v.summe, def.waehrung, l)} · ${T(l, 'EZB-Kurs vom', 'ECB rate of', 'ECB-koers van')} ${datum(M.KURSE.stand, l)}` : undefined} />
      <Rows rows={v.wahl.map((w) => [`${w.anzahl > 1 ? `${w.anzahl} × ` : ''}${PRODUKT_NAME[w.id][l]}`, `${datum(w.ab, l)}${w.bis !== w.ab ? ` – ${datum(w.bis, l)}` : ''}`] as [string, string])} />
      {v.anhaengerNv && <p className="mt-2 text-xs text-navy-700">{T(l, 'Regel für den Anhänger beim Betreiber nicht verifiziert: Preis nur für das Zugfahrzeug.', 'Trailer rule not verified with the operator: price for the towing vehicle only.', 'Regel voor de aanhanger niet geverifieerd bij de beheerder: prijs alleen voor het trekkende voertuig.')}</p>}
      <MethodLink href={methodHref} lang={l} />
    </>
  );
  const after = (
    <div className="mt-6">
      <table className="w-full text-sm">
        <caption className="mb-2 text-left text-sm text-navy-700">{T(l, `Alle Vignetten ${land(c, l)}, ${FZ_NAME[fz].de}, Kauf für den`, `All ${land(c, l)} vignettes, ${FZ_NAME[fz].en.toLowerCase()}, bought for`, `Alle vignetten ${land(c, l)}, ${FZ_NAME[fz].nl.toLowerCase()}, gekocht voor`)} {datum(ab, l)}</caption>
        <thead><tr className="text-left text-navy-600"><th className="py-1 font-medium">{T(l, 'Vignette', 'Vignette', 'Vignet')}</th><th className="py-1 text-right font-medium">{T(l, 'Preis', 'Price', 'Prijs')}</th><th className="py-1 text-right font-medium">{T(l, 'gültig bis', 'valid until', 'geldig tot')}</th></tr></thead>
        <tbody className="divide-y divide-navy-100">{liste.map((p) => (
          <tr key={p.id}><td className="py-1.5">{PRODUKT_NAME[p.id][l]}</td><td className="tabular-nums py-1.5 text-right">{def.waehrung === 'EUR' ? eur(p.preis, l) : `${geld(p.preis, def.waehrung, l)} (${eur(p.preisEur, l)})`}</td><td className="tabular-nums py-1.5 text-right">{p.bis ? datum(p.bis, l) : T(l, 'Preis 2027 offen', '2027 price pending', 'prijs 2027 open')}</td></tr>
        ))}</tbody>
      </table>
      <p className="mt-2 text-xs text-navy-600">{T(l, 'Quelle', 'Source', 'Bron')} : <Q k={def.quelle} l={l} />{def.waehrung !== 'EUR' && <>, <Q k="ezb" l={l} /></>}. {T(l, 'Gelesen am', 'Read on', 'Gelezen op')} {datum(P.retrieved_at, l)}.</p>
    </div>
  );
  return <Shell id={id} form={form} result={result} after={after} />;
}

/* ------------------------------------------------------------------ Sprit eines Landes */
interface SpritProps { lang: L; methodHref?: string; id: string; land: string; heim?: string }
export function SpritCalc({ lang: l, methodHref, id, land: c, heim: h0 }: SpritProps) {
  const [sorte, setSorte] = useState<Sorte>('e95');
  const [liter, setLiter] = useState(50);
  const [heim, setHeim] = useState(h0 ?? (l === 'nl' ? 'NL' : 'DE'));
  const p = M.preis(c, sorte), q = M.preis(heim, sorte);
  const vergleich = M.SPRIT_LAENDER.filter((x) => x !== c);
  const form = (
    <Row2>
      <SelectField id={`${id}-sorte`} label={T(l, 'Kraftstoff', 'Fuel', 'Brandstof')} value={sorte} onChange={(x) => setSorte(x as Sorte)} options={sorteOptions(l)} />
      <NumberField id={`${id}-liter`} label={T(l, 'Tankfüllung', 'Fill-up', 'Tankbeurt')} value={liter} onChange={setLiter} unit="L" max={500} />
      <SelectField id={`${id}-heim`} label={T(l, 'Vergleich mit', 'Compare with', 'Vergelijken met')} value={heim} onChange={setHeim} options={vergleich.map((x) => ({ value: x, label: land(x, l) }))} />
    </Row2>
  );
  const diff = p != null && q != null ? (q - p) * liter : null;
  const result = p == null ? <Note>{T(l, 'Für diese Sorte meldet das Land keinen Preis.', 'The country reports no price for this fuel.', 'Het land meldt geen prijs voor deze brandstof.')}</Note> : (
    <>
      <Head label={T(l, `${liter} Liter in ${land(c, l)}`, `${liter} litres in ${land(c, l)}`, `${liter} liter in ${land(c, l)}`)} value={eur(p * liter, l)} sub={`${formatMoney(p, 3, l)} / L · ${T(l, 'Woche vom', 'week of', 'week van')} ${datum(M.SPRIT_STAND, l)}`} />
      <Rows rows={[
        [T(l, `Gleiche Menge in ${land(heim, l)}`, `Same amount in ${land(heim, l)}`, `Zelfde hoeveelheid in ${land(heim, l)}`), q == null ? '–' : eur(q * liter, l)],
        [diff == null ? '' : diff >= 0 ? T(l, `Ersparnis in ${land(c, l)}`, `Saving in ${land(c, l)}`, `Besparing in ${land(c, l)}`) : T(l, `Mehrkosten in ${land(c, l)}`, `Extra cost in ${land(c, l)}`, `Meerkosten in ${land(c, l)}`), diff == null ? '–' : eur(Math.abs(diff), l)],
      ]} />
      <MethodLink href={methodHref} lang={l} />
    </>
  );
  const alle = M.SPRIT_LAENDER.map((x) => ({ x, p: M.preis(x, sorte) })).filter((y): y is { x: string; p: number } => y.p != null).sort((a, b) => a.p - b.p);
  const v = M.verlauf(c, sorte);
  const min = v.length ? Math.min(...v.map((x) => x[1])) : null, max = v.length ? Math.max(...v.map((x) => x[1])) : null;
  const after = (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <section>
        <h3 className="mb-2 text-base font-semibold text-navy-900">{T(l, `${SORTE_NAME[sorte].de} in ${land(c, l)}, letzte ${v.length} Wochen`, `${SORTE_NAME[sorte].en} in ${land(c, l)}, last ${v.length} weeks`, `${SORTE_NAME[sorte].nl} in ${land(c, l)}, laatste ${v.length} weken`)}</h3>
        {min != null && max != null && <p className="text-sm text-navy-700">{T(l, 'Tiefster Wert', 'Lowest', 'Laagste')} {formatMoney(min, 3, l)}, {T(l, 'höchster', 'highest', 'hoogste')} {formatMoney(max, 3, l)}, {T(l, 'zuletzt', 'latest', 'laatst')} {formatMoney(v[v.length - 1][1], 3, l)}.</p>}
        <div className="mt-2 flex h-24 items-end gap-0.5" aria-hidden="true">
          {min != null && max != null && v.map(([w, x]) => <div key={w} title={`${datum(w, l)} : ${formatMoney(x, 3, l)}`} className="flex-1 rounded-t bg-accent-600/70" style={{ height: `${max === min ? 50 : 15 + ((x - min) / (max - min)) * 85}%` }} />)}
        </div>
      </section>
      <section>
        <h3 className="mb-2 text-base font-semibold text-navy-900">{T(l, 'Alle Länder im Bulletin, günstigste zuerst', 'All countries in the bulletin, cheapest first', 'Alle landen in het bulletin, goedkoopste eerst')}</h3>
        <ol className="grid grid-cols-2 gap-x-4 text-sm">{alle.map((y) => <li key={y.x} className={`flex justify-between border-b border-navy-100 py-1 ${y.x === c ? 'font-semibold' : ''}`}><span>{land(y.x, l)}</span><span className="tabular-nums">{formatMoney(y.p, 3, l)}</span></li>)}</ol>
        <p className="mt-2 text-xs text-navy-600"><Q k="wob" l={l} />, {T(l, 'Preise mit Steuern, Landesdurchschnitt', 'prices with taxes, national average', 'prijzen met belastingen, landelijk gemiddelde')}.</p>
      </section>
    </div>
  );
  return <Shell id={id} form={form} result={result} after={after} />;
}
