# Architecture

A developer's map of Fundy. For what the product is, see [PRODUCT.md](PRODUCT.md); for setup and commands, see [README.md](README.md).

## Overview

- **Frontend:** React 19, Vite, TypeScript, Tailwind v4, React Router. A single-page app; `vercel.json` rewrites every route to `index.html`.
- **Server state:** TanStack Query (30 s stale time, one retry). Auth state lives in `AuthProvider` (`src/features/auth`).
- **Backend:** Supabase: Postgres, auth (PKCE), storage, realtime. There is almost no custom server code; the database enforces the rules.
- **Hosting:** Vercel. Two small serverless functions in `api/` (link previews, sitemap).
- **Edge functions:** `supabase/functions/oneid` and `supabase/functions/telegram`. They deploy separately to Supabase and are **not** part of the Vercel build.
- **Android:** `android/` is a Trusted Web Activity wrapping the website, not a separate app. `src/lib/appMode.ts` detects it.
- **Languages:** Uzbek (Latin) first, then Russian and English, via `react-i18next` (`src/i18n/locales/*.json`). Uzbek Cyrillic is derived from Latin in `src/lib/script.ts`.
- **Monitoring:** Sentry is optional and loads only when `VITE_SENTRY_DSN` is set. Vercel Analytics is on.

## Code layout

| Path                    | What it holds                                                                                                                                                   |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/`              | App shell, `routes.ts` (every URL in one place; use `paths.x`, never hard-code), scroll handling, lazy page loader                                              |
| `src/pages/`            | One file per route                                                                                                                                              |
| `src/features/<domain>` | The real logic, per domain: `auth`, `projects`, `wizard`, `cart`, `admin`, `notifications`, `community`, `education`, `contact`, `feedback`, `reference`, `app` |
| `src/components/`       | Shared UI (`ui/`, `layout/`, `ProjectCard`, …)                                                                                                                  |
| `src/lib/`              | Supabase client, money formatting, theme, monitoring, `focus.ts`, generated `database.types.ts`                                                                 |
| `src/content/`          | Long legal and info page text in three languages                                                                                                                |
| `api/`                  | Vercel functions: `preview.ts` (link previews for share bots), `sitemap.ts`                                                                                     |
| `supabase/migrations/`  | Schema, security rules and functions (35 migrations)                                                                                                            |
| `supabase/tests/`       | Database tests (PGlite, no account needed)                                                                                                                      |
| `supabase/scripts/`     | Seed, showcase and email-template generators, live check                                                                                                        |

## The database is where the rules live

- **Money and state changes go through database functions** (`contribute`, `contribute_cart`, `pay_pledge`, `admin_approve_milestone`, …). The browser cannot write totals directly.
- **Default-deny privileges:** migration 4 revokes all default privileges on tables, sequences and functions for `anon` and `authenticated`. Every new function needs an explicit `grant execute`. A "permission denied" after adding a function usually means a missing grant.
- **`security definer` functions** set `search_path` (checked across all migrations).
- **Storage:** public buckets (`project-images`, `avatars`) accept uploads only into the uploader's own folder; `project-documents` is private (owner and admins only).
- **Never edit an old migration.** Add a new numbered file, then run `npm run db:test` and `npm run db:types`.

## Gotchas

1. **`DONATION_ONLY`** is set in two places that must change together: `src/lib/focus.ts` and the `donation_only` setting in the database (migration 32). Reward and Musharakah (equity) code still exists but is hidden.
2. **Demo data:** projects marked `is_demo` are sample content and must never be presented as real. Several migrations (14, 18, 22, 31) are demo content; migration 24 reset for real projects.
3. **Payments are simulated.** No real payment provider is integrated yet.
4. **Environment variables:** only `VITE_`-prefixed variables reach the browser. Never put the service-role key in one. See `.env.example`.
5. **Edge functions deploy separately:** `npx supabase functions deploy telegram --no-verify-jwt` and `npx supabase functions deploy oneid --no-verify-jwt`.
6. **OneID** is built but off until OneID keys exist (`docs/ONEID.md`, `VITE_ONEID_ENABLED`). Known gap to fix before enabling: the callback `state` is signed but not tied to the browser that started the flow.
7. **Telegram** has two jobs: the webhook that links a chat to an account, and a once-a-minute database cron that sends pending notifications.
8. **Auth settings** (`supabase/config.toml`) only take effect on the live project after `npx supabase config push`.
9. **Security headers** (including the Content-Security-Policy) are in `vercel.json`. If you add an inline script, a new external host or a custom Supabase domain, update the CSP.

## Everyday commands

`npm run dev` · `npm run build` · `npm run typecheck` · `npm run lint` · `npm test` · `npm run db:test` · `npm run db:types` · `npm run db:check` · `npm run images`
