-- =============================================================================
-- Database logic: helpers, triggers and the actions the app calls (RPCs).
--
-- Why in the database? Anything that changes money totals, project status or
-- moderation must be impossible to fake from the browser. These functions run
-- with elevated rights (SECURITY DEFINER) and check permissions themselves.
--
-- Errors are raised with a short snake_case key as the message
-- (e.g. 'amount_below_minimum') so the app can show a translated message.
--
-- Schemas:
--   private.*  internal helpers — NOT reachable from the website API
--   public.*   functions the app calls with supabase.rpc('name', {...})
-- =============================================================================

create schema if not exists private;

-- -----------------------------------------------------------------------------
-- Internal helpers
-- -----------------------------------------------------------------------------

create function private.is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and not is_blocked
  );
$$;

create function private.is_blocked(p_user_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce((select is_blocked from public.profiles where id = p_user_id), false);
$$;

-- Projects anyone can see once approved.
create function private.is_public_status(p_status public.project_status)
returns boolean
language sql immutable
as $$
  select p_status in ('active', 'funded', 'unsuccessful', 'completed');
$$;

create function private.can_view_project(p_project_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.projects p
    where p.id = p_project_id
      and (private.is_public_status(p.status) or p.owner_id = auth.uid() or private.is_admin())
  );
$$;

-- The owner may edit a project only while it is a draft or sent back for changes.
create function private.can_edit_project(p_project_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.projects p
    where p.id = p_project_id
      and p.owner_id = auth.uid()
      and p.status in ('draft', 'changes_requested')
      and not private.is_blocked(auth.uid())
  );
$$;

create function private.require_admin()
returns void
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'admin_only' using errcode = '42501';
  end if;
end;
$$;

create function private.notify(p_user_id uuid, p_type public.notification_type, p_data jsonb)
returns void
language sql security definer set search_path = ''
as $$
  insert into public.notifications (user_id, type, data) values (p_user_id, p_type, p_data);
$$;

-- Notify everyone who backed or follows a project (except one user, e.g. the author).
create function private.notify_project_audience(
  p_project_id uuid, p_type public.notification_type, p_data jsonb, p_except uuid default null
)
returns void
language sql security definer set search_path = ''
as $$
  insert into public.notifications (user_id, type, data)
  select u.user_id, p_type, p_data
  from (
    select backer_id as user_id from public.contributions
      where project_id = p_project_id and status = 'confirmed'
    union
    select user_id from public.follows where project_id = p_project_id
  ) u
  where u.user_id is distinct from p_except;
$$;

create function private.audit(p_action text, p_target_type text, p_target_id text, p_details jsonb default '{}')
returns void
language sql security definer set search_path = ''
as $$
  insert into public.audit_log (actor_id, action, target_type, target_id, details)
  values (auth.uid(), p_action, p_target_type, p_target_id, p_details);
$$;

-- -----------------------------------------------------------------------------
-- Triggers
-- -----------------------------------------------------------------------------

-- Keep updated_at current.
create function private.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.founder_profiles
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.projects
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.project_translations
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.project_updates
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.comments
  for each row execute function private.set_updated_at();

-- Create a profile for every new account. Name and language come from the
-- sign-up form (supabase.auth.signUp({ options: { data: { full_name, language } } })).
create function private.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_lang text := new.raw_user_meta_data ->> 'language';
begin
  insert into public.profiles (id, full_name, preferred_language)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''), 120),
    case when v_lang in ('uz', 'ru', 'en') then v_lang::public.app_language else 'uz' end
  );
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_user();

-- Keep project_updates.likes_count in sync with update_likes.
create function private.sync_update_likes()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.project_updates set likes_count = likes_count + 1 where id = new.update_id;
  else
    update public.project_updates set likes_count = greatest(likes_count - 1, 0) where id = old.update_id;
  end if;
  return null;
end;
$$;

create trigger sync_update_likes after insert or delete on public.update_likes
  for each row execute function private.sync_update_likes();

-- Replies must belong to the same project and only go one level deep.
create function private.check_comment_parent()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.parent_id is not null and not exists (
    select 1 from public.comments c
    where c.id = new.parent_id and c.project_id = new.project_id and c.parent_id is null
  ) then
    raise exception 'invalid_reply_parent';
  end if;
  return new;
end;
$$;

