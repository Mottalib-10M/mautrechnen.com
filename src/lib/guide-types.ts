/**
 * Eine Seite = EINE Datei in `src/content/outils/` (CONTRIBUTING-GUIDES.md). Sie trägt ihre Sprachen
 * (Englisch immer ; Deutsch und Niederländisch, wo diese Leser suchen), Text, FAQ, Quellen, Rechner und
 * Verweise ; der Kern (Routen, Menüs, Fußzeile, Sitemap, hreflang, Schemas) liest sie selbst.
 */
import type { SourceKey, Params, Lang } from './engine/params';
export type { Lang };
export type Group = 'vignette' | 'maut' | 'sprit' | 'strecke';
/** Rechner am Kopf der Seite (components/outils/Tools.tsx). */
export type Tool = 'reise' | 'maut' | 'vignette' | 'sprit';
export interface FAQ { q: string; a: string }

/** Schreibwerkzeuge für den Seitentext : Links, Zahlen im Format der Sprache, Motor. */
export interface Helpers {
  lang: Lang;
  /** Text der Sprache der Seite, Reihenfolge immer de, en, nl. */
  T: <A>(de: A, en: A, nl: A) => A;
  /** Interner Link auf eine Seite (id) ; fehlt sie in dieser Sprache, nur der Text. */
  a: (id: string, text: string) => string;
  eur: (n: number, decimals?: number) => string;
  num: (n: number, decimals?: number) => string;
  pct: (x: number, decimals?: number) => string;
  /** Literpreis mit drei Nachkommastellen (« 1,817 € »). */
  l3: (n: number) => string;
  /** Betrag in Landeswährung (« 230 CZK », « 40,00 CHF »). */
  geld: (n: number, waehrung: string) => string;
  date: (iso: string) => string;
  /** Ländername in der Sprache der Seite. */
  land: (code: string) => string;
  table: (headers: string[], rows: Array<Array<string | number>>, caption?: string, align?: Array<'l' | 'r'>) => string;
  src: (key: SourceKey, text?: string) => string;
  P: Params;
  M: typeof import('./engine/index');
  /** Tag des Builds (Berliner Zeit). */
  today: string;
}

export interface PageText {
  slug: string;
  nav: string;
  card: string;
  /** 50 bis 60 Zeichen, Suchbegriff vorn, Jahr enthalten (RECETTE §11). */
  title: string;
  /** 150 bis 160 Zeichen. */
  description: string;
  h1: string;
  intro: string;
  /** Zitierfähiger Block : EIN Absatz mit mindestens 120 Wörtern (RECETTE §21). */
  resume: (h: Helpers) => string;
  faqs: (h: Helpers) => FAQ[];
  body: (h: Helpers) => string;
}

export interface PageDef {
  id: string;
  group: Group;
  order: number;
  tool: Tool;
  /** Land des Rechners (Vignette, Sprit) ; Maut : Länder der Orte in den Auswahllisten. */
  land?: string;
  laender?: string[];
  /** Vorgaben des Rechners : Start und Ziel (reise), von und nach (maut). */
  von?: string;
  nach?: string;
  related: string[];
  sources: SourceKey[];
  de?: PageText;
  en: PageText;
  nl?: PageText;
}
export const defineGuide = (g: PageDef): PageDef => g;
