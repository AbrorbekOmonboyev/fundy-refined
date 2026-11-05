/**
 * Generates supabase/seed.sql (demo data) from the prototype's projects in
 * src/data/mockProjects.ts.
 *
 *   npm run db:seed:generate
 *
 * What it creates:
 *   - an admin, one founder per project and ~225 demo backers (they can't log in)
 *   - the 8 projects with budgets, milestones, rewards, equity terms, evaluations
 *   - contributions that add up EXACTLY to each project's raised amount and backer count
 *   - updates (with likes), comments and replies, saved projects
 *
 * Output is deterministic (same input → same file), so diffs stay readable.
 */
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { INITIAL_PROJECTS } from '../../src/data/mockProjects.ts';
import { UZ_PROJECTS } from '../../src/data/mockProjects.uz.ts';

// `node generate-seed.ts --update <file>` also writes a migration that rewrites the
// demo projects' texts IN PLACE on an existing database (matched by the same ids).
const updateArg = process.argv.indexOf('--update');
const updateTarget = updateArg > 0 ? process.argv[updateArg + 1] : null;

// The date the demo data is anchored to. Campaign deadlines are written relative
// to now() so they stay in the future whenever the seed is loaded.
const TODAY = new Date('2026-11-04T09:00:00Z');
const DAY = 86_400_000;

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

