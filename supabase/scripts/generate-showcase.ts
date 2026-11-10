/**
 * Builds supabase/scripts/showcase.sql from the demo seed, for the hackathon demo.
 *
 *   node supabase/scripts/generate-showcase.ts
 *
 * The result adds the 8 made-up sample projects and exactly 97 accounts at
 * @demo.fundy.uz (no password, cannot log in) to a database that holds real data.
 * Unlike seed.sql it creates no demo admin and only ever touches its own rows.
 * Remove everything again with supabase/scripts/showcase-remove.sql.
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const USERS = 97;
const dir = import.meta.dirname;
const lines = readFileSync(join(dir, '..', 'seed.sql'), 'utf8').split('\n');

const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
const indexOf = (start: string) => {
  const i = lines.findIndex(l => l.startsWith(start));
  if (i < 0) throw new Error(`seed.sql: not found: ${start}`);
  return i;
};

// The accounts in the seed: one line each, right after "insert into auth.users".
const usersStart = indexOf('insert into auth.users') + 3;
let usersEnd = usersStart;
while (lines[usersEnd].startsWith("  ('00000000-")) usersEnd++;
const accountId = (l: string) => new RegExp(`^  \\('00000000-[0-9a-f-]+', '(${UUID})'`).exec(l)![1];
const accounts = lines.slice(usersStart, usersEnd).map(accountId);

const adminLine = lines.find(l => l.startsWith("update public.profiles set role = 'admin'"))!;
const admin = new RegExp(UUID).exec(adminLine)![0];

const projectsStart = indexOf('insert into public.projects');
const founders = new Set<string>();
for (let i = projectsStart + 5; lines[i].startsWith("  ('"); i++) {
  founders.add(new RegExp(`^  \\('${UUID}', '(${UUID})'`).exec(lines[i])![1]);
}

const others = accounts.filter(a => a !== admin && !founders.has(a));
const backers = others.slice(0, USERS - founders.size);
const kept = new Set([...founders, ...backers]);
if (kept.size !== USERS) throw new Error(`expected ${USERS} accounts, got ${kept.size}`);

// A dropped account's activity moves to one of the kept backers (always the same one).
const replacement = (id: string) => {
  const n = parseInt(createHash('sha256').update(id).digest('hex').slice(0, 8), 16);
  return backers[n % backers.length];
};

const out: string[] = [];
const activityStart = indexOf('-- 866 simulated contributions');
const DEMO_PROJECT = 'select id from public.projects where is_demo';
const replaceExact: Record<string, string> = {
  'from public.contributions c join public.reward_tiers t on t.id = c.reward_tier_id;': `from public.contributions c join public.reward_tiers t on t.id = c.reward_tier_id
where c.project_id in (${DEMO_PROJECT});`,
  'from public.reward_tiers t where t.id = c.reward_tier_id;': `from public.reward_tiers t where t.id = c.reward_tier_id
  and c.project_id in (${DEMO_PROJECT});`,
  "from public.projects p where p.id = c.project_id and p.model = 'reward' and c.reward_tier_id is null;":
    "from public.projects p where p.id = c.project_id and p.is_demo and p.model = 'reward' and c.reward_tier_id is null;",
  'where p.id = t.project_id;': 'where p.id = t.project_id and p.is_demo;',
};
const applied = new Set<string>();
const idPattern = new RegExp(`'(${UUID})'`, 'g');
let section = '';

lines.forEach((raw, i) => {
  if (raw === adminLine) return;
  if (i >= usersStart && i < usersEnd) {
    if (kept.has(accountId(raw))) out.push(raw.replace(/[,;]$/, ','));
    return;
  }
  if (i === activityStart) {
    out.push(
      '-- Mark the sample projects before anything refers to them.',
      `update public.projects set is_demo = true where owner_id in (select id from auth.users where email like '%@demo.fundy.uz');`,
      '',
    );
  }
  if (raw.startsWith('insert into ')) section = raw.split(' ')[2];

  let line = raw;
  if (replaceExact[line]) {
    applied.add(line);
    line = replaceExact[line];
  }
  if (i >= projectsStart - 12) line = line.replaceAll(`'${admin}'`, 'null');
  if (i >= activityStart) {
    line = line.replace(idPattern, (m, id: string) =>
      accounts.includes(id) && !kept.has(id) ? `'${replacement(id)}'` : m,
    );
    if (
      (section === 'public.follows' || section === 'public.update_likes') &&
      line.endsWith(';') &&
      line.startsWith('  (')
    ) {
      line = `${line.slice(0, -1)}\non conflict do nothing;`;
    }
  }
  if (line === 'commit;') {
    out.push(
      '-- Nothing here should reach anyone’s bell or Telegram.',
      `delete from public.notifications where user_id in (select id from auth.users where email like '%@demo.fundy.uz');`,
      '',
    );
  }
  out.push(line);
});

for (const key of Object.keys(replaceExact)) {
  if (!applied.has(key)) throw new Error(`seed.sql: statement not found: ${key}`);
}

// The last kept account line must end the VALUES list.
const lastAccount = out.map(l => l.startsWith("  ('00000000-")).lastIndexOf(true);
out[lastAccount] = out[lastAccount].replace(/,$/, '');
const after = out[lastAccount + 1];
if (!after.trim().startsWith(';') && !after.trim().startsWith('on conflict')) out[lastAccount] += ';';

const header = `-- =============================================================================
-- HACKATHON SHOWCASE: generated by supabase/scripts/generate-showcase.ts. Do not edit.
-- 8 made-up sample projects (marked is_demo) and ${USERS} accounts at @demo.fundy.uz.
-- These are not real people or businesses, and must never be counted as users.
-- Remove with supabase/scripts/showcase-remove.sql.
-- =============================================================================
`;
writeFileSync(join(dir, 'showcase.sql'), header + out.join('\n'));
console.log(`showcase.sql: ${kept.size} accounts (${founders.size} founders, ${backers.length} backers)`);
