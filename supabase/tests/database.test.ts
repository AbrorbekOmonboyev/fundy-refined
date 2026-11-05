/**
 * Database tests: migrations, demo seed, security rules and money logic.
 * Runs against an in-memory Postgres — no Supabase account or Docker needed.
 *
 *   npm run db:test
 */
import assert from 'node:assert/strict';
import { before, describe, test } from 'node:test';
import type { PGlite } from '@electric-sql/pglite';
import { INITIAL_PROJECTS } from '../../src/data/mockProjects.ts';
import { as, createTestDb, createUser } from './db.ts';

let db: PGlite;
let alice: string; // founder
let bob: string; // backer
let carol: string; // another user
let admin: string;

const anon = { role: 'anon' } as const;
const user = (userId: string) => ({ role: 'authenticated', userId }) as const;
const owner = { role: 'owner' } as const;

async function rejects(promise: Promise<unknown>, message: RegExp) {
  await assert.rejects(promise, (error: Error) => {
    assert.match(error.message, message);
    return true;
  });
}

/** A complete draft project owned by `ownerId`, ready to submit. */
async function createDraft(ownerId: string, slug: string, opts: { target?: number; model?: string } = {}) {
  const target = opts.target ?? 10_000_000;
  const model = opts.model ?? 'donation';
  const [project] = await as<{ id: string }>(
    db,
    user(ownerId),
    `insert into public.projects (owner_id, slug, model, category_id, target_amount, cover_image_path)
     values ($1, $2, $3, 'technology', $4, 'x/cover.jpg') returning id`,
    [ownerId, slug, model, target],
  );
  await as(
    db,
    user(ownerId),
    `insert into public.project_translations (project_id, language, title, tagline, story)
    values ($1, 'uz', 'Test loyiha nomi', 'Qisqa tavsif', repeat('Batafsil hikoya. ', 20))`,
    [project.id],
  );
  await as(
    db,
    user(ownerId),
    `insert into public.budget_items (project_id, category, amount) values ($1, 'Equipment', $2)`,
    [project.id, target],
  );
  await as(
    db,
    user(ownerId),
    `insert into public.milestones (project_id, title, release_percent) values ($1, 'Phase 1', 60), ($1, 'Phase 2', 40)`,
    [project.id],
  );
  return project.id;
}

async function evaluateAndApprove(projectId: string) {
  await as(
    db,
    user(admin),
    `select public.admin_save_evaluation($1, 16::smallint, 16::smallint, 16::smallint, 16::smallint, 16::smallint, 'moderate', 'Looks solid')`,
    [projectId],
  );
  await as(db, user(admin), `select public.admin_review_project($1, 'approve')`, [projectId]);
}

before(async () => {
  db = await createTestDb({ seed: true });
  alice = await createUser(db, 'Alice Founder');
  bob = await createUser(db, 'Bob Backer');
  carol = await createUser(db, 'Carol Other');
  admin = await createUser(db, 'Ada Admin', { admin: true });
  await as(
    db,
    user(alice),
    `insert into public.founder_profiles (user_id, display_name) values ($1, 'Alice Founder')`,
    [alice],
  );
});

describe('demo seed', () => {
  test('loads all 8 prototype projects with matching totals', async () => {
    const rows = await as<{ slug: string; raised_amount: string; backer_count: number }>(
      db,
      owner,
      `select slug, raised_amount::text, backer_count from public.projects where slug = any($1)`,
      [INITIAL_PROJECTS.map(p => p.slug)],
    );
    assert.equal(rows.length, 8);
    for (const p of INITIAL_PROJECTS) {
      const row = rows.find(r => r.slug === p.slug)!;
      assert.equal(Number(row.raised_amount), p.raisedAmount, `${p.slug} raised`);
      assert.equal(row.backer_count, p.backerCount, `${p.slug} backers`);
    }
  });

  test('reward claims never exceed their limit', async () => {
    const over = await as(
      db,
      owner,
      `select id from public.reward_tiers where quantity_limit is not null and claimed_count > quantity_limit`,
    );
    assert.equal(over.length, 0);
  });

  test('update like counts match the likes table', async () => {
    const mismatched = await as(
      db,
      owner,
      `
      select u.id from public.project_updates u
      where u.likes_count <> (select count(*) from public.update_likes l where l.update_id = u.id)`,
    );
    assert.equal(mismatched.length, 0);
  });
});

describe('visitors (not signed in)', () => {
  test('can browse live projects, their text and evaluations', async () => {
    const projects = await as(db, anon, `select id from public.projects`);
    assert.equal(projects.length, 8);
    const texts = await as(db, anon, `select title from public.project_translations`);
    assert.equal(texts.length, 8);
    const evaluations = await as(db, anon, `select overall_score from public.evaluations`);
    assert.equal(evaluations.length, 8);
  });

  test('cannot see contributions, notifications or the audit log', async () => {
    await rejects(as(db, anon, `select * from public.contributions`), /permission denied/);
    await rejects(as(db, anon, `select * from public.notifications`), /permission denied/);
    await rejects(as(db, anon, `select * from public.audit_log`), /permission denied/);
  });

  test('cannot write anything or contribute', async () => {
    await rejects(
      as(
        db,
        anon,
        `insert into public.comments (project_id, author_id, body) select id, id, 'hi' from public.projects limit 1`,
      ),
      /permission denied/,
    );
    await rejects(as(db, anon, `select public.contribute(gen_random_uuid(), 100000, 'click')`), /permission denied/);
  });
});

