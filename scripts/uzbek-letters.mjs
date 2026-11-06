/**
 * Uses the official Uzbek Latin letters everywhere in Uzbek text:
 *   o' g' o’ g‘ → oʻ gʻ   (U+02BB)
 *   other apostrophes inside words (ma'lumot, Fundy'da) → ʼ (U+02BC)
 *
 *   node scripts/uzbek-letters.mjs        (rewrites the Uzbek texts in place)
 *
 * Only Uzbek text is touched: uz.json, the `uz` part of src/content/*.ts and
 * src/data/mockProjects.uz.ts. English and Russian are left alone.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const OKINA = 'ʻ'; // U+02BB  oʻ gʻ
const TUTUQ = 'ʼ'; // U+02BC  maʼlumot

/** For plain text (JSON values). */
export function fixUzbek(s) {
  return s.replace(/([oOgG])['’‘`]/g, `$1${OKINA}`).replace(/([A-Za-zʻ])['’‘`]([A-Za-z])/g, `$1${TUTUQ}$2`);
}

/** For TypeScript source: also handles \' inside '…' strings. */
function fixUzbekSource(s) {
  return s
    .replace(/([oOgG])\\'/g, `$1${OKINA}`)
    .replace(/([A-Za-zʻ])\\'([A-Za-z])/g, `$1${TUTUQ}$2`)
    .replace(/([oOgG])['’‘](?=[A-Za-zʻ])/g, `$1${OKINA}`) // only between letters, so code quotes stay
    .replace(/([oOgG])[’‘]/g, `$1${OKINA}`)
    .replace(/([A-Za-zʻ])['’‘]([A-Za-z])/g, `$1${TUTUQ}$2`)
    .replace(/([gG])'(?= )/g, `$1${OKINA}`); // bogʻ, Mablagʻ at the end of a word
}

function walk(value) {
  if (typeof value === 'string') return fixUzbek(value);
  if (Array.isArray(value)) return value.map(walk);
  if (value && typeof value === 'object')
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, walk(v)]));
  return value;
}

if (process.argv[1]?.endsWith('uzbek-letters.mjs')) {
  // 1. UI texts
  const uzFile = join(root, 'src/i18n/locales/uz.json');
  writeFileSync(uzFile, JSON.stringify(walk(JSON.parse(readFileSync(uzFile, 'utf8'))), null, 2) + '\n');

  // 2. Content pages: only the `uz: { … }` block, which comes first in each file
  const contentDir = join(root, 'src/content');
  for (const f of readdirSync(contentDir).filter(f => f.endsWith('.ts') && f !== 'types.ts')) {
    const file = join(contentDir, f);
    const src = readFileSync(file, 'utf8');
    const start = src.indexOf('  uz: {');
    const end = src.indexOf('\n  ru: {');
    if (start < 0 || end < 0) continue;
    writeFileSync(file, src.slice(0, start) + fixUzbekSource(src.slice(start, end)) + src.slice(end));
  }

  // 3. Demo projects in Uzbek
  const demo = join(root, 'src/data/mockProjects.uz.ts');
  const src = readFileSync(demo, 'utf8');
  const body = src.indexOf('export const UZ_PROJECTS');
  writeFileSync(demo, src.slice(0, body) + fixUzbekSource(src.slice(body)));
  console.log('ok');
}
