/**
 * Assigns a stable, deterministic color palette to each category
 * based on its UUID. The color is consistent across the entire session
 * without requiring a database column.
 */

export interface CategoryColorSet {
  /** Tailwind bg class for the badge background */
  bg: string;
  /** Tailwind text class for the badge text */
  text: string;
  /** Tailwind border class for accent borders */
  border: string;
  /** Hex color for canvas/chart use */
  hex: string;
  /** Dark mode bg class */
  darkBg: string;
  /** Dark mode text class */
  darkText: string;
}

const PALETTES: CategoryColorSet[] = [
  { bg: 'bg-violet-100',  text: 'text-violet-700',  border: 'border-violet-300',  hex: '#7c3aed', darkBg: 'dark:bg-violet-900/40',  darkText: 'dark:text-violet-300' },
  { bg: 'bg-sky-100',     text: 'text-sky-700',     border: 'border-sky-300',     hex: '#0284c7', darkBg: 'dark:bg-sky-900/40',     darkText: 'dark:text-sky-300' },
  { bg: 'bg-rose-100',    text: 'text-rose-700',    border: 'border-rose-300',    hex: '#e11d48', darkBg: 'dark:bg-rose-900/40',    darkText: 'dark:text-rose-300' },
  { bg: 'bg-amber-100',   text: 'text-amber-700',   border: 'border-amber-300',   hex: '#d97706', darkBg: 'dark:bg-amber-900/40',   darkText: 'dark:text-amber-300' },
  { bg: 'bg-teal-100',    text: 'text-teal-700',    border: 'border-teal-300',    hex: '#0d9488', darkBg: 'dark:bg-teal-900/40',    darkText: 'dark:text-teal-300' },
  { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', border: 'border-fuchsia-300', hex: '#a21caf', darkBg: 'dark:bg-fuchsia-900/40', darkText: 'dark:text-fuchsia-300' },
  { bg: 'bg-lime-100',    text: 'text-lime-700',    border: 'border-lime-300',    hex: '#65a30d', darkBg: 'dark:bg-lime-900/40',    darkText: 'dark:text-lime-300' },
  { bg: 'bg-orange-100',  text: 'text-orange-700',  border: 'border-orange-300',  hex: '#ea580c', darkBg: 'dark:bg-orange-900/40',  darkText: 'dark:text-orange-300' },
];

/** Simple hash of a string to a stable integer */
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const cache = new Map<string, CategoryColorSet>();

/**
 * Returns a stable color palette for the given category ID.
 * The same ID always returns the same palette across the app.
 */
export function getCategoryColor(categoryId: string): CategoryColorSet {
  if (cache.has(categoryId)) return cache.get(categoryId)!;
  const palette = PALETTES[hashString(categoryId) % PALETTES.length];
  cache.set(categoryId, palette);
  return palette;
}
