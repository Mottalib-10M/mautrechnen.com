/** Kalendertage als ISO-Text (AAAA-MM-TT), in UTC gerechnet : keine Sommerzeitfehler. */
const d = (iso: string) => new Date(`${iso}T00:00:00Z`);
const iso = (x: Date) => x.toISOString().slice(0, 10);
export const addDays = (s: string, n: number) => { const x = d(s); x.setUTCDate(x.getUTCDate() + n); return iso(x); };
/** Gleicher Kalendertag n Monate später ; fehlt er (31.), der letzte Tag des Monats. */
export function addMonths(s: string, n: number): string {
  const x = d(s);
  const day = x.getUTCDate();
  x.setUTCDate(1);
  x.setUTCMonth(x.getUTCMonth() + n);
  const last = new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth() + 1, 0)).getUTCDate();
  x.setUTCDate(Math.min(day, last));
  return iso(x);
}
export const diffDays = (a: string, b: string) => Math.round((d(b).getTime() - d(a).getTime()) / 86400000);
export const isIso = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(d(s).getTime());