create trigger check_comment_parent before insert on public.comments
  for each row execute function private.check_comment_parent();

-- Notify the project owner about a new comment, or the parent author about a reply.
create function private.notify_new_comment()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_owner uuid;
  v_parent_author uuid;
begin
  if new.parent_id is not null then
    select author_id into v_parent_author from public.comments where id = new.parent_id;
    if v_parent_author is distinct from new.author_id then
      perform private.notify(v_parent_author, 'comment_reply',
        jsonb_build_object('project_id', new.project_id, 'comment_id', new.id));
    end if;
  else
    select owner_id into v_owner from public.projects where id = new.project_id;
    if v_owner is distinct from new.author_id then
      perform private.notify(v_owner, 'new_comment',
        jsonb_build_object('project_id', new.project_id, 'comment_id', new.id));
    end if;
  end if;
  return null;
end;
$$;

create trigger notify_new_comment after insert on public.comments
  for each row execute function private.notify_new_comment();

-- Tell backers and followers when the founder posts an update.
create function private.notify_new_update()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  perform private.notify_project_audience(new.project_id, 'new_update',
    jsonb_build_object('project_id', new.project_id, 'update_id', new.id), new.author_id);
  return null;
end;
$$;

create trigger notify_new_update after insert on public.project_updates
  for each row execute function private.notify_new_update();

-- -----------------------------------------------------------------------------
-- Actions for signed-in users
-- -----------------------------------------------------------------------------

-- Record a (simulated) contribution and update all totals in one step.
create function public.contribute(
  p_project_id      uuid,
  p_amount          bigint,
  p_payment_method  public.payment_method,
  p_reward_tier_id  uuid default null,
  p_is_anonymous    boolean default false
)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_user         uuid := auth.uid();
  v_project      public.projects%rowtype;
  v_tier         public.reward_tiers%rowtype;
  v_terms        public.equity_terms%rowtype;
  v_share        numeric(7,4);
  v_first_time   boolean;
  v_id           uuid;
begin
  if v_user is null then
    raise exception 'not_signed_in' using errcode = '28000';
  end if;
  if private.is_blocked(v_user) then
    raise exception 'account_blocked' using errcode = '42501';
  end if;

  -- Lock the project row so two contributions at once can't corrupt totals.
  select * into v_project from public.projects where id = p_project_id for update;
  if not found then
    raise exception 'project_not_found' using errcode = 'P0002';
  end if;
  if v_project.status <> 'active' or now() >= v_project.ends_at then
    raise exception 'project_not_accepting_contributions';
  end if;
  if v_project.owner_id = v_user then
    raise exception 'cannot_back_own_project';
  end if;
  if p_amount is null or p_amount < v_project.min_contribution then
    raise exception 'amount_below_minimum';
  end if;
  if p_amount > 1000000000 then  -- 1 billion so'm per contribution
    raise exception 'amount_above_maximum';
  end if;

  if p_reward_tier_id is not null then
    if v_project.model <> 'reward' then
      raise exception 'rewards_not_available';
    end if;
    select * into v_tier from public.reward_tiers
      where id = p_reward_tier_id and project_id = p_project_id
      for update;
    if not found then
      raise exception 'reward_not_found' using errcode = 'P0002';
    end if;
    if p_amount < v_tier.amount then
      raise exception 'amount_below_reward_price';
    end if;
    if v_tier.quantity_limit is not null and v_tier.claimed_count >= v_tier.quantity_limit then
      raise exception 'reward_sold_out';
    end if;
    update public.reward_tiers set claimed_count = claimed_count + 1 where id = v_tier.id;
  end if;

  if v_project.model = 'equity' then
    select * into v_terms from public.equity_terms where project_id = p_project_id;
    if not found then
      raise exception 'equity_terms_missing';
    end if;
    if p_amount < v_terms.min_investment then
      raise exception 'amount_below_minimum';
    end if;
    -- Share of the investor pool, proportional to the target.
    v_share := round(p_amount::numeric / v_project.target_amount * v_terms.investor_profit_share_pct, 4);
  end if;

  v_first_time := not exists (
    select 1 from public.contributions
    where project_id = p_project_id and backer_id = v_user and status = 'confirmed'
  );

  insert into public.contributions
    (project_id, backer_id, amount, reward_tier_id, payment_method, equity_share_pct, is_anonymous)
  values
    (p_project_id, v_user, p_amount, p_reward_tier_id, p_payment_method, v_share, coalesce(p_is_anonymous, false))
  returning id into v_id;

  update public.projects
  set raised_amount = raised_amount + p_amount,
      backer_count  = backer_count + case when v_first_time then 1 else 0 end
  where id = p_project_id;

  perform private.notify(v_project.owner_id, 'new_contribution',
    jsonb_build_object('project_id', p_project_id, 'contribution_id', v_id, 'amount', p_amount));
  perform private.notify(v_user, 'contribution_confirmed',
    jsonb_build_object('project_id', p_project_id, 'contribution_id', v_id, 'amount', p_amount));

  return v_id;