describe('profiles', () => {
  test('a profile is created on sign-up', async () => {
    const [profile] = await as<{ full_name: string; preferred_language: string }>(
      db,
      user(bob),
      `select full_name, preferred_language from public.profiles where id = $1`,
      [bob],
    );
    assert.equal(profile.full_name, 'Bob Backer');
    assert.equal(profile.preferred_language, 'en');
  });

  test('users edit their own profile but cannot make themselves admin', async () => {
    await as(db, user(bob), `update public.profiles set city = 'Bukhara' where id = $1`, [bob]);
    await rejects(
      as(db, user(bob), `update public.profiles set role = 'admin' where id = $1`, [bob]),
      /permission denied/,
    );
    const changed = await as(db, user(bob), `update public.profiles set city = 'Hacked' where id = $1 returning id`, [
      carol,
    ]);
    assert.equal(changed.length, 0, "can't edit someone else's profile");
  });

  test('founders cannot verify themselves', async () => {
    await rejects(
      as(db, user(alice), `update public.founder_profiles set is_verified = true where user_id = $1`, [alice]),
      /permission denied/,
    );
  });
});

describe('project lifecycle', () => {
  let projectId: string;

  test('drafts are private to their owner and admins', async () => {
    projectId = await createDraft(alice, 'alice-draft');
    assert.equal((await as(db, anon, `select id from public.projects where id = $1`, [projectId])).length, 0);
    assert.equal((await as(db, user(bob), `select id from public.projects where id = $1`, [projectId])).length, 0);
    assert.equal(
      (await as(db, user(bob), `select * from public.budget_items where project_id = $1`, [projectId])).length,
      0,
    );
    assert.equal((await as(db, user(alice), `select id from public.projects where id = $1`, [projectId])).length, 1);
    assert.equal((await as(db, user(admin), `select id from public.projects where id = $1`, [projectId])).length, 1);
  });

  test('owners cannot change status or money totals directly', async () => {
    await rejects(
      as(db, user(alice), `update public.projects set status = 'active' where id = $1`, [projectId]),
      /permission denied/,
    );
    await rejects(
      as(db, user(alice), `update public.projects set raised_amount = 999 where id = $1`, [projectId]),
      /permission denied/,
    );
  });

  test("others cannot edit or add to someone else's draft", async () => {
    const changed = await as(
      db,
      user(bob),
      `update public.budget_items set amount = 1 where project_id = $1 returning id`,
      [projectId],
    );
    assert.equal(changed.length, 0);
    await rejects(
      as(db, user(bob), `insert into public.budget_items (project_id, category, amount) values ($1, 'Mine', 5)`, [
        projectId,
      ]),
      /row-level security/,
    );
  });

  test('submission checks the budget adds up to the target', async () => {
    await as(
      db,
      user(alice),
      `insert into public.budget_items (project_id, category, amount) values ($1, 'Extra', 500000)`,
      [projectId],
    );
    await rejects(as(db, user(alice), `select public.submit_project($1)`, [projectId]), /budget_total_mismatch/);
    await as(db, user(alice), `delete from public.budget_items where project_id = $1 and category = 'Extra'`, [
      projectId,
    ]);
  });

  test('only the owner can submit', async () => {
    await rejects(as(db, user(bob), `select public.submit_project($1)`, [projectId]), /project_not_found/);
  });

  test('submitting locks editing and notifies admins', async () => {
    await as(db, user(alice), `select public.submit_project($1)`, [projectId]);
    const [p] = await as<{ status: string }>(db, owner, `select status from public.projects where id = $1`, [
      projectId,
    ]);
    assert.equal(p.status, 'pending_review');
    const edited = await as(
      db,
      user(alice),
      `update public.projects set target_amount = 20000000 where id = $1 returning id`,
      [projectId],
    );
    assert.equal(edited.length, 0, 'no edits while under review');
    const notes = await as(db, user(admin), `select type from public.notifications where data->>'project_id' = $1`, [
      projectId,
    ]);
    assert.deepEqual(
      notes.map(n => n.type),
      ['project_submitted'],
    );
  });

  test('only admins can review, and approval needs an evaluation', async () => {
    await rejects(as(db, user(alice), `select public.admin_review_project($1, 'approve')`, [projectId]), /admin_only/);
    await rejects(
      as(db, user(admin), `select public.admin_review_project($1, 'approve')`, [projectId]),
      /evaluation_required/,
    );
  });

  test('approval makes the project live, public and logged', async () => {
    await evaluateAndApprove(projectId);
    const [p] = await as<{ status: string; ends_at: string }>(
      db,
      anon,
      `select status, ends_at from public.projects where id = $1`,
      [projectId],
    );
    assert.equal(p.status, 'active');
    assert.ok(p.ends_at);
    const [evaluation] = await as<{ overall_score: number }>(
      db,
      anon,
      `select overall_score from public.evaluations where project_id = $1`,
      [projectId],
    );
    assert.equal(evaluation.overall_score, 80);
    const log = await as<{ action: string }>(
      db,
      user(admin),
      `select action from public.audit_log where target_id = $1 order by id`,
      [projectId],
    );
    assert.deepEqual(
      log.map(l => l.action),
      ['evaluation.save', 'project.approve'],
    );
    const notes = await as(db, user(alice), `select type from public.notifications where type = 'project_approved'`);
    assert.equal(notes.length, 1);
  });

  test('rejection requires a reason', async () => {
    const otherId = await createDraft(alice, 'alice-second');
    await as(db, user(alice), `select public.submit_project($1)`, [otherId]);
    await rejects(
      as(db, user(admin), `select public.admin_review_project($1, 'reject', 'no')`, [otherId]),
      /review_note_required/,
    );
    await as(
      db,
      user(admin),
      `select public.admin_review_project($1, 'request_changes', 'Please add more detail to the story.')`,
      [otherId],
    );
    const edited = await as(
      db,
      user(alice),
      `update public.projects set target_amount = 12000000 where id = $1 returning id`,
      [otherId],
    );
    assert.equal(edited.length, 1, 'owner can edit again after changes are requested');
  });
});

