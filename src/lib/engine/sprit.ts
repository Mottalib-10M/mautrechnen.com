/** Spritpreise je Land (Weekly Oil Bulletin, Preise mit Steuern, €/L) und Kosten je Land auf der Strecke. */
import { SPRIT, KURSE, P, type Fz, type Sorte } from './params';

export const SORTEN: Sorte[] = ['e95', 'diesel', 'lpg'];
export const SPRIT_LAENDER = Object.keys(SPRIT.laender);
export const SPRIT_STAND = SPRIT.stand;
/** Preis der letzten Woche ; null, wenn das Land nicht im Bulletin steht (Schweiz) oder keinen Wert meldet. */
export function preis(land: string, sorte: Sorte, woche = 0): number | null {
  return SPRIT.laender[land]?.[sorte]?.[woche] ?? null;
}
export function verlauf(land: string, sorte: Sorte): Array<[string, number]> {
  const s = SPRIT.laender[land]?.[sorte] ?? [];
  return SPRIT.wochen.map((w, i) => [w, s[i]] as [string, number | null]).filter((x): x is [string, number] => x[1] != null).reverse();
}
export const vorgabeVerbrauch = (fz: Fz) => P.verbrauch_vorgabe[fz];

export interface SpritPosten { land: string; km: number; liter: number; preis: number | null; kosten: number | null }
/** Kosten je Land : km × Verbrauch / 100 × Landespreis. Schweiz : Preis in CHF/L vom Nutzer, sonst nicht berechnet. */
export function spritKosten(laender: Array<{ c: string; km: number }>, sorte: Sorte, verbrauch: number, chfLiter?: number | null): SpritPosten[] {
  return laender.map(({ c, km }) => {
    const liter = (km * verbrauch) / 100;
    let p = preis(c, sorte);
    if (c === 'CH') p = chfLiter && chfLiter > 0 ? chfLiter / KURSE.kurse.CHF : null;
    return { land: c, km, liter: Math.round(liter * 10) / 10, preis: p, kosten: p == null ? null : Math.round(liter * p * 100) / 100 };
  });
}
/** Günstigstes Land der Strecke für die Sorte (wo tanken). */
export function billigstes(laender: string[], sorte: Sorte): { land: string; preis: number } | null {
  let best: { land: string; preis: number } | null = null;
  for (const c of laender) { const p = preis(c, sorte); if (p != null && (!best || p < best.preis)) best = { land: c, preis: p }; }
  return best;
}
