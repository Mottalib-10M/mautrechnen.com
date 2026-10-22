/**
 * Vignetten : günstigste Kombination für die Fahrtage. Durchreise = nur Hin- und Rückfahrttag ;
 * Aufenthalt = jeder Tag dazwischen. Preise in Landeswährung, umgerechnet mit dem EZB-Kurs.
 */
import { P, KURSE, type Fz } from './params';
import { addDays, addMonths, diffDays } from './datum';

export type VLand = keyof typeof P.vignetten;
export const VIGNETTEN_LAENDER = Object.keys(P.vignetten) as VLand[];
interface Produkt { id: string; preis: number; tage?: number; monate?: number; von?: string; bis?: string; jahresvignette?: boolean }
interface VDef { waehrung: string; quelle: string; preise_bis: string | null; klasse: Record<Fz, string | null>; anhaenger: number; anhaenger_nv?: boolean; produkte: Record<string, Produkt[]> }
const def = (land: VLand) => P.vignetten[land] as unknown as VDef;

/** Euro je Einheit der Landeswährung (EZB-Referenzkurs). */
export function inEuro(betrag: number, waehrung: string): number {
  if (waehrung === 'EUR') return betrag;
  const k = KURSE.kurse[waehrung];
  if (!k) throw new Error(`Kein Kurs für ${waehrung}`);
  return betrag / k;
}
export const r2 = (x: number) => Math.round(x * 100) / 100;

/** Letzter Gültigkeitstag eines Produkts, gekauft für den Tag `start` ; null = an diesem Tag nicht erhältlich. */
export function gueltigBis(land: VLand, p: Produkt, start: string): string | null {
  const d = def(land);
  if (p.von && p.bis) return start >= p.von && start <= p.bis ? p.bis : null;
  if (d.preise_bis && start > d.preise_bis) return null;
  if (p.jahresvignette) {
    // Schweiz : Vignette des Jahres J gilt vom 1. Dezember J-1 bis 31. Januar J+1 ; Preis gesetzlich 40 CHF.
    const y = Number(start.slice(0, 4)) + (start.slice(5, 7) === '12' ? 1 : 0);
    return `${y + 1}-01-31`;
  }
  if (p.tage) return addDays(start, p.tage - 1);
  if (p.monate) return addMonths(start, p.monate);
  return null;
}

export interface VignettenWahl { id: string; anzahl: number; ab: string; bis: string; preis: number }
export interface VignettenErgebnis {
  land: VLand;
  /** false : keine Vignettenpflicht für dieses Fahrzeug (Motorrad in CZ und SK). */
  pflicht: boolean;
  /** true : Regel für Anhänger beim Betreiber nicht gelesen (Slowenien) ; der Preis gilt nur für das Zugfahrzeug. */
  anhaengerNv?: boolean;
  /** false : Preise für diese Daten noch nicht veröffentlicht (Jahr 2027). */
  verfuegbar: boolean;
  waehrung: string;
  wahl: VignettenWahl[];
  summe: number;
  summeEur: number;
}

/** Produkte der Fahrzeugklasse, mit Gültigkeit ab `start`. */
export function produkte(land: VLand, fz: Fz, start: string) {
  const d = def(land);
  const k = d.klasse[fz];
  if (!k) return [];
  return d.produkte[k].map((p) => ({ ...p, bis: gueltigBis(land, p, start), preisEur: r2(inEuro(p.preis, d.waehrung)) }));
}

/**
 * Günstigste Vignetten für die Fahrtage `tage` (sortiert, ISO). Dynamische Programmierung über die Tage :
 * für den ersten noch offenen Tag jedes Produkt probieren, das an diesem Tag beginnt.
 */
export function vignette(land: VLand, fz: Fz, tage: string[]): VignettenErgebnis {
  const d = def(land);
  const k = d.klasse[fz];
  const leer = { land, waehrung: d.waehrung, wahl: [], summe: 0, summeEur: 0, anhaengerNv: fz === 'gespann' && !!d.anhaenger_nv };
  if (!k) return { ...leer, pflicht: false, verfuegbar: true };
  const need = [...new Set(tage)].sort();
  const list = d.produkte[k];
  const memo = new Map<number, { cost: number; wahl: VignettenWahl[] } | null>();
  const f = (i: number): { cost: number; wahl: VignettenWahl[] } | null => {
    if (i >= need.length) return { cost: 0, wahl: [] };
    if (memo.has(i)) return memo.get(i)!;
    let best: { cost: number; wahl: VignettenWahl[] } | null = null;
    for (const p of list) {
      const bis = gueltigBis(land, p, need[i]);
      if (!bis) continue;
      let j = i;
      while (j < need.length && need[j] <= bis) j++;
      const rest = f(j);
      if (!rest) continue;
      const cost = p.preis + rest.cost;
      // Gleicher Preis : die Lösung mit weniger Vignetten.
      if (!best || cost < best.cost - 1e-9 || (Math.abs(cost - best.cost) < 1e-9 && 1 + rest.wahl.length < best.wahl.length)) best = { cost, wahl: [{ id: p.id, anzahl: 1, ab: need[i], bis, preis: p.preis }, ...rest.wahl] };
    }
    memo.set(i, best);
    return best;
  };
  const r = f(0);
  if (!r) return { ...leer, pflicht: true, verfuegbar: false };
  // Anhänger mit eigener Vignette (Schweiz) : gleiche Wahl noch einmal.
  const n = fz === 'gespann' ? 1 + d.anhaenger : 1;
  const wahl = r.wahl.map((w) => ({ ...w, anzahl: n }));
  const summe = r2(r.cost * n);
  return { land, pflicht: true, verfuegbar: true, waehrung: d.waehrung, wahl, summe, summeEur: r2(inEuro(summe, d.waehrung)), anhaengerNv: leer.anhaengerNv };
}

/** Fahrtage einer Reise : Hinfahrt am `ab`, Rückfahrt `dauer` Tage später ; Aufenthalt = alle Tage dazwischen. */
export function fahrtage(ab: string, dauer: number, hinUndZurueck: boolean, aufenthalt: boolean): string[] {
  if (!hinUndZurueck) return [ab];
  if (!aufenthalt) return [ab, addDays(ab, Math.max(0, dauer))];
  return Array.from({ length: Math.max(0, dauer) + 1 }, (_, i) => addDays(ab, i));
}
export { diffDays };
