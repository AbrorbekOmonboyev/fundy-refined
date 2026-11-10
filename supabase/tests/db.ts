/**
 * Test helper: builds a fresh in-memory Postgres (PGlite) with the Supabase
 * stand-in, all migrations and (optionally) the demo seed — then lets tests
 * run queries as an anonymous visitor, a signed-in user, or the database owner.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PGlite } from '@electric-sql/pglite';

const SUPABASE_DIR = join(import.meta.dirname, '..');

/**
 * donationOnly: the live site only accepts donation projects (migration 32). Most tests
 * still cover the other models, so it is off unless a test asks for it.
 */
export async function createTestDb({ seed = false, donationOnly = false } = {}) {
  const db = new PGlite();
  await db.exec(readFileSync(join(import.meta.dirname, 'supabase-stub.sql'), 'utf8'));

  const migrationsDir = join(SUPABASE_DIR, 'migrations');
  for (const file of readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()) {
    try {
      await db.exec(readFileSync(join(migrationsDir, file), 'utf8'));
    } catch (error) {
      throw new Error(`Migration ${file} failed: ${(error as Error).message}`, { cause: error });
    }
  }

  if (!donationOnly) await db.exec(`update private.settings set value = 'false' where key = 'donation_only'`);

  if (seed) {
    try {
      await db.exec(readFileSync(join(SUPABASE_DIR, 'seed.sql'), 'utf8'));
    } catch (error) {
      throw new Error(`seed.sql failed: ${(error as Error).message}`, { cause: error });
    }
  }

  return db;
}

type Who = { role: 'anon' } | { role: 'authenticated'; userId: string } | { role: 'owner' };

/**
 * Run SQL as a given user, the same way Supabase does for an API request:
 * switch to the anon/authenticated role and set the JWT's user id.
 * Each call runs in its own transaction, rolled back on error.
 */
export async function as<T = Record<string, unknown>>(db: PGlite, who: Who, sql: string, params: unknown[] = []) {
  return db.transaction(async tx => {
    if (who.role !== 'owner') {
      const claims = who.role === 'authenticated' ? { sub: who.userId, role: 'authenticated' } : { role: 'anon' };
      await tx.query(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify(claims)]);
      await tx.exec(`set local role ${who.role}`);
    }
    const result = await tx.query<T>(sql, params);
    return result.rows;
  });
}

/** Create a user the way Supabase sign-up does (the profile is created by trigger). */
export async function createUser(db: PGlite, name: string, opts: { admin?: boolean } = {}) {
  const id = crypto.randomUUID();
  await db.query(`insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3)`, [
    id,
    `${id}@test.local`,
    JSON.stringify({ full_name: name, language: 'en' }),
  ]);
  if (opts.admin) await db.query(`update public.profiles set role = 'admin' where id = $1`, [id]);
  return id;
}
