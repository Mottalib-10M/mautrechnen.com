/**
 * Tests, die die Veröffentlichung blockieren : jeder Preis gegen das Tarifblatt des Betreibers
 * (research/peages.md, research/vignettes.md), Laufzeiten der Vignetten, Zusammenfassung der Mautsysteme,
 * italienische Formel, Spritdaten des Weekly Oil Bulletin.
 */
import { describe, it, expect } from 'vitest';
import * as M from './index';
import { P } from './params';

describe('Vignettenpreise laut Betreiber (gelesen am 2026-10-21)', () => {
  const preis = (land: M.VLand, fz: M.Fz, id: string) => M.produkte(land, fz, '2026-07-01').find((p) => p.id === id)?.preis;
  it('Österreich ASFINAG 2026 : 9,60 / 12,80 / 32,00 / 106,80 € (Pkw), 3,80 / 5,10 / 12,80 / 42,70 € (Motorrad)', () => {
    expect([preis('AT', 'pkw', '1t'), preis('AT', 'pkw', '10t'), preis('AT', 'pkw', '2m'), preis('AT', 'pkw', 'jahr')]).toEqual([9.6, 12.8, 32, 106.8]);
    expect([preis('AT', 'motorrad', '1t'), preis('AT', 'motorrad', '10t'), preis('AT', 'motorrad', '2m'), preis('AT', 'motorrad', 'jahr')]).toEqual([3.8, 5.1, 12.8, 42.7]);
  });
  it('Schweiz BAZG : 40 CHF, gesetzlich, eine zweite Vignette für den Anhänger', () => {
    expect(preis('CH', 'pkw', 'jahr')).toBe(40);
    const v = M.vignette('CH', 'gespann', ['2026-08-01']);
    expect(v.summe).toBe(80);
    expect(v.summeEur).toBeCloseTo(80 / M.KURSE.kurse.CHF, 2);
  });
  it('Slowenien DARS : 2A 16 / 32 / 117,50 €, 2B 32 / 64,10 / 235 €, Motorrad 8 / 32 / 58,70 €', () => {
    expect(['7t', '1m', 'jahr'].map((i) => preis('SI', 'pkw', i))).toEqual([16, 32, 117.5]);
    expect(['7t', '1m', 'jahr'].map((i) => preis('SI', 'wohnmobil', i))).toEqual([32, 64.1, 235]);
    expect(['7t', '6m', 'jahr'].map((i) => preis('SI', 'motorrad', i))).toEqual([8, 32, 58.7]);
  });
  it('Tschechien eDálnice ab 1.1.2026 : 230 / 300 / 480 / 2 570 CZK ; Motorrad frei', () => {
    expect(['1t', '10t', '30t', 'jahr'].map((i) => preis('CZ', 'pkw', i))).toEqual([230, 300, 480, 2570]);
    expect(M.vignette('CZ', 'motorrad', ['2026-08-01']).pflicht).toBe(false);
  });
  it('Ungarn e-matrica ab 1.1.2026 : D1 5 550 / 6 900 / 11 170 / 61 760 HUF ; D1M 2 770 / 3 450 / 5 590 HUF', () => {
    expect(['1t', '10t', '1m', 'jahr'].map((i) => preis('HU', 'pkw', i))).toEqual([5550, 6900, 11170, 61760]);
    expect(['1t', '10t', '1m'].map((i) => preis('HU', 'motorrad', i))).toEqual([2770, 3450, 5590]);
  });
  it('Slowakei eznamka : 8,10 / 10,80 / 17,10 / 90 € ; Motorrad frei', () => {
    expect(['1t', '10t', '30t', 'jahr'].map((i) => preis('SK', 'pkw', i))).toEqual([8.1, 10.8, 17.1, 90]);
    expect(M.vignette('SK', 'motorrad', ['2026-08-01']).pflicht).toBe(false);
  });
});

