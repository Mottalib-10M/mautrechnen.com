/** Startseite : gemeinsame Rechnungen der drei Sprachen. Alle Zahlen kommen aus dem Motor. */
import type { Helpers } from '../../lib/guide-types';

export type Fz = 'pkw' | 'wohnmobil' | 'gespann' | 'motorrad';
export const ALLE_SEITEN = ['vignette-oesterreich', 'digitale-vignette', 'vignette-schweiz', 'vignette-slowenien', 'vignette-tschechien', 'vignette-ungarn', 'maut-italien', 'maut-frankreich', 'maut-kroatien', 'maut-spanien', 'maut-oesterreich', 'brennermaut', 'tauerntunnel', 'karawankentunnel', 'spritpreise-oesterreich', 'spritpreise-italien', 'spritpreise-kroatien', 'spritpreise-slowenien', 'benzinpreis-frankreich', 'benzineprijs-duitsland', 'benzineprijs-belgie', 'tanken-luxemburg', 'maut-nach-kroatien', 'maut-nach-italien'];

export function daten(h: Helpers) {
  const ab = h.M.addDays(h.today, 7);
  const sorte = (fz: Fz) => (fz === 'pkw' || fz === 'motorrad' ? 'e95' : 'diesel') as 'e95' | 'diesel';
  const go = (start: string, ziel: string, fz: Fz = 'pkw', meiden: string[] = []) =>
    h.M.reise({ start, ziel, fz, sorte: sorte(fz), verbrauch: h.P.verbrauch_vorgabe[fz], ab, dauer: 14, hinUndZurueck: true, aufenthalt: false, meiden });
  const ort = (id: string) => h.M.KNOTEN[id].n[h.lang];
  /** Tabelle von Beispielfahrten. */
  const fahrten = (paare: Array<[string, string]>, kopf: string[], caption: string) => h.table(kopf, paare.map(([a, b]) => {
    const r = go(a, b);
    if (!r) return [`${ort(a)} – ${ort(b)}`, '–', '–', '–', '–', '–', '–'];
    return [`${ort(a)} – ${ort(b)}`, `${h.num(r.route.km)} km`, h.eur(r.summen.vignetten, 2), h.eur(r.summen.mautGeprueft, 2), `${h.eur(r.summen.mautSchaetzung, 2)}${r.offen.length ? ` + ${r.offen.length} nv` : ''}`, h.eur(r.summen.sprit, 2), h.eur(r.summen.gesamt, 2)];
  }), caption, ['l', 'r', 'r', 'r', 'r', 'r', 'r']);
  /** Beste Vignette je Land für eine Durchreise mit 14 Tagen Pause (zwei Fahrtage). */
  const tage = h.M.fahrtage(ab, 14, true, false);
  const vignetten = (['AT', 'CH', 'SI', 'CZ', 'HU', 'SK'] as const).map((c) => ({ c, pkw: h.M.vignette(c, 'pkw', tage), wm: h.M.vignette(c, 'wohnmobil', tage), mo: h.M.vignette(c, 'motorrad', tage) }));
  const vz = (v: ReturnType<typeof h.M.vignette>) => (!v.pflicht ? h.eur(0) : !v.verfuegbar ? '–' : h.eur(v.summeEur, 2));
  /** Spritpreise der Woche (Super, Diesel) für die wichtigsten Länder, sortiert nach Super. */
  const spritLaender = ['DE', 'NL', 'BE', 'LU', 'FR', 'AT', 'IT', 'SI', 'HR', 'CZ', 'HU', 'ES'].filter((c) => h.M.preis(c, 'e95') != null);
  const sprit = spritLaender.map((c) => ({ c, e95: h.M.preis(c, 'e95')!, diesel: h.M.preis(c, 'diesel') })).sort((a, b) => a.e95 - b.e95);
  const T = h.P.tunnel;
  const haupt = go(h.T('muenchen', 'frankfurt', 'utrecht'), h.T('split', 'venedig', 'nizza'));
  return { ab, go, ort, fahrten, vignetten, vz, sprit, T, haupt };
}

/** Liste aller Inhaltsseiten mit internen Links (nur die in dieser Sprache vorhandenen werden verlinkt). */
export const linkliste = (h: Helpers, namen: Record<string, string>) => `<ul>${ALLE_SEITEN.filter((id) => namen[id]).map((id) => `<li>${h.a(id, namen[id])}</li>`).join('')}</ul>`;
