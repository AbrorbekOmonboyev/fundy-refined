# Fundy

Interest-free crowdfunding and Musharakah profit-sharing platform for Uzbekistan.
**Status:** demo — payments are simulated, no real money moves. See [PLAN.md](PLAN.md) for the full build plan.

## Run it locally

Requires [Node.js](https://nodejs.org) 22 or newer.

```bash
npm install
npm run dev        # http://localhost:3000
```

| Command             | What it does                                          |
| ------------------- | ----------------------------------------------------- |
| `npm run dev`       | Start the dev server with live reload                 |
| `npm run build`     | Type-check and build the production site into `dist/` |
| `npm run preview`   | Serve the built site locally                          |
| `npm run typecheck` | Check TypeScript types only                           |
| `npm run lint`      | Check code for mistakes (ESLint)                      |
| `npm run format`    | Auto-format all files (Prettier)                      |

Copy `.env.example` to `.env.local` when environment values are needed (Supabase, from Phase 1).

## Project layout

```
src/
  main.tsx              Entry point: router + app state + translations
  app/
    App.tsx             Page layout (banner, header, footer) and the list of routes
    routes.ts           Every URL of the site, in one place
    ScrollManager.tsx   Scroll to top / to #anchor on navigation
  pages/                One file per page (Home, Explore, Project, …)
  components/
    layout/             Header, Footer, DemoBanner, LanguageSwitcher
    *.tsx               Shared pieces (ProjectCard, contribution modal)
  lib/supabase.ts       Connection to Supabase (database, login, files)
  context/AppContext.tsx  App state (demo data in localStorage; switched to Supabase in Phases 2–3)
  data/mockProjects.ts  Demo projects (becomes the database seed in Phase 1)
  types/index.ts        Data shapes: Project, Contribution, …
  lib/formatters.ts     Money / percentage formatting
  i18n/
    index.ts            Translation setup (Uzbek default, Russian, English)
    locales/*.json      The texts — same keys in all three files
public/images/          Static images
```

## URLs

| Page                   | URL                  |
| ---------------------- | -------------------- |
| Home                   | `/`                  |
| Explore                | `/explore`           |
| Project                | `/projects/:slug`    |
| Start a project        | `/start`             |
| Backer dashboard       | `/dashboard/backer`  |
| Founder dashboard      | `/dashboard/founder` |
| Education & Musharakah | `/learn`             |
| Trust & Safety         | `/trust-and-safety`  |

## Translations

Add text to all three files in `src/i18n/locales/` under the same key, then use it in a component:

```tsx
const { t } = useTranslation();
return <h1>{t('nav.explore')}</h1>;
```

TypeScript reports an error for any key missing from `en.json`. So far the header, footer, banner and 404 page are translated. Page content is translated as each page is rebuilt with the final design (Phase 3+).

## Database

Supabase (Postgres, login, file storage). Schema, security rules, demo data and tests are in [`supabase/`](supabase/README.md).

```bash
npm run db:test    # check the database rules (no account needed)
```
