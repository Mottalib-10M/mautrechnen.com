/** Startseite (Säulenseite) : Text der drei Sprachen in src/content/home/{de,en,nl}.ts. Darstellung : components/HomePage.astro.
 *  Alle Zahlen kommen aus dem Motor ; kein Preis steht hier fest im Text. */
import type { PageText, Lang } from '../lib/guide-types';
import { de } from './home/de';
import { en } from './home/en';
import { nl } from './home/nl';

type Home = Omit<PageText, 'slug' | 'card' | 'nav'> & { start: string; ziel: string };

export const HOME: Record<Lang, Home> = { de, en, nl };