describe('Laufzeiten und günstigste Wahl', () => {
  it('10-Tages-Vignette : Tag 1 bis Tag 10', () => {
    const p = P.vignetten.AT.produkte.kfz[1];
    expect(M.gueltigBis('AT', p, '2026-07-18')).toBe('2026-07-27');
  });
  it('2-Monats-Vignette : bis zum selben Tag zwei Monate später ; 31. auf Monatsende', () => {
    const p = P.vignetten.AT.produkte.kfz[2];
    expect(M.gueltigBis('AT', p, '2026-07-18')).toBe('2026-09-18');
    expect(M.addMonths('2026-08-31', 1)).toBe('2026-09-30');
  });
  it('Jahresvignette Österreich 2026 gilt bis 31.1.2027 ; Schweiz : 1.12. bis 31.1. des übernächsten Jahres', () => {
    expect(M.gueltigBis('AT', P.vignetten.AT.produkte.kfz[3], '2026-06-01')).toBe('2027-01-31');
    expect(M.gueltigBis('CH', P.vignetten.CH.produkte.kfz[0], '2026-06-01')).toBe('2027-01-31');
    expect(M.gueltigBis('CH', P.vignetten.CH.produkte.kfz[0], '2026-12-05')).toBe('2028-01-31');
  });
  it('Durchreise Österreich, 14 Tage Urlaub : zwei 1-Tages-Vignetten (19,20 €) statt 2 Monate (32 €)', () => {
    const v = M.vignette('AT', 'pkw', M.fahrtage('2026-07-18', 14, true, false));
    expect(v.summe).toBe(19.2);
    expect(v.wahl.map((w) => w.id)).toEqual(['1t', '1t']);
  });
  it('Durchreise Österreich, Rückfahrt nach 7 Tagen : eine 10-Tages-Vignette (12,80 €)', () => {
    expect(M.vignette('AT', 'pkw', M.fahrtage('2026-07-18', 7, true, false)).wahl.map((w) => w.id)).toEqual(['10t']);
  });
  it('Urlaub in Österreich, 21 Tage mit Autobahn : 2-Monats-Vignette (32 €)', () => {
    const v = M.vignette('AT', 'pkw', M.fahrtage('2026-07-18', 21, true, true));
    expect(v.summe).toBe(32);
  });
  it('Slowenien, 14 Tage : Monatsvignette (32 €) statt zwei Wochenvignetten (gleicher Preis, eine Vignette)', () => {
    const v = M.vignette('SI', 'pkw', M.fahrtage('2026-07-18', 14, true, false));
    expect(v.summe).toBe(32);
    expect(v.wahl).toHaveLength(1);
  });
  it('Tschechien, Hin- und Rückfahrt nach 5 Tagen : 10-Tages-Vignette (300 CZK)', () => {
    expect(M.vignette('CZ', 'pkw', M.fahrtage('2026-07-18', 5, true, false)).summe).toBe(300);
  });
  it('Preise 2027 noch nicht veröffentlicht : keine Summe (Österreich ab 1.12.2026, Slowenien ab 1.1.2027)', () => {
    expect(M.vignette('AT', 'pkw', ['2026-12-20']).verfuegbar).toBe(true); // Jahresvignette 2026 gilt noch
    expect(M.vignette('AT', 'pkw', ['2027-03-01']).verfuegbar).toBe(false);
    expect(M.vignette('SI', 'pkw', ['2027-01-05']).verfuegbar).toBe(false);
  });
});