describe('contributions', () => {
  let projectId: string;

  before(async () => {
    projectId = await createDraft(alice, 'alice-reward', { model: 'reward', target: 5_000_000 });
    await as(
      db,
      user(alice),
      `insert into public.reward_tiers (project_id, title, amount, quantity_limit) values ($1, 'Thank-you card', 100000, 1)`,
      [projectId],
    );
    await as(db, user(alice), `select public.submit_project($1)`, [projectId]);
    await evaluateAndApprove(projectId);
  });

  test('a contribution updates totals and notifies both sides', async () => {
    await as(db, user(bob), `select public.contribute($1, 300000, 'payme')`, [projectId]);
    await as(db, user(bob), `select public.contribute($1, 200000, 'click')`, [projectId]);
    const [p] = await as<{ raised_amount: string; backer_count: number }>(
      db,
      anon,
      `select raised_amount::text, backer_count from public.projects where id = $1`,
      [projectId],
    );
    assert.equal(Number(p.raised_amount), 500_000);
    assert.equal(p.backer_count, 1, 'same backer twice counts once');
    assert.equal(
      (
        await as(
          db,
          user(alice),
          `select id from public.notifications where type = 'new_contribution' and data->>'project_id' = $1`,
          [projectId],
        )
      ).length,
      2,
    );
    assert.equal(
      (await as(db, user(bob), `select id from public.notifications where type = 'contribution_confirmed'`)).length,
      2,
    );
  });

  test('cannot insert contributions directly', async () => {
    await rejects(
      as(
        db,
        user(bob),
        `insert into public.contributions (project_id, backer_id, amount, payment_method) values ($1, $2, 99999999, 'click')`,
        [projectId, bob],
      ),
      /permission denied/,
    );
  });

  test('rules: minimum amount, no self-backing, reward limits', async () => {
    await rejects(
      as(db, user(bob), `select public.contribute($1, 5000, 'click')`, [projectId]),
      /amount_below_minimum/,
    );
    await rejects(
      as(db, user(alice), `select public.contribute($1, 100000, 'click')`, [projectId]),
      /cannot_back_own_project/,
    );
    const [tier] = await as<{ id: string }>(db, anon, `select id from public.reward_tiers where project_id = $1`, [
      projectId,
    ]);
    await rejects(
      as(db, user(bob), `select public.contribute($1, 50000, 'click', $2)`, [projectId, tier.id]),
      /amount_below_reward_price/,
    );
    await as(db, user(bob), `select public.contribute($1, 100000, 'click', $2)`, [projectId, tier.id]);
    await rejects(
      as(db, user(carol), `select public.contribute($1, 100000, 'click', $2)`, [projectId, tier.id]),
      /reward_sold_out/,
    );
  });

  test('backers see their own contributions; others do not', async () => {
    assert.equal(
      (await as(db, user(bob), `select id from public.contributions where project_id = $1`, [projectId])).length,
      3,
    );
    assert.equal(
      (await as(db, user(alice), `select id from public.contributions where project_id = $1`, [projectId])).length,
      3,
      'owner sees backers',
    );
    assert.equal(
      (await as(db, user(carol), `select id from public.contributions where project_id = $1`, [projectId])).length,
      0,
    );
  });

  test('equity contributions record the profit share', async () => {
    const [p] = await as<{ id: string; target_amount: string }>(
      db,
      owner,
      `
      select p.id, p.target_amount::text from public.projects p where slug = 'agrosmart-fergana-greenhouse'`,
    );
    await rejects(
      as(db, user(carol), `select public.contribute($1, 1000000, 'uzcard')`, [p.id]),
      /amount_below_minimum/,
    );
    await as(db, user(carol), `select public.contribute($1, 24000000, 'uzcard')`, [p.id]);
    const [c] = await as<{ equity_share_pct: string }>(
      db,
      user(carol),
      `select equity_share_pct::text from public.contributions where project_id = $1`,
      [p.id],
    );
    assert.equal(Number(c.equity_share_pct), 2.8); // 24M of 240M target × 28% investor pool
  });

  test('ended campaigns close as funded or unsuccessful', async () => {
    await db.query(`update public.projects set ends_at = now() - interval '1 minute' where id = $1`, [projectId]);
    const [{ closed }] = (await db.query<{ closed: number }>(`select private.close_ended_projects() as closed`)).rows;
    assert.equal(closed, 1);
    const [p] = await as<{ status: string }>(db, anon, `select status from public.projects where id = $1`, [projectId]);
    assert.equal(p.status, 'unsuccessful'); // 600k of 5M
    await rejects(
      as(db, user(carol), `select public.contribute($1, 100000, 'click')`, [projectId]),
      /project_not_accepting_contributions/,
    );
  });

  test('visitors cannot run the closing job', async () => {
    await rejects(as(db, user(bob), `select private.close_ended_projects()`), /permission denied/);
  });
});