/** Stable UUID derived from a key, so ids don't change between runs. */
function uuid(key: string): string {
  const h = createHash('sha256').update(`fundy-seed:${key}`).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

/** Deterministic pseudo-random numbers (mulberry32). */
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const q = (v: string | null | undefined) => (v == null ? 'null' : `'${v.replace(/'/g, "''")}'`);
const qArr = (arr: string[]) => (arr.length ? `array[${arr.map(q).join(', ')}]` : `'{}'::text[]`);
const ts = (d: Date) => q(d.toISOString());

const CATEGORY: Record<string, string> = {
  Technology: 'technology',
  Agriculture: 'agriculture',
  'Artisanal & Crafts': 'crafts',
  Education: 'education',
  Healthcare: 'healthcare',
  'Clean Energy': 'clean-energy',
  'Food & Culinary': 'food',
  'Social Impact': 'social',
};

function regionOf(location: string): string | null {
  const l = location.toLowerCase();
  const rules: [string, string][] = [
    ['karakalpak', 'karakalpakstan'],
    ['muynak', 'karakalpakstan'],
    ['nukus', 'karakalpakstan'],
    ['fergana', 'fergana'],
    ['samarkand', 'samarkand'],
    ['navoi', 'navoi'],
    ['bukhara', 'bukhara'],
    ['namangan', 'namangan'],
    ['chust', 'namangan'],
    ['andijan', 'andijan'],
    ['tashkent', 'tashkent-city'],
    ['khorezm', 'khorezm'],
    ['jizzakh', 'jizzakh'],
  ];
  return rules.find(([k]) => l.includes(k))?.[1] ?? null;
}

const CONFIDENCE: Record<string, string> = {
  'Verified High Confidence': 'high',
  'Verified Moderate Confidence': 'moderate',
  'In Review': 'in_review',
};

// ---------------------------------------------------------------------------
// People
// ---------------------------------------------------------------------------
type Person = { id: string; name: string; city: string | null; region: string | null };
const people = new Map<string, Person>(); // by key (the English name)

/**
 * The id comes from `key` (the English name in mockProjects.ts), so changing how a
 * name is displayed never creates a new person. `regionFrom` is an English place name.
 */
function person(key: string, city: string | null = null, display?: string, regionFrom?: string | null): Person {
  let p = people.get(key);
  if (!p) {
    const from = regionFrom ?? city;
    p = { id: uuid(`user:${key}`), name: display ?? key, city, region: from ? regionOf(from) : null };
    people.set(key, p);
  }
  return p;
}

const admin = person('Fundy Admin', 'Toshkent', undefined, 'Tashkent');
const demoBacker = person('Alisher Vohidov', 'Toshkent', undefined, 'Tashkent'); // the prototype's demo user

// Pool of generic demo backers with Uzbek names.
const MALE = [
  'Aziz',
  'Bekzod',
  'Davron',
  'Eldor',
  'Farrux',
  'Jahongir',
  'Javlon',
  'Rustam',
  'Sanjar',
  'Sherzod',
  'Temur',
  'Ulugbek',
  'Islom',
  'Murod',
  'Oybek',
];
const FEMALE = [
  'Dilfuza',
  'Feruza',
  'Gulnoza',
  'Kamola',
  'Lola',
  'Madina',
  'Malika',
  'Nigora',
  'Nodira',
  'Sevara',
  'Shahlo',
  'Zarina',
  'Mohira',
  'Yulduz',
  'Ozoda',
];
const SURNAME = [
  'Abdullayev',
  'Karimov',
  'Rahimov',
  'Tursunov',
  'Usmonov',
  'Ergashev',
  'Qodirov',
  'Nazarov',
  'Sobirov',
  'Xolmatov',
  'Yoqubov',
  'Mirzayev',
  'Rasulov',
  'Saidov',
  'Hamidov',
];
const CITIES = [
  'Tashkent',
  'Samarkand',
  'Bukhara',
  'Fergana',
  'Namangan',
  'Andijan',
  'Navoi',
  'Nukus',
  'Karshi',
  'Urgench',
];

const CITY_UZ: Record<string, string> = {
  Tashkent: 'Toshkent',
  Samarkand: 'Samarqand',
  Bukhara: 'Buxoro',
  Fergana: "Farg'ona",
  Namangan: 'Namangan',
  Andijan: 'Andijon',
  Navoi: 'Navoiy',
  Nukus: 'Nukus',
  Karshi: 'Qarshi',
  Urgench: 'Urganch',
};
const poolRand = rng(42);
const allNames = SURNAME.flatMap((last, s) =>
  MALE.map((first, f) => ((s + f) % 2 === 0 ? `${first} ${last}` : `${FEMALE[f]} ${last}a`)),
); // 225 distinct names, half male, half female
const backerPool: Person[] = allNames
  .filter(name => !people.has(name))
  .map(name => {
    const city = CITIES[Math.floor(poolRand() * CITIES.length)];
    return person(name, CITY_UZ[city] ?? city, undefined, city);
  });
const maxBackers = Math.max(...INITIAL_PROJECTS.map(p => p.backerCount));
if (backerPool.length < maxBackers) throw new Error(`need ${maxBackers} backer names, have ${backerPool.length}`);

// ---------------------------------------------------------------------------
// Build SQL
// ---------------------------------------------------------------------------
const out: string[] = [];
const emit = (s: string) => out.push(s);

type Contribution = {
  id: string;
  projectId: string;
  backerId: string;
  amount: number;
  tierId: string | null;
  at: Date;
  method: string;
  share: number | null;
};
const contributions: Contribution[] = [];
const projectRows: string[] = [];
const translationRows: string[] = [];
const budgetRows: string[] = [];
const milestoneRows: string[] = [];
const tierRows: string[] = [];
const equityRows: string[] = [];
const evaluationRows: string[] = [];
const founderRows: string[] = [];
const updateRows: string[] = [];
const likeRows: string[] = [];
const commentRows: string[] = [];
const followRows: string[] = [];

const METHODS = ['click', 'payme', 'uzcard', 'humo', 'bank_wire'];

// Statements for the in-place update migration (see --update).
const live: string[] = [];
const exists = (projectId: string) => `exists (select 1 from public.projects where id = ${q(projectId)})`;
const same = (what: string, a: number, b: number, slug: string) => {
  if (a !== b) throw new Error(`${slug}: ${what} — ${a} in English, ${b} in Uzbek`);
};

INITIAL_PROJECTS.forEach((p, index) => {
  const rand = rng(1000 + index);
  const projectId = uuid(`project:${p.slug}`);
  const uz = UZ_PROJECTS[p.slug];
  if (!uz) throw new Error(`No Uzbek text for ${p.slug} (src/data/mockProjects.uz.ts)`);
  same('budget lines', p.budgetBreakdown.length, uz.budget.length, p.slug);
  same('milestones', p.milestones.length, uz.milestones.length, p.slug);
  same('rewards', p.rewards?.length ?? 0, uz.rewards?.length ?? 0, p.slug);
  same('updates', p.updates.length, uz.updates.length, p.slug);
  same('comments', p.comments.length, uz.comments.length, p.slug);
  const founder = person(p.founder.name, uz.founder.location, uz.founder.name, p.founder.location);
  const commenter = (i: number) => {
    const c = p.comments[i];
    return person(c.authorName, uz.comments[i].city, uz.comments[i].author, c.authorCity);
  };
  const model = p.model;
  const categoryId = CATEGORY[p.category];
  if (!categoryId) throw new Error(`Unknown category ${p.category}`);

  // Dates: started on createdAt, ends daysRemaining from now.
  const startsAt = new Date(`${p.createdAt}T08:00:00Z`);
  const durationDays = Math.min(90, Math.ceil((TODAY.getTime() + p.daysRemaining * DAY - startsAt.getTime()) / DAY));
  const minContribution = model === 'equity' && p.equityTerms ? p.equityTerms.minInvestment : 10_000;

  const fz = uz.founder;
  live.push(
    `update public.founder_profiles set display_name = ${q(fz.name)}, role_title = ${q(fz.role)}, organization = ${q(fz.organization)}, location = ${q(fz.location)}, bio = ${q(fz.bio)}, registration_number = ${q(fz.registration)} where user_id = ${q(founder.id)};`,
  );
  founderRows.push(
    `(${q(founder.id)}, ${q(fz.name)}, ${q(fz.role)}, ${q(fz.organization)}, ${q(fz.location)}, ${q(fz.bio)}, ${p.founder.experienceYears}, ${q(fz.registration)}, ${p.founder.verifiedIdentity}, ${p.founder.verifiedIdentity ? ts(startsAt) : 'null'}, ${p.founder.verifiedIdentity ? q(admin.id) : 'null'})`,
  );

  projectRows.push(
    `(${q(projectId)}, ${q(founder.id)}, ${q(p.slug)}, '${model}', ${q(categoryId)}, ${q(regionOf(p.location))}, ${q(uz.location)}, ${q(uz.imageUrl)}, 'uz', ${p.targetAmount}, ${minContribution}, ${durationDays}, 'active', ${p.featured}, ${ts(new Date(startsAt.getTime() - 3 * DAY))}, ${ts(new Date(startsAt.getTime() - DAY))}, ${q(admin.id)}, ${ts(startsAt)}, now() + interval '${p.daysRemaining} days', ${ts(new Date(startsAt.getTime() - 10 * DAY))})`,
  );

  const uzRow = `(${q(projectId)}, 'uz', ${q(uz.title)}, ${q(uz.tagline)}, ${q(uz.description)}, ${q(uz.story)}, ${q(uz.risks)})`;
  translationRows.push(
    uzRow,
    `(${q(projectId)}, 'en', ${q(p.title)}, ${q(p.tagline)}, ${q(p.description)}, ${q(p.story)}, ${q(p.risksAndChallenges)})`,
  );
  live.push(
    `update public.projects set location = ${q(uz.location)}, cover_image_path = ${q(uz.imageUrl)}, original_language = 'uz' where id = ${q(projectId)};`,
    `insert into public.project_translations (project_id, language, title, tagline, summary, story, risks)
  select v.project_id::uuid, v.language::public.app_language, v.title, v.tagline, v.summary, v.story, v.risks
  from (values ${uzRow}) v(project_id, language, title, tagline, summary, story, risks)
  where ${exists(projectId)}
  on conflict (project_id, language) do update set title = excluded.title, tagline = excluded.tagline,
    summary = excluded.summary, story = excluded.story, risks = excluded.risks;`,
  );

  p.budgetBreakdown.forEach((b, i) => {
    const id = uuid(`budget:${p.slug}:${b.id}`);
    const [category, description] = uz.budget[i];
    budgetRows.push(`(${q(id)}, ${q(projectId)}, ${i}, ${q(category)}, ${q(description)}, ${b.amount})`);
    live.push(
      `update public.budget_items set category = ${q(category)}, description = ${q(description)} where id = ${q(id)};`,
    );
  });
  const budgetTotal = p.budgetBreakdown.reduce((s, b) => s + b.amount, 0);
  if (budgetTotal !== p.targetAmount) console.warn(`! ${p.slug}: budget ${budgetTotal} ≠ target ${p.targetAmount}`);

  // Campaigns are still running, so no milestone has been delivered yet.
  p.milestones.forEach((m, i) => {
    const id = uuid(`milestone:${p.slug}:${m.id}`);
    const [title, description, when] = uz.milestones[i];
    milestoneRows.push(
      `(${q(id)}, ${q(projectId)}, ${i}, ${q(title)}, ${q(description)}, ${q(when)}, ${m.fundReleasePercentage})`,
    );
    live.push(
      `update public.milestones set title = ${q(title)}, description = ${q(description)}, target_label = ${q(when)} where id = ${q(id)};`,
    );
  });

  const tiers = (p.rewards ?? []).map((r, i) => ({
    ...r,
    title: uz.rewards![i].title,
    description: uz.rewards![i].description,
    items: uz.rewards![i].items,
    estimatedDelivery: uz.rewards![i].delivery,
    uuid: uuid(`reward:${p.slug}:${r.id}`),
    position: i,
    claimed: 0,
  }));

  if (p.equityTerms) {
    const e = p.equityTerms;
    equityRows.push(
      `(${q(projectId)}, '${e.contractType.toLowerCase()}', ${e.investorProfitSharePercent}, ${e.minInvestment}, ${q(uz.projected ?? null)}, '${e.distributionSchedule.toLowerCase().replace('-', '')}', ${e.exitHorizonYears})`,
    );
  }

  if (p.equityTerms) {
    live.push(
      `update public.equity_terms set projected_annual_return = ${q(uz.projected ?? null)} where project_id = ${q(projectId)};`,
    );
  }
  const ev = p.evaluation;
  const evz = uz.evaluation;
  live.push(
    `update public.evaluations set summary = ${q(evz.summary)}, strengths = ${qArr(evz.strengths)}, risks = ${qArr(evz.risks)} where project_id = ${q(projectId)};`,
  );
  evaluationRows.push(
    `(${q(projectId)}, ${ev.businessPlanScore}, ${ev.teamScore}, ${ev.marketScore}, ${ev.financialScore}, ${ev.riskScore}, '${CONFIDENCE[ev.status] ?? 'in_review'}', ${q(evz.summary)}, ${qArr(evz.strengths)}, ${qArr(evz.risks)}, true, ${q(admin.id)}, ${q(`${ev.lastEvaluatedDate}T10:00:00Z`)})`,
  );

  // --- Contributions: exactly backerCount backers, summing to raisedAmount ---
  const fixed: { backer: Person; amount: number; tierKey?: string }[] = [];
  // The prototype's demo user backed projects 1 and 2.
  if (p.id === 'project-1') fixed.push({ backer: demoBacker, amount: 15_000_000 });
  if (p.id === 'project-2') fixed.push({ backer: demoBacker, amount: 850_000, tierKey: 'r-2' });
  // Commenters marked as backers really are backers.
  p.comments.forEach((c, i) => {
    if (c.isBacker) fixed.push({ backer: commenter(i), amount: 0 });
  });

  const backers: Person[] = fixed.map(f => f.backer);
  let poolIndex = Math.floor(rand() * backerPool.length);
  while (backers.length < p.backerCount) {
    const candidate = backerPool[poolIndex++ % backerPool.length];
    if (!backers.includes(candidate) && candidate !== founder) backers.push(candidate);
  }

  // Split the raised amount: everyone gets the minimum, the rest by random weight,
  // rounded to 10,000 so'm; the last backer absorbs rounding.
  const fixedSum = fixed.reduce((s, f) => s + f.amount, 0);
  const free = backers.slice(fixed.filter(f => f.amount > 0).length);
  const freeMin = Math.max(minContribution, 50_000);
  const remaining = p.raisedAmount - fixedSum - free.length * freeMin;
  if (remaining < 0) throw new Error(`${p.slug}: raised amount too small for ${p.backerCount} backers`);
  const weights = free.map(() => rand() ** 2 + 0.05);
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const amounts = weights.map(w => freeMin + Math.floor((remaining * w) / weightSum / 10_000) * 10_000);
  amounts[amounts.length - 1] += p.raisedAmount - fixedSum - amounts.reduce((a, b) => a + b, 0);

  const span = TODAY.getTime() - startsAt.getTime();
  const record = (backer: Person, amount: number, tierKey?: string) => {
    let tier = tierKey ? tiers.find(t => t.id === tierKey) : undefined;
    if (!tier && model === 'reward' && rand() < 0.75) {
      // Pick the best reward the amount pays for, if any are left.
      tier = [...tiers]
        .sort((a, b) => b.amount - a.amount)
        .find(t => t.amount <= amount && (t.availableCount == null || t.claimed < t.availableCount));
    }
    if (tier) tier.claimed++;
    const share =
      model === 'equity' && p.equityTerms
        ? Math.round((amount / p.targetAmount) * p.equityTerms.investorProfitSharePercent * 10_000) / 10_000
        : null;
    contributions.push({
      id: uuid(`contribution:${p.slug}:${backer.id}`),
      projectId,
      backerId: backer.id,
      amount,
      tierId: tier?.uuid ?? null,
      at: new Date(startsAt.getTime() + rand() * span),
      method: METHODS[Math.floor(rand() * METHODS.length)],
      share,
    });
  };
  fixed.filter(f => f.amount > 0).forEach(f => record(f.backer, f.amount, f.tierKey));
  free.forEach((b, i) => record(b, amounts[i]));

  for (const t of tiers) {
    live.push(
      `update public.reward_tiers set title = ${q(t.title)}, description = ${q(t.description)}, items = ${qArr(t.items)}, estimated_delivery = ${q(t.estimatedDelivery)} where id = ${q(t.uuid)};`,
    );
    tierRows.push(
      `(${q(t.uuid)}, ${q(projectId)}, ${t.position}, ${q(t.title)}, ${q(t.description)}, ${t.amount}, ${qArr(t.items)}, ${q(t.estimatedDelivery)}, ${t.availableCount ?? 'null'}, ${t.claimed})`,
    );
  }

  // --- Updates (with likes from backers) ---
  p.updates.forEach((u, i) => {
    const updateId = uuid(`update:${p.slug}:${u.id}`);
    const [title, body] = uz.updates[i];
    updateRows.push(
      `(${q(updateId)}, ${q(projectId)}, ${q(founder.id)}, ${q(title)}, ${q(body)}, ${q(`${u.date}T12:00:00Z`)})`,
    );
    live.push(`update public.project_updates set title = ${q(title)}, body = ${q(body)} where id = ${q(updateId)};`);
    backers
      .slice(0, Math.min(u.likesCount, backers.length))
      .forEach(b => likeRows.push(`(${q(updateId)}, ${q(b.id)})`));
  });

  // --- Comments and founder replies ---
  p.comments.forEach((c, i) => {
    const author = commenter(i);
    const cz = uz.comments[i];
    const commentId = uuid(`comment:${p.slug}:${c.id}`);
    commentRows.push(
      `(${q(commentId)}, ${q(projectId)}, ${q(author.id)}, null, ${q(cz.body)}, ${q(`${c.date}T14:00:00Z`)})`,
    );
    live.push(`update public.comments set body = ${q(cz.body)} where id = ${q(commentId)};`);
    if (c.reply) {
      const replyId = uuid(`reply:${p.slug}:${c.id}`);
      const body = cz.reply ?? c.reply.content;
      commentRows.push(
        `(${q(replyId)}, ${q(projectId)}, ${q(founder.id)}, ${q(commentId)}, ${q(body)}, ${q(`${c.reply.date}T16:00:00Z`)})`,
      );
      live.push(`update public.comments set body = ${q(body)} where id = ${q(replyId)};`);
    }
  });

  // The demo user has saved the first two projects.
  if (p.id === 'project-1' || p.id === 'project-2') followRows.push(`(${q(demoBacker.id)}, ${q(projectId)})`);
});

// ---------------------------------------------------------------------------
// Write the file
// ---------------------------------------------------------------------------
const values = (rows: string[]) => rows.join(',\n  ');

emit(`-- =============================================================================
-- DEMO DATA — generated by supabase/scripts/generate-seed.ts. Do not edit by hand.
-- Regenerate with: npm run db:seed:generate
--
-- Demo accounts have no password and cannot log in.
-- =============================================================================

begin;

-- Users (profiles are created automatically by the on_auth_user_created trigger)
insert into auth.users (instance_id, id, aud, role, email, raw_app_meta_data, raw_user_meta_data,
                        confirmation_token, recovery_token, email_change_token_new, email_change, created_at, updated_at)
values
  ${values(
    [...people.values()].map(
      (u, i) =>
        `('00000000-0000-0000-0000-000000000000', ${q(u.id)}, 'authenticated', 'authenticated', 'demo${String(i).padStart(3, '0')}@demo.fundy.uz', '{"provider":"email","providers":["email"]}', ${q(JSON.stringify({ full_name: u.name, language: 'uz' }))}, '', '', '', '', ${ts(new Date('2026-08-01T00:00:00Z'))}, ${ts(new Date('2026-08-01T00:00:00Z'))})`,
    ),
  )};

update public.profiles p set city = v.city, region_id = v.region
from (values
  ${values([...people.values()].map(u => `(${q(u.id)}::uuid, ${q(u.city)}, ${q(u.region)})`))}
) as v(id, city, region)
where p.id = v.id;

update public.profiles set role = 'admin' where id = ${q(admin.id)};

insert into public.founder_profiles
  (user_id, display_name, role_title, organization, location, bio, experience_years, registration_number, is_verified, verified_at, verified_by)
values
  ${values(founderRows)};

insert into public.projects
  (id, owner_id, slug, model, category_id, region_id, location, cover_image_path, original_language,
   target_amount, min_contribution, duration_days, status, is_featured, submitted_at, reviewed_at, reviewed_by,
   starts_at, ends_at, created_at)
values
  ${values(projectRows)};

insert into public.project_translations (project_id, language, title, tagline, summary, story, risks)
values
  ${values(translationRows)};

insert into public.budget_items (id, project_id, position, category, description, amount)
values
  ${values(budgetRows)};

insert into public.milestones (id, project_id, position, title, description, target_label, release_percent)
values
  ${values(milestoneRows)};

insert into public.reward_tiers (id, project_id, position, title, description, amount, items, estimated_delivery, quantity_limit, claimed_count)
values
  ${values(tierRows)};

insert into public.equity_terms
  (project_id, contract_type, investor_profit_share_pct, min_investment, projected_annual_return, distribution_schedule, exit_horizon_years)
values
  ${values(equityRows)};

insert into public.evaluations
  (project_id, business_plan_score, team_score, market_score, financial_score, risk_score, confidence, summary,
   strengths, risks, is_published, evaluated_by, evaluated_at)
values
  ${values(evaluationRows)};

-- ${contributions.length} simulated contributions (they add up to each project's raised_amount)
insert into public.contributions (id, project_id, backer_id, amount, reward_tier_id, payment_method, equity_share_pct, created_at)
values
  ${values(contributions.map(c => `(${q(c.id)}, ${q(c.projectId)}, ${q(c.backerId)}, ${c.amount}, ${q(c.tierId)}, '${c.method}', ${c.share ?? 'null'}, ${ts(c.at)})`))};

-- Totals come from the contributions themselves.
update public.projects p
set raised_amount = t.total, backer_count = t.backers
from (select project_id, sum(amount) as total, count(distinct backer_id) as backers
      from public.contributions group by project_id) t
where p.id = t.project_id;

-- Notifications for these inserts would be noise in a fresh demo.
alter table public.project_updates disable trigger notify_new_update;
alter table public.comments disable trigger notify_new_comment;

insert into public.project_updates (id, project_id, author_id, title, body, created_at)
values
  ${values(updateRows)};

insert into public.update_likes (update_id, user_id)
values
  ${values(likeRows)};

insert into public.comments (id, project_id, author_id, parent_id, body, created_at)
values
  ${values(commentRows)};

alter table public.project_updates enable trigger notify_new_update;
alter table public.comments enable trigger notify_new_comment;

insert into public.follows (user_id, project_id)
values
  ${values(followRows)};

commit;
`);

if (updateTarget) {
  writeFileSync(
    updateTarget,
    `-- =============================================================================
-- Demo projects in Uzbek, in place: texts, names, covers and profit forecasts
-- (in so'm instead of "% p.a."). Generated by supabase/scripts/generate-seed.ts --update.
-- Only demo rows are touched (matched by their fixed ids); nothing is deleted.
-- On a fresh database these rows don't exist yet, so every statement does nothing.
-- =============================================================================

update public.profiles p set full_name = v.name, city = v.city
from (values
  ${values([...people.values()].map(u => `(${q(u.id)}::uuid, ${q(u.name)}, ${q(u.city)})`))}
) as v(id, name, city)
where p.id = v.id;

${live.join('\n')}
`,
  );
  console.log(`Wrote ${updateTarget}`);
}

const target = join(import.meta.dirname, '..', 'seed.sql');
writeFileSync(target, out.join('\n'));
console.log(
  `Wrote ${target}: ${people.size} users, ${INITIAL_PROJECTS.length} projects, ${contributions.length} contributions.`,
);
