-- =============================================================================
-- Fundy — database schema
--
-- Conventions
--   * Money is stored as BIGINT in whole Uzbek so'm (UZS). No decimals, no floats.
--   * Every table has created_at; editable tables also have updated_at (set by trigger).
--   * Text a visitor reads in their language lives in *_translations or lookup
--     tables with name_uz / name_ru / name_en.
--   * Security rules (who can read/write what) are in the *_security migration.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Enums (fixed lists of allowed values)
-- -----------------------------------------------------------------------------
create type public.app_language       as enum ('uz', 'ru', 'en');
create type public.app_role           as enum ('member', 'admin');
create type public.funding_model      as enum ('donation', 'reward', 'equity');
create type public.project_status     as enum (
  'draft',              -- founder is still writing it
  'pending_review',     -- submitted, waiting for an admin
  'changes_requested',  -- admin sent it back for edits
  'rejected',           -- admin declined it (final)
  'active',             -- live and accepting contributions
  'funded',             -- campaign ended and reached its target
  'unsuccessful',       -- campaign ended below target
  'completed'           -- all milestones delivered
);
create type public.contract_type         as enum ('musharakah', 'mudarabah');
create type public.distribution_schedule as enum ('quarterly', 'biannually', 'annually');
create type public.milestone_status      as enum ('pending', 'submitted', 'approved');
create type public.evaluation_confidence as enum ('high', 'moderate', 'in_review');
create type public.payment_method        as enum ('click', 'payme', 'uzcard', 'humo', 'bank_wire');
create type public.contribution_status   as enum ('confirmed', 'refunded');
create type public.document_kind         as enum ('registration', 'business_plan', 'identity', 'financials', 'other');
create type public.report_target         as enum ('project', 'comment', 'update', 'user');
create type public.report_status         as enum ('open', 'resolved', 'dismissed');
create type public.notification_type     as enum (
  'project_submitted',      -- to admins
  'project_approved',       -- to owner
  'project_changes_requested',
  'project_rejected',
  'project_ended',          -- to owner and backers
  'new_contribution',       -- to owner
  'contribution_confirmed', -- to backer
  'new_comment',            -- to owner
  'comment_reply',          -- to comment author
  'new_update',             -- to followers and backers
  'milestone_approved'      -- to owner and backers
);

-- -----------------------------------------------------------------------------
-- Lookup tables (admin-managed lists shown in filters and forms)
-- -----------------------------------------------------------------------------
create table public.categories (
  id          text primary key,             -- e.g. 'technology'
  name_uz     text not null,
  name_ru     text not null,
  name_en     text not null,
  sort_order  smallint not null default 0,
  is_active   boolean not null default true
);

create table public.regions (
  id          text primary key,             -- e.g. 'tashkent-city'
  name_uz     text not null,
  name_ru     text not null,
  name_en     text not null,
  sort_order  smallint not null default 0
);

-- -----------------------------------------------------------------------------
-- People
-- -----------------------------------------------------------------------------

