/** Gesamtkosten einer Urlaubsfahrt : Strecke, Vignetten, Maut, Sprit ; Hin- und Rückfahrt auf derselben Strecke. */
import { P, type Fz, type Sorte } from './params';
import { addDays } from './datum';
import { route, KNOTEN, type Route } from './route';
import { maut, mautSumme, streckeAuf, type MautPosten } from './maut';
const STRECKE = P.streckenmaut as Record<string, { ohne_vignette?: boolean }>;
import { vignette, fahrtage, VIGNETTEN_LAENDER, type VLand, type VignettenErgebnis } from './vignette';
import { spritKosten, billigstes, type SpritPosten } from './sprit';

export interface ReiseEingabe {
  start: string; ziel: string; fz: Fz; sorte: Sorte; verbrauch: number;
  ab: string; dauer: number; hinUndZurueck: boolean;
  /** Im Zielland auch während des Aufenthalts Autobahn fahren (Vignette für alle Tage). */
  aufenthalt: boolean;
  meiden?: string[];
  chfLiter?: number | null;
}
export interface ReiseErgebnis {
  route: Route;
  fahrten: number;
  vignetten: VignettenErgebnis[];
  /** Maut der Hinfahrt (Reisetag ab). */
  maut: MautPosten[];
  /** Maut der Rückfahrt, nur wenn sie anders rechnet als die Hinfahrt (neuer Tarif oder noch nicht veröffentlicht am Rückfahrttag). */
  mautRueck: MautPosten[] | null;
  sprit: SpritPosten[];
  summen: { vignetten: number; mautGeprueft: number; mautSchaetzung: number; sprit: number; gesamt: number; ohneSchaetzung: number };
  offen: MautPosten[];
  vignettenFehlen: VLand[];
  spritFehlt: string[];
  tanken: { land: string; preis: number } | null;
}
const VFREI = P.vignettenfrei as Record<string, string>;
const vfrei = (a: string, b: string) => !!(VFREI[`${a}|${b}`] ?? VFREI[`${b}|${a}`]);

/** Länder mit Vignettenpflicht auf der Strecke : mindestens eine Kante ohne Ausnahme (vignettenfreie Abschnitte, A13). */
export function vignettenLaender(r: Route): VLand[] {
  const set = new Set<string>();
  for (const s of r.schritte) if ((VIGNETTEN_LAENDER as string[]).includes(s.c) && !vfrei(s.von, s.nach) && !STRECKE[streckeAuf(s.von, s.nach) ?? '']?.ohne_vignette) set.add(s.c);
  return VIGNETTEN_LAENDER.filter((c) => set.has(c));
}
const r2 = (x: number) => Math.round(x * 100) / 100;

export function reise(e: ReiseEingabe): ReiseErgebnis | null {
  const r = route(e.start, e.ziel, e.meiden ?? []);
  if (!r) return null;
  const fahrten = e.hinUndZurueck ? 2 : 1;
  const zielLand = KNOTEN[e.ziel].c[0];
  const vignetten = vignettenLaender(r).map((c) => vignette(c, e.fz, fahrtage(e.ab, e.dauer, e.hinUndZurueck, e.aufenthalt && c === zielLand)));
  const m = maut(r.schritte, e.fz, e.ab);
  const ms = mautSumme(m);
  // Rückfahrt am Tag ab + dauer : der Tarif kann dann ein anderer sein (Jahreswechsel).
  const mR = e.hinUndZurueck ? maut(r.schritte, e.fz, addDays(e.ab, Math.max(0, e.dauer))) : [];
  const gleich = mR.length === m.length && mR.every((p, i) => p.preis === m[i].preis && p.grund === m[i].grund);
  const msR = mautSumme(mR);
  const sprit = spritKosten(r.laender, e.sorte, e.verbrauch, e.chfLiter);
  const vSum = r2(vignetten.reduce((s, v) => s + (v.verfuegbar ? v.summeEur : 0), 0));
  const sSum = r2(sprit.reduce((s, x) => s + (x.kosten ?? 0), 0) * fahrten);
  const mg = r2(ms.geprueft + msR.geprueft), msch = r2(ms.schaetzung + msR.schaetzung);
  const ohne = r2(vSum + mg + sSum);
  return {
    route: r, fahrten, vignetten, maut: m, mautRueck: e.hinUndZurueck && !gleich ? mR : null, sprit,
    summen: { vignetten: vSum, mautGeprueft: mg, mautSchaetzung: msch, sprit: sSum, ohneSchaetzung: ohne, gesamt: r2(ohne + msch) },
    offen: gleich ? ms.offen : [...ms.offen, ...msR.offen],
    vignettenFehlen: vignetten.filter((v) => !v.verfuegbar).map((v) => v.land),
    spritFehlt: sprit.filter((x) => x.kosten == null).map((x) => x.land),
    tanken: billigstes(r.laender.map((l) => l.c), e.sorte),
  };
}
