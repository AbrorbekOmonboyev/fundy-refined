-- =============================================================================
-- Donation focus: Fundy starts as a donation platform.
--
--   * private.settings 'donation_only' = 'true': only donation projects can be
--     submitted. Equity and reward projects already live (EduNavi) run to the end;
--     their data stays. Set it to 'false' to bring the other models back.
--   * Verified fund: an admin checks a fund (NGO) and marks its project
--     (projects.fund_verified_at + the registration number at that moment).
--     Changing the registration number later removes the mark until re-checked.
--   * Spending report: when a stage is reported done, the founder adds how much
--     was spent and photos of receipts (milestones.spent_amount, receipt_paths).
--     Shown publicly once an admin approves the stage.
--   * Optional tip for Fundy (contributions.tip_amount). The project receives the
--     whole donation; the tip is not part of raised_amount. Payments are simulated.
-- =============================================================================

insert into private.settings (key, value) values ('donation_only', 'true')
on conflict (key) do update set value = excluded.value;

create function private.donation_only()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce((select value from private.settings where key = 'donation_only'), 'false') = 'true';
$$;

-- ---------------------------------------------------------------------------
-- Only donation projects can be sent for review
-- ---------------------------------------------------------------------------
create function private.block_non_donation_submit()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.status = 'pending_review' and old.status is distinct from 'pending_review'
     and new.model <> 'donation' and private.donation_only() then
    raise exception 'donation_only';
  end if;
  return new;
end;
$$;

create trigger block_non_donation_submit before update of status on public.projects
  for each row execute function private.block_non_donation_submit();

-- ---------------------------------------------------------------------------
-- Verified fund
-- ---------------------------------------------------------------------------
alter table public.projects
  add column fund_verified_at         timestamptz,
  add column fund_registration_number text check (char_length(fund_registration_number) <= 60);

create function public.admin_verify_fund(p_project_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_project public.projects%rowtype;
  v_number  text;
begin
  perform private.require_admin();
  perform private.require_not_own_project(p_project_id);

  select * into v_project from public.projects where id = p_project_id for update;
  if not found then
    raise exception 'project_not_found' using errcode = 'P0002';
  end if;
  if v_project.organizer_type is distinct from 'ngo' then
    raise exception 'not_a_fund';
  end if;
  select trim(registration_number) into v_number from public.founder_profiles where user_id = v_project.owner_id;
  if coalesce(char_length(v_number), 0) = 0 then
    raise exception 'registration_number_missing';
  end if;

  update public.projects set fund_verified_at = now(), fund_registration_number = v_number where id = p_project_id;
  perform private.audit('fund.verify', 'project', p_project_id::text, jsonb_build_object('registration_number', v_number));
end;
$$;

create function public.admin_unverify_fund(p_project_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  perform private.require_admin();
  update public.projects set fund_verified_at = null, fund_registration_number = null where id = p_project_id;
  perform private.audit('fund.unverify', 'project', p_project_id::text);
end;
$$;

revoke all on function public.admin_verify_fund(uuid), public.admin_unverify_fund(uuid) from public, anon;
grant execute on function public.admin_verify_fund(uuid), public.admin_unverify_fund(uuid) to authenticated;

-- A new registration number has not been checked yet.
create function private.clear_fund_verification()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.registration_number is distinct from old.registration_number then
    update public.projects set fund_verified_at = null, fund_registration_number = null
    where owner_id = new.user_id and fund_verified_at is not null;
  end if;
  return new;
end;
$$;

create trigger clear_fund_verification after update of registration_number on public.founder_profiles
  for each row execute function private.clear_fund_verification();

-- ---------------------------------------------------------------------------
-- Spending report on each stage
-- ---------------------------------------------------------------------------
alter table public.milestones
  add column spent_amount  bigint check (spent_amount >= 0),
  add column receipt_paths text[] not null default '{}' check (cardinality(receipt_paths) <= 10);

drop function public.submit_milestone(uuid, text);

create function public.submit_milestone(
  p_milestone_id  uuid,
  p_evidence      text,
  p_spent_amount  bigint default null,
  p_receipt_paths text[] default '{}'
)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_owner  uuid;
  v_status public.project_status;
  v_path   text;
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
  if p_spent_amount is not null and p_spent_amount < 0 then
    raise exception 'spent_amount_invalid';
  end if;
  if cardinality(coalesce(p_receipt_paths, '{}')) > 10 then
    raise exception 'too_many_receipts';
  end if;
  -- Receipts must be the founder's own uploads.
  foreach v_path in array coalesce(p_receipt_paths, '{}') loop
    if v_path not like v_owner::text || '/%' then
      raise exception 'receipt_not_yours';
    end if;
  end loop;

  update public.milestones
  set status = 'submitted', evidence = p_evidence,
      spent_amount = p_spent_amount, receipt_paths = coalesce(p_receipt_paths, '{}')
  where id = p_milestone_id and status = 'pending';

  if not found then
    raise exception 'milestone_already_submitted';
  end if;
end;
$$;

revoke all on function public.submit_milestone(uuid, text, bigint, text[]) from public, anon;
grant execute on function public.submit_milestone(uuid, text, bigint, text[]) to authenticated;

-- ---------------------------------------------------------------------------
-- Optional tip for Fundy on donations
-- ---------------------------------------------------------------------------
alter table public.contributions
  add column tip_amount bigint not null default 0 check (tip_amount >= 0 and tip_amount <= 10000000);

drop function public.contribute(uuid, bigint, public.payment_method, uuid, boolean);

create function public.contribute(
  p_project_id      uuid,
  p_amount          bigint,
  p_payment_method  public.payment_method,
  p_reward_tier_id  uuid default null,
  p_is_anonymous    boolean default false,
  p_tip_amount      bigint default 0
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
  v_tip          bigint := coalesce(p_tip_amount, 0);
  v_id           uuid;
begin
  if p_reward_tier_id is not null then
    if v_tip <> 0 then
      raise exception 'tip_only_for_donations';
    end if;
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
  if v_tip < 0 or v_tip > 10000000 then
    raise exception 'tip_invalid';
  end if;
  if v_tip > 0 and v_project.model <> 'donation' then
    raise exception 'tip_only_for_donations';
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
     charge_authorized_at, tip_amount)
  values
    (p_project_id, v_user, p_amount, p_payment_method, v_share, coalesce(p_is_anonymous, false),
     case when v_project.model = 'reward' then p_amount else 0 end,
     case when v_pledge then 'pledged' else 'confirmed' end::public.contribution_status,
     case when v_pledge then now() end,
     v_tip)
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

revoke all on function public.contribute(uuid, bigint, public.payment_method, uuid, boolean, bigint) from public, anon;
grant execute on function public.contribute(uuid, bigint, public.payment_method, uuid, boolean, bigint) to authenticated;
