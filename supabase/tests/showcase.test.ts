/**
 * The hackathon showcase loads next to real data, is clearly marked, stays out of the
 * real-user reports and can be removed completely.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { before, describe, test } from 'node:test';
import type { PGlite } from '@electric-sql/pglite';
import { as, createTestDb, createUser } from './db.ts';

const script = (name: string) => readFileSync(join(import.meta.dirname, '..', 'scripts', name), 'utf8');
const one = async (db: PGlite, sql: string) => (await db.query<{ n: number }>(sql)).rows[0].n;

describe('hackathon showcase', () => {
  let db: PGlite;
  let admin: string;
  let fan: string;
  let realProject: string;

  before(async () => {
    db = await createTestDb();
    admin = await createUser(db, 'Real Admin', { admin: true });
    fan = await createUser(db, 'Real Backer');
    const founder = await createUser(db, 'Real Founder');
    const [p] = await as<{ id: string }>(
      db,
      user(founder),
      `insert into public.projects (owner_id, slug, model, organizer_type, category_id, target_amount)
       values ($1, 'real-project', 'reward', 'individual', 'technology', 5000000) returning id`,
      [founder],
    );
    realProject = p.id;
    await db.query(
      `update public.projects set status = 'active', starts_at = now(), ends_at = now() + interval '30 days',
         raised_amount = 777000, backer_count = 1 where id = $1`,
      [realProject],
    );
    await db.query(
      `insert into public.contributions (project_id, backer_id, amount, payment_method, extra_amount)
       values ($1, $2, 777000, 'click', 123)`,
      [realProject, fan],
    );
    await db.query(`delete from public.notifications`);
    await db.exec(script('showcase.sql'));
  });

  const user = (userId: string) => ({ role: 'authenticated', userId }) as const;

  test('adds exactly 8 marked projects and 97 demo accounts, and no admin', async () => {
    assert.equal(await one(db, `select count(*)::int as n from public.projects where is_demo`), 8);
    assert.equal(await one(db, `select count(*)::int as n from auth.users where email like '%@demo.fundy.uz'`), 97);
    assert.equal(await one(db, `select count(*)::int as n from public.profiles where role = 'admin'`), 1);
    assert.equal(await one(db, `select count(*)::int as n from public.projects where not is_demo`), 1);
  });

  test('project totals add up and the real project is untouched', async () => {
    const mismatched = await one(
      db,
      `select count(*)::int as n from public.projects p
       where p.is_demo and p.raised_amount <> (select coalesce(sum(amount), 0) from public.contributions c where c.project_id = p.id)`,
    );
    assert.equal(mismatched, 0);
    const { rows } = await db.query<{ raised: string; extra: string }>(
      `select p.raised_amount::text as raised, c.extra_amount::text as extra
       from public.projects p join public.contributions c on c.project_id = p.id where p.id = $1`,
      [realProject],
    );
    assert.deepEqual(rows, [{ raised: '777000', extra: '123' }]);
  });

  test('nobody is notified, and founders cannot mark or unmark a project', async () => {
    assert.equal(await one(db, `select count(*)::int as n from public.notifications`), 0);
    await assert.rejects(
      as(db, user(admin), `update public.projects set is_demo = true where id = $1`, [realProject]),
      /permission denied/,
    );
  });

  test('removal leaves only the real data', async () => {
    await db.exec(script('showcase-remove.sql'));
    assert.equal(await one(db, `select count(*)::int as n from public.projects where is_demo`), 0);
    assert.equal(await one(db, `select count(*)::int as n from auth.users where email like '%@demo.fundy.uz'`), 0);
    assert.equal(await one(db, `select count(*)::int as n from public.projects`), 1);
    assert.equal(await one(db, `select count(*)::int as n from public.profiles`), 3);
    assert.equal(await one(db, `select count(*)::int as n from public.contributions`), 1);
  });
});