describe('community', () => {
  let liveId: string;
  let draftId: string;

  before(async () => {
    [{ id: liveId }] = await as<{ id: string }>(
      db,
      owner,
      `select id from public.projects where slug = 'tashkent-stem-robotics-lab'`,
    );
    draftId = await createDraft(alice, 'alice-quiet-draft');
  });

  test('comments on live projects notify the owner; drafts cannot be commented on', async () => {
    const [comment] = await as<{ id: string }>(
      db,
      user(bob),
      `insert into public.comments (project_id, author_id, body) values ($1, $2, 'Great idea!') returning id`,
      [liveId, bob],
    );
    const [{ owner_id }] = await as<{ owner_id: string }>(
      db,
      owner,
      `select owner_id from public.projects where id = $1`,
      [liveId],
    );
    const notes = await as(db, user(owner_id), `select id from public.notifications where data->>'comment_id' = $1`, [
      comment.id,
    ]);
    assert.equal(notes.length, 1);
    await rejects(
      as(db, user(bob), `insert into public.comments (project_id, author_id, body) values ($1, $2, 'hi')`, [
        draftId,
        bob,
      ]),
      /row-level security/,
    );
  });

  test('cannot comment as someone else', async () => {
    await rejects(
      as(db, user(bob), `insert into public.comments (project_id, author_id, body) values ($1, $2, 'fake')`, [
        liveId,
        carol,
      ]),
      /row-level security/,
    );
  });

  test('hidden comments disappear for everyone but the author and admins', async () => {
    const [comment] = await as<{ id: string }>(
      db,
      user(carol),
      `insert into public.comments (project_id, author_id, body) values ($1, $2, 'Spam spam') returning id`,
      [liveId, carol],
    );
    await rejects(as(db, user(bob), `select public.admin_set_hidden('comment', $1, true)`, [comment.id]), /admin_only/);
    await as(db, user(admin), `select public.admin_set_hidden('comment', $1, true)`, [comment.id]);
    assert.equal((await as(db, anon, `select id from public.comments where id = $1`, [comment.id])).length, 0);
    assert.equal((await as(db, user(carol), `select id from public.comments where id = $1`, [comment.id])).length, 1);
  });

  test('blocked users cannot comment', async () => {
    await as(db, user(admin), `select public.admin_set_user_blocked($1, true)`, [carol]);
    await rejects(
      as(db, user(carol), `insert into public.comments (project_id, author_id, body) values ($1, $2, 'again')`, [
        liveId,
        carol,
      ]),
      /row-level security/,
    );
    await as(db, user(admin), `select public.admin_set_user_blocked($1, false)`, [carol]);
  });

  test('only the owner posts updates, which notify backers and followers', async () => {
    await as(db, user(bob), `insert into public.follows (user_id, project_id) values ($1, $2)`, [bob, liveId]);
    await rejects(
      as(
        db,
        user(bob),
        `insert into public.project_updates (project_id, author_id, title, body) values ($1, $2, 'Fake', 'Fake news')`,
        [liveId, bob],
      ),
      /row-level security/,
    );
    const [{ owner_id }] = await as<{ owner_id: string }>(
      db,
      owner,
      `select owner_id from public.projects where id = $1`,
      [liveId],
    );
    const [update] = await as<{ id: string }>(
      db,
      user(owner_id),
      `insert into public.project_updates (project_id, author_id, title, body) values ($1, $2, 'Progress', 'Kits ordered') returning id`,
      [liveId, owner_id],
    );
    const notes = await as(db, user(bob), `select id from public.notifications where data->>'update_id' = $1`, [
      update.id,
    ]);
    assert.equal(notes.length, 1);
  });

  test('notifications and saved projects are private', async () => {
    assert.equal(
      (await as(db, user(carol), `select id from public.notifications where user_id = $1`, [bob])).length,
      0,
    );
    assert.equal((await as(db, user(carol), `select * from public.follows where user_id = $1`, [bob])).length, 0);
  });
});

