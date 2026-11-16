# Hosting

Where Fundy runs and who controls what. Written from the repo and the team; check each dashboard for plans, regions and costs, which the repo does not record.

## Overview

| Part                | Provider                 | What it does                                                                                                               |
| ------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Website (frontend)  | **Vercel**               | Serves the React app (`npm run build` → `dist/`). Config in `vercel.json`. Also runs `api/preview.ts` and `api/sitemap.ts` |
| Backend             | **Supabase**             | Postgres database, login, file storage, realtime, edge functions (`telegram`, `oneid`), scheduled notification job         |
| Domain              | **ahost.uz**             | Registrar for `fundy.uz`. DNS records for `fundy.uz` and `www.fundy.uz` are managed here unless nameservers were moved     |
| Android app         | _(none)_                 | Trusted Web Activity wrapper around the website; nothing separate to host                                                  |
| Error tracking      | Sentry (optional)        | Enabled only when `VITE_SENTRY_DSN` is set                                                                                 |
| Analytics           | Vercel Analytics         | Page-visit statistics                                                                                                      |
| Transactional email | Check Supabase dashboard | Auth email uses Supabase's built-in sender unless custom SMTP is configured (see below)                                    |

## Addresses

- Production: `https://www.fundy.uz` (also `https://fundy.uz`)
- Vercel preview: `https://fundy-refined-b8z3.vercel.app`; branches also get their own preview URLs
- Supabase API: `VITE_SUPABASE_URL` (set in Vercel, see `.env.example`)

## How a change reaches production

1. Merge to `main` on GitHub.
2. Vercel builds and deploys the site automatically.
3. Database changes are separate: add a migration in `supabase/migrations/`, then `npm run db:push`.
4. Edge functions are separate too: `npx supabase functions deploy telegram --no-verify-jwt` and `npx supabase functions deploy oneid --no-verify-jwt`.
5. Auth settings in `supabase/config.toml` apply only after `npx supabase config push`.

## Environment variables

Set in Vercel (Production and Preview): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and optionally `VITE_SENTRY_DSN`, `VITE_TELEGRAM_BOT`, `VITE_ONEID_ENABLED`.
Edge-function secrets live in Supabase → Edge Functions → Secrets: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `ONEID_CLIENT_ID`, `ONEID_CLIENT_SECRET`, `ONEID_SCOPE`.
Never put a service-role key or any secret in a `VITE_` variable.

## Domain and DNS (ahost.uz)

- Registrar account for `fundy.uz`: ahost.uz. Keep it under a company email, not a personal one, and note the renewal date.
- If the site goes down after a hosting change, check the DNS records here first.
- Sending email from `@fundy.uz` (for example through Resend) means adding SPF, DKIM and DMARC records in the ahost.uz DNS panel.

## Known gaps

- **Email:** custom SMTP is commented out in `supabase/config.toml`, so Supabase's built-in email is used, which only reaches team members. Set up a real sender before inviting real users.
- **Payments:** simulated; no payment provider is hosted or connected yet.
- **Not recorded here:** plans, regions, billing owner, account owners. Add them once confirmed.
