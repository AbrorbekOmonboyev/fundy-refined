-- =============================================================================
-- Security: who can read and write what.
--
-- Two layers:
--   1. GRANTs   — which tables/columns a role may touch at all.
--                 Users can never write columns like raised_amount, status,
--                 role or is_verified; those change only through the
--                 functions in the *_functions migration.
--   2. POLICIES — Row Level Security: which ROWS a user may see or change.
--
-- Roles (provided by Supabase):
--   anon           visitor who isn't signed in
--   authenticated  signed-in user (admins too — admin powers come from the
--                  admin_* functions, which check profiles.role)
--   service_role   server-side key; bypasses all of this. Never use in the browser.
--
-- New tables get NO access by default — add grants and policies explicitly.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Start from zero
-- -----------------------------------------------------------------------------
revoke all on all tables    in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;
revoke all on all functions in schema private from public, anon, authenticated;

alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;
alter default privileges in schema private revoke execute on functions from public, anon, authenticated;

-- Policies below call these helpers as the current user, so they need
-- permission to run them. (The private schema is not exposed by the API.)
grant usage on schema private to anon, authenticated;
grant execute on function
  private.is_admin(),
  private.is_blocked(uuid),
  private.is_public_status(public.project_status),
  private.can_view_project(uuid),
  private.can_edit_project(uuid)
to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Table grants
-- -----------------------------------------------------------------------------

-- Public reading (rows still filtered by policies)
grant select on
  public.categories, public.regions,
  public.profiles, public.founder_profiles,
  public.projects, public.project_translations,
  public.budget_items, public.milestones, public.reward_tiers, public.equity_terms,
  public.evaluations, public.project_updates, public.update_likes, public.comments
to anon, authenticated;

-- Signed-in only reading
grant select on
  public.follows, public.contributions, public.notifications,
  public.reports, public.audit_log, public.project_documents
to authenticated;

-- Writing (signed-in users, listed columns only)
grant update (full_name, avatar_path, city, region_id, preferred_language)
  on public.profiles to authenticated;

grant insert (user_id, display_name, role_title, organization, location, bio, experience_years, registration_number)
  on public.founder_profiles to authenticated;
grant update (display_name, role_title, organization, location, bio, experience_years, registration_number)
  on public.founder_profiles to authenticated;

grant insert (owner_id, slug, model, category_id, region_id, location, cover_image_path,
              original_language, target_amount, min_contribution, duration_days)
  on public.projects to authenticated;
grant update (slug, model, category_id, region_id, location, cover_image_path,
              original_language, target_amount, min_contribution, duration_days)
  on public.projects to authenticated;
grant delete on public.projects to authenticated;

grant insert (project_id, language, title, tagline, summary, story, risks)
  on public.project_translations to authenticated;
grant update (title, tagline, summary, story, risks)
  on public.project_translations to authenticated;
grant delete on public.project_translations to authenticated;

grant insert (project_id, position, category, description, amount)
  on public.budget_items to authenticated;
grant update (position, category, description, amount)
  on public.budget_items to authenticated;
grant delete on public.budget_items to authenticated;

grant insert (project_id, position, title, description, target_label, release_percent)
  on public.milestones to authenticated;
grant update (position, title, description, target_label, release_percent)
  on public.milestones to authenticated;
grant delete on public.milestones to authenticated;

grant insert (project_id, position, title, description, amount, items, estimated_delivery, quantity_limit)
  on public.reward_tiers to authenticated;
grant update (position, title, description, amount, items, estimated_delivery, quantity_limit)
  on public.reward_tiers to authenticated;
grant delete on public.reward_tiers to authenticated;

grant insert (project_id, contract_type, investor_profit_share_pct, min_investment,
              projected_annual_return, distribution_schedule, exit_horizon_years)
  on public.equity_terms to authenticated;
grant update (contract_type, investor_profit_share_pct, min_investment,
              projected_annual_return, distribution_schedule, exit_horizon_years)
  on public.equity_terms to authenticated;
grant delete on public.equity_terms to authenticated;

grant insert (project_id, kind, storage_path, file_name, uploaded_by)
  on public.project_documents to authenticated;
grant delete on public.project_documents to authenticated;

grant insert (project_id, author_id, title, body) on public.project_updates to authenticated;
grant update (title, body) on public.project_updates to authenticated;
grant delete on public.project_updates to authenticated;

grant insert (update_id, user_id) on public.update_likes to authenticated;
grant delete on public.update_likes to authenticated;

