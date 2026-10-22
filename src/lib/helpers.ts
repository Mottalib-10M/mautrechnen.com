/** Baut die Schreibwerkzeuge (`Helpers`) für den Text jeder Seite. */
import { route, ROUTES, type Locale } from '../i18n/routes';
import { P, sourceUrl } from './engine/params';
import type { SourceKey } from './engine/params';
import * as M from './engine/index';
import type { Helpers } from './guide-types';
import { formatMoney, formatNumber, formatPercent, displayDate } from './format';
import { LANG_TAGS } from '../data/site-config';
import { BUILD_TODAY } from './today';
import { land } from './laender';

/** « < 3,5 t » in einer Zelle : ein « < » vor Leerzeichen oder Ziffer ist kein Tag. */
const lt = (s: string) => s.replace(/<(?=[\s\d])/g, '&lt;');
const esc = (s: string | number) => String(s).replace(/&(?!(?:[a-z]+|#\d+);)/g, '&amp;').replace(/</g, '&lt;');
export const REF_DAY = BUILD_TODAY;

export function helpers(lang: Locale): Helpers {
  const T = <A,>(de: A, en: A, nl: A) => (lang === 'en' ? en : lang === 'nl' ? nl : de);
  const hasRoute = (id: string) => { const r = ROUTES.find((x) => x.id === id); return !!r?.paths[lang]; };
  return {
    lang, P, M, T, today: REF_DAY,
    l3: (n) => formatMoney(n, 3, lang),
    geld: (n, w) => (w === 'EUR' ? formatMoney(n, Number.isInteger(n) ? 0 : 2, lang) : `${formatNumber(n, w === 'CHF' ? 2 : 0, lang)} ${w}`),
    a: (id, text) => (hasRoute(id) ? `<a href="${route(id, lang)}">${text}</a>` : text),
    eur: (n, d = 0) => formatMoney(n, d, lang),
    num: (n, d = 0) => formatNumber(n, d, lang),
    pct: (x, d = 1) => formatPercent(x, d, lang),
    date: (iso) => displayDate(iso, LANG_TAGS[lang]),
    land: (c) => land(c, lang),
    src: (key: SourceKey, text?: string) => { const s = P.sources[key]; return `<a href="${sourceUrl(key, lang)}" target="_blank" rel="nofollow noopener noreferrer">${text ?? s.label[lang]}</a>`; },
    table: (headers, rows, caption, align = []) => {
      const al = (i: number) => (align[i] === 'r' ? 'text-right' : 'text-left');
      return `<div class="not-prose my-6 overflow-x-auto"><table class="w-full text-sm">${caption ? `<caption class="mb-2 text-left text-sm text-navy-600">${caption}</caption>` : ''}<thead><tr>${headers.map((h, i) => `<th scope="col" class="border-b border-navy-300 bg-navy-50 px-3 py-2 font-semibold text-navy-900 ${al(i)}">${lt(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r, ri) => `<tr class="${ri % 2 ? 'bg-navy-50/40' : ''}">${r.map((c, i) => `<td class="tabular-nums border-b border-navy-100 px-3 py-2 text-navy-800 ${al(i)}">${typeof c === 'number' ? esc(formatNumber(c, 0, lang)) : lt(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    },
  };
}