describe('project wizard (the exact writes the app makes)', () => {
  let dina: string;
  let projectId: string;

  before(async () => {
    dina = await createUser(db, 'Dina Wizard');
  });

  test('step 1 creates a draft with its text', async () => {
    const [p] = await as<{ id: string }>(
      db,
      user(dina),
      `
      insert into public.projects (owner_id, slug, model, category_id, region_id, location, target_amount, duration_days, original_language)
      values ($1, 'dina-solar-bakery', 'equity', 'food', 'samarkand', 'Samarkand', 50000000, 45, 'uz') returning id`,
      [dina],
    );
    projectId = p.id;
    await as(
      db,
      user(dina),
      `insert into public.project_translations (project_id, language, title, tagline) values ($1, 'uz', 'Quyosh nonvoyxonasi', 'Quyosh energiyasida non')`,
      [projectId],
    );
  });

  test('step 1 can be edited again, and the slug is protected from others', async () => {
    await as(db, user(dina), `update public.projects set target_amount = 60000000, duration_days = 60 where id = $1`, [
      projectId,
    ]);
    await rejects(
      as(
        db,
        user(bob),
        `insert into public.projects (owner_id, slug, model, category_id, target_amount) values ($1, 'dina-solar-bakery', 'donation', 'food', 2000000)`,
        [bob],
      ),
      /duplicate key/,
    );
  });

  test('steps 2–4: story, cover, budget and milestones (replace on save)', async () => {
    await as(
      db,
      user(dina),
      `update public.project_translations set summary = 'Qisqa', story = repeat('Hikoya. ', 40), risks = 'Xavf' where project_id = $1 and language = 'uz'`,
      [projectId],
    );
    await as(db, user(dina), `update public.projects set cover_image_path = $2 where id = $1`, [
      projectId,
      `${dina}/${projectId}/cover.jpg`,
    ]);
    for (let round = 0; round < 2; round++) {
      await as(db, user(dina), `delete from public.budget_items where project_id = $1`, [projectId]);
      await as(
        db,
        user(dina),
        `insert into public.budget_items (project_id, position, category, description, amount) values ($1, 0, 'Oven', '', 40000000), ($1, 1, 'Solar panels', '', 20000000)`,
        [projectId],
      );
      await as(db, user(dina), `delete from public.milestones where project_id = $1`, [projectId]);
      await as(
        db,
        user(dina),
        `insert into public.milestones (project_id, position, title, description, target_label, release_percent) values ($1, 0, 'Install', '', 'Month 1', 50), ($1, 1, 'Open', '', null, 50)`,
        [projectId],
      );
    }
    const [{ n }] = await as<{ n: number }>(
      db,
      user(dina),
      `select count(*)::int as n from public.budget_items where project_id = $1`,
      [projectId],
    );
    assert.equal(n, 2, 'saving twice replaces, not duplicates');
  });

  test('step 5: equity terms insert, then update (no upsert needed)', async () => {
    await as(db, user(dina), `update public.projects set min_contribution = 500000 where id = $1`, [projectId]);
    await as(
      db,
      user(dina),
      `insert into public.equity_terms (project_id, contract_type, investor_profit_share_pct, min_investment, distribution_schedule, exit_horizon_years) values ($1, 'musharakah', 25, 1000000, 'quarterly', 5)`,
      [projectId],
    );
    const updated = await as(
      db,
      user(dina),
      `update public.equity_terms set investor_profit_share_pct = 30 where project_id = $1 returning project_id`,
      [projectId],
    );
    assert.equal(updated.length, 1);
    await rejects(
      as(db, user(dina), `update public.equity_terms set project_id = project_id where project_id = $1`, [projectId]),
      /permission denied/,
    );
  });

  test('step 6: founder profile and a private document', async () => {
    await as(
      db,
      user(dina),
      `insert into public.founder_profiles (user_id, display_name, role_title) values ($1, 'Dina', 'Founder')`,
      [dina],
    );
    await as(db, user(dina), `insert into storage.objects (bucket_id, name) values ('project-documents', $1)`, [
      `${dina}/${projectId}/license.pdf`,
    ]);
    await as(
      db,
      user(dina),
      `insert into public.project_documents (project_id, kind, storage_path, file_name, uploaded_by) values ($1, 'registration', $2, 'license.pdf', $3)`,
      [projectId, `${dina}/${projectId}/license.pdf`, dina],
    );
    assert.equal(
      (await as(db, user(bob), `select id from public.project_documents where project_id = $1`, [projectId])).length,
      0,
    );
  });

  test('step 7: submit, after which the draft is locked', async () => {
    await as(db, user(dina), `select public.submit_project($1)`, [projectId]);
    const changed = await as(
      db,
      user(dina),
      `update public.project_translations set story = 'x' where project_id = $1 returning project_id`,
      [projectId],
    );
    assert.equal(changed.length, 0);
    const deleted = await as(db, user(dina), `delete from public.projects where id = $1 returning id`, [projectId]);
    assert.equal(deleted.length, 0, 'submitted projects cannot be deleted');
  });

  test('owners can delete an unsubmitted draft (with its parts)', async () => {
    const id = await createDraft(dina, 'dina-throwaway');
    await as(db, user(dina), `delete from public.projects where id = $1`, [id]);
    assert.equal((await as(db, owner, `select id from public.budget_items where project_id = $1`, [id])).length, 0);
  });

  test('founders post updates only on their live projects', async () => {
    await rejects(
      as(
        db,
        user(dina),
        `insert into public.project_updates (project_id, author_id, title, body) values ($1, $2, 'Hi', 'Still in review')`,
        [projectId, dina],
      ),
      /row-level security/,
    );
  });
});