grant insert (project_id, author_id, parent_id, body) on public.comments to authenticated;
grant update (body) on public.comments to authenticated;
grant delete on public.comments to authenticated;

grant insert (user_id, project_id) on public.follows to authenticated;
grant delete on public.follows to authenticated;

grant update (read_at) on public.notifications to authenticated;
grant delete on public.notifications to authenticated;

grant insert (reporter_id, target_type, target_id, reason, details) on public.reports to authenticated;

-- contributions, evaluations, audit_log: no direct writes — functions only.

-- -----------------------------------------------------------------------------
-- Function grants (what the app may call with supabase.rpc)
-- -----------------------------------------------------------------------------
grant execute on function
  public.contribute(uuid, bigint, public.payment_method, uuid, boolean),
  public.submit_project(uuid),
  public.submit_milestone(uuid, text),
  public.admin_review_project(uuid, text, text),
  public.admin_save_evaluation(uuid, smallint, smallint, smallint, smallint, smallint,
                               public.evaluation_confidence, text, text[], text[]),
  public.admin_set_featured(uuid, boolean),
  public.admin_verify_founder(uuid, boolean),
  public.admin_approve_milestone(uuid),
  public.admin_set_hidden(public.report_target, uuid, boolean),
  public.admin_resolve_report(uuid, public.report_status),
  public.admin_set_user_blocked(uuid, boolean),
  public.admin_set_role(uuid, public.app_role)
to authenticated;
-- (admin_* functions refuse non-admins themselves.)

-- -----------------------------------------------------------------------------
-- Row Level Security policies
-- -----------------------------------------------------------------------------
alter table public.categories           enable row level security;
alter table public.regions              enable row level security;
alter table public.profiles             enable row level security;
alter table public.founder_profiles     enable row level security;
alter table public.projects             enable row level security;
alter table public.project_translations enable row level security;
alter table public.budget_items         enable row level security;
alter table public.milestones           enable row level security;
alter table public.reward_tiers         enable row level security;
alter table public.equity_terms         enable row level security;
alter table public.evaluations          enable row level security;
alter table public.project_documents    enable row level security;
alter table public.project_updates      enable row level security;
alter table public.update_likes         enable row level security;
alter table public.comments             enable row level security;
alter table public.follows              enable row level security;
alter table public.contributions        enable row level security;
alter table public.notifications        enable row level security;
alter table public.reports              enable row level security;
alter table public.audit_log            enable row level security;

-- Lookup lists: everyone reads.
create policy "anyone reads categories" on public.categories for select using (true);
create policy "anyone reads regions"    on public.regions    for select using (true);

-- Profiles: public names; you edit only your own.
create policy "anyone reads profiles" on public.profiles for select using (true);
create policy "edit own profile" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

-- Founder profiles: public; you create/edit only your own.
create policy "anyone reads founder profiles" on public.founder_profiles for select using (true);
create policy "create own founder profile" on public.founder_profiles for insert
  with check (user_id = auth.uid() and not private.is_blocked(auth.uid()));
create policy "edit own founder profile" on public.founder_profiles for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Projects: live ones are public; drafts only for their owner and admins.
create policy "read visible projects" on public.projects for select
  using (private.is_public_status(status) or owner_id = auth.uid() or private.is_admin());
create policy "create own draft" on public.projects for insert
  with check (owner_id = auth.uid() and status = 'draft' and not private.is_blocked(auth.uid()));
create policy "edit own editable project" on public.projects for update
  using (private.can_edit_project(id)) with check (owner_id = auth.uid());
create policy "delete own draft" on public.projects for delete
  using (owner_id = auth.uid() and status = 'draft');

-- Project parts: visible with the project; editable while the project is editable.
create policy "read with project" on public.project_translations for select using (private.can_view_project(project_id));
create policy "add while editable" on public.project_translations for insert with check (private.can_edit_project(project_id));
create policy "edit while editable" on public.project_translations for update
  using (private.can_edit_project(project_id)) with check (private.can_edit_project(project_id));
create policy "delete while editable" on public.project_translations for delete using (private.can_edit_project(project_id));

create policy "read with project" on public.budget_items for select using (private.can_view_project(project_id));
create policy "add while editable" on public.budget_items for insert with check (private.can_edit_project(project_id));
create policy "edit while editable" on public.budget_items for update
  using (private.can_edit_project(project_id)) with check (private.can_edit_project(project_id));
create policy "delete while editable" on public.budget_items for delete using (private.can_edit_project(project_id));