describe('Maut laut Raster der Betreiber', () => {
  const r = (a: string, b: string, fz: M.Fz = 'pkw') => M.maut(M.route(a, b)!.schritte, fz);
  it('APRR : Mulhouse → Lyon = Fontaine-Larivière 3,10 + Saint-Maurice → Villefranche-Limas 32,80 = 35,90 € (Klasse 1)', () => {
    const m = r('b_basel_fr', 'lyon');
    expect(m.find((x) => x.id === 'aprr')?.preis).toBe(35.9);
  });
  it('APRR : Gye → Beaune Sud 22,40 € (Kl. 1), 34,30 € (Kl. 2), 13,40 € (Kl. 5)', () => {
    expect(P.systeme.aprr.paare['nancy|beaune'].preis).toEqual({ pkw: 22.4, wohnmobil: 34.3, gespann: 34.3, motorrad: 13.4 });
  });
  it('Straßburg → Nizza : APRR, ASF Lyon–Aix 28,10 € und Escota Aix–Nizza 21,20 €, jede Fahrt einmal', () => {
    const m = M.maut(M.route('strassburg', 'nizza', ['CH', 'IT'])!.schritte, 'pkw');
    expect(m.map((x) => [x.id, x.preis])).toEqual([['aprr', 35.9], ['asf', 28.1], ['escota', 21.2]]);
  });
  it('ASF Lyon → Le Perthus 55,50 € ; Wohnmobil 86,40 € ; Motorrad 32,80 €', () => {
    expect(r('lyon', 'b_lejonquera')[0].preis).toBe(55.5);
    expect(r('lyon', 'b_lejonquera', 'wohnmobil')[0].preis).toBe(86.4);
    expect(r('lyon', 'b_lejonquera', 'motorrad')[0].preis).toBe(32.8);
  });
  it('Lyon → Orange, Motorrad : Preis nicht gelesen, also offen', () => {
    const m = r('lyon', 'orange', 'motorrad');
    expect(m[0].preis).toBeNull();
    expect(M.mautSumme(m).offen).toHaveLength(1);
  });
  it('Sanef (A4, A1) : nicht verifiziert, in keiner Summe', () => {
    const m = r('lille', 'paris');
    expect(m[0].typ).toBe('nv');
    expect(M.mautSumme(m).geprueft).toBe(0);
  });
  it('Kroatien HAC : Zagreb → Split 26,40 € (I), 41,40 € (II), 15,80 € (IA) ; Bregana 1,00 €', () => {
    const m = r('b_obrezje', 'split');
    expect(m.map((x) => x.preis)).toEqual([1, 26.4]);
    expect(r('b_obrezje', 'split', 'wohnmobil').map((x) => x.preis)).toEqual([1.2, 41.4]);
    expect(r('zagreb', 'split', 'motorrad')[0].preis).toBe(15.8);
  });
  it('Kroatien BINA-Istra : Umag → Pula 6,40 €', () => {
    expect(r('umag', 'pula')[0].preis).toBe(6.4);
  });
  it('Österreich Streckenmaut : Brenner 12,50, Tauern 15, Karawanken 9, Pyhrn 7 + 12, Arlberg 13 €', () => {
    expect(P.streckenmaut.brenner.preis.pkw).toBe(12.5);
    expect(P.streckenmaut.tauern.preis.pkw).toBe(15);
    expect(P.streckenmaut.karawanken.preis.pkw).toBe(9);
    expect(P.streckenmaut.pyhrn.teile.bosruck + P.streckenmaut.pyhrn.teile.gleinalm).toBe(P.streckenmaut.pyhrn.preis.pkw);
    expect(P.streckenmaut.arlberg.preis.pkw).toBe(13);
  });
  it('Italien : Schätzung = km × Kilometertarif (MwSt. inbegriffen), auf 10 Cent gerundet, je Betreiber', () => {
    const m = r('b_brenner', 'modena');
    expect(m).toHaveLength(1);
    expect(m[0].schaetzung).toBe(true);
    const net = M.NETZ.edges;
    const km = (a: string, b: string) => net.find((e) => (e.a === a && e.b === b) || (e.a === b && e.b === a))!.km;
    const erwartet = Math.round((km('b_brenner', 'bozen') * 0.07592 + km('bozen', 'verona') * 0.07592 + km('verona', 'modena') * 0.06412) * 10) / 10;
    expect(m[0].preis).toBe(erwartet);
  });
  it('jede Kante in FR, IT, HR, ES hat eine Mautart', () => {
    for (const e of M.NETZ.edges) if (['FR', 'IT', 'HR', 'ES'].includes(e.c)) expect(M.kantenArt(e.a, e.b), `${e.a}|${e.b}`).toBeTruthy();
  });
  it('jede Streckenmaut-, Vignetten- und Mautkante existiert im Netz', () => {
    const has = (k: string) => { const [a, b] = k.split('|'); return M.NETZ.edges.some((e) => (e.a === a && e.b === b) || (e.a === b && e.b === a)); };
    for (const k of Object.keys(P.kanten)) expect(has(k), k).toBe(true);
    for (const k of Object.keys(P.vignettenfrei)) expect(has(k), k).toBe(true);
    for (const s of Object.values(P.streckenmaut)) expect(has(s.kante), s.kante).toBe(true);
  });
});

