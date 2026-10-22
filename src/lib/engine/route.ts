/** Schnellste Strecke im Netz (Dijkstra auf Fahrminuten laut OSRM), wahlweise ohne bestimmte Länder. */
import { NETZ, type Kante, type Knoten } from './params';

export const KNOTEN: Record<string, Knoten> = Object.fromEntries(NETZ.nodes.map((n) => [n.id, n]));
const ADJ: Record<string, Array<{ to: string; e: Kante }>> = {};
for (const e of NETZ.edges) {
  (ADJ[e.a] ??= []).push({ to: e.b, e });
  (ADJ[e.b] ??= []).push({ to: e.a, e });
}
export const START = NETZ.nodes.filter((n) => n.s);
export const ZIELE = NETZ.nodes.filter((n) => n.z);
export const kantenKey = (a: string, b: string) => `${a}|${b}`;

export interface Schritt { von: string; nach: string; c: string; km: number; min: number }
export interface Route { knoten: string[]; schritte: Schritt[]; km: number; min: number; laender: Array<{ c: string; km: number }> }

export function route(von: string, nach: string, meiden: string[] = []): Route | null {
  if (!KNOTEN[von] || !KNOTEN[nach]) return null;
  // Ein Land, in dem Start oder Ziel liegt, lässt sich nicht meiden.
  const sperre = new Set(meiden.filter((c) => !KNOTEN[von].c.includes(c) && !KNOTEN[nach].c.includes(c)));
  const dist: Record<string, number> = { [von]: 0 };
  const prev: Record<string, { from: string; e: Kante }> = {};
  const offen = new Set<string>([von]);
  const fertig = new Set<string>();
  while (offen.size) {
    let u = '';
    for (const x of offen) if (!u || dist[x] < dist[u]) u = x;
    offen.delete(u);
    if (u === nach) break;
    fertig.add(u);
    for (const { to, e } of ADJ[u] ?? []) {
      if (fertig.has(to) || sperre.has(e.c)) continue;
      const nd = dist[u] + e.min;
      if (dist[to] === undefined || nd < dist[to]) { dist[to] = nd; prev[to] = { from: u, e }; offen.add(to); }
    }
  }
  if (dist[nach] === undefined) return null;
  const knoten = [nach];
  const schritte: Schritt[] = [];
  for (let x = nach; x !== von; x = prev[x].from) {
    const { from, e } = prev[x];
    schritte.unshift({ von: from, nach: x, c: e.c, km: e.km, min: e.min });
    knoten.unshift(from);
  }
  const laender: Array<{ c: string; km: number }> = [];
  for (const s of schritte) {
    const l = laender.find((x) => x.c === s.c);
    if (l) l.km += s.km; else laender.push({ c: s.c, km: s.km });
  }
  laender.forEach((l) => (l.km = Math.round(l.km * 10) / 10));
  return { knoten, schritte, km: Math.round(schritte.reduce((s, x) => s + x.km, 0) * 10) / 10, min: schritte.reduce((s, x) => s + x.min, 0), laender };
}
