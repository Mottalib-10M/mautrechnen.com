/**
 * Maut entlang einer Strecke, einfache Fahrt. Jede Kante in Frankreich, Italien, Kroatien und Spanien hat
 * in params-2026.json eine Mautart. Aufeinanderfolgende Kanten desselben geschlossenen Systems werden zu
 * einer Fahrt von der ersten Einfahrt bis zur letzten Ausfahrt zusammengefasst (so rechnet der Betreiber).
 * Ein Paar ohne gelesenen Preis bleibt « nicht verifiziert » und geht in keine Summe ein.
 */
import { P, type Fz, type SourceKey } from './params';
import type { Schritt } from './route';

type Typ = 'sys' | 'strecke' | 'barriere' | 'it' | 'nv';
export interface MautPosten {
  typ: Typ;
  land: string;
  /** Schlüssel des Systems, der Strecke, der Mautstelle oder des italienischen Tarifs. */
  id: string;
  von: string;
  nach: string;
  /** Preis in Euro ; null = nicht verifiziert (oder für diese Fahrzeugklasse nicht gelesen). */
  preis: number | null;
  /** true : italienische Schätzung (Kilometertarif × Kilometer). */
  schaetzung?: boolean;
  km?: number;
  quelle?: SourceKey;
  grund?: keyof typeof P.nv_gruende;
  /** Ein- und Ausfahrt laut Tarifblatt. */
  station?: string;
}

type Preis = Record<Fz, number | null>;
interface Paar { von: string; bis: string; preis: Preis; quelle?: string }
const KANTEN = P.kanten as Record<string, { typ: string; sys?: string; id?: string; tarif?: string; grund?: string }>;
const SYS = P.systeme as Record<string, { land: string; quelle: string; paare: Record<string, Paar> }>;
const STRECKE = P.streckenmaut as Record<string, { land: string; kante: string; quelle: string; preis: Preis }>;
const BARR = P.barrieren as Record<string, { land: string; quelle: string; preis: Preis }>;
const ITT = P.italien_tarife as Record<string, { quelle: string; betreiber: string; preis: Record<Fz, number> }>;

export function kantenArt(a: string, b: string) { return KANTEN[`${a}|${b}`] ?? KANTEN[`${b}|${a}`]; }
export function streckeAuf(a: string, b: string): string | null {
  for (const [id, s] of Object.entries(STRECKE)) if (s.kante === `${a}|${b}` || s.kante === `${b}|${a}`) return id;
  return null;
}
/** Italien : Summe km × Tarif je Betreiber, mit MwSt. (im Tarif), auf 10 Cent gerundet (Formel des Betreibers). */
export const rund10 = (x: number) => Math.round(x * 10) / 10;

export function maut(schritte: Schritt[], fz: Fz): MautPosten[] {
  const out: MautPosten[] = [];
  let i = 0;
  while (i < schritte.length) {
    const s = schritte[i];
    const st = streckeAuf(s.von, s.nach);
    if (st) {
      const x = STRECKE[st];
      out.push({ typ: 'strecke', land: x.land, id: st, von: s.von, nach: s.nach, preis: x.preis[fz], quelle: x.quelle as SourceKey });
      i++; continue;
    }
    const k = kantenArt(s.von, s.nach);
    if (!k || k.typ === 'frei') { i++; continue; }
    if (k.typ === 'barriere') {
      const b = BARR[k.id!];
      out.push({ typ: 'barriere', land: b.land, id: k.id!, von: s.von, nach: s.nach, preis: b.preis[fz], quelle: b.quelle as SourceKey });
      i++; continue;
    }
    if (k.typ === 'nv') {
      out.push({ typ: 'nv', land: s.c, id: k.grund!, von: s.von, nach: s.nach, preis: null, grund: k.grund as MautPosten['grund'] });
      i++; continue;
    }
    if (k.typ === 'sys') {
      let j = i;
      while (j + 1 < schritte.length && kantenArt(schritte[j + 1].von, schritte[j + 1].nach)?.sys === k.sys && !streckeAuf(schritte[j + 1].von, schritte[j + 1].nach)) j++;
      const von = s.von, nach = schritte[j].nach;
      const sys = SYS[k.sys!];
      const paar = sys.paare[`${von}|${nach}`] ?? sys.paare[`${nach}|${von}`];
      if (paar) {
        out.push({ typ: 'sys', land: sys.land, id: k.sys!, von, nach, preis: paar.preis[fz], quelle: (paar.quelle ?? sys.quelle) as SourceKey, station: `${paar.von} – ${paar.bis}`, ...(paar.preis[fz] == null ? { grund: sys.land === 'HR' ? 'hac_paar' : 'fr_paar' } : {}) } as MautPosten);
      } else {
        out.push({ typ: 'nv', land: sys.land, id: k.sys!, von, nach, preis: null, grund: sys.land === 'HR' ? 'hac_paar' : 'fr_paar' });
      }
      i = j + 1; continue;
    }
    if (k.typ === 'it') {
      // Aufeinanderfolgende Kanten desselben Betreibers : eine Fahrt, ein gerundeter Betrag.
      const betreiber = ITT[k.tarif!].betreiber;
      let j = i, summe = 0, km = 0;
      const quelle = ITT[k.tarif!].quelle as SourceKey;
      while (j < schritte.length) {
        const kk = kantenArt(schritte[j].von, schritte[j].nach);
        if (kk?.typ !== 'it' || ITT[kk.tarif!].betreiber !== betreiber) break;
        summe += schritte[j].km * ITT[kk.tarif!].preis[fz];
        km += schritte[j].km;
        j++;
      }
      out.push({ typ: 'it', land: 'IT', id: k.tarif!, von: s.von, nach: schritte[j - 1].nach, preis: rund10(summe), schaetzung: true, km: Math.round(km), quelle });
      i = j; continue;
    }
    i++;
  }
  return out;
}

export function mautSumme(posten: MautPosten[]) {
  const sum = (f: (p: MautPosten) => boolean) => Math.round(posten.filter((p) => p.preis != null && f(p)).reduce((s, p) => s + p.preis!, 0) * 100) / 100;
  return { geprueft: sum((p) => !p.schaetzung), schaetzung: sum((p) => !!p.schaetzung), offen: posten.filter((p) => p.preis == null) };
}