end;
$$;

-- Founder sends a finished draft for review. Checks everything is complete.
create function public.submit_project(p_project_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_project       public.projects%rowtype;
  v_budget_total  bigint;
  v_release_total numeric;
begin
  select * into v_project from public.projects where id = p_project_id for update;
  if not found or v_project.owner_id is distinct from auth.uid() then
    raise exception 'project_not_found' using errcode = 'P0002';
  end if;
  if private.is_blocked(auth.uid()) then
    raise exception 'account_blocked' using errcode = '42501';
  end if;
  if v_project.status not in ('draft', 'changes_requested') then
    raise exception 'project_not_editable';
  end if;

  if not exists (select 1 from public.founder_profiles where user_id = v_project.owner_id) then
    raise exception 'founder_profile_missing';
  end if;
  if not exists (
    select 1 from public.project_translations
    where project_id = p_project_id and language = v_project.original_language
      and char_length(tagline) > 0 and char_length(story) >= 200
  ) then
    raise exception 'project_text_incomplete';
  end if;
  if v_project.cover_image_path is null then
    raise exception 'cover_image_missing';
  end if;

  select coalesce(sum(amount), 0) into v_budget_total from public.budget_items where project_id = p_project_id;
  if v_budget_total <> v_project.target_amount then
    raise exception 'budget_total_mismatch'
      using detail = format('budget %s ≠ target %s', v_budget_total, v_project.target_amount);
  end if;

  select coalesce(sum(release_percent), 0) into v_release_total from public.milestones where project_id = p_project_id;
  if v_release_total <> 100 then
    raise exception 'milestones_must_total_100';
  end if;

  if v_project.model = 'reward'
     and not exists (select 1 from public.reward_tiers where project_id = p_project_id) then
    raise exception 'reward_tiers_missing';
  end if;
  if v_project.model = 'equity'
     and not exists (select 1 from public.equity_terms where project_id = p_project_id) then
    raise exception 'equity_terms_missing';
  end if;

  update public.projects
  set status = 'pending_review', submitted_at = now(), review_note = null
  where id = p_project_id;

  -- Tell every admin there is something to review.
  insert into public.notifications (user_id, type, data)
  select id, 'project_submitted', jsonb_build_object('project_id', p_project_id)
  from public.profiles where role = 'admin' and not is_blocked;
end;
$$;

-- Founder reports a milestone as done, with evidence for the admin.
create function public.submit_milestone(p_milestone_id uuid, p_evidence text)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_owner  uuid;
  v_status public.project_status;
begin
  select p.owner_id, p.status into v_owner, v_status
  from public.milestones m join public.projects p on p.id = m.project_id
  where m.id = p_milestone_id;

  if v_owner is null or v_owner is distinct from auth.uid() then
    raise exception 'milestone_not_found' using errcode = 'P0002';
  end if;
  if v_status not in ('funded', 'completed') then
    raise exception 'project_not_funded';
  end if;
  if coalesce(char_length(trim(p_evidence)), 0) < 20 then
    raise exception 'evidence_too_short';
  end if;

  update public.milestones
  set status = 'submitted', evidence = p_evidence
  where id = p_milestone_id and status = 'pending';

  if not found then
    raise exception 'milestone_already_submitted';
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- Admin actions (each one is written to audit_log)
-- -----------------------------------------------------------------------------

-- Approve, send back, or reject a submitted project.
create function public.admin_review_project(
  p_project_id uuid,
  p_decision   text,          -- 'approve' | 'request_changes' | 'reject'
  p_note       text default null
)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_project public.projects%rowtype;
begin
  perform private.require_admin();

  select * into v_project from public.projects where id = p_project_id for update;
  if not found then
    raise exception 'project_not_found' using errcode = 'P0002';
  end if;
  if v_project.status <> 'pending_review' then
    raise exception 'project_not_pending_review';
  end if;

  if p_decision = 'approve' then
    if not exists (select 1 from public.evaluations where project_id = p_project_id) then
      raise exception 'evaluation_required';
    end if;
    update public.projects
    set status = 'active', starts_at = now(), ends_at = now() + make_interval(days => duration_days),
        reviewed_at = now(), reviewed_by = auth.uid(), review_note = p_note
    where id = p_project_id;
    update public.evaluations set is_published = true where project_id = p_project_id;
    perform private.notify(v_project.owner_id, 'project_approved', jsonb_build_object('project_id', p_project_id));

  elsif p_decision in ('request_changes', 'reject') then
    if coalesce(char_length(trim(p_note)), 0) < 10 then
      raise exception 'review_note_required';
    end if;
    update public.projects
    set status = case when p_decision = 'reject' then 'rejected' else 'changes_requested' end::public.project_status,
        reviewed_at = now(), reviewed_by = auth.uid(), review_note = p_note
    where id = p_project_id;
    perform private.notify(
      v_project.owner_id,
      case when p_decision = 'reject' then 'project_rejected' else 'project_changes_requested' end::public.notification_type,
      jsonb_build_object('project_id', p_project_id));

  else
    raise exception 'invalid_decision';
  end if;

  perform private.audit('project.' || p_decision, 'project', p_project_id::text, jsonb_build_object('note', p_note));
end;
$$;

-- Create or update a project's evaluation (scores 0–20 each).
create function public.admin_save_evaluation(
  p_project_id          uuid,
  p_business_plan_score smallint,
  p_team_score          smallint,
  p_market_score        smallint,
  p_financial_score     smallint,
  p_risk_score          smallint,
  p_confidence          public.evaluation_confidence,
  p_summary             text,
  p_strengths           text[] default '{}',
  p_risks               text[] default '{}'
)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  perform private.require_admin();

  insert into public.evaluations as e (
    project_id, business_plan_score, team_score, market_score, financial_score, risk_score,
    confidence, summary, strengths, risks, evaluated_by, evaluated_at,
    is_published
  )
  values (
    p_project_id, p_business_plan_score, p_team_score, p_market_score, p_financial_score, p_risk_score,
    p_confidence, coalesce(p_summary, ''), coalesce(p_strengths, '{}'), coalesce(p_risks, '{}'), auth.uid(), now(),
    -- already-live projects show the new evaluation immediately
    exists (select 1 from public.projects p where p.id = p_project_id and private.is_public_status(p.status))
  )
  on conflict (project_id) do update set
    business_plan_score = excluded.business_plan_score,
    team_score          = excluded.team_score,
    market_score        = excluded.market_score,
    financial_score     = excluded.financial_score,
    risk_score          = excluded.risk_score,
    confidence          = excluded.confidence,
    summary             = excluded.summary,
    strengths           = excluded.strengths,
    risks               = excluded.risks,
    evaluated_by        = excluded.evaluated_by,
    evaluated_at        = excluded.evaluated_at;

  perform private.audit('evaluation.save', 'project', p_project_id::text,
    jsonb_build_object('overall', p_business_plan_score + p_team_score + p_market_score + p_financial_score + p_risk_score));
end;
$$;

create function public.admin_set_featured(p_project_id uuid, p_featured boolean)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  perform private.require_admin();
  update public.projects set is_featured = p_featured where id = p_project_id;
  if not found then
    raise exception 'project_not_found' using errcode = 'P0002';
  end if;
  perform private.audit('project.set_featured', 'project', p_project_id::text, jsonb_build_object('featured', p_featured));
end;
$$;

create function public.admin_verify_founder(p_user_id uuid, p_verified boolean)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  perform private.require_admin();
  update public.founder_profiles
  set is_verified = p_verified,
      verified_at = case when p_verified then now() end,
      verified_by = case when p_verified then auth.uid() end
  where user_id = p_user_id;
  if not found then
    raise exception 'founder_profile_missing' using errcode = 'P0002';
  end if;
  perform private.audit('founder.verify', 'user', p_user_id::text, jsonb_build_object('verified', p_verified));
end;
$$;

create function public.admin_approve_milestone(p_milestone_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_project_id uuid;
begin
  perform private.require_admin();

  update public.milestones
  set status = 'approved', approved_at = now(), approved_by = auth.uid()
  where id = p_milestone_id and status = 'submitted'
  returning project_id into v_project_id;
  if v_project_id is null then
    raise exception 'milestone_not_submitted';
  end if;

  -- All milestones approved → project completed.
  if not exists (select 1 from public.milestones where project_id = v_project_id and status <> 'approved') then
    update public.projects set status = 'completed' where id = v_project_id and status = 'funded';
  end if;

  perform private.notify((select owner_id from public.projects where id = v_project_id), 'milestone_approved',
    jsonb_build_object('project_id', v_project_id, 'milestone_id', p_milestone_id));
  perform private.notify_project_audience(v_project_id, 'milestone_approved',
    jsonb_build_object('project_id', v_project_id, 'milestone_id', p_milestone_id));
  perform private.audit('milestone.approve', 'milestone', p_milestone_id::text);
end;
$$;

-- Hide or show a comment or project update (moderation).
create function public.admin_set_hidden(p_target public.report_target, p_target_id uuid, p_hidden boolean)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  perform private.require_admin();
  if p_target = 'comment' then
    update public.comments set is_hidden = p_hidden where id = p_target_id;
  elsif p_target = 'update' then
    update public.project_updates set is_hidden = p_hidden where id = p_target_id;
  else
    raise exception 'invalid_target';
  end if;
  if not found then
    raise exception 'target_not_found' using errcode = 'P0002';
  end if;
  perform private.audit(p_target::text || '.set_hidden', p_target::text, p_target_id::text,
    jsonb_build_object('hidden', p_hidden));
end;
$$;

create function public.admin_resolve_report(p_report_id uuid, p_status public.report_status)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  perform private.require_admin();
  if p_status = 'open' then
    raise exception 'invalid_status';
  end if;
  update public.reports
  set status = p_status, resolved_by = auth.uid(), resolved_at = now()
  where id = p_report_id;
  if not found then
    raise exception 'report_not_found' using errcode = 'P0002';
  end if;
  perform private.audit('report.' || p_status::text, 'report', p_report_id::text);
end;
$$;

create function public.admin_set_user_blocked(p_user_id uuid, p_blocked boolean)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  perform private.require_admin();
  if p_user_id = auth.uid() then
    raise exception 'cannot_block_self';
  end if;
  update public.profiles set is_blocked = p_blocked where id = p_user_id;
  if not found then
    raise exception 'user_not_found' using errcode = 'P0002';
  end if;
  perform private.audit('user.set_blocked', 'user', p_user_id::text, jsonb_build_object('blocked', p_blocked));
end;
$$;

create function public.admin_set_role(p_user_id uuid, p_role public.app_role)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  perform private.require_admin();
  if p_user_id = auth.uid() then
    raise exception 'cannot_change_own_role';
  end if;
  update public.profiles set role = p_role where id = p_user_id;
  if not found then
    raise exception 'user_not_found' using errcode = 'P0002';
  end if;
  perform private.audit('user.set_role', 'user', p_user_id::text, jsonb_build_object('role', p_role));
end;
$$;

-- -----------------------------------------------------------------------------
-- Scheduled job (run by pg_cron, see *_scheduled_jobs migration)
-- -----------------------------------------------------------------------------

-- Close campaigns whose time is up: 'funded' if they reached the target,
-- otherwise 'unsuccessful'. Returns how many were closed.
create function private.close_ended_projects()
returns integer
language plpgsql security definer set search_path = ''
as $$
declare
  v_project record;
  v_count   integer := 0;
begin
  for v_project in
    update public.projects
    set status = case when raised_amount >= target_amount then 'funded' else 'unsuccessful' end::public.project_status
    where status = 'active' and ends_at <= now()
    returning id, owner_id, status
  loop
    v_count := v_count + 1;
    perform private.notify(v_project.owner_id, 'project_ended',
      jsonb_build_object('project_id', v_project.id, 'status', v_project.status));
    perform private.notify_project_audience(v_project.id, 'project_ended',
      jsonb_build_object('project_id', v_project.id, 'status', v_project.status), v_project.owner_id);
  end loop;
  return v_count;
end;
$$;
