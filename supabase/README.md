# Fundy database (Supabase)

Everything about the database lives in this folder and is version-controlled.

```
supabase/
  config.toml                 Supabase CLI settings
  migrations/                 The database, built step by step (run in order)
    …01_schema.sql            Tables, allowed values, indexes
    …02_reference_data.sql    Categories and Uzbekistan's 14 regions (all environments)
    …03_functions.sql         Logic: contributions, review, admin actions, triggers
    …04_security.sql          Who can read / write what (grants + Row Level Security)
    …05_storage.sql           File buckets: project-images, avatars, project-documents
    …06_scheduled_jobs.sql    Closes ended campaigns every 15 minutes
  seed.sql                    Demo data — GENERATED, don't edit (see below)
  scripts/generate-seed.ts    Builds seed.sql from src/data/mockProjects.ts
  tests/                      Automated checks (run without Supabase or Docker)
```

## The data model

| Area      | Tables                                                                                                                                               |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| People    | `profiles` (every user), `founder_profiles` (people who launch projects)                                                                             |
| Projects  | `projects`, `project_translations` (uz/ru/en text), `budget_items`, `milestones`, `reward_tiers`, `equity_terms`, `evaluations`, `project_documents` |
| Community | `project_updates`, `update_likes`, `comments` (with replies), `follows` (saved projects)                                                             |
| Money     | `contributions` (simulated in the demo)                                                                                                              |
| System    | `notifications`, `reports`, `audit_log`, `categories`, `regions`                                                                                     |

**Rules that matter:**

- Money is whole so'm in `bigint` — never decimals.
- A project's `raised_amount`, `backer_count` and `status` can **only** change through database functions. The browser can't fake them.
- Contributions are only created by `contribute()`, which checks the project is live, the minimum amount, reward stock, and that founders don't back themselves.
- Drafts are visible only to their owner and admins. Owners can edit only while the project is a `draft` or `changes_requested`.
- Every admin action (`admin_*` functions) is written to `audit_log`.

**Project status flow:**

```
draft ──submit_project()──▶ pending_review ──admin approve──▶ active ──deadline──▶ funded ──all milestones approved──▶ completed
  ▲                              │                                           └──▶ unsuccessful
  └──── changes_requested ◀──────┤ (admin, with a reason)
                                 └──▶ rejected
```

**Functions the app calls** (`supabase.rpc('name', { … })`): `contribute`, `submit_project`, `submit_milestone`, and for admins `admin_review_project`, `admin_save_evaluation`, `admin_set_featured`, `admin_verify_founder`, `admin_approve_milestone`, `admin_set_hidden`, `admin_resolve_report`, `admin_set_user_blocked`, `admin_set_role`.
Errors come back as short keys (e.g. `amount_below_minimum`) for the app to translate.

## Commands

| Command                    | What it does                                             |
| -------------------------- | -------------------------------------------------------- |
| `npm run db:test`          | Build a throw-away database in memory and run all checks |
| `npm run db:seed:generate` | Regenerate `seed.sql` after changing the demo projects   |
| `npm run db:login`         | Log the Supabase CLI into your account (once)            |
| `npm run db:link`          | Connect this folder to your Supabase project (once)      |
| `npm run db:push`          | Apply new migrations to the linked project               |
| `npm run db:seed:push`     | Apply migrations **and** load demo data                  |
| `npm run db:types`         | Generate TypeScript types from the live database         |

## Connecting a Supabase project (first time)

1. Create a project at [supabase.com](https://supabase.com). Choose the **Frankfurt (eu-central-1)** region, which is closest to Uzbekistan. Save the database password somewhere safe.
2. In this folder, run each step and follow the prompts:
   ```bash
   npm run db:login
   npm run db:link
   npm run db:seed:push
   npm run db:types
   ```
3. Copy `.env.example` to `.env.local` and fill in the Project URL and the **publishable** key from _Project Settings → API Keys_.
   Never put the secret / `service_role` key in the website.
4. Make yourself an admin. Sign up on the site first (Phase 2), then in Supabase _SQL Editor_:
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'you@example.com');
   ```

## Changing the database later

Never edit an old migration once it's been pushed. Instead:

```bash
npx supabase migration new describe_the_change   # creates a new file in migrations/
# write the SQL, add grants + policies for any new table, add a test
npm run db:test
npm run db:push
```
