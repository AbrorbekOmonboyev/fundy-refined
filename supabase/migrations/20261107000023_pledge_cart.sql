-- =============================================================================
-- Phase B of docs/PLAN-rewards-and-pledges.md: the pledge cart.
--
--   contribution_items  one row per reward / add-on in a pledge (quantity, price paid)
--   contributions       + extra_amount (support on top of rewards), shipping_amount (Phase C)
--   projects            + allow_addons_only (founder's choice; off by default)
--   contribute_cart()   one payment for several rewards and add-ons. Prices come from the
--                       database, never the browser. Rewards are locked while checking, so
--                       two people can't take the last unit.
--   contribute()        unchanged for donations and Musharakah; with a reward it now goes
--                       through contribute_cart(), so both paths share the same rules.
-- =============================================================================

alter table public.contributions
  add column extra_amount     bigint not null default 0 check (extra_amount >= 0),
  add column shipping_amount  bigint not null default 0 check (shipping_amount >= 0);

alter table public.projects add column allow_addons_only boolean not null default false;
grant update (allow_addons_only) on public.projects to authenticated;

create table public.contribution_items (
  id               uuid primary key default gen_random_uuid(),
  contribution_id  uuid not null references public.contributions (id) on delete cascade,
  reward_tier_id   uuid not null references public.reward_tiers (id) on delete restrict,
  kind             public.reward_kind not null,
  quantity         integer not null check (quantity between 1 and 99),
  unit_amount      bigint not null check (unit_amount > 0),
  unique (contribution_id, reward_tier_id)
);
create index contribution_items_tier_idx on public.contribution_items (reward_tier_id);

-- Existing pledges with a reward become one item each (so limits count them).
insert into public.contribution_items (contribution_id, reward_tier_id, kind, quantity, unit_amount)
select c.id, c.reward_tier_id, t.kind, 1, t.amount
from public.contributions c
join public.reward_tiers t on t.id = c.reward_tier_id
on conflict do nothing;

-- The part of old reward-project pledges above the reward price was extra support.
update public.contributions c
set extra_amount = c.amount
from public.projects p
where p.id = c.project_id and p.model = 'reward' and c.reward_tier_id is null;

update public.contributions c
set extra_amount = greatest(c.amount - t.amount, 0)
from public.reward_tiers t
where t.id = c.reward_tier_id;

-- Same people as the pledge itself: the backer, the project owner, admins. No direct writes.
alter table public.contribution_items enable row level security;
grant select on public.contribution_items to authenticated;
create policy "read with contribution" on public.contribution_items for select using (
  exists (
    select 1 from public.contributions c
    where c.id = contribution_id
      and (c.backer_id = auth.uid()
           or private.is_admin()
           or exists (select 1 from public.projects p where p.id = c.project_id and p.owner_id = auth.uid()))
  )
);

-- ---------------------------------------------------------------------------
-- contribute_cart(): one pledge with several items
-- p_items: [{"reward_id": "<uuid>", "quantity": 2}, …]  (prices are looked up here)
-- ---------------------------------------------------------------------------
create function public.contribute_cart(
  p_project_id      uuid,
  p_items           jsonb,
  p_extra_amount    bigint default 0,
  p_payment_method  public.payment_method default 'click',
  p_is_anonymous    boolean default false
)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_user        uuid := auth.uid();
  v_project     public.projects%rowtype;
  v_line        record;
  v_tier        public.reward_tiers%rowtype;
  v_mine        integer;
  v_items_total bigint := 0;
  v_total       bigint;
  v_has_main    boolean := false;
  v_has_addon   boolean := false;
  v_first_main  uuid;
  v_first_time  boolean;
  v_id          uuid;
begin
  if v_user is null then
    raise exception 'not_signed_in' using errcode = '28000';
  end if;
  if private.is_blocked(v_user) then
    raise exception 'account_blocked' using errcode = '42501';
  end if;
  if p_extra_amount is null or p_extra_amount < 0 then
    raise exception 'amount_below_minimum';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) > 30 then
    raise exception 'cart_invalid';
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
  if jsonb_array_length(p_items) > 0 and v_project.model <> 'reward' then
    raise exception 'rewards_not_available';
  end if;

  -- The cart, one line per reward (same reward twice → quantities added up).
  create temporary table if not exists cart_lines (reward_id uuid primary key, quantity integer) on commit drop;
  truncate cart_lines;
  begin
    insert into cart_lines (reward_id, quantity)
    select (x ->> 'reward_id')::uuid, sum((x ->> 'quantity')::integer)
    from jsonb_array_elements(p_items) x
    group by 1;
  exception when others then
    raise exception 'cart_invalid';
  end;
  if exists (select 1 from cart_lines where quantity is null or quantity < 1 or quantity > 99) then
    raise exception 'cart_invalid';
  end if;

  -- Check every reward, locked in a fixed order (no deadlocks between two carts).
  for v_line in select * from cart_lines order by reward_id loop
    select * into v_tier from public.reward_tiers
      where id = v_line.reward_id and project_id = p_project_id
      for update;
    if not found or v_tier.is_hidden then
      raise exception 'reward_not_found' using errcode = 'P0002';
    end if;
    if (v_tier.available_from is not null and now() < v_tier.available_from)
       or (v_tier.available_until is not null and now() >= v_tier.available_until) then
      raise exception 'reward_not_available_now';
    end if;
    if v_tier.quantity_limit is not null and v_tier.claimed_count + v_line.quantity > v_tier.quantity_limit then
      raise exception 'reward_sold_out';
    end if;
    if v_tier.per_backer_limit is not null then
      select coalesce(sum(i.quantity), 0) into v_mine
      from public.contribution_items i
      join public.contributions c on c.id = i.contribution_id
      where i.reward_tier_id = v_tier.id and c.backer_id = v_user and c.status = 'confirmed';
      if v_mine + v_line.quantity > v_tier.per_backer_limit then
        raise exception 'reward_limit_per_backer';
      end if;
    end if;
    v_items_total := v_items_total + v_tier.amount * v_line.quantity;
    if v_tier.kind = 'reward' then
      v_has_main := true;
      v_first_main := coalesce(v_first_main, v_tier.id);
    else
      v_has_addon := true;
    end if;
  end loop;

  -- Add-ons ride along with a main reward: in this cart, or one backed before.
  if v_has_addon and not v_has_main and not v_project.allow_addons_only
     and not exists (
       select 1 from public.contribution_items i
       join public.contributions c on c.id = i.contribution_id
       where c.project_id = p_project_id and c.backer_id = v_user and c.status = 'confirmed' and i.kind = 'reward'
     ) then
    raise exception 'addon_needs_reward';
  end if;

  v_total := v_items_total + p_extra_amount;
  if v_total < v_project.min_contribution then
    raise exception 'amount_below_minimum';
  end if;
  if v_total > 1000000000 then
    raise exception 'amount_above_maximum';
  end if;

  v_first_time := not exists (
    select 1 from public.contributions
    where project_id = p_project_id and backer_id = v_user and status = 'confirmed'
  );

  insert into public.contributions
    (project_id, backer_id, amount, reward_tier_id, payment_method, is_anonymous, extra_amount)
  values
    (p_project_id, v_user, v_total, v_first_main, p_payment_method, coalesce(p_is_anonymous, false), p_extra_amount)
  returning id into v_id;

  insert into public.contribution_items (contribution_id, reward_tier_id, kind, quantity, unit_amount)
  select v_id, t.id, t.kind, l.quantity, t.amount
  from cart_lines l join public.reward_tiers t on t.id = l.reward_id;

  update public.reward_tiers t set claimed_count = t.claimed_count + l.quantity
  from cart_lines l where t.id = l.reward_id;

  update public.projects
  set raised_amount = raised_amount + v_total,
      backer_count  = backer_count + case when v_first_time then 1 else 0 end
  where id = p_project_id;

  perform private.notify(v_project.owner_id, 'new_contribution',
    jsonb_build_object('project_id', p_project_id, 'contribution_id', v_id, 'amount', v_total));
  perform private.notify(v_user, 'contribution_confirmed',
    jsonb_build_object('project_id', p_project_id, 'contribution_id', v_id, 'amount', v_total));

  return v_id;
end;
$$;

grant execute on function public.contribute_cart(uuid, jsonb, bigint, public.payment_method, boolean) to authenticated;

-- ---------------------------------------------------------------------------
-- contribute(): with a reward it is now a one-line cart; otherwise unchanged.
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

  v_first_time := not exists (
    select 1 from public.contributions
    where project_id = p_project_id and backer_id = v_user and status = 'confirmed'
  );

  insert into public.contributions
    (project_id, backer_id, amount, payment_method, equity_share_pct, is_anonymous, extra_amount)
  values
    (p_project_id, v_user, p_amount, p_payment_method, v_share, coalesce(p_is_anonymous, false),
     case when v_project.model = 'reward' then p_amount else 0 end)
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
