-- =============================================================================
-- Conflict-of-interest rule: admins may not review their own projects.
--   * admin_review_project, admin_save_evaluation, admin_approve_milestone refuse
--     when the project belongs to the admin ('cannot_review_own_project')
--   * admin_verify_founder refuses to verify yourself ('cannot_verify_self')
-- Another admin must handle it.
--
-- Also: withdraw_submission() lets a founder take a project back from the review
-- queue (pending_review → draft), e.g. to fix something or to delete it.
-- =============================================================================

create function private.require_not_own_project(p_project_id uuid)
returns void
language plpgsql stable security definer set search_path = ''
as $$
begin
  if exists (select 1 from public.projects where id = p_project_id and owner_id = auth.uid()) then
    raise exception 'cannot_review_own_project' using errcode = '42501';
  end if;
end;
$$;

create or replace function public.admin_review_project(
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
  perform private.require_not_own_project(p_project_id);

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

create or replace function public.admin_save_evaluation(
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
  perform private.require_not_own_project(p_project_id);

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

create or replace function public.admin_approve_milestone(p_milestone_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_project_id uuid;
begin
  perform private.require_admin();
  perform private.require_not_own_project((select project_id from public.milestones where id = p_milestone_id));

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

create or replace function public.admin_verify_founder(p_user_id uuid, p_verified boolean)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  perform private.require_admin();
  if p_user_id = auth.uid() then
    raise exception 'cannot_verify_self' using errcode = '42501';
  end if;
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

-- Founder takes a submitted project back to draft (before an admin decides).
create function public.withdraw_submission(p_project_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  update public.projects
  set status = 'draft', submitted_at = null
  where id = p_project_id and owner_id = auth.uid() and status = 'pending_review';
  if not found then
    raise exception 'project_not_pending_review';
  end if;
end;
$$;

revoke all on function private.require_not_own_project(uuid) from public, anon, authenticated;
revoke all on function public.withdraw_submission(uuid) from public, anon;
grant execute on function public.withdraw_submission(uuid) to authenticated;