describe('Reise', () => {
  const basis = { fz: 'pkw' as const, sorte: 'e95' as const, verbrauch: 7, ab: '2026-07-18', dauer: 14, hinUndZurueck: true, aufenthalt: false };
  it('München → Split : Österreich (2 × 1 Tag), Slowenien (Monat), Tauern, Karawanken, Bregana, HAC', () => {
    const r = M.reise({ ...basis, start: 'muenchen', ziel: 'split' })!;
    expect(r.vignetten.map((v) => [v.land, v.summeEur])).toEqual([['AT', 19.2], ['SI', 32]]);
    expect(r.maut.map((m) => m.preis)).toEqual([15, 9, 1, 26.4]);
    expect(r.summen.mautGeprueft).toBe(2 * (15 + 9 + 1 + 26.4));
    expect(r.summen.gesamt).toBeCloseTo(r.summen.vignetten + r.summen.mautGeprueft + r.summen.sprit + r.summen.mautSchaetzung, 2);
  });
  it('München → Rom : die italienische Maut ist als Schätzung getrennt', () => {
    const r = M.reise({ ...basis, start: 'muenchen', ziel: 'rom' })!;
    expect(r.summen.mautSchaetzung).toBeGreaterThan(0);
    expect(r.summen.ohneSchaetzung).toBeLessThan(r.summen.gesamt);
  });
  it('Länder meiden : Stuttgart → Nizza ohne Schweiz und Italien fährt durch Frankreich', () => {
    const r = M.reise({ ...basis, start: 'stuttgart', ziel: 'nizza', meiden: ['CH', 'IT'] })!;
    expect(r.route.laender.map((l) => l.c)).not.toContain('CH');
  });
  it('Schweiz : ohne eingegebenen Literpreis kein Sprit für die Schweiz', () => {
    const r = M.reise({ ...basis, start: 'dortmund', ziel: 'zuerich' })!;
    expect(r.spritFehlt).toEqual(['CH']);
    const r2 = M.reise({ ...basis, start: 'dortmund', ziel: 'zuerich', chfLiter: 1.8 })!;
    expect(r2.spritFehlt).toEqual([]);
  });
  it('Salzburg ab München : vignettenfrei (A1 Walserberg – Salzburg Nord)', () => {
    expect(M.reise({ ...basis, start: 'muenchen', ziel: 'salzburg' })!.vignetten).toHaveLength(0);
  });
  it('alle Start-Ziel-Paare haben eine Strecke', () => {
    for (const s of M.START) for (const z of M.ZIELE) if (s.id !== z.id) expect(M.route(s.id, z.id), `${s.id}>${z.id}`).not.toBeNull();
  });
});

describe('Weekly Oil Bulletin und EZB-Kurse', () => {
  it('18 Länder, Preise zwischen 0,50 und 3,50 €/L, Stand höchstens 21 Tage alt beim Abruf', () => {
    expect(M.SPRIT_LAENDER).toHaveLength(18);
    for (const c of M.SPRIT_LAENDER) for (const s of ['e95', 'diesel'] as const) {
      const p = M.preis(c, s);
      expect(p, `${c} ${s}`).not.toBeNull();
      expect(p!).toBeGreaterThan(0.5); expect(p!).toBeLessThan(3.5);
    }
    expect(M.diffDays(M.SPRIT.stand, M.SPRIT.abgerufen)).toBeLessThanOrEqual(21);
  });
  it('Kurse CHF, CZK, HUF, DKK vorhanden und plausibel', () => {
    expect(M.KURSE.kurse.CHF).toBeGreaterThan(0.7); expect(M.KURSE.kurse.CHF).toBeLessThan(1.2);
    expect(M.KURSE.kurse.CZK).toBeGreaterThan(20); expect(M.KURSE.kurse.HUF).toBeGreaterThan(300);
  });
});
