-- =============================================================================
-- 1. Musharakah for founders who have no company yet: "pledge now, pay after registration"
--
--   * A person (individual) or sole trader (yatt) may now run a Musharakah campaign.
--     Investors PLEDGE: a contribution with status 'pledged'. No money moves.
--   * Goal reached → the founder has 60 days to register an MChJ and add its number.
--     An admin checks it (admin_confirm_registration): the project becomes an MChJ
--     project and every investor is asked to pay within 7 days (pay_pledge).
--   * Founder misses the 60 days → the campaign closes as unsuccessful and every
--     pledge is cancelled. Nobody paid, so there is nothing to refund.
--   * Pledges not paid within the 7 days are cancelled and leave the total.
--   * No stage money is released while pledges are still unpaid.
--   A non-profit still runs donations only.
--
-- 2. Identity without uploading a passport
--
--   * founder_identities: one private row per founder whose identity is confirmed,
--     either by OneID (id.egov.uz; written by the oneid edge function) or, until
--     OneID is connected, by an admin after a short video call.
--     Only the founder and admins can read it. Nobody writes it directly.
--   * submit_project no longer asks for an uploaded ID or certificate; a registered
--     organiser still types its registration number.
--   * An admin can approve a project only once the founder's identity is confirmed.
--   Projects created before organiser types existed (organizer_type null) are unaffected.
-- =============================================================================

alter type public.contribution_status add value if not exists 'pledged';    -- promise, no money yet
alter type public.contribution_status add value if not exists 'cancelled';  -- promise that was never paid
alter type public.notification_type add value if not exists 'pledge_payment_due';
alter type public.notification_type add value if not exists 'pledges_cancelled';

-- ---------------------------------------------------------------------------
-- Who may run what
-- ---------------------------------------------------------------------------
alter table public.projects drop constraint projects_model_fits_organizer;
alter table public.projects add constraint projects_model_fits_organizer check (
  organizer_type is null or organizer_type <> 'ngo' or model = 'donation'
);

alter table public.projects
  add column pay_after_registration     boolean not null default false,  -- set by submit_project
  add column registration_due_at        timestamptz,                     -- goal reached → register by
  add column registration_confirmed_at  timestamptz,                     -- admin checked the MChJ
  add column pledge_payment_due_at      timestamptz;                     -- investors pay by
-- No grants: only the functions below change these.

-- ---------------------------------------------------------------------------
-- Confirmed identities (private)
-- ---------------------------------------------------------------------------
create type public.identity_method as enum ('oneid', 'video_call');

create table public.founder_identities (
  user_id          uuid primary key references public.profiles (id) on delete cascade,
  method           public.identity_method not null,
  full_name        text check (char_length(full_name) <= 200),
  pinfl            text check (pinfl ~ '^[0-9]{14}$'),          -- personal number (JShShIR)
  passport_number  text check (char_length(passport_number) <= 20),
  birth_date       date,
  company_tin      text check (company_tin ~ '^[0-9]{9}$'),      -- when signed in with a company key
  company_name     text check (char_length(company_name) <= 300),
  note             text check (char_length(note) <= 1000),       -- admin's note after a video call
  verified_at      timestamptz not null default now(),
  verified_by      uuid references public.profiles (id)          -- the admin; null for OneID
);

alter table public.founder_identities enable row level security;
grant select on public.founder_identities to authenticated;
grant select, insert, update on public.founder_identities to service_role;   -- the oneid edge function
create policy "own or admin reads identity" on public.founder_identities for select
  using (user_id = auth.uid() or private.is_admin());

-- An admin confirms a founder's identity after a video call (never their own).
create function public.admin_confirm_identity(p_user_id uuid, p_note text default null)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  perform private.require_admin();
  if p_user_id = auth.uid() then
    raise exception 'cannot_verify_self' using errcode = '42501';
  end if;
  if not exists (select 1 from public.profiles where id = p_user_id) then
    raise exception 'founder_profile_missing' using errcode = 'P0002';
  end if;
  -- A OneID check is stronger; never replace it with a video call.
  insert into public.founder_identities (user_id, method, note, verified_by)
  values (p_user_id, 'video_call', nullif(trim(p_note), ''), auth.uid())
  on conflict (user_id) do update
    set note = excluded.note, verified_by = excluded.verified_by, verified_at = now()
    where public.founder_identities.method = 'video_call';
  perform private.audit('identity.confirm', 'user', p_user_id::text, jsonb_build_object('method', 'video_call'));
