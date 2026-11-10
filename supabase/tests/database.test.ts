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
async function createDraft(
  ownerId: string,
  slug: string,
  opts: { target?: number; model?: string; organizer?: string; identity?: boolean } = {},
) {
  const target = opts.target ?? 10_000_000;
  const model = opts.model ?? 'donation';
  const organizer = opts.organizer ?? (model === 'equity' ? 'mchj' : 'individual');
  const [project] = await as<{ id: string }>(
    db,
    user(ownerId),
    `insert into public.projects (owner_id, slug, model, organizer_type, category_id, target_amount, cover_image_path)
     values ($1, $2, $3, $4, 'technology', $5, 'x/cover.jpg') returning id`,
    [ownerId, slug, model, organizer, target],
  );
  // Identity is confirmed outside the wizard (OneID, or an admin after a video call).
  if (opts.identity !== false) await confirmIdentity(ownerId);
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

/** The founder's identity is confirmed (written as the database owner, like the OneID function does). */
async function confirmIdentity(userId: string) {
  await db.query(
    `insert into public.founder_identities (user_id, method) values ($1, 'oneid') on conflict (user_id) do nothing`,
    [userId],
  );
}

/** A private document (ID, certificate, ...) the founder uploaded for the review team. */
async function addDocument(ownerId: string, projectId: string, kind: string) {
  const path = `${ownerId}/${projectId}/${kind}-${Math.random().toString(36).slice(2, 8)}.pdf`;
  await as(db, user(ownerId), `insert into storage.objects (bucket_id, name) values ('project-documents', $1)`, [path]);
  await as(
    db,
    user(ownerId),
    `insert into public.project_documents (project_id, kind, storage_path, file_name, uploaded_by) values ($1, $2, $3, $4, $5)`,
    [projectId, kind, path, `${kind}.pdf`, ownerId],
  );
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
    `insert into public.founder_profiles (user_id, display_name, registration_number) values ($1, 'Alice Founder', 'YaTT 4012345')`,
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
    assert.equal(texts.length, 16); // Uzbek + English for each demo project
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
    const refunds = await as<{ status: string }>(
      db,
      owner,
      `select distinct status from public.contributions where project_id = $1`,
      [projectId],
    );
    assert.deepEqual(
      refunds.map(r => r.status),
      ['refunded'],
    ); // backers get their money back
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
      insert into public.projects (owner_id, slug, model, organizer_type, category_id, region_id, location, target_amount, duration_days, original_language)
      values ($1, 'dina-solar-bakery', 'equity', 'mchj', 'food', 'samarkand', 'Samarkand', 50000000, 45, 'uz') returning id`,
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
      `insert into public.founder_profiles (user_id, display_name, role_title, registration_number) values ($1, 'Dina', 'Founder', 'MChJ 309812490')`,
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
    await addDocument(dina, projectId, 'identity');
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

describe('milestone reviews', () => {
  let projectId: string;
  let milestoneId: string;

  before(async () => {
    // A funded project of alice's with one milestone.
    projectId = await createDraft(alice, 'alice-funded-milestones');
    await as(db, user(alice), `select public.submit_project($1)`, [projectId]);
    await evaluateAndApprove(projectId);
    await db.query(`update public.projects set status = 'funded' where id = $1`, [projectId]);
    [{ id: milestoneId }] = await as<{ id: string }>(
      db,
      anon,
      `select id from public.milestones where project_id = $1 order by position limit 1`,
      [projectId],
    );
  });

  test('reporting a milestone done notifies admins', async () => {
    await as(
      db,
      user(alice),
      `select public.submit_milestone($1, 'Equipment installed; photos and receipts attached.')`,
      [milestoneId],
    );
    const notes = await as(
      db,
      user(admin),
      `select id from public.notifications where type = 'milestone_submitted' and data->>'milestone_id' = $1`,
      [milestoneId],
    );
    assert.equal(notes.length, 1);
  });

  test('an admin can send it back with a note; the founder is notified and can resubmit', async () => {
    await rejects(
      as(db, user(admin), `select public.admin_return_milestone($1, 'short')`, [milestoneId]),
      /review_note_required/,
    );
    await rejects(
      as(db, user(alice), `select public.admin_return_milestone($1, 'Please add the receipts')`, [milestoneId]),
      /admin_only/,
    );
    await as(db, user(admin), `select public.admin_return_milestone($1, 'Please add the supplier receipts.')`, [
      milestoneId,
    ]);
    const [m] = await as<{ status: string; review_note: string }>(
      db,
      anon,
      `select status, review_note from public.milestones where id = $1`,
      [milestoneId],
    );
    assert.equal(m.status, 'pending');
    assert.match(m.review_note, /receipts/);
    assert.equal(
      (await as(db, user(alice), `select id from public.notifications where type = 'milestone_returned'`)).length,
      1,
    );
    await as(db, user(alice), `select public.submit_milestone($1, 'Receipts from the supplier are now attached.')`, [
      milestoneId,
    ]);
  });

  test('approving clears the note', async () => {
    await as(db, user(admin), `select public.admin_approve_milestone($1)`, [milestoneId]);
    const [m] = await as<{ status: string; review_note: string | null }>(
      db,
      anon,
      `select status, review_note from public.milestones where id = $1`,
      [milestoneId],
    );
    assert.equal(m.status, 'approved');
    assert.equal(m.review_note, null);
  });
});

describe('content reports', () => {
  let commentId: string;

  before(async () => {
    [{ id: commentId }] = await as<{ id: string }>(
      db,
      owner,
      `select id from public.comments where is_hidden = false limit 1`,
    );
  });

  test('a user reports a comment once; admins are notified', async () => {
    await as(
      db,
      user(carol),
      `insert into public.reports (reporter_id, target_type, target_id, reason) values ($1, 'comment', $2, 'spam')`,
      [carol, commentId],
    );
    await rejects(
      as(
        db,
        user(carol),
        `insert into public.reports (reporter_id, target_type, target_id, reason) values ($1, 'comment', $2, 'spam')`,
        [carol, commentId],
      ),
      /duplicate key/,
    );
    const notes = await as(db, user(admin), `select id from public.notifications where type = 'content_reported'`);
    assert.ok(notes.length >= 1);
  });

  test('reporters see only their own reports; visitors cannot report', async () => {
    assert.equal((await as(db, user(bob), `select id from public.reports where reporter_id = $1`, [carol])).length, 0);
    await rejects(
      as(
        db,
        anon,
        `insert into public.reports (reporter_id, target_type, target_id, reason) values (gen_random_uuid(), 'comment', gen_random_uuid(), 'spam')`,
      ),
      /permission denied/,
    );
  });
});

describe('likes on updates', () => {
  test('liking twice is refused and the count follows likes', async () => {
    const [u] = await as<{ id: string; likes_count: number }>(
      db,
      owner,
      `select id, likes_count from public.project_updates limit 1`,
    );
    await as(db, user(carol), `insert into public.update_likes (update_id, user_id) values ($1, $2)`, [u.id, carol]);
    await rejects(
      as(db, user(carol), `insert into public.update_likes (update_id, user_id) values ($1, $2)`, [u.id, carol]),
      /duplicate key/,
    );
    const [after] = await as<{ likes_count: number }>(
      db,
      anon,
      `select likes_count from public.project_updates where id = $1`,
      [u.id],
    );
    assert.equal(after.likes_count, u.likes_count + 1);
    await as(db, user(carol), `delete from public.update_likes where update_id = $1 and user_id = $2`, [u.id, carol]);
    const [back] = await as<{ likes_count: number }>(
      db,
      anon,
      `select likes_count from public.project_updates where id = $1`,
      [u.id],
    );
    assert.equal(back.likes_count, u.likes_count);
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

describe('page feedback', () => {
  test('a visitor sends feedback about a page; admins are notified and can read it', async () => {
    await as(
      db,
      anon,
      `insert into public.page_feedback (page, kind, message, email, context) values ('/explore', 'bug', '  Filter button does nothing  ', ' Guest@Example.com ', '{"lang":"uz","width":390}')`,
    );
    const rows = await as<{ message: string; email: string; status: string }>(
      db,
      user(admin),
      `select message, email, status from public.page_feedback where page = '/explore'`,
    );
    assert.equal(rows.length, 1);
    assert.equal(rows[0].message, 'Filter button does nothing');
    assert.equal(rows[0].email, 'guest@example.com');
    assert.equal(rows[0].status, 'new');
    const notes = await as<{ data: { page: string; kind: string } }>(
      db,
      user(admin),
      `select data from public.notifications where type = 'page_feedback'`,
    );
    assert.equal(notes[0].data.page, '/explore');
    assert.equal(notes[0].data.kind, 'bug');
  });

  test('only admins read it; bad input and posing as someone else are refused', async () => {
    assert.equal((await as(db, user(bob), `select id from public.page_feedback`)).length, 0);
    await rejects(as(db, anon, `select id from public.page_feedback`), /permission denied/);
    await rejects(
      as(db, anon, `insert into public.page_feedback (page, kind, message) values ('/', 'spam', 'Hello there')`),
      /check constraint/,
    );
    for (const page of ['javascript:alert(1)', '//evil.example', 'https://evil.example']) {
      await rejects(
        as(db, anon, `insert into public.page_feedback (page, message) values ($1, 'Only site paths')`, [page]),
        /check constraint/,
      );
    }
    await rejects(
      as(
        db,
        user(bob),
        `insert into public.page_feedback (page, message, user_id) values ('/', 'Pretending to be Carol', $1)`,
        [carol],
      ),
      /row-level security/,
    );
    await rejects(
      as(db, anon, `insert into public.page_feedback (page, message, status) values ('/', 'Self handled', 'handled')`),
      /permission denied/,
    );
  });

  test('more than 5 in 10 minutes from one person are refused', async () => {
    for (let i = 0; i < 5; i++) {
      await as(db, user(carol), `insert into public.page_feedback (page, message, user_id) values ('/', $1, $2)`, [
        `Note number ${i}`,
        carol,
      ]);
    }
    await rejects(
      as(db, user(carol), `insert into public.page_feedback (page, message, user_id) values ('/', 'One more', $1)`, [
        carol,
      ]),
      /too_many_messages/,
    );
  });

  test('admins mark feedback handled (audited); others cannot', async () => {
    const [f] = await as<{ id: string }>(
      db,
      user(admin),
      `select id from public.page_feedback where page = '/explore'`,
    );
    await rejects(as(db, user(bob), `select public.admin_set_feedback_handled($1, true)`, [f.id]), /admin_only/);
    await as(db, user(admin), `select public.admin_set_feedback_handled($1, true)`, [f.id]);
    const log = await as(
      db,
      user(admin),
      `select id from public.audit_log where action = 'feedback.handled' and target_id = $1`,
      [f.id],
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
    assert.ok(Number.isFinite(Number(rows[0].contribution_total))); // Bob's backing was refunded when that campaign missed its goal
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
    const byPlace = await as(db, anon, `select * from public.search_project_ids('SAMARQAND')`);
    assert.ok(byPlace.length >= 1);
    const byFounder = await as(db, anon, `select * from public.search_project_ids('Rahimov')`);
    assert.equal(byFounder.length, 1);
    const plainApostrophe = await as(db, anon, `select * from public.search_project_ids('Farg''ona')`);
    assert.ok(plainApostrophe.length >= 1); // finds "Fargʻona"
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

describe('recent backers', () => {
  test('show first name and city only, newest first, never anonymous backers', async () => {
    const [{ id }] = await as<{ id: string }>(
      db,
      owner,
      `select id from public.projects where slug = 'silkroad-samarkand-ikat-weavers'`,
    );
    const rows = await as<{ first_name: string; city: string | null; backed_at: string }>(
      db,
      anon,
      `select * from public.recent_backers($1, 3)`,
      [id],
    );
    assert.equal(rows.length, 3);
    assert.ok(rows.every(r => !r.first_name.includes(' ')));
    assert.ok(new Date(rows[0].backed_at) >= new Date(rows[1].backed_at));
    const cols = Object.keys(rows[0]).sort();
    assert.deepEqual(cols, ['backed_at', 'city', 'first_name']); // no amounts, no ids
  });
});

describe('telegram notifications', () => {
  test('a one-time code links a chat; only the server can link or read chats', async () => {
    const [{ telegram_link_token: code }] = await as<{ telegram_link_token: string }>(
      db,
      user(bob),
      `select public.telegram_link_token()`,
    );
    assert.match(code, /^[0-9a-f]{32}$/);
    const status = async () =>
      (await as<{ telegram_status: boolean }>(db, user(bob), `select public.telegram_status()`))[0].telegram_status;
    assert.equal(await status(), false);

    // the website can't link chats or read what's waiting
    await rejects(as(db, user(bob), `select public.telegram_link_chat($1, 111)`, [code]), /permission denied/);
    await rejects(as(db, anon, `select * from public.telegram_pending()`), /permission denied/);
    await rejects(as(db, user(bob), `select * from public.telegram_pending()`), /permission denied/);

    // the bot (service role) links it — once
    const link = async () =>
      (await as<{ ok: boolean }>(db, owner, `select public.telegram_link_chat($1, 111) as ok`, [code]))[0].ok;
    assert.equal(await link(), true);
    assert.equal(await link(), false);
    assert.equal(await status(), true);

    // new notifications for Bob are waiting, then marked as sent
    await db.query(`insert into public.notifications (user_id, type, data) values ($1, 'new_update', '{}')`, [bob]);
    const pending = await as<{ id: string; chat_id: string }>(db, owner, `select * from public.telegram_pending()`);
    assert.ok(pending.length >= 1 && pending.every(p => Number(p.chat_id) === 111));
    await as(db, owner, `select public.telegram_mark_sent($1::uuid[])`, [pending.map(p => p.id)]);
    assert.equal((await as(db, owner, `select * from public.telegram_pending()`)).length, 0);

    await as(db, user(bob), `select public.telegram_unlink()`);
    assert.equal(await status(), false);
  });
});

describe('richer rewards (phase A)', () => {
  let projectId: string;
  let scarf: string;
  let addon: string;
  before(async () => {
    [{ id: projectId }] = await as<{ id: string }>(
      db,
      owner,
      `select id from public.projects where slug = 'silkroad-samarkand-ikat-weavers'`,
    );
    [{ id: scarf }] = await as<{ id: string }>(
      db,
      owner,
      `select id from public.reward_tiers where project_id = $1 and per_backer_limit = 2`,
      [projectId],
    );
    [{ id: addon }] = await as<{ id: string }>(
      db,
      owner,
      `select id from public.reward_tiers where project_id = $1 and kind = 'addon' limit 1`,
      [projectId],
    );
  });

  test('visitors see rewards with their contents; they cannot change them', async () => {
    const rows = await as<{ name: string; quantity: number }>(
      db,
      anon,
      `select c.name, c.quantity from public.reward_components c
       join public.reward_tiers t on t.id = c.reward_tier_id where t.project_id = $1`,
      [projectId],
    );
    assert.ok(rows.some(r => r.quantity === 6)); // "Piyola ×6" in the big set
    await rejects(
      as(db, user(bob), `insert into public.reward_components (reward_tier_id, name) values ($1, 'x')`, [scarf]),
      /row-level security|permission denied/,
    );
  });

  test('retail price must be above the price', async () => {
    await rejects(
      db.query(`update public.reward_tiers set compare_at_amount = amount where id = $1`, [scarf]),
      /reward_compare_at_above_price/,
    );
  });

  test('a per-backer limit stops the third scarf', async () => {
    const back = () => as(db, user(carol), `select public.contribute($1, 850000, 'click', $2)`, [projectId, scarf]);
    await back();
    await back();
    await rejects(back(), /reward_limit_per_backer/);
  });

  test('add-ons cannot be backed on their own', async () => {
    await rejects(
      as(db, user(alice), `select public.contribute($1, 200000, 'click', $2)`, [projectId, addon]),
      /addon_needs_reward/,
    );
  });

  test('hidden or ended rewards cannot be chosen', async () => {
    const [{ id: cup }] = await as<{ id: string }>(
      db,
      owner,
      `select id from public.reward_tiers where project_id = $1 and kind = 'reward' order by position limit 1`,
      [projectId],
    );
    await db.query(`update public.reward_tiers set available_until = now() - interval '1 hour' where id = $1`, [cup]);
    await rejects(
      as(db, user(carol), `select public.contribute($1, 400000, 'click', $2)`, [projectId, cup]),
      /reward_not_available_now/,
    );
    await db.query(`update public.reward_tiers set available_until = null, is_hidden = true where id = $1`, [cup]);
    await rejects(
      as(db, user(carol), `select public.contribute($1, 400000, 'click', $2)`, [projectId, cup]),
      /reward_not_found/,
    );
    await db.query(`update public.reward_tiers set is_hidden = false where id = $1`, [cup]);
  });
});

describe('pledge cart (phase B)', () => {
  let projectId: string;
  let knife: string; // main reward, 280 000, max 3 per person
  let sheath: string; // add-on, 95 000
  let stone: string; // add-on, 120 000, 80 in stock
  let erin: string;
  const cart = (who: string, items: unknown, extra = 0) =>
    as<{ id: string }>(db, user(who), `select public.contribute_cart($1, $2::jsonb, $3) as id`, [
      projectId,
      JSON.stringify(items),
      extra,
    ]);

  before(async () => {
    [{ id: projectId }] = await as<{ id: string }>(
      db,
      owner,
      `select id from public.projects where slug = 'chust-master-cutlery-works'`,
    );
    const tiers = await as<{ id: string; title: string; kind: string; amount: string }>(
      db,
      owner,
      `select id, title, kind, amount from public.reward_tiers where project_id = $1 order by position`,
      [projectId],
    );
    knife = tiers.find(t => t.kind === 'reward' && Number(t.amount) === 280000)!.id;
    sheath = tiers.find(t => t.kind === 'addon' && Number(t.amount) === 95000)!.id;
    stone = tiers.find(t => t.kind === 'addon' && Number(t.amount) === 120000)!.id;
    erin = await createUser(db, 'Erin Cart');
  });

  test('one payment: 2 knives + a sheath + extra support; prices come from the database', async () => {
    const [before] = await as<{ raised_amount: string }>(
      db,
      anon,
      `select raised_amount from public.projects where id = $1`,
      [projectId],
    );
    const [{ id }] = await cart(
      erin,
      [
        { reward_id: knife, quantity: 2, amount: 1 }, // a price sent by the browser is ignored
        { reward_id: sheath, quantity: 1 },
      ],
      50_000,
    );
    const [c] = await as<{ amount: string; extra_amount: string }>(
      db,
      user(erin),
      `select amount, extra_amount from public.contributions where id = $1`,
      [id],
    );
    assert.equal(Number(c.amount), 2 * 280_000 + 95_000 + 50_000);
    assert.equal(Number(c.extra_amount), 50_000);
    const items = await as<{ quantity: number; unit_amount: string }>(
      db,
      user(erin),
      `select quantity, unit_amount from public.contribution_items where contribution_id = $1 order by unit_amount`,
      [id],
    );
    assert.deepEqual(
      items.map(i => [i.quantity, Number(i.unit_amount)]),
      [
        [1, 95_000],
        [2, 280_000],
      ],
    );
    const [after] = await as<{ raised_amount: string }>(
      db,
      anon,
      `select raised_amount from public.projects where id = $1`,
      [projectId],
    );
    assert.equal(Number(after.raised_amount) - Number(before.raised_amount), 705_000);
    // other people can't see Erin's items
    assert.equal(
      (await as(db, user(carol), `select * from public.contribution_items where contribution_id = $1`, [id])).length,
      0,
    );
  });

  test('the per-person limit counts every cart (2 + 2 > 3)', async () => {
    await rejects(cart(erin, [{ reward_id: knife, quantity: 2 }]), /reward_limit_per_backer/);
    await cart(erin, [{ reward_id: knife, quantity: 1 }]); // exactly 3
  });

  test('add-ons later are fine for someone who already has a main reward; not for others', async () => {
    await cart(erin, [{ reward_id: stone, quantity: 1 }]);
    const frank = await createUser(db, 'Frank Addon');
    await rejects(cart(frank, [{ reward_id: stone, quantity: 1 }]), /addon_needs_reward/);
    await db.query(`update public.projects set allow_addons_only = true where id = $1`, [projectId]);
    await cart(frank, [{ reward_id: stone, quantity: 1 }]);
    await db.query(`update public.projects set allow_addons_only = false where id = $1`, [projectId]);
  });

  test('stock: you cannot take more than what is left', async () => {
    await db.query(`update public.reward_tiers set quantity_limit = claimed_count + 1 where id = $1`, [stone]);
    await rejects(cart(erin, [{ reward_id: stone, quantity: 2 }]), /reward_sold_out/);
    await cart(erin, [{ reward_id: stone, quantity: 1 }]);
    await rejects(cart(erin, [{ reward_id: stone, quantity: 1 }]), /reward_sold_out/);
  });

  test('bad carts are refused', async () => {
    await rejects(cart(erin, [{ reward_id: knife, quantity: 0 }]), /cart_invalid/);
    await rejects(cart(erin, [{ reward_id: 'not-a-uuid', quantity: 1 }]), /cart_invalid/);
    await rejects(cart(erin, [], 5_000), /amount_below_minimum/); // below the project minimum
    const [{ id: other }] = await as<{ id: string }>(
      db,
      owner,
      `select r.id from public.reward_tiers r join public.projects p on p.id = r.project_id
       where p.slug = 'silkroad-samarkand-ikat-weavers' and r.kind = 'reward' limit 1`,
    );
    await rejects(cart(erin, [{ reward_id: other, quantity: 1 }]), /reward_not_found/); // another project's reward
    await rejects(
      as(db, anon, `select public.contribute_cart($1, '[]'::jsonb, 100000)`, [projectId]),
      /permission denied|not_signed_in/,
    );
  });

  test('support only (no reward) works as a cart with an extra amount', async () => {
    const [{ id }] = await cart(erin, [], 100_000);
    const items = await as(db, user(erin), `select * from public.contribution_items where contribution_id = $1`, [id]);
    assert.equal(items.length, 0);
  });

  test('old pledges with a reward were turned into items', async () => {
    const [{ n }] = await as<{ n: number }>(
      db,
      owner,
      `select count(*)::int as n from public.contributions c
       where c.reward_tier_id is not null
         and not exists (select 1 from public.contribution_items i where i.contribution_id = c.id)`,
    );
    assert.equal(n, 0);
  });
});

describe('owner alerts and /getreports', () => {
  test('admins get a "new user" notification with name and email', async () => {
    const newbie = await createUser(db, 'Nora Newcomer');
    const rows = await as<{ data: { email: string; name: string } }>(
      db,
      user(admin),
      `select data from public.notifications where type = 'user_signed_up' and data->>'user_id' = $1`,
      [newbie],
    );
    assert.equal(rows.length, 1);
    assert.equal(rows[0].data.name, 'Nora Newcomer');
    assert.match(rows[0].data.email, /@test\.local$/);
    // members don't get it
    const forBob = await as(
      db,
      user(bob),
      `select 1 from public.notifications where type = 'user_signed_up' and user_id = $1`,
      [bob],
    );
    assert.equal(forBob.length, 0);
  });

  test('/getreports answers only a chat linked to an admin', async () => {
    const link = async (who: string, chat: number) => {
      const [{ code }] = await as<{ code: string }>(db, user(who), `select public.telegram_link_token() as code`);
      await as(db, owner, `select public.telegram_link_chat($1, $2)`, [code, chat]);
    };
    await link(admin, 9001);
    await link(bob, 9002);
    const report = await as<{ email: string; contributed: string; contributions: number }>(
      db,
      owner,
      `select * from public.telegram_admin_report(9001)`,
    );
    assert.ok(report.length > 5);
    assert.ok(report.every(r => r.email.includes('@')));
    assert.ok(report.some(r => Number(r.contributed) > 0 && r.contributions > 0));
    await rejects(as(db, owner, `select * from public.telegram_admin_report(9002)`), /admin_only/); // Bob isn't an admin
    await rejects(as(db, owner, `select * from public.telegram_admin_report(12345)`), /admin_only/); // unknown chat
    await rejects(as(db, user(admin), `select * from public.telegram_admin_report(9001)`), /permission denied/); // not from the website
  });
});

describe('who is raising the money (organiser type)', () => {
  let gulnora: string; // a student with only a passport

  before(async () => {
    gulnora = await createUser(db, 'Gulnora Student');
    await as(db, user(gulnora), `insert into public.founder_profiles (user_id, display_name) values ($1, 'Gulnora')`, [
      gulnora,
    ]);
  });

  test('anyone may run Musharakah, but a non-profit runs donations only', async () => {
    for (const model of ['equity', 'reward']) {
      await rejects(
        createDraft(gulnora, `bad-ngo-${model}`, { organizer: 'ngo', model }),
        /projects_model_fits_organizer/,
      );
    }
    await createDraft(gulnora, 'ok-individual-equity', { model: 'equity', organizer: 'individual' });
    await createDraft(gulnora, 'ok-yatt-equity', { model: 'equity', organizer: 'yatt' });
  });

  test('submitting needs the organiser type, but no uploaded ID', async () => {
    const noType = await createDraft(gulnora, 'no-type');
    await db.query(`update public.projects set organizer_type = null where id = $1`, [noType]);
    await rejects(as(db, user(gulnora), `select public.submit_project($1)`, [noType]), /organizer_type_missing/);

    const noUpload = await createDraft(gulnora, 'no-upload', { identity: false });
    await as(db, user(gulnora), `select public.submit_project($1)`, [noUpload]);
  });

  test('a registered organiser types its number (no certificate upload)', async () => {
    const id = await createDraft(gulnora, 'gulnora-yatt', { organizer: 'yatt' });
    await rejects(as(db, user(gulnora), `select public.submit_project($1)`, [id]), /registration_number_missing/);
    await as(
      db,
      user(gulnora),
      `update public.founder_profiles set registration_number = 'YaTT 777' where user_id = $1`,
      [gulnora],
    );
    await as(db, user(gulnora), `select public.submit_project($1)`, [id]);
    await as(db, user(gulnora), `update public.founder_profiles set registration_number = null where user_id = $1`, [
      gulnora,
    ]);
  });

  test('an individual applies without a company, but is paid only after registering', async () => {
    const id = await createDraft(gulnora, 'gulnora-passport-only');
    await as(db, user(gulnora), `select public.submit_project($1)`, [id]);
    await evaluateAndApprove(id);
    await db.query(`update public.projects set status = 'funded' where id = $1`, [id]);
    const [{ id: milestoneId }] = await as<{ id: string }>(
      db,
      anon,
      `select id from public.milestones where project_id = $1 order by position limit 1`,
      [id],
    );
    await as(
      db,
      user(gulnora),
      `select public.submit_milestone($1, 'Stage one is done; photos and receipts attached.')`,
      [milestoneId],
    );
    await rejects(
      as(db, user(admin), `select public.admin_approve_milestone($1)`, [milestoneId]),
      /registration_required_before_payout/,
    );
    await as(
      db,
      user(gulnora),
      `update public.founder_profiles set registration_number = 'YaTT 5550001' where user_id = $1`,
      [gulnora],
    );
    await as(db, user(admin), `select public.admin_approve_milestone($1)`, [milestoneId]);
  });
});

describe('identity without uploading a passport', () => {
  let timur: string;

  before(async () => {
    timur = await createUser(db, 'Timur Founder');
    await as(db, user(timur), `insert into public.founder_profiles (user_id, display_name) values ($1, 'Timur')`, [
      timur,
    ]);
  });

  test('an admin approves only once the identity is confirmed', async () => {
    const id = await createDraft(timur, 'timur-unchecked', { identity: false });
    await as(db, user(timur), `select public.submit_project($1)`, [id]);
    await rejects(evaluateAndApprove(id), /identity_not_confirmed/);
    await as(db, user(admin), `select public.admin_confirm_identity($1, 'Video call, face matched the profile')`, [
      timur,
    ]);
    await as(db, user(admin), `select public.admin_review_project($1, 'approve')`, [id]);
  });

  test('only the founder and admins can see it, and nobody writes it directly', async () => {
    const read = (who: string) =>
      as(db, user(who), `select * from public.founder_identities where user_id = $1`, [timur]);
    assert.equal((await read(timur)).length, 1);
    assert.equal((await read(admin)).length, 1);
    assert.equal((await read(bob)).length, 0);
    await rejects(
      as(db, user(bob), `insert into public.founder_identities (user_id, method) values ($1, 'oneid')`, [bob]),
      /permission denied/,
    );
    await rejects(as(db, user(bob), `select public.admin_confirm_identity($1)`, [bob]), /admin|permission/);
    await rejects(as(db, user(admin), `select public.admin_confirm_identity($1)`, [admin]), /cannot_verify_self/);
  });

  test('a video call never replaces a OneID check', async () => {
    const zara = await createUser(db, 'Zara OneID');
    await db.query(
      `insert into public.founder_identities (user_id, method, pinfl) values ($1, 'oneid', '12345678901234')`,
      [zara],
    );
    await as(db, user(admin), `select public.admin_confirm_identity($1, 'call')`, [zara]);
    await as(db, user(admin), `select public.admin_clear_identity($1)`, [zara]);
    const [row] = await as<{ method: string }>(
      db,
      user(admin),
      `select method::text from public.founder_identities where user_id = $1`,
      [zara],
    );
    assert.equal(row.method, 'oneid');
  });
});

describe('Musharakah: pledge now, pay after registration', () => {
  let sardor: string; // a founder with no company yet
  let projectId: string;

  async function equityTerms(ownerId: string, id: string) {
    await as(
      db,
      user(ownerId),
      `insert into public.equity_terms (project_id, contract_type, investor_profit_share_pct, min_investment, distribution_schedule, exit_horizon_years) values ($1, 'musharakah', 20, 1000000, 'quarterly', 5)`,
      [id],
    );
  }
  async function liveStartup(slug: string) {
    const id = await createDraft(sardor, slug, { model: 'equity', organizer: 'individual' });
    await equityTerms(sardor, id);
    await as(db, user(sardor), `select public.submit_project($1)`, [id]);
    await evaluateAndApprove(id);
    return id;
  }
  async function statuses(id: string) {
    const { rows } = await db.query<{ status: string }>(
      `select status::text from public.contributions where project_id = $1 order by created_at, amount desc`,
      [id],
    );
    return rows.map(r => r.status);
  }
  async function project(id: string) {
    const { rows } = await db.query<{
      status: string;
      raised_amount: string;
      registration_due_at: string | null;
      organizer_type: string;
    }>(
      `select status::text, raised_amount::text, registration_due_at, organizer_type::text from public.projects where id = $1`,
      [id],
    );
    return rows[0];
  }
  const close = () => db.query(`select private.close_ended_projects()`);
  const endNow = (id: string) =>
    db.query(`update public.projects set ends_at = now() - interval '1 minute' where id = $1`, [id]);

  before(async () => {
    sardor = await createUser(db, 'Sardor Startup');
    await as(db, user(sardor), `insert into public.founder_profiles (user_id, display_name) values ($1, 'Sardor')`, [
      sardor,
    ]);
    projectId = await liveStartup('sardor-startup');
  });

  test('investing is a pledge: it counts toward the goal, but no money is taken', async () => {
    await as(db, user(bob), `select public.contribute($1, 6000000, 'click')`, [projectId]);
    await as(db, user(carol), `select public.contribute($1, 4000000, 'payme')`, [projectId]);
    assert.deepEqual(await statuses(projectId), ['pledged', 'pledged']);
    assert.equal((await project(projectId)).raised_amount, '10000000');
    const { rows } = await db.query<{ n: number }>(
      `select count(*)::int as n from public.contributions where project_id = $1 and charge_authorized_at is not null`,
      [projectId],
    );
    assert.equal(rows[0].n, 2, 'each pledge is a permission to charge the card later');
  });

  test('paying is not possible before the company is registered', async () => {
    const [{ id }] = await as<{ id: string }>(
      db,
      user(bob),
      `select id from public.contributions where project_id = $1 and backer_id = $2`,
      [projectId, bob],
    );
    await rejects(as(db, user(bob), `select public.pay_pledge($1, 'click')`, [id]), /pledge_payment_not_open/);
  });

  test('goal reached → the founder gets 60 days to register', async () => {
    await endNow(projectId);
    await close();
    const p = await project(projectId);
    assert.equal(p.status, 'funded');
    const days = (new Date(p.registration_due_at!).getTime() - Date.now()) / 86_400_000;
    assert.ok(days > 59 && days <= 60);
  });

  test('an admin confirms the MChJ; cards are charged the day after the registration deadline', async () => {
    await rejects(
      as(db, user(admin), `select public.admin_confirm_registration($1)`, [projectId]),
      /registration_number_missing/,
    );
    await rejects(as(db, user(bob), `select public.admin_confirm_registration($1)`, [projectId]), /admin|permission/);
    await as(
      db,
      user(sardor),
      `update public.founder_profiles set registration_number = 'MChJ 312345678' where user_id = $1`,
      [sardor],
    );
    const told = await as(
      db,
      user(admin),
      `select 1 from public.notifications where user_id = $1 and type = 'project_submitted' and data->>'registration' = 'true' and data->>'project_id' = $2`,
      [admin, projectId],
    );
    assert.equal(told.length, 1, 'admins hear that the company number was added');
    await as(db, user(admin), `select public.admin_confirm_registration($1)`, [projectId]);
    assert.equal((await project(projectId)).organizer_type, 'mchj');
    const { rows } = await db.query<{ ok: boolean }>(
      `select charge_at = registration_due_at + interval '1 day' as ok from public.projects where id = $1`,
      [projectId],
    );
    assert.ok(rows[0].ok);
    const due = await as(
      db,
      user(bob),
      `select 1 from public.notifications where user_id = $1 and type = 'pledge_payment_due' and data->>'project_id' = $2`,
      [bob, projectId],
    );
    assert.equal(due.length, 1);
  });

  test('charge day: authorised cards are charged; a failed charge gets 7 days, then drops out', async () => {
    const [{ id: milestoneId }] = await as<{ id: string }>(
      db,
      anon,
      `select id from public.milestones where project_id = $1 order by position limit 1`,
      [projectId],
    );
    await as(
      db,
      user(sardor),
      `select public.submit_milestone($1, 'Stage one is done; photos and receipts attached.')`,
      [milestoneId],
    );
    await rejects(
      as(db, user(admin), `select public.admin_approve_milestone($1)`, [milestoneId]),
      /pledges_not_paid_yet/,
    );

    // Before the charge day nothing happens and nobody can pay by hand.
    await close();
    assert.deepEqual(await statuses(projectId), ['pledged', 'pledged']);
    const [{ id: carolPledge }] = await as<{ id: string }>(
      db,
      user(carol),
      `select id from public.contributions where project_id = $1 and backer_id = $2`,
      [projectId, carol],
    );
    await rejects(
      as(db, user(carol), `select public.pay_pledge($1, 'click')`, [carolPledge]),
      /pledge_payment_not_open/,
    );

    // Carol's card charge fails (simulated by removing her permission); Bob's goes through.
    await db.query(`update public.contributions set charge_authorized_at = null where id = $1`, [carolPledge]);
    await db.query(`update public.projects set charge_at = now() - interval '1 minute' where id = $1`, [projectId]);
    await close();
    assert.deepEqual(await statuses(projectId), ['confirmed', 'pledged']);
    await close(); // runs only once per project
    assert.deepEqual(await statuses(projectId), ['confirmed', 'pledged']);

    await rejects(as(db, user(bob), `select public.pay_pledge($1, 'click')`, [carolPledge]), /contribution_not_found/);
    await as(db, user(carol), `select public.pay_pledge($1, 'uzcard')`, [carolPledge]);
    await rejects(as(db, user(carol), `select public.pay_pledge($1, 'uzcard')`, [carolPledge]), /pledge_not_open/);
    assert.deepEqual(await statuses(projectId), ['confirmed', 'confirmed']);
    await as(db, user(admin), `select public.admin_approve_milestone($1)`, [milestoneId]);
  });

  test('a pledge not paid within 7 days of a failed charge is dropped from the total', async () => {
    const id = await liveStartup('sardor-unpaid');
    await as(db, user(bob), `select public.contribute($1, 7000000, 'click')`, [id]);
    await as(db, user(carol), `select public.contribute($1, 3000000, 'click')`, [id]);
    await endNow(id);
    await close();
    await as(db, user(admin), `select public.admin_confirm_registration($1)`, [id]);
    await db.query(
      `update public.contributions set charge_authorized_at = null where project_id = $1 and backer_id = $2`,
      [id, carol],
    );
    await db.query(`update public.projects set charge_at = now() - interval '1 minute' where id = $1`, [id]);
    await close();
    await db.query(`update public.projects set pledge_payment_due_at = now() - interval '1 minute' where id = $1`, [
      id,
    ]);
    await close();
    assert.deepEqual(await statuses(id), ['confirmed', 'cancelled']);
    assert.equal((await project(id)).raised_amount, '7000000');
  });

  test('no registration in 60 days → the campaign closes and every pledge is cancelled', async () => {
    const id = await liveStartup('sardor-second-try');
    await as(db, user(bob), `select public.contribute($1, 10000000, 'click')`, [id]);
    await endNow(id);
    await close();
    await db.query(`update public.projects set registration_due_at = now() - interval '1 minute' where id = $1`, [id]);
    await close();
    assert.equal((await project(id)).status, 'unsuccessful');
    assert.deepEqual(await statuses(id), ['cancelled']);
  });

  test('a campaign that misses its goal cancels pledges instead of refunding', async () => {
    const id = await liveStartup('sardor-too-small');
    await as(db, user(bob), `select public.contribute($1, 2000000, 'click')`, [id]);
    await endNow(id);
    await close();
    assert.equal((await project(id)).status, 'unsuccessful');
    assert.deepEqual(await statuses(id), ['cancelled']);
  });

  test('a company runs Musharakah as before: investors pay straight away', async () => {
    const id = await createDraft(alice, 'alice-company-equity', { model: 'equity', organizer: 'mchj' });
    await equityTerms(alice, id);
    await as(db, user(alice), `select public.submit_project($1)`, [id]);
    await evaluateAndApprove(id);
    await as(db, user(bob), `select public.contribute($1, 2000000, 'click')`, [id]);
    assert.deepEqual(await statuses(id), ['confirmed']);
  });
});

describe('donation minimum', () => {
  const minOf = async (id: string) => {
    const { rows } = await db.query<{ m: string }>(
      `select min_contribution::text as m from public.projects where id = $1`,
      [id],
    );
    return rows[0].m;
  };

  test('every donation project stays at 10,000; other models keep their own', async () => {
    const id = await createDraft(alice, 'donation-minimum', { model: 'reward' });
    await as(db, user(alice), `update public.projects set min_contribution = 500000 where id = $1`, [id]);
    assert.equal(await minOf(id), '500000');
    await as(db, user(alice), `update public.projects set model = 'donation' where id = $1`, [id]);
    assert.equal(await minOf(id), '10000');
    await as(db, user(alice), `update public.projects set min_contribution = 30000000 where id = $1`, [id]);
    assert.equal(await minOf(id), '10000');
  });
});

describe('donation focus', () => {
  let fund: string;
  const donationOnly = (on: boolean) =>
    db.query(`update private.settings set value = $1 where key = 'donation_only'`, [on ? 'true' : 'false']);

  before(async () => {
    fund = await createUser(db, 'Mehr Fund');
    await as(
      db,
      user(fund),
      `insert into public.founder_profiles (user_id, display_name, registration_number) values ($1, 'Mehr', 'NNT-0042')`,
      [fund],
    );
  });

  test('while donation-only is on, only donation projects can be submitted; live ones keep running', async () => {
    const live = await createDraft(alice, 'focus-live-reward', { model: 'reward', target: 5_000_000 });
    await as(db, owner, `insert into public.reward_tiers (project_id, title, amount) values ($1, 'Thanks', 100000)`, [
      live,
    ]);
    await as(db, user(alice), `select public.submit_project($1)`, [live]);
    await evaluateAndApprove(live);

    await donationOnly(true);
    try {
      const reward = await createDraft(alice, 'focus-reward', { model: 'reward', target: 5_000_000 });
      await as(db, owner, `insert into public.reward_tiers (project_id, title, amount) values ($1, 'Mug', 100000)`, [
        reward,
      ]);
      await rejects(as(db, user(alice), `select public.submit_project($1)`, [reward]), /donation_only/);
      const donation = await createDraft(alice, 'focus-donation');
      await as(db, user(alice), `select public.submit_project($1)`, [donation]);
      // The reward project approved earlier still takes backers.
      await as(db, user(bob), `select public.contribute($1, 100000, 'click')`, [live]);
    } finally {
      await donationOnly(false);
    }
  });

  test('an admin marks a fund as verified; founders cannot, and a new registration number clears it', async () => {
    const id = await createDraft(fund, 'mehr-winter-coats', { organizer: 'ngo' });
    const notFund = await createDraft(alice, 'alice-not-a-fund');
    await rejects(as(db, user(admin), `select public.admin_verify_fund($1)`, [notFund]), /not_a_fund/);
    await rejects(
      as(db, user(fund), `update public.projects set fund_verified_at = now() where id = $1`, [id]),
      /permission denied/,
    );
    await rejects(as(db, user(fund), `select public.admin_verify_fund($1)`, [id]), /admin/);

    await as(db, user(admin), `select public.admin_verify_fund($1)`, [id]);
    const [p] = await as<{ n: string; v: boolean }>(
      db,
      owner,
      `select fund_registration_number as n, fund_verified_at is not null as v from public.projects where id = $1`,
      [id],
    );
    assert.deepEqual(p, { n: 'NNT-0042', v: true });

    await as(db, user(fund), `update public.founder_profiles set registration_number = 'NNT-9999' where user_id = $1`, [
      fund,
    ]);
    const [after] = await as<{ v: boolean }>(
      db,
      owner,
      `select fund_verified_at is not null as v from public.projects where id = $1`,
      [id],
    );
    assert.equal(after.v, false);
  });

  test('a tip for Fundy is saved apart from the donation and only on donation projects', async () => {
    const id = await createDraft(fund, 'mehr-school-books', { organizer: 'ngo' });
    await as(db, user(fund), `select public.submit_project($1)`, [id]);
    await evaluateAndApprove(id);
    await as(db, user(bob), `select public.contribute($1, 50000, 'click', null, false, 5000)`, [id]);
    const [row] = await as<{ amount: string; tip: string; raised: string }>(
      db,
      owner,
      `select c.amount::text as amount, c.tip_amount::text as tip, p.raised_amount::text as raised
       from public.contributions c join public.projects p on p.id = c.project_id where c.project_id = $1`,
      [id],
    );
    assert.deepEqual(row, { amount: '50000', tip: '5000', raised: '50000' });
    await rejects(
      as(db, user(bob), `select public.contribute($1, 50000, 'click', null, false, -1)`, [id]),
      /tip_invalid/,
    );

    const equity = await createDraft(alice, 'alice-equity-tip', { model: 'equity', organizer: 'mchj' });
    await as(
      db,
      owner,
      `insert into public.equity_terms (project_id, investor_profit_share_pct, min_investment, exit_horizon_years) values ($1, 20, 100000, 3)`,
      [equity],
    );
    await as(db, user(alice), `select public.submit_project($1)`, [equity]);
    await evaluateAndApprove(equity);
    await rejects(
      as(db, user(bob), `select public.contribute($1, 500000, 'click', null, false, 5000)`, [equity]),
      /tip_only_for_donations/,
    );
  });

  test('a stage report carries the amount spent and the founder’s own receipt photos', async () => {
    const id = await createDraft(fund, 'mehr-clinic-beds', { organizer: 'ngo' });
    await as(db, user(fund), `select public.submit_project($1)`, [id]);
    await evaluateAndApprove(id);
    await db.query(`update public.projects set status = 'funded' where id = $1`, [id]);
    const [{ id: stage }] = await as<{ id: string }>(
      db,
      anon,
      `select id from public.milestones where project_id = $1 order by position limit 1`,
      [id],
    );
    const evidence = 'Bought 12 beds from Toshkent Mebel, delivered 3 May.';
    await rejects(
      as(db, user(fund), `select public.submit_milestone($1, $2, 5000000, $3)`, [stage, evidence, [`${alice}/x.jpg`]]),
      /receipt_not_yours/,
    );
    await as(db, user(fund), `select public.submit_milestone($1, $2, 5800000, $3)`, [
      stage,
      evidence,
      [`${fund}/receipts/a.jpg`, `${fund}/receipts/b.jpg`],
    ]);
    const [m] = await as<{ spent: string; n: number }>(
      db,
      anon,
      `select spent_amount::text as spent, cardinality(receipt_paths) as n from public.milestones where id = $1`,
      [stage],
    );
    assert.deepEqual(m, { spent: '5800000', n: 2 });
  });
});