create policy "read with project" on public.milestones for select using (private.can_view_project(project_id));
create policy "add while editable" on public.milestones for insert with check (private.can_edit_project(project_id));
create policy "edit while editable" on public.milestones for update
  using (private.can_edit_project(project_id)) with check (private.can_edit_project(project_id));
create policy "delete while editable" on public.milestones for delete using (private.can_edit_project(project_id));

create policy "read with project" on public.reward_tiers for select using (private.can_view_project(project_id));
create policy "add while editable" on public.reward_tiers for insert with check (private.can_edit_project(project_id));
create policy "edit while editable" on public.reward_tiers for update
  using (private.can_edit_project(project_id)) with check (private.can_edit_project(project_id));
create policy "delete while editable" on public.reward_tiers for delete using (private.can_edit_project(project_id));

create policy "read with project" on public.equity_terms for select using (private.can_view_project(project_id));
create policy "add while editable" on public.equity_terms for insert with check (private.can_edit_project(project_id));
create policy "edit while editable" on public.equity_terms for update
  using (private.can_edit_project(project_id)) with check (private.can_edit_project(project_id));
create policy "delete while editable" on public.equity_terms for delete using (private.can_edit_project(project_id));

-- Evaluations: public once published; the owner and admins always see them.
create policy "read evaluations" on public.evaluations for select using (
  (is_published and private.can_view_project(project_id))
  or private.is_admin()
  or exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
);

-- Review documents: only the owner and admins.
create policy "owner and admins read documents" on public.project_documents for select using (
  private.is_admin()
  or exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
);
create policy "owner uploads while editable" on public.project_documents for insert
  with check (uploaded_by = auth.uid() and private.can_edit_project(project_id));
create policy "owner deletes while editable" on public.project_documents for delete
  using (private.can_edit_project(project_id));

-- Project updates: written by the owner of a live project.
create policy "read updates" on public.project_updates for select using (
  (not is_hidden and private.can_view_project(project_id))
  or author_id = auth.uid()
  or private.is_admin()
);
create policy "owner posts updates on live project" on public.project_updates for insert with check (
  author_id = auth.uid()
  and not private.is_blocked(auth.uid())
  and exists (
    select 1 from public.projects p
    where p.id = project_id and p.owner_id = auth.uid() and private.is_public_status(p.status)
  )
);
create policy "author edits update" on public.project_updates for update
  using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "author deletes update" on public.project_updates for delete using (author_id = auth.uid());

create policy "anyone reads likes" on public.update_likes for select using (true);
create policy "like as yourself" on public.update_likes for insert with check (user_id = auth.uid());
create policy "remove own like" on public.update_likes for delete using (user_id = auth.uid());

-- Comments: on live projects; you edit/delete your own; hidden ones disappear.
create policy "read comments" on public.comments for select using (
  (not is_hidden and private.can_view_project(project_id))
  or author_id = auth.uid()
  or private.is_admin()
);
create policy "comment on live project" on public.comments for insert with check (
  author_id = auth.uid()
  and not private.is_blocked(auth.uid())
  and exists (select 1 from public.projects p where p.id = project_id and private.is_public_status(p.status))
);
create policy "edit own comment" on public.comments for update
  using (author_id = auth.uid() and not private.is_blocked(auth.uid())) with check (author_id = auth.uid());
create policy "delete own comment" on public.comments for delete using (author_id = auth.uid());

-- Saved projects: private to each user.
create policy "read own follows" on public.follows for select using (user_id = auth.uid());
create policy "follow visible project" on public.follows for insert
  with check (user_id = auth.uid() and private.can_view_project(project_id));
create policy "unfollow" on public.follows for delete using (user_id = auth.uid());

-- Contributions: the backer, the project owner and admins.
create policy "read related contributions" on public.contributions for select using (
  backer_id = auth.uid()
  or private.is_admin()
  or exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
);

-- Notifications: your own.
create policy "read own notifications" on public.notifications for select using (user_id = auth.uid());
create policy "mark own notifications read" on public.notifications for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "delete own notifications" on public.notifications for delete using (user_id = auth.uid());

-- Reports: anyone signed in can report; reporters see their own, admins see all.
create policy "file a report" on public.reports for insert
  with check (reporter_id = auth.uid() and not private.is_blocked(auth.uid()));
create policy "read own or all as admin" on public.reports for select
  using (reporter_id = auth.uid() or private.is_admin());

-- Audit log: admins only.
create policy "admins read audit log" on public.audit_log for select using (private.is_admin());
