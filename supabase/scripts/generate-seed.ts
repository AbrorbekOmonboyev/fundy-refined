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
const people = new Map<string, Person>(); // by name

function person(name: string, city: string | null = null): Person {
  let p = people.get(name);
  if (!p) {
    p = { id: uuid(`user:${name}`), name, city, region: city ? regionOf(city) : null };
    people.set(name, p);
  }
  return p;
}

const admin = person('Fundy Admin', 'Tashkent');
const demoBacker = person('Alisher Vohidov', 'Tashkent'); // the prototype's demo user

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

const poolRand = rng(42);
const allNames = SURNAME.flatMap((last, s) =>
  MALE.map((first, f) => ((s + f) % 2 === 0 ? `${first} ${last}` : `${FEMALE[f]} ${last}a`)),
); // 225 distinct names, half male, half female
const backerPool: Person[] = allNames
  .filter(name => !people.has(name))
  .map(name => person(name, CITIES[Math.floor(poolRand() * CITIES.length)]));
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

INITIAL_PROJECTS.forEach((p, index) => {
  const rand = rng(1000 + index);
  const projectId = uuid(`project:${p.slug}`);
  const founder = person(p.founder.name, p.founder.location);
  const model = p.model;
  const categoryId = CATEGORY[p.category];
  if (!categoryId) throw new Error(`Unknown category ${p.category}`);

  // Dates: started on createdAt, ends daysRemaining from now.
  const startsAt = new Date(`${p.createdAt}T08:00:00Z`);
  const durationDays = Math.min(90, Math.ceil((TODAY.getTime() + p.daysRemaining * DAY - startsAt.getTime()) / DAY));
  const minContribution = model === 'equity' && p.equityTerms ? p.equityTerms.minInvestment : 10_000;

  founderRows.push(
    `(${q(founder.id)}, ${q(p.founder.name)}, ${q(p.founder.role)}, ${q(p.founder.organization)}, ${q(p.founder.location)}, ${q(p.founder.bio)}, ${p.founder.experienceYears}, ${q(p.founder.tinOrRegistration)}, ${p.founder.verifiedIdentity}, ${p.founder.verifiedIdentity ? ts(startsAt) : 'null'}, ${p.founder.verifiedIdentity ? q(admin.id) : 'null'})`,
  );

  projectRows.push(
    `(${q(projectId)}, ${q(founder.id)}, ${q(p.slug)}, '${model}', ${q(categoryId)}, ${q(regionOf(p.location))}, ${q(p.location)}, ${q(p.imageUrl)}, 'en', ${p.targetAmount}, ${minContribution}, ${durationDays}, 'active', ${p.featured}, ${ts(new Date(startsAt.getTime() - 3 * DAY))}, ${ts(new Date(startsAt.getTime() - DAY))}, ${q(admin.id)}, ${ts(startsAt)}, now() + interval '${p.daysRemaining} days', ${ts(new Date(startsAt.getTime() - 10 * DAY))})`,
  );

  translationRows.push(
    `(${q(projectId)}, 'en', ${q(p.title)}, ${q(p.tagline)}, ${q(p.description)}, ${q(p.story)}, ${q(p.risksAndChallenges)})`,
  );

  p.budgetBreakdown.forEach((b, i) =>
    budgetRows.push(
      `(${q(uuid(`budget:${p.slug}:${b.id}`))}, ${q(projectId)}, ${i}, ${q(b.category)}, ${q(b.description)}, ${b.amount})`,
    ),
  );
  const budgetTotal = p.budgetBreakdown.reduce((s, b) => s + b.amount, 0);
  if (budgetTotal !== p.targetAmount) console.warn(`! ${p.slug}: budget ${budgetTotal} ≠ target ${p.targetAmount}`);

  // Campaigns are still running, so no milestone has been delivered yet.
  p.milestones.forEach((m, i) =>
    milestoneRows.push(
      `(${q(uuid(`milestone:${p.slug}:${m.id}`))}, ${q(projectId)}, ${i}, ${q(m.title)}, ${q(m.description)}, ${q(m.targetMonth)}, ${m.fundReleasePercentage})`,
    ),
  );

  const tiers = (p.rewards ?? []).map((r, i) => ({
    ...r,
    uuid: uuid(`reward:${p.slug}:${r.id}`),
    position: i,
    claimed: 0,
  }));

  if (p.equityTerms) {
    const e = p.equityTerms;
    equityRows.push(
      `(${q(projectId)}, '${e.contractType.toLowerCase()}', ${e.investorProfitSharePercent}, ${e.minInvestment}, ${q(e.projectedAnnualReturn)}, '${e.distributionSchedule.toLowerCase().replace('-', '')}', ${e.exitHorizonYears})`,
    );
  }

  const ev = p.evaluation;
  evaluationRows.push(
    `(${q(projectId)}, ${ev.businessPlanScore}, ${ev.teamScore}, ${ev.marketScore}, ${ev.financialScore}, ${ev.riskScore}, '${CONFIDENCE[ev.status] ?? 'in_review'}', ${q(ev.summaryNotes)}, ${qArr(ev.keyStrengths)}, ${qArr(ev.keyRisks)}, true, ${q(admin.id)}, ${q(`${ev.lastEvaluatedDate}T10:00:00Z`)})`,
  );

  // --- Contributions: exactly backerCount backers, summing to raisedAmount ---
  const fixed: { backer: Person; amount: number; tierKey?: string }[] = [];
  // The prototype's demo user backed projects 1 and 2.
  if (p.id === 'project-1') fixed.push({ backer: demoBacker, amount: 15_000_000 });
  if (p.id === 'project-2') fixed.push({ backer: demoBacker, amount: 850_000, tierKey: 'r-2' });
  // Commenters marked as backers really are backers.
  for (const c of p.comments) {
    if (c.isBacker) fixed.push({ backer: person(c.authorName, c.authorCity), amount: 0 });
  }

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
    tierRows.push(
      `(${q(t.uuid)}, ${q(projectId)}, ${t.position}, ${q(t.title)}, ${q(t.description)}, ${t.amount}, ${qArr(t.items)}, ${q(t.estimatedDelivery)}, ${t.availableCount ?? 'null'}, ${t.claimed})`,
    );
  }

  // --- Updates (with likes from backers) ---
  p.updates.forEach(u => {
    const updateId = uuid(`update:${p.slug}:${u.id}`);
    updateRows.push(
      `(${q(updateId)}, ${q(projectId)}, ${q(founder.id)}, ${q(u.title)}, ${q(u.content)}, ${q(`${u.date}T12:00:00Z`)})`,
    );
    backers
      .slice(0, Math.min(u.likesCount, backers.length))
      .forEach(b => likeRows.push(`(${q(updateId)}, ${q(b.id)})`));
  });

  // --- Comments and founder replies ---
  p.comments.forEach(c => {
    const author = person(c.authorName, c.authorCity);
    const commentId = uuid(`comment:${p.slug}:${c.id}`);
    commentRows.push(
      `(${q(commentId)}, ${q(projectId)}, ${q(author.id)}, null, ${q(c.content)}, ${q(`${c.date}T14:00:00Z`)})`,
    );
    if (c.reply) {
      commentRows.push(
        `(${q(uuid(`reply:${p.slug}:${c.id}`))}, ${q(projectId)}, ${q(founder.id)}, ${q(commentId)}, ${q(c.reply.content)}, ${q(`${c.reply.date}T16:00:00Z`)})`,
      );
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

const target = join(import.meta.dirname, '..', 'seed.sql');
writeFileSync(target, out.join('\n'));
console.log(
  `Wrote ${target}: ${people.size} users, ${INITIAL_PROJECTS.length} projects, ${contributions.length} contributions.`,
);
