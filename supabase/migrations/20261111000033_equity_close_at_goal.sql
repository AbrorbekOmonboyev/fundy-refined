-- Investment (Musharakah) raises close at their goal.
--   * A pledge can't be more than what is left of the goal (each backer's profit share is
--     worked out against the goal, so pledging past it would promise more than the founder offered).
--   * The pledge that reaches the goal closes the campaign at once: status 'funded', and the
--     60-day MChJ registration clock starts. Donation and reward campaigns are unchanged.
--   * Raises that are already fully pledged (EduNavi) are closed by this migration.

create or replace function public.contribute(
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
    -- Never more than what is left of the goal: the profit share is promised against the goal.
    if p_amount > v_project.target_amount - v_project.raised_amount then
      raise exception 'amount_above_remaining';
    end if;
    -- The last piece may be smaller than the minimum.
    if p_amount < v_terms.min_investment and p_amount <> v_project.target_amount - v_project.raised_amount then
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

  -- An investment raise closes as soon as it is fully pledged (the 60-day registration clock starts now).
  if v_project.model = 'equity' and v_project.raised_amount + p_amount >= v_project.target_amount then
    update public.projects set ends_at = now() where id = p_project_id;
    perform private.close_ended_projects();
  end if;

  return v_id;
end;
$$;

revoke all on function public.contribute(uuid, bigint, public.payment_method, uuid, boolean, bigint) from public, anon;
grant execute on function public.contribute(uuid, bigint, public.payment_method, uuid, boolean, bigint) to authenticated;

update public.projects set ends_at = now()
where status = 'active' and model = 'equity' and raised_amount >= target_amount;
select private.close_ended_projects();