-- One row per registered user (created automatically on sign-up).
-- Email and phone stay in auth.users, which is never public.
create table public.profiles (
  id                  uuid primary key references auth.users (id) on delete cascade,
  full_name           text not null default '' check (char_length(full_name) <= 120),
  avatar_path         text,
  city                text check (char_length(city) <= 80),
  region_id           text references public.regions (id),
  preferred_language  public.app_language not null default 'uz',
  role                public.app_role not null default 'member',
  is_blocked          boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Extra public details for users who launch projects. One per user.
create table public.founder_profiles (
  user_id              uuid primary key references public.profiles (id) on delete cascade,
  display_name         text not null check (char_length(display_name) between 2 and 120),
  role_title           text check (char_length(role_title) <= 120),   -- "Founder & CEO"
  organization         text check (char_length(organization) <= 160),
  location             text check (char_length(location) <= 120),
  bio                  text check (char_length(bio) <= 4000),
  experience_years     smallint check (experience_years between 0 and 80),
  registration_number  text check (char_length(registration_number) <= 120), -- TIN / MCHJ number
  is_verified          boolean not null default false,               -- set by admins only
  verified_at          timestamptz,
  verified_by          uuid references public.profiles (id),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Projects
-- -----------------------------------------------------------------------------
create table public.projects (
  id                 uuid primary key default gen_random_uuid(),
  owner_id           uuid not null references public.profiles (id) on delete restrict,
  slug               text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  model              public.funding_model not null,
  category_id        text not null references public.categories (id),
  region_id          text references public.regions (id),
  location           text check (char_length(location) <= 120),   -- free text, e.g. "Fergana, Uzbekistan"
  cover_image_path   text,                                        -- path in the project-images bucket
  original_language  public.app_language not null default 'uz',

  target_amount      bigint not null check (target_amount between 1000000 and 100000000000),
  min_contribution   bigint not null default 10000 check (min_contribution > 0),
  raised_amount      bigint not null default 0 check (raised_amount >= 0),     -- maintained by contribute()
  backer_count       integer not null default 0 check (backer_count >= 0),     -- maintained by contribute()
  duration_days      smallint not null default 30 check (duration_days between 7 and 90),

  status             public.project_status not null default 'draft',
  is_featured        boolean not null default false,
  submitted_at       timestamptz,
  reviewed_at        timestamptz,
  reviewed_by        uuid references public.profiles (id),
  review_note        text,                    -- reason shown to founder on rejection / changes requested
  starts_at          timestamptz,             -- set on approval
  ends_at            timestamptz,             -- starts_at + duration_days
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  constraint live_projects_have_dates check (
    status in ('draft', 'pending_review', 'changes_requested', 'rejected')
    or (starts_at is not null and ends_at is not null)
  )
);

-- Project text in each language. The founder writes original_language;
-- the other languages are optional and fall back to the original.
create table public.project_translations (
  project_id  uuid not null references public.projects (id) on delete cascade,
  language    public.app_language not null,
  title       text not null check (char_length(title) between 5 and 140),
  tagline     text not null default '' check (char_length(tagline) <= 240),
  summary     text not null default '' check (char_length(summary) <= 1000),
  story       text not null default '' check (char_length(story) <= 20000),
  risks       text not null default '' check (char_length(risks) <= 5000),
  updated_at  timestamptz not null default now(),
  primary key (project_id, language)
);

create table public.budget_items (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects (id) on delete cascade,
  position     smallint not null default 0,
  category     text not null check (char_length(category) between 2 and 120),
  description  text not null default '' check (char_length(description) <= 1000),
  amount       bigint not null check (amount > 0)
);

create table public.milestones (
  id               uuid primary key default gen_random_uuid(),
  project_id       uuid not null references public.projects (id) on delete cascade,
  position         smallint not null default 0,
  title            text not null check (char_length(title) between 2 and 160),
  description      text not null default '' check (char_length(description) <= 2000),
  target_label     text check (char_length(target_label) <= 60),   -- "Month 2", "Spring 2027"
  release_percent  numeric(5,2) not null check (release_percent > 0 and release_percent <= 100),
  status           public.milestone_status not null default 'pending',
  evidence         text check (char_length(evidence) <= 4000),     -- founder's proof of completion
  approved_at      timestamptz,
  approved_by      uuid references public.profiles (id)
);

create table public.reward_tiers (
  id                  uuid primary key default gen_random_uuid(),
  project_id          uuid not null references public.projects (id) on delete cascade,
  position            smallint not null default 0,
  title               text not null check (char_length(title) between 2 and 160),
  description         text not null default '' check (char_length(description) <= 2000),
  amount              bigint not null check (amount > 0),
  items               text[] not null default '{}',
  estimated_delivery  text check (char_length(estimated_delivery) <= 60),
  quantity_limit      integer check (quantity_limit > 0),           -- null = unlimited
  claimed_count       integer not null default 0 check (claimed_count >= 0)  -- maintained by contribute()
);

-- Profit-sharing terms, only for model = 'equity'.
create table public.equity_terms (
  project_id                 uuid primary key references public.projects (id) on delete cascade,
  contract_type              public.contract_type not null default 'musharakah',
  investor_profit_share_pct  numeric(5,2) not null check (investor_profit_share_pct > 0 and investor_profit_share_pct < 100),
  min_investment             bigint not null check (min_investment > 0),
  projected_annual_return    text check (char_length(projected_annual_return) <= 60),  -- "18% – 24% target"
  distribution_schedule      public.distribution_schedule not null default 'quarterly',
  exit_horizon_years         smallint not null check (exit_horizon_years between 1 and 30)
);

-- Admin evaluation, shown publicly once is_published = true.
create table public.evaluations (
  project_id           uuid primary key references public.projects (id) on delete cascade,
  business_plan_score  smallint not null check (business_plan_score between 0 and 20),
  team_score           smallint not null check (team_score between 0 and 20),
  market_score         smallint not null check (market_score between 0 and 20),
  financial_score      smallint not null check (financial_score between 0 and 20),
  risk_score           smallint not null check (risk_score between 0 and 20),   -- higher = lower risk
  overall_score        smallint generated always as
                         (business_plan_score + team_score + market_score + financial_score + risk_score) stored,
  confidence           public.evaluation_confidence not null default 'in_review',
  summary              text not null default '' check (char_length(summary) <= 4000),
  strengths            text[] not null default '{}',
  risks                text[] not null default '{}',
  is_published         boolean not null default false,
  evaluated_by         uuid references public.profiles (id),
  evaluated_at         timestamptz not null default now()
);

-- Private files for review (registration certificate, business plan, ID).
create table public.project_documents (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.projects (id) on delete cascade,
  kind          public.document_kind not null,
  storage_path  text not null,                -- path in the project-documents bucket
  file_name     text not null,
  uploaded_by   uuid not null references public.profiles (id),
  created_at    timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Community
-- -----------------------------------------------------------------------------
create table public.project_updates (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects (id) on delete cascade,
  author_id   uuid not null references public.profiles (id),
  title       text not null check (char_length(title) between 2 and 160),
  body        text not null check (char_length(body) between 1 and 20000),
  likes_count integer not null default 0 check (likes_count >= 0),   -- maintained by trigger
  is_hidden   boolean not null default false,                        -- moderation
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.update_likes (
  update_id   uuid not null references public.project_updates (id) on delete cascade,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (update_id, user_id)
);

-- Comments; a reply has parent_id set (one level deep).
create table public.comments (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects (id) on delete cascade,
  author_id   uuid not null references public.profiles (id) on delete cascade,
  parent_id   uuid references public.comments (id) on delete cascade,
  body        text not null check (char_length(body) between 1 and 4000),
  is_hidden   boolean not null default false,                        -- moderation
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- "Saved" / followed projects.
create table public.follows (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  project_id  uuid not null references public.projects (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, project_id)
);

-- -----------------------------------------------------------------------------
-- Money (simulated in the demo — no real payments)
-- -----------------------------------------------------------------------------
-- Rows are only created by public.contribute(); nobody can insert directly.
create table public.contributions (
  id                uuid primary key default gen_random_uuid(),
  project_id        uuid not null references public.projects (id) on delete restrict,
  backer_id         uuid not null references public.profiles (id) on delete restrict,
  amount            bigint not null check (amount > 0),
  reward_tier_id    uuid references public.reward_tiers (id) on delete set null,
  payment_method    public.payment_method not null,
  equity_share_pct  numeric(7,4),            -- backer's share of profits, equity projects only
  status            public.contribution_status not null default 'confirmed',
  is_simulated      boolean not null default true,
  is_anonymous      boolean not null default false,   -- hide name on public backer lists
  created_at        timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- System
-- -----------------------------------------------------------------------------
-- In-app notifications. The app turns `type` + `data` into text in the
-- reader's language, so nothing language-specific is stored here.
create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  type        public.notification_type not null,
  data        jsonb not null default '{}',     -- e.g. {"project_id": "...", "amount": 500000}
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

create table public.reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid not null references public.profiles (id) on delete cascade,
  target_type  public.report_target not null,
  target_id    uuid not null,
  reason       text not null check (char_length(reason) between 2 and 120),
  details      text check (char_length(details) <= 2000),
  status       public.report_status not null default 'open',
  resolved_by  uuid references public.profiles (id),
  resolved_at  timestamptz,
  created_at   timestamptz not null default now()
);

-- Every admin action, for accountability. Written by functions only.
create table public.audit_log (
  id           bigint generated always as identity primary key,
  actor_id     uuid references public.profiles (id) on delete set null,
  action       text not null,                 -- e.g. 'project.approve'
  target_type  text not null,
  target_id    text not null,
  details      jsonb not null default '{}',
  created_at   timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Indexes for common lookups
-- -----------------------------------------------------------------------------
create index projects_status_idx          on public.projects (status);
create index projects_owner_idx           on public.projects (owner_id);
create index projects_category_idx        on public.projects (category_id);
create index projects_featured_idx        on public.projects (is_featured) where is_featured;
create index projects_ends_at_idx         on public.projects (ends_at) where status = 'active';
create index budget_items_project_idx     on public.budget_items (project_id, position);
create index milestones_project_idx       on public.milestones (project_id, position);
create index reward_tiers_project_idx     on public.reward_tiers (project_id, position);
create index project_documents_project_idx on public.project_documents (project_id);
create index project_updates_project_idx  on public.project_updates (project_id, created_at desc);
create index comments_project_idx         on public.comments (project_id, created_at desc);
create index comments_parent_idx          on public.comments (parent_id);
create index follows_project_idx          on public.follows (project_id);
create index contributions_project_idx    on public.contributions (project_id, created_at desc);
create index contributions_backer_idx     on public.contributions (backer_id, created_at desc);
create index notifications_user_idx       on public.notifications (user_id, created_at desc);
create index notifications_unread_idx     on public.notifications (user_id) where read_at is null;
create index reports_status_idx           on public.reports (status, created_at desc);
create index audit_log_target_idx         on public.audit_log (target_type, target_id);
