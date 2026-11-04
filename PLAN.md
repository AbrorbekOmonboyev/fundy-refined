# Fundy — Build Plan

**Goal:** turn the AI Studio prototype into a real, working website: real accounts, real database, real admin review. For the first version, payments stay **simulated** (no real money).

**Decisions so far**
| Topic | Decision |
|---|---|
| Money | Demo only. Contributions are recorded in the database but no money moves. The site is clearly labeled as a demo. |
| Backend | Supabase: Postgres database, login, file storage and security rules. Small server functions (Supabase Edge Functions) handle the logic that must not run in the browser. |
| Frontend | Keep React + Vite + TypeScript + Tailwind from the prototype. |
| Languages | Uzbek (Latin), Russian, English. Uzbek is the default. |
| Design | You provide it later. Until then the current prototype look is a placeholder. |

**What we reuse from the prototype:** the data types (`src/types`) become the database schema, the mock projects become seed data, and the pages and components get rewired to real data. Most of the screens exist already; what's missing is everything behind them.

---

## Phase 0 — Foundations *(start here)*
1. Put the project under git and make a first commit of the original prototype, so every change is tracked and can be undone.
2. Clean up AI Studio leftovers: the duplicate images in `src/assets` and `public`, `metadata.json`, the HMR comments, and unused packages (`express`, plus `@google/genai` until we need it). Fix the broken `—` text encoding.
3. Install dependencies and confirm the app runs locally.
4. Add real URL routing (React Router), e.g. `/explore`, `/projects/:slug`, `/dashboard`. Right now pages switch inside memory, so links can't be shared and the Back button doesn't work.
5. Set up the folder structure (`features/`, `lib/`, `routes/`), linting and formatting, and environment variables (`.env.local`).
6. Set up translations (react-i18next) with `uz`, `ru` and `en` files and a language switcher. Do this **now**, before more text gets hard-coded into pages.

✅ **Done when:** the app runs, URLs work, and the language switches between all three.

## Phase 1 — Database (Supabase)
1. Create the Supabase project (you create the account; I set it up). Keep the schema as migration files in the repo (Supabase CLI) so it's versioned.
2. Tables:
   - `profiles`: user, name, city, phone, language, role (`backer` / `founder` / `admin`)
   - `founders`: organization, registration/TIN, bio, verified flag
   - `projects`: title, slug, tagline, story, model, category, location, target, raised, status, deadline, featured
   - `project_translations`: the project's text in uz/ru/en (founders can write in one language)
   - `budget_items`, `milestones`, `reward_tiers`, `equity_terms`
   - `evaluations`: the 5 × 20 scoring, strengths, risks, reviewer notes
   - `project_updates`, `comments` (with founder replies), `follows` (saved projects)
   - `contributions`: simulated payment method, amount, reward chosen, status
   - `notifications`, `reports` (flagged content), `audit_log` (admin actions)
3. Row Level Security rules: anyone can read active projects; only the owner edits their draft; only admins approve, evaluate or verify.
4. Storage buckets for project images, founder avatars and documents (registration certificate, business plan).
5. Seed script that loads the 4 prototype projects plus extra test data.
6. Database functions so `raised_amount` and `backer_count` update automatically and can't be faked from the browser.

✅ **Done when:** the schema is live, the seed data loads, and the security rules are tested.

## Phase 2 — Accounts & login
1. Sign up and log in with email and password, a magic link, and Google. Phone SMS login (Eskiz/Playmobile) waits until after the demo, since it costs money per SMS.
2. Onboarding: name, city, preferred language, "I want to back / I want to launch a project".
3. Profile and settings page: edit profile, change password, notification preferences, delete account.
4. Roles and protected pages: dashboards need a login, and the admin area needs the admin role.
5. Password reset and email verification.

✅ **Done when:** a new user can register, log in, and see only what their role allows.

## Phase 3 — Public browsing (replace mock data with real data)
1. Home: featured projects, platform stats, and categories, all loaded from the database.
2. Explore: search, filters (category, model, region, status), sort (newest, most funded, ending soon) and paging.
3. Project page: story, budget, milestones, rewards, evaluation, updates, comments and founder info. Includes share buttons and a "save project" button.
4. Founder public profile page.
5. SEO basics: page titles and descriptions, link previews for Telegram and Facebook (very important in Uzbekistan), a sitemap, and readable URL slugs.
6. Loading, empty and error states, plus a 404 page.

✅ **Done when:** a visitor can find and read any approved project in any of the 3 languages.

