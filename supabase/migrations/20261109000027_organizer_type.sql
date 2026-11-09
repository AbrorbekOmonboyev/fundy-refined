-- =============================================================================
-- Who is raising the money?
--
-- A founder now says up front whether they are
--   individual  a person or team without a company (passport is enough to apply)
--   yatt        a sole trader (YaTT)
--   mchj        a company (MChJ)
--   ngo         a non-profit (NNT)
--
-- Rules (the same ones the /start page and the wizard show):
--   * Musharakah (equity) needs a company: only 'mchj'.
--   * A non-profit runs donation projects only.
--   * Everyone uploads an ID document before submitting.
--   * A registered organiser also gives its registration number and uploads
--     the certificate before submitting.
--   * An individual can apply and raise money with ID alone, but must register
--     (YaTT or MChJ) and add the registration number to their founder profile
--     before the first stage's money is released.
--
-- Projects created before this change keep organizer_type = null and are not
-- affected by the new submit and payout checks.
-- =============================================================================

create type public.organizer_type as enum ('individual', 'yatt', 'mchj', 'ngo');

alter table public.projects
  add column organizer_type public.organizer_type,
  add constraint projects_model_fits_organizer check (
    organizer_type is null
    or ((model <> 'equity' or organizer_type = 'mchj')
        and (organizer_type <> 'ngo' or model = 'donation'))
  );

grant insert (organizer_type), update (organizer_type) on public.projects to authenticated;

-- ---------------------------------------------------------------------------
-- submit_project(): same as before, plus the organiser checks
-- ---------------------------------------------------------------------------
create or replace function public.submit_project(p_project_id uuid)
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

  if v_project.organizer_type is null then
    raise exception 'organizer_type_missing';
  end if;

  if not exists (select 1 from public.founder_profiles where user_id = v_project.owner_id) then
    raise exception 'founder_profile_missing';
  end if;
  if not exists (select 1 from public.project_documents where project_id = p_project_id and kind = 'identity') then
    raise exception 'identity_document_missing';
  end if;
  if v_project.organizer_type <> 'individual' then
    if not exists (select 1 from public.founder_profiles
                   where user_id = v_project.owner_id
                     and char_length(trim(coalesce(registration_number, ''))) > 0) then
      raise exception 'registration_number_missing';
    end if;
    if not exists (select 1 from public.project_documents where project_id = p_project_id and kind = 'registration') then
      raise exception 'registration_document_missing';
    end if;
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
     and not exists (select 1 from public.reward_tiers
                     where project_id = p_project_id and kind = 'reward' and not is_hidden) then
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

-- ---------------------------------------------------------------------------
-- admin_approve_milestone(): same as before, but an individual's money is not
-- released until they have registered (registration number on their profile)
-- ---------------------------------------------------------------------------
create or replace function public.admin_approve_milestone(p_milestone_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_project_id uuid;
begin
  perform private.require_admin();
  perform private.require_not_own_project((select project_id from public.milestones where id = p_milestone_id));

  if exists (
    select 1
    from public.milestones m
    join public.projects p on p.id = m.project_id
    left join public.founder_profiles f on f.user_id = p.owner_id
    where m.id = p_milestone_id
      and p.organizer_type = 'individual'
      and char_length(trim(coalesce(f.registration_number, ''))) = 0
  ) then
    raise exception 'registration_required_before_payout';
  end if;

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
