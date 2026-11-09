-- =============================================================================
-- Musharakah pledges are charged automatically on a scheduled day
--
--   * Pledging = permission to charge the investor's card later
--     (contributions.charge_authorized_at). No money is taken when pledging.
--   * Goal reached → the founder has 60 days to register an MChJ (registration_due_at).
--   * Charge day = registration deadline + 1 day (projects.charge_at, set when an
--     admin confirms the company).
--       registered in time → every authorised card is charged that day
--       not registered     → nothing is charged, every pledge is cancelled (as before)
--   * A charge that fails (empty or expired card) gives that investor 7 days to pay
--     by hand; after that the pledge is dropped.
--   Payments are still simulated: the scheduled charge always succeeds in the demo.
--   The real Payme / Click saved-card charge goes where marked below.
-- =============================================================================

alter table public.contributions add column charge_authorized_at timestamptz;  -- investor allowed a later charge
alter table public.projects add column charge_at timestamptz;                  -- the scheduled charge day

-- Pledges made before this change were also promises to pay.
update public.contributions set charge_authorized_at = created_at
where status = 'pledged' and charge_authorized_at is null;

-- ---------------------------------------------------------------------------
-- contribute(): a pledge now also records the permission to charge later
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
    (project_id, backer_id, amount, payment_method, equity_share_pct, is_anonymous, extra_amount, status,
     charge_authorized_at)
  values
    (p_project_id, v_user, p_amount, p_payment_method, v_share, coalesce(p_is_anonymous, false),
     case when v_project.model = 'reward' then p_amount else 0 end,
     case when v_pledge then 'pledged' else 'confirmed' end::public.contribution_status,
     case when v_pledge then now() end)
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
-- Company confirmed → cards are charged the day after the registration deadline
-- ---------------------------------------------------------------------------
create or replace function public.admin_confirm_registration(p_project_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_project   public.projects%rowtype;
  v_charge_at timestamptz;
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

  v_charge_at := v_project.registration_due_at + interval '1 day';
  update public.projects
  set organizer_type = 'mchj', registration_confirmed_at = now(), charge_at = v_charge_at
  where id = p_project_id;

  insert into public.notifications (user_id, type, data)
  select distinct backer_id, 'pledge_payment_due'::public.notification_type,
         jsonb_build_object('project_id', p_project_id, 'charge_at', v_charge_at)
  from public.contributions
  where project_id = p_project_id and status = 'pledged';
  perform private.notify(v_project.owner_id, 'pledge_payment_due',
    jsonb_build_object('project_id', p_project_id, 'charge_at', v_charge_at, 'owner', true));

  perform private.audit('project.registration_confirmed', 'project', p_project_id::text);
end;
$$;

-- ---------------------------------------------------------------------------
-- pay_pledge(): only for an investor whose scheduled charge failed (7 days)
-- ---------------------------------------------------------------------------
create or replace function public.pay_pledge(p_contribution_id uuid, p_payment_method public.payment_method)
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
  if v_project.registration_confirmed_at is null or v_project.pledge_payment_due_at is null then
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
-- The closing job: campaigns, registration deadline, charge day, payment window
-- ---------------------------------------------------------------------------
create or replace function private.close_ended_projects()
returns integer
language plpgsql security definer set search_path = ''
as $$
declare
  v_project record;
  v_c       record;
  v_count   integer := 0;
  v_unpaid  bigint;
  v_ok      boolean;
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

  -- 2. Goal reached, but no company by the deadline: decline every pledge.
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

  -- 3. Charge day: charge every authorised card. Charges that fail get 7 days to pay by hand.
  for v_project in
    select p.id, p.owner_id from public.projects p
    where p.registration_confirmed_at is not null and p.charge_at <= now()
      and p.pledge_payment_due_at is null
    for update
  loop
    v_count := v_count + 1;
    for v_c in
      select * from public.contributions
      where project_id = v_project.id and status = 'pledged'
      for update
    loop
      -- Real payments: charge the saved Payme / Click card here and set v_ok from the answer.
      v_ok := v_c.charge_authorized_at is not null;   -- demo: an authorised charge always succeeds
      if v_ok then
        update public.contributions set status = 'confirmed' where id = v_c.id;
        perform private.notify(v_c.backer_id, 'contribution_confirmed',
          jsonb_build_object('project_id', v_project.id, 'contribution_id', v_c.id, 'amount', v_c.amount, 'paid', true));
      end if;
    end loop;

    update public.projects set pledge_payment_due_at = now() + interval '7 days' where id = v_project.id;

    insert into public.notifications (user_id, type, data)
    select distinct backer_id, 'pledge_payment_due'::public.notification_type,
           jsonb_build_object('project_id', v_project.id, 'due_at', now() + interval '7 days', 'failed', true)
    from public.contributions
    where project_id = v_project.id and status = 'pledged';
    perform private.notify(v_project.owner_id, 'pledge_payment_due',
      jsonb_build_object('project_id', v_project.id, 'charged', true, 'owner', true));
  end loop;

  -- 4. Payment window closed: unpaid pledges are dropped and leave the total.
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