## Phase 4 — Founder side
1. "Start a project" wizard in steps: basics → story → budget → milestones → rewards or equity terms → founder and verification documents → preview → submit. It autosaves drafts.
2. Image upload with resizing, and a document upload for verification.
3. Checks: the budget adds up to the target, milestone release percentages total 100%, and required fields are filled.
4. Submit for review: status changes to `pending_review` and admins get notified.
5. Founder dashboard: my projects with their status, funding progress chart, backer list, post updates, reply to comments, edit after rejection, and mark milestones done (admin confirms).

✅ **Done when:** a founder can create a project, submit it, fix it after rejection, and manage it once it's live.

## Phase 5 — Backer side (simulated contributions)
1. Contribution flow: choose an amount or reward tier → pick Click / Payme / Uzcard / Humo → a **mock** payment screen → confirmation. It's clearly labeled "Demo — no money charged".
2. A server function records the contribution and updates project totals in one step, so the numbers stay correct.
3. Backer dashboard: my contributions, saved projects, projects I follow, and simulated profit-share numbers for Musharakah projects.
4. Comments (logged-in users only, with a backer badge), likes on updates, and reporting bad content.
5. Automatic project end: when the deadline passes, the project becomes `funded` or `unsuccessful`.

✅ **Done when:** a backer can "fund" a project end to end and see it reflected everywhere.

## Phase 6 — Admin panel
1. Review queue: see submitted projects and their documents, then approve, reject with a reason, or request changes.
2. Evaluation form: the 5 scores (business plan, team, market, financials, risk), strengths, risks and confidence level, all shown publicly on the project page.
3. *Optional:* Gemini AI pre-fills a draft evaluation from the business plan, and the admin edits it. This is the one place the existing `@google/genai` setup is useful.
4. Founder identity verification (manual check of the uploaded documents).
5. Moderation: reported comments, hide or remove content, block users.
6. Milestone confirmation (marks funds as "released" in the demo).
7. Simple stats: users, projects by status, total simulated funding.
8. Every admin action is written to `audit_log`.

✅ **Done when:** no project goes live without admin approval, and everything admins do is logged.

## Phase 7 — Notifications & email
1. In-app notifications (bell icon) that update live: project approved, new backer, new comment, new update from a followed project, milestone reached.
2. Transactional email (Resend or similar) for verification, approval/rejection, contribution receipts and update digests, in the user's language.

## Phase 8 — Content pages
Education (how Musharakah, Mudarabah and reward/donation crowdfunding work), Trust & Safety, FAQ, About, How it works, Terms of Use, Privacy Policy, and a Contact form. All in 3 languages. I draft the translations, but a native speaker should check the Uzbek and Russian.

## Phase 9 — Quality & launch
1. Automated tests: unit tests (Vitest) for money math and validation, and end-to-end tests (Playwright) for sign up → create project → approve → contribute.
2. Mobile check on real phones (most users will be on Android), accessibility, and page speed.
3. Error tracking (Sentry) and visitor analytics.
4. Separate **staging** and **production** Supabase projects, and database backups.
5. Hosting: Vercel or Netlify for the site, plus a domain (e.g. `fundy.uz`) with HTTPS.
6. Launch checklist: demo banner in place, terms and privacy published, admin account secured.

## Phase 10 — Later, after the demo (not part of this build)
Real money needs non-code work first: a registered legal entity, Click/Payme merchant contracts, an escrow or nominal account with a bank, MyID identity checks (KYC), a Shariah advisory review of the Musharakah contracts, and legal advice on whether equity crowdfunding needs a license from the capital markets regulator. Once those exist, the simulated payment step from Phase 5 gets replaced by real payment integrations.

---

## Order of importance
1. **Phase 0–1.** URLs, translations and the database schema are what everything else stands on. Changing them later is expensive.
2. **Phase 2–3.** Real users can browse real projects.
3. **Phase 4–6.** The core loop: founder submits → admin approves → backer contributes.
4. **Phase 7–9.** Polish, trust and launch.

## What I need from you
- **Supabase account:** create one at supabase.com (free tier is fine) and add me to the project when we reach Phase 1.
- **Design:** before Phase 3 if possible, since that's when pages get rebuilt.
- **Domain and hosting account:** needed before Phase 9.
- **Native-speaker review:** someone to check the Uzbek and Russian texts.
- **Your rules:** the review criteria, fees, minimum and maximum amounts, and which project categories are allowed.