describe('conflict of interest and withdrawing', () => {
  let founderAdmin: string;
  let ownProject: string;

  before(async () => {
    founderAdmin = await createUser(db, 'Farida FounderAdmin', { admin: true });
    await as(
      db,
      user(founderAdmin),
      `insert into public.founder_profiles (user_id, display_name) values ($1, 'Farida')`,
      [founderAdmin],
    );
    ownProject = await createDraft(founderAdmin, 'farida-own-project');
    await as(db, user(founderAdmin), `select public.submit_project($1)`, [ownProject]);
  });

  test('an admin cannot evaluate, approve or reject their own project', async () => {
    await rejects(
      as(
        db,
        user(founderAdmin),
        `select public.admin_save_evaluation($1, 20::smallint, 20::smallint, 20::smallint, 20::smallint, 20::smallint, 'high', 'Perfect')`,
        [ownProject],
      ),
      /cannot_review_own_project/,
    );
    await rejects(
      as(db, user(founderAdmin), `select public.admin_review_project($1, 'approve')`, [ownProject]),
      /cannot_review_own_project/,
    );
    await rejects(
      as(db, user(founderAdmin), `select public.admin_review_project($1, 'reject', 'Not good enough at all')`, [
        ownProject,
      ]),
      /cannot_review_own_project/,
    );
  });

  test('admins cannot verify themselves', async () => {
    await rejects(
      as(db, user(founderAdmin), `select public.admin_verify_founder($1, true)`, [founderAdmin]),
      /cannot_verify_self/,
    );
  });

  test('another admin can still review it', async () => {
    await as(
      db,
      user(admin),
      `select public.admin_save_evaluation($1, 15::smallint, 15::smallint, 15::smallint, 15::smallint, 15::smallint, 'moderate', 'Fine')`,
      [ownProject],
    );
  });

  test('a founder can withdraw a submission and then delete the draft', async () => {
    const id = await createDraft(alice, 'withdraw-me');
    await as(db, user(alice), `select public.submit_project($1)`, [id]);
    await rejects(as(db, user(bob), `select public.withdraw_submission($1)`, [id]), /project_not_pending_review/);
    await as(db, user(alice), `select public.withdraw_submission($1)`, [id]);
    const [p] = await as<{ status: string; submitted_at: string | null }>(
      db,
      owner,
      `select status, submitted_at from public.projects where id = $1`,
      [id],
    );
    assert.equal(p.status, 'draft');
    assert.equal(p.submitted_at, null);
    await rejects(as(db, user(alice), `select public.withdraw_submission($1)`, [id]), /project_not_pending_review/);
    const deleted = await as(db, user(alice), `delete from public.projects where id = $1 returning id`, [id]);
    assert.equal(deleted.length, 1);
  });

  test('visitors cannot withdraw anything', async () => {
    await rejects(as(db, anon, `select public.withdraw_submission(gen_random_uuid())`), /permission denied/);
  });
});

describe('notifications', () => {
  test('users mark only their own notifications as read', async () => {
    const before = await as<{ n: number }>(
      db,
      user(alice),
      `select count(*)::int as n from public.notifications where user_id = $1 and read_at is null`,
      [alice],
    );
    assert.ok(before[0].n > 0, 'alice has unread notifications from earlier tests');
    const bobUnread = await as<{ n: number }>(
      db,
      owner,
      `select count(*)::int as n from public.notifications where user_id = $1 and read_at is null`,
      [bob],
    );

    const [{ mark_all_notifications_read: marked }] = await as<{ mark_all_notifications_read: number }>(
      db,
      user(alice),
      `select public.mark_all_notifications_read()`,
    );
    assert.equal(marked, before[0].n);

    const after = await as<{ n: number }>(
      db,
      owner,
      `select count(*)::int as n from public.notifications where user_id = $1 and read_at is null`,
      [bob],
    );
    assert.equal(after[0].n, bobUnread[0].n, "bob's notifications are untouched");
  });

  test('users cannot rewrite what a notification says', async () => {
    await rejects(
      as(db, user(bob), `update public.notifications set data = '{}' where user_id = $1`, [bob]),
      /permission denied/,
    );
    await rejects(as(db, anon, `select public.mark_all_notifications_read()`), /permission denied/);
  });
});

