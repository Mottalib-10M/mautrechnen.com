/** Feste Parameter (RECETTE §4), Netz, Spritpreise und Kurse, einmal gelesen. */
import raw from '../../data/params-2026.json';
import netz from '../../data/netz.json';
import sprit from '../../data/sprit.json';
import kurse from '../../data/kurse.json';
export const P = raw;
export type Params = typeof raw;
export type SourceKey = keyof typeof raw.sources;
export type Lang = 'de' | 'en' | 'nl';
export type Fz = 'pkw' | 'wohnmobil' | 'gespann' | 'motorrad';
export const FAHRZEUGE: Fz[] = ['pkw', 'wohnmobil', 'gespann', 'motorrad'];
export type Sorte = 'e95' | 'diesel' | 'lpg';
export const NETZ = netz as { quelle: string; erstellt: string; nodes: Knoten[]; edges: Kante[] };
export const SPRIT = sprit as { quelle: string; quelle_url: string; lizenz: string; abgerufen: string; stand: string; wochen: string[]; laender: Record<string, Record<Sorte, Array<number | null>>> };
export const KURSE = kurse as { quelle: string; stand: string; kurse: Record<string, number> };
export interface Knoten { id: string; c: string[]; lon: number; lat: number; s?: number; z?: number; b?: number; n: Record<Lang, string> }
export interface Kante { a: string; b: string; c: string; km: number; min: number }
export const sourceUrl = (key: SourceKey, _lang?: Lang): string => (raw.sources[key] as { url: string }).url;
/** Stand der Tarifdaten (gelesen bei den Betreibern). */
export const TARIF_STAND = raw.retrieved_at;
