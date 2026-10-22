/**
 * Tarifperioden (params-2026.json, „_tarifperioden“) : jeder Tarif hat ein Ende (preise_bis, letzter Reisetag ;
 * null = kein Ende genannt) und optional den schon veröffentlichten Folgetarif (folge, gültig ab folge.ab).
 */
export type MitPeriode = { preise_bis?: string | null; folge?: unknown };

/** Tarif am Reisetag `tag` (ISO) : Folgetarif, sobald tag ≥ folge.ab ; null = für diesen Tag noch nicht veröffentlicht. Ohne Tag : der gelesene Tarif. */
export function tarifAm<T extends MitPeriode>(t: T, tag?: string): T | null {
  let cur = t;
  while (tag && cur.folge && tag >= (cur.folge as { ab: string }).ab) {
    const f = cur.folge as Partial<T> & { ab: string };
    cur = { ...cur, ...f, folge: f.folge } as T;
  }
  if (tag && cur.preise_bis && tag > cur.preise_bis) return null;
  return cur;
}