describe('contact messages', () => {
  test('a visitor can send a message; admins are notified and can read it', async () => {
    await as(
      db,
      anon,
      `insert into public.contact_messages (name, email, topic, message) values ('Visitor', 'Visitor@Example.com', 'general', 'Hello, how do fees work?')`,
    );
    const msgs = await as<{ email: string; status: string }>(
      db,
      user(admin),
      `select email, status from public.contact_messages where name = 'Visitor'`,
    );
    assert.equal(msgs.length, 1);
    assert.equal(msgs[0].email, 'visitor@example.com', 'email is stored in lower case');
    assert.equal(msgs[0].status, 'new');
    const notes = await as(db, user(admin), `select id from public.notifications where type = 'contact_message'`);
    assert.ok(notes.length >= 1);
  });

  test('nobody but admins can read messages', async () => {
    assert.equal((await as(db, user(bob), `select id from public.contact_messages`)).length, 0);
    await rejects(as(db, anon, `select id from public.contact_messages`), /permission denied/);
  });

  test('bad input is refused, and senders cannot pose as someone else', async () => {
    await rejects(
      as(
        db,
        anon,
        `insert into public.contact_messages (name, email, message) values ('X', 'not-an-email', 'Too short')`,
      ),
      /check constraint/,
    );
    await rejects(
      as(
        db,
        user(bob),
        `insert into public.contact_messages (name, email, message, user_id) values ('Bob', 'bob@example.com', 'Pretending to be Carol here', $1)`,
        [carol],
      ),
      /row-level security/,
    );
    await rejects(
      as(
        db,
        anon,
        `insert into public.contact_messages (name, email, message, status) values ('Sneaky', 's@example.com', 'Marking my own message handled', 'handled')`,
      ),
      /permission denied/,
    );
  });

  test('more than 5 messages an hour from one email are refused', async () => {
    for (let i = 0; i < 5; i++) {
      await as(
        db,
        anon,
        `insert into public.contact_messages (name, email, message) values ('Spammer', 'spam@example.com', 'Buy my product now please ' || $1)`,
        [String(i)],
      );
    }
    await rejects(
      as(
        db,
        anon,
        `insert into public.contact_messages (name, email, message) values ('Spammer', 'SPAM@example.com', 'One more time buying stuff')`,
      ),
      /too_many_messages/,
    );
  });

  test('admins mark messages handled (audited); others cannot', async () => {
    const [m] = await as<{ id: string }>(
      db,
      user(admin),
      `select id from public.contact_messages where name = 'Visitor'`,
    );
    await rejects(as(db, user(bob), `select public.admin_set_message_handled($1, true)`, [m.id]), /admin_only/);
    await as(db, user(admin), `select public.admin_set_message_handled($1, true)`, [m.id]);
    const log = await as(
      db,
      user(admin),
      `select id from public.audit_log where action = 'message.handled' and target_id = $1`,
      [m.id],
    );
    assert.equal(log.length, 1);
  });
});

describe('admin panel', () => {
  test('admins list users with email and activity; others cannot', async () => {
    const rows = await as<{ email: string; contribution_total: string; total_count: string }>(
      db,
      user(admin),
      `select * from public.admin_list_users('Bob Backer')`,
    );
    assert.equal(rows.length, 1);
    assert.match(rows[0].email, /@test\.local$/);
    assert.ok(Number(rows[0].contribution_total) > 0);
    await rejects(as(db, user(bob), `select * from public.admin_list_users()`), /admin_only/);
    await rejects(as(db, anon, `select * from public.admin_list_users()`), /permission denied/);
  });

  test('user search pages through everyone', async () => {
    const page = await as<{ total_count: string }>(
      db,
      user(admin),
      `select * from public.admin_list_users(null, 10, 0)`,
    );
    assert.equal(page.length, 10);
    assert.ok(Number(page[0].total_count) > 200);
  });

  test('admins see recent comments including hidden ones; others cannot', async () => {
    const all = await as<{ is_hidden: boolean }>(db, user(admin), `select * from public.admin_recent_comments(200)`);
    assert.ok(
      all.some(c => c.is_hidden),
      'hidden comment from the moderation test is listed',
    );
    const hidden = await as<{ is_hidden: boolean }>(
      db,
      user(admin),
      `select * from public.admin_recent_comments(50, true)`,
    );
    assert.ok(hidden.length > 0 && hidden.every(c => c.is_hidden));
    await rejects(as(db, user(carol), `select * from public.admin_recent_comments()`), /admin_only/);
  });

  test('admins can read pending projects and their private documents', async () => {
    const pending = await as(db, user(admin), `select id from public.projects where status = 'pending_review'`);
    assert.ok(pending.length > 0);
    const docs = await as(db, user(admin), `select id from public.project_documents`);
    assert.ok(docs.length > 0);
  });
});

