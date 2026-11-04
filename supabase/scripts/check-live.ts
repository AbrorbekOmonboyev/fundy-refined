/**
 * Quick health check of the LIVE Supabase project, seen as an anonymous visitor
 * (uses the publishable key from .env.local — the same access a website visitor has).
 *
 *   npm run db:check
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(
  readFileSync(join(import.meta.dirname, '..', '..', '.env.local'), 'utf8')
    .split('\n')
    .filter(line => line.includes('=') && !line.startsWith('#'))
    .map(line => [line.slice(0, line.indexOf('=')).trim(), line.slice(line.indexOf('=') + 1).trim()]),
);

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);
let failures = 0;
const check = (ok: boolean, label: string, detail = '') => {
  console.log(`${ok ? '✔' : '✖'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
};

const projects = await supabase
  .from('projects')
  .select('slug, status, raised_amount, backer_count, project_translations(title)')
  .order('raised_amount', { ascending: false });
check(
  !projects.error && projects.data?.length === 8,
  'visitors see the 8 live projects',
  projects.error?.message ?? `${projects.data?.length} found`,
);
for (const p of projects.data ?? []) {
  console.log(
    `    ${p.project_translations[0]?.title} — ${p.raised_amount.toLocaleString('en')} UZS, ${p.backer_count} backers`,
  );
}

const categories = await supabase.from('categories').select('id');
check(categories.data?.length === 8, 'categories loaded', `${categories.data?.length}`);
const regions = await supabase.from('regions').select('id');
check(regions.data?.length === 14, 'regions loaded', `${regions.data?.length}`);

const contributions = await supabase.from('contributions').select('id').limit(1);
check(!!contributions.error, 'contributions are hidden from visitors', contributions.error?.message ?? 'VISIBLE!');

const audit = await supabase.from('audit_log').select('id').limit(1);
check(!!audit.error, 'audit log is hidden from visitors', audit.error?.message ?? 'VISIBLE!');

const sneaky = await supabase.rpc('contribute', {
  p_project_id: crypto.randomUUID(),
  p_amount: 100000,
  p_payment_method: 'click',
});
check(!!sneaky.error, 'visitors cannot contribute', sneaky.error?.message ?? 'ALLOWED!');

const write = await supabase.from('categories').insert({ id: 'hack', name_uz: 'x', name_ru: 'x', name_en: 'x' });
check(!!write.error, 'visitors cannot write data', write.error?.message ?? 'ALLOWED!');

const buckets = ['project-images', 'avatars'];
for (const bucket of buckets) {
  const { data } = supabase.storage.from(bucket).getPublicUrl('probe.txt');
  check(data.publicUrl.includes(bucket), `public bucket ${bucket} configured`);
}

console.log(failures ? `\n${failures} check(s) failed` : '\nAll live checks passed.');
process.exit(failures ? 1 : 0);
