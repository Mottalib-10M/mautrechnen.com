/** Ländernamen und Bezeichnungen der Rechner in drei Sprachen. */
import type { Lang, Fz, Sorte } from './engine/params';
export const LAND: Record<string, Record<Lang, string>> = {
  DE: { de: 'Deutschland', en: 'Germany', nl: 'Duitsland' },
  NL: { de: 'Niederlande', en: 'Netherlands', nl: 'Nederland' },
  BE: { de: 'Belgien', en: 'Belgium', nl: 'België' },
  LU: { de: 'Luxemburg', en: 'Luxembourg', nl: 'Luxemburg' },
  AT: { de: 'Österreich', en: 'Austria', nl: 'Oostenrijk' },
  CH: { de: 'Schweiz', en: 'Switzerland', nl: 'Zwitserland' },
  FR: { de: 'Frankreich', en: 'France', nl: 'Frankrijk' },
  IT: { de: 'Italien', en: 'Italy', nl: 'Italië' },
  SI: { de: 'Slowenien', en: 'Slovenia', nl: 'Slovenië' },
  HR: { de: 'Kroatien', en: 'Croatia', nl: 'Kroatië' },
  ES: { de: 'Spanien', en: 'Spain', nl: 'Spanje' },
  CZ: { de: 'Tschechien', en: 'Czechia', nl: 'Tsjechië' },
  HU: { de: 'Ungarn', en: 'Hungary', nl: 'Hongarije' },
  SK: { de: 'Slowakei', en: 'Slovakia', nl: 'Slowakije' },
  PL: { de: 'Polen', en: 'Poland', nl: 'Polen' },
  DK: { de: 'Dänemark', en: 'Denmark', nl: 'Denemarken' },
  PT: { de: 'Portugal', en: 'Portugal', nl: 'Portugal' },
  RO: { de: 'Rumänien', en: 'Romania', nl: 'Roemenië' },
  BG: { de: 'Bulgarien', en: 'Bulgaria', nl: 'Bulgarije' },
};
export const land = (c: string, l: Lang) => LAND[c]?.[l] ?? c;
export const FZ_NAME: Record<Fz, Record<Lang, string>> = {
  pkw: { de: 'Pkw', en: 'Car', nl: 'Auto' },
  wohnmobil: { de: 'Wohnmobil bis 3,5 t', en: 'Motorhome up to 3.5 t', nl: 'Camper tot 3,5 t' },
  gespann: { de: 'Pkw mit Wohnwagen', en: 'Car with caravan', nl: 'Auto met caravan' },
  motorrad: { de: 'Motorrad', en: 'Motorcycle', nl: 'Motor' },
};
export const SORTE_NAME: Record<Sorte, Record<Lang, string>> = {
  e95: { de: 'Super 95', en: 'Petrol (95)', nl: 'Euro 95' },
  diesel: { de: 'Diesel', en: 'Diesel', nl: 'Diesel' },
  lpg: { de: 'Autogas (LPG)', en: 'LPG', nl: 'LPG' },
};
export const PRODUKT_NAME: Record<string, Record<Lang, string>> = {
  '1t': { de: '1-Tages-Vignette', en: '1-day vignette', nl: 'dagvignet' },
  '7t': { de: 'Wochenvignette (7 Tage)', en: 'weekly vignette (7 days)', nl: 'weekvignet (7 dagen)' },
  '10t': { de: '10-Tages-Vignette', en: '10-day vignette', nl: '10-dagenvignet' },
  '30t': { de: '30-Tages-Vignette', en: '30-day vignette', nl: '30-dagenvignet' },
  '1m': { de: 'Monatsvignette', en: 'monthly vignette', nl: 'maandvignet' },
  '2m': { de: '2-Monats-Vignette', en: '2-month vignette', nl: '2-maandenvignet' },
  '6m': { de: 'Halbjahresvignette', en: '6-month vignette', nl: 'halfjaarvignet' },
  jahr: { de: 'Jahresvignette', en: 'annual vignette', nl: 'jaarvignet' },
};