describe('public browsing', () => {
  test('search finds projects by title, place or founder, in any case', async () => {
    const byTitle = await as(db, anon, `select * from public.search_project_ids('robotics')`);
    assert.equal(byTitle.length, 1);
    const byPlace = await as(db, anon, `select * from public.search_project_ids('SAMARKAND')`);
    assert.ok(byPlace.length >= 1);
    const byFounder = await as(db, anon, `select * from public.search_project_ids('Rakhimov')`);
    assert.equal(byFounder.length, 1);
  });

  test('search ignores wildcards, very short queries and hidden drafts', async () => {
    assert.equal((await as(db, anon, `select * from public.search_project_ids('%')`)).length, 0);
    assert.equal((await as(db, anon, `select * from public.search_project_ids('a')`)).length, 0);
    const draftId = await createDraft(alice, 'secret-greenhouse-draft');
    const found = await as<{ search_project_ids: string }>(
      db,
      anon,
      `select * from public.search_project_ids('Test loyiha')`,
    );
    assert.ok(!found.some(r => r.search_project_ids === draftId));
  });

  test('funded percent follows the raised amount', async () => {
    const [p] = await as<{ funded_percent: string }>(
      db,
      anon,
      `select funded_percent::text from public.projects where slug = 'chust-master-cutlery-works'`,
    );
    assert.equal(Number(p.funded_percent), 93.33); // 42M of 45M
  });

  test('platform stats are public and count real backers', async () => {
    const [{ platform_stats: s }] = await as<{ platform_stats: Record<string, number> }>(
      db,
      anon,
      `select public.platform_stats()`,
    );
    assert.ok(s.backers > 200 && s.backers < 300, `backers ${s.backers}`); // ~240 demo users back several projects
    assert.ok(s.public_projects >= 8);
    assert.ok(s.raised >= 1_212_000_000);
  });

  test('comments show a Backer badge only for real, non-anonymous backers', async () => {
    const rows = await as<{ is_backer: boolean }>(
      db,
      anon,
      `
      select c.is_backer from public.comments c
      join public.projects p on p.id = c.project_id
      where p.slug = 'agrosmart-fergana-greenhouse' and c.parent_id is null`,
    );
    assert.ok(
      rows.some(r => r.is_backer),
      'seeded backer comment has the badge',
    );
    const replies = await as<{ is_backer: boolean }>(
      db,
      anon,
      `select c.is_backer from public.comments c where c.parent_id is not null limit 1`,
    );
    assert.equal(replies[0].is_backer, false, 'founder replies are not backers');
  });
});

describe('accounts', () => {
  test('users can mark their welcome step as done', async () => {
    await as(db, user(bob), `update public.profiles set onboarded_at = now() where id = $1`, [bob]);
    const [p] = await as<{ onboarded_at: string | null }>(
      db,
      user(bob),
      `select onboarded_at from public.profiles where id = $1`,
      [bob],
    );
    assert.ok(p.onboarded_at);
  });

  test('a user without activity can delete their account', async () => {
    const dave = await createUser(db, 'Dave Leaving');
    await as(db, user(dave), `select public.delete_my_account()`);
    assert.equal((await as(db, owner, `select id from auth.users where id = $1`, [dave])).length, 0);
    assert.equal((await as(db, owner, `select id from public.profiles where id = $1`, [dave])).length, 0);
  });

  test('accounts with contributions or projects are kept', async () => {
    await rejects(as(db, user(bob), `select public.delete_my_account()`), /account_has_activity/);
    await rejects(as(db, user(alice), `select public.delete_my_account()`), /account_has_activity/);
  });

  test('visitors cannot delete accounts', async () => {
    await rejects(as(db, anon, `select public.delete_my_account()`), /permission denied/);
  });
});

describe('file storage', () => {
  test('users upload only into their own folder', async () => {
    await as(db, user(bob), `insert into storage.objects (bucket_id, name) values ('avatars', $1)`, [`${bob}/me.png`]);
    await rejects(
      as(db, user(bob), `insert into storage.objects (bucket_id, name) values ('avatars', $1)`, [`${carol}/me.png`]),
      /row-level security/,
    );
  });

  test('private documents are visible to their uploader and admins only', async () => {
    await as(db, user(alice), `insert into storage.objects (bucket_id, name) values ('project-documents', $1)`, [
      `${alice}/license.pdf`,
    ]);
    assert.equal(
      (await as(db, user(bob), `select id from storage.objects where bucket_id = 'project-documents'`)).length,
      0,
    );
    const adminSees = await as(
      db,
      user(admin),
      `select name from storage.objects where bucket_id = 'project-documents'`,
    );
    assert.ok(
      adminSees.some(o => o.name === `${alice}/license.pdf`),
      'admin sees the document',
    );
  });
});