end;
$$;

-- An admin takes a video-call confirmation back (e.g. clicked by mistake).
create function public.admin_clear_identity(p_user_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  perform private.require_admin();
  delete from public.founder_identities where user_id = p_user_id and method = 'video_call';
  perform private.audit('identity.clear', 'user', p_user_id::text);
end;
$$;

-- ---------------------------------------------------------------------------
-- submit_project(): no uploads needed; remembers whether investors pay later
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
  if v_project.organizer_type <> 'individual'
     and not exists (select 1 from public.founder_profiles
                     where user_id = v_project.owner_id
                       and char_length(trim(coalesce(registration_number, ''))) > 0) then
    raise exception 'registration_number_missing';
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
  set status = 'pending_review', submitted_at = now(), review_note = null,
      pay_after_registration = (v_project.model = 'equity' and v_project.organizer_type <> 'mchj')
  where id = p_project_id;

  insert into public.notifications (user_id, type, data)
  select id, 'project_submitted', jsonb_build_object('project_id', p_project_id)
  from public.profiles where role = 'admin' and not is_blocked;
end;
$$;

-- ---------------------------------------------------------------------------
-- admin_review_project(): approving needs a confirmed identity
-- ---------------------------------------------------------------------------
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
    if v_project.organizer_type is not null
       and not exists (select 1 from public.founder_identities where user_id = v_project.owner_id) then
      raise exception 'identity_not_confirmed';
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

-- ---------------------------------------------------------------------------
-- contribute(): on a pay-after-registration project an investment is a pledge
-- (the reward path through contribute_cart is unchanged)
-- ---------------------------------------------------------------------------
create or replace function public.contribute(
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
  v_price        bigint;
  v_terms        public.equity_terms%rowtype;
  v_share        numeric(7,4);
  v_first_time   boolean;
  v_pledge       boolean;
  v_id           uuid;
begin
  if p_reward_tier_id is not null then
    select amount into v_price from public.reward_tiers where id = p_reward_tier_id and project_id = p_project_id;
    if v_price is not null and p_amount is not null and p_amount < v_price then
      raise exception 'amount_below_reward_price';
    end if;
    return public.contribute_cart(
      p_project_id,
      jsonb_build_array(jsonb_build_object('reward_id', p_reward_tier_id, 'quantity', 1)),
      greatest(coalesce(p_amount, 0) - coalesce(v_price, 0), 0),
      p_payment_method,
      p_is_anonymous
    );
  end if;

  if v_user is null then
    raise exception 'not_signed_in' using errcode = '28000';
  end if;
  if private.is_blocked(v_user) then
    raise exception 'account_blocked' using errcode = '42501';
  end if;

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
  if p_amount > 1000000000 then
    raise exception 'amount_above_maximum';
  end if;

  if v_project.model = 'equity' then
    select * into v_terms from public.equity_terms where project_id = p_project_id;
    if not found then
      raise exception 'equity_terms_missing';
    end if;
    if p_amount < v_terms.min_investment then
      raise exception 'amount_below_minimum';
    end if;
    v_share := round(p_amount::numeric / v_project.target_amount * v_terms.investor_profit_share_pct, 4);
  end if;
  v_pledge := v_project.model = 'equity' and v_project.pay_after_registration;

  v_first_time := not exists (
    select 1 from public.contributions
    where project_id = p_project_id and backer_id = v_user and status in ('confirmed', 'pledged')
  );

  insert into public.contributions
    (project_id, backer_id, amount, payment_method, equity_share_pct, is_anonymous, extra_amount, status)
  values
    (p_project_id, v_user, p_amount, p_payment_method, v_share, coalesce(p_is_anonymous, false),
     case when v_project.model = 'reward' then p_amount else 0 end,
     case when v_pledge then 'pledged' else 'confirmed' end::public.contribution_status)
  returning id into v_id;

  update public.projects
  set raised_amount = raised_amount + p_amount,
      backer_count  = backer_count + case when v_first_time then 1 else 0 end
  where id = p_project_id;

  perform private.notify(v_project.owner_id, 'new_contribution',
    jsonb_build_object('project_id', p_project_id, 'contribution_id', v_id, 'amount', p_amount, 'pledged', v_pledge));
  perform private.notify(v_user, 'contribution_confirmed',
    jsonb_build_object('project_id', p_project_id, 'contribution_id', v_id, 'amount', p_amount, 'pledged', v_pledge));

  return v_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- The founder registered an MChJ: an admin checks it, investors are asked to pay
-- ---------------------------------------------------------------------------
create function public.admin_confirm_registration(p_project_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_project public.projects%rowtype;
  v_due     timestamptz := now() + interval '7 days';
begin
  perform private.require_admin();
  perform private.require_not_own_project(p_project_id);

  select * into v_project from public.projects where id = p_project_id for update;
  if not found then
    raise exception 'project_not_found' using errcode = 'P0002';
  end if;
  if not v_project.pay_after_registration or v_project.status <> 'funded'
     or v_project.registration_confirmed_at is not null
     or v_project.registration_due_at <= now() then
    raise exception 'registration_not_awaited';
  end if;
  if not exists (select 1 from public.founder_profiles
                 where user_id = v_project.owner_id
                   and char_length(trim(coalesce(registration_number, ''))) > 0) then
    raise exception 'registration_number_missing';
  end if;

  update public.projects
  set organizer_type = 'mchj', registration_confirmed_at = now(), pledge_payment_due_at = v_due
  where id = p_project_id;

  insert into public.notifications (user_id, type, data)
  select distinct backer_id, 'pledge_payment_due'::public.notification_type,
         jsonb_build_object('project_id', p_project_id, 'due_at', v_due)
  from public.contributions
  where project_id = p_project_id and status = 'pledged';
  perform private.notify(v_project.owner_id, 'pledge_payment_due',
    jsonb_build_object('project_id', p_project_id, 'due_at', v_due, 'owner', true));

  perform private.audit('project.registration_confirmed', 'project', p_project_id::text);
end;
$$;

-- An investor pays their pledge (simulated payment, like every payment in the demo).
create function public.pay_pledge(p_contribution_id uuid, p_payment_method public.payment_method)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_c       public.contributions%rowtype;
  v_project public.projects%rowtype;
begin
  if auth.uid() is null then
    raise exception 'not_signed_in' using errcode = '28000';
  end if;
  select * into v_c from public.contributions where id = p_contribution_id for update;
  if not found or v_c.backer_id <> auth.uid() then
    raise exception 'contribution_not_found' using errcode = 'P0002';
  end if;
  if v_c.status <> 'pledged' then
    raise exception 'pledge_not_open';
  end if;
  select * into v_project from public.projects where id = v_c.project_id;
  if v_project.registration_confirmed_at is null then
    raise exception 'pledge_payment_not_open';
  end if;
  if now() >= v_project.pledge_payment_due_at then
    raise exception 'pledge_payment_closed';
  end if;

  update public.contributions
  set status = 'confirmed', payment_method = coalesce(p_payment_method, payment_method)
  where id = p_contribution_id;

  perform private.notify(v_project.owner_id, 'new_contribution',
    jsonb_build_object('project_id', v_project.id, 'contribution_id', v_c.id, 'amount', v_c.amount, 'paid', true));
  perform private.notify(v_c.backer_id, 'contribution_confirmed',
    jsonb_build_object('project_id', v_project.id, 'contribution_id', v_c.id, 'amount', v_c.amount, 'paid', true));
end;
$$;

-- ---------------------------------------------------------------------------
-- No stage money while pledges are unpaid (plus the earlier rules)
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
  if exists (
    select 1 from public.milestones m
    join public.contributions c on c.project_id = m.project_id
    where m.id = p_milestone_id and c.status = 'pledged'
  ) then
    raise exception 'pledges_not_paid_yet';
  end if;

  update public.milestones
  set status = 'approved', approved_at = now(), approved_by = auth.uid()
  where id = p_milestone_id and status = 'submitted'
  returning project_id into v_project_id;
  if v_project_id is null then
    raise exception 'milestone_not_submitted';
  end if;

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

-- ---------------------------------------------------------------------------
-- The closing job (every 15 minutes): campaigns, registration deadline, payment window
-- ---------------------------------------------------------------------------
create or replace function private.close_ended_projects()
returns integer
language plpgsql security definer set search_path = ''
as $$
declare
  v_project record;
  v_count   integer := 0;
  v_unpaid  bigint;
begin
  -- 1. Campaigns whose time is up.
  for v_project in
    update public.projects
    set status = case when raised_amount >= target_amount then 'funded' else 'unsuccessful' end::public.project_status,
        registration_due_at = case when pay_after_registration and raised_amount >= target_amount
                                   then now() + interval '60 days' end
    where status = 'active' and ends_at <= now()
    returning id, owner_id, status, registration_due_at
  loop
    v_count := v_count + 1;

    if v_project.status = 'unsuccessful' then
      update public.contributions
      set status = case when status = 'pledged' then 'cancelled' else 'refunded' end::public.contribution_status
      where project_id = v_project.id and status in ('confirmed', 'pledged');
    end if;

    perform private.notify(v_project.owner_id, 'project_ended',
      jsonb_build_object('project_id', v_project.id, 'status', v_project.status,
                         'registration_due_at', v_project.registration_due_at, 'owner', true));
    perform private.notify_project_audience(v_project.id, 'project_ended',
      jsonb_build_object('project_id', v_project.id, 'status', v_project.status,
                         'registration_due_at', v_project.registration_due_at), v_project.owner_id);
  end loop;

  -- 2. Goal reached, but the founder did not register a company in time.
  for v_project in
    update public.projects
    set status = 'unsuccessful'
    where status = 'funded' and pay_after_registration
      and registration_confirmed_at is null and registration_due_at <= now()
    returning id, owner_id
  loop
    v_count := v_count + 1;
    update public.contributions set status = 'cancelled'
    where project_id = v_project.id and status = 'pledged';
    perform private.notify(v_project.owner_id, 'pledges_cancelled',
      jsonb_build_object('project_id', v_project.id, 'reason', 'not_registered'));
    perform private.notify_project_audience(v_project.id, 'pledges_cancelled',
      jsonb_build_object('project_id', v_project.id, 'reason', 'not_registered'), v_project.owner_id);
  end loop;

  -- 3. Payment window closed: unpaid pledges are cancelled and leave the total.
  for v_project in
    select p.id, p.owner_id from public.projects p
    where p.pledge_payment_due_at <= now()
      and exists (select 1 from public.contributions c where c.project_id = p.id and c.status = 'pledged')
    for update
  loop
    v_count := v_count + 1;
    with gone as (
      update public.contributions set status = 'cancelled'
      where project_id = v_project.id and status = 'pledged'
      returning amount
    )
    select coalesce(sum(amount), 0) into v_unpaid from gone;

    update public.projects p
    set raised_amount = greatest(p.raised_amount - v_unpaid, 0),
        backer_count = (select count(distinct backer_id) from public.contributions
                        where project_id = p.id and status = 'confirmed')
    where p.id = v_project.id;

    perform private.notify(v_project.owner_id, 'pledges_cancelled',
      jsonb_build_object('project_id', v_project.id, 'reason', 'not_paid', 'amount', v_unpaid));
  end loop;

  return v_count;
end;
$$;

revoke all on function public.admin_confirm_identity(uuid, text) from public, anon;
revoke all on function public.admin_clear_identity(uuid) from public, anon;
revoke all on function public.admin_confirm_registration(uuid) from public, anon;
revoke all on function public.pay_pledge(uuid, public.payment_method) from public, anon;
grant execute on function
  public.admin_confirm_identity(uuid, text),
  public.admin_clear_identity(uuid),
  public.admin_confirm_registration(uuid),
  public.pay_pledge(uuid, public.payment_method)
to authenticated;

-- ---------------------------------------------------------------------------
-- Tell admins when a founder whose investors are waiting adds the company number
-- ---------------------------------------------------------------------------
create function private.notify_registration_added()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if char_length(trim(coalesce(new.registration_number, ''))) > 0
     and new.registration_number is distinct from old.registration_number then
    insert into public.notifications (user_id, type, data)
    select a.id, 'project_submitted', jsonb_build_object('project_id', p.id, 'registration', true)
    from public.projects p
    cross join public.profiles a
    where p.owner_id = new.user_id and p.pay_after_registration and p.status = 'funded'
      and p.registration_confirmed_at is null
      and a.role = 'admin' and not a.is_blocked;
  end if;
  return new;
end;
$$;

create trigger founder_registration_added
  after update of registration_number on public.founder_profiles
  for each row execute function private.notify_registration_added();
revoke all on function private.notify_registration_added() from public, anon, authenticated;
