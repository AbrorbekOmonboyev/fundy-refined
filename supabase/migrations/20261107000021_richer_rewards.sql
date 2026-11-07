-- =============================================================================
-- Phase A of docs/PLAN-rewards-and-pledges.md: richer rewards.
--
--   reward_tiers  + kind (reward / add-on), retail price for "−20%", photos, long
--                   description, featured / digital / hidden flags, a per-backer limit
--                   and an availability window (early-bird pricing).
--   reward_components  what a reward consists of, with quantities ("i8 ×1, CFS ×1").
--   contribute()  respects the new rules; add-ons can't be backed on their own yet
--                 (that comes with the cart in Phase B).
--   submit_project()  a reward project needs at least one main reward (not only add-ons).
-- =============================================================================

create type public.reward_kind as enum ('reward', 'addon');

alter table public.reward_tiers
  add column kind               public.reward_kind not null default 'reward',
  add column compare_at_amount  bigint,
  add column image_paths        text[] not null default '{}',
  add column long_description   text not null default '' check (char_length(long_description) <= 5000),
  add column is_featured        boolean not null default false,
  add column is_digital         boolean not null default false,
  add column is_hidden          boolean not null default false,
  add column per_backer_limit   smallint check (per_backer_limit > 0),
  add column available_from     timestamptz,
  add column available_until    timestamptz,
  add constraint reward_compare_at_above_price check (compare_at_amount is null or compare_at_amount > amount),
  add constraint reward_window_in_order check (available_from is null or available_until is null or available_from < available_until),
  add constraint reward_images_max_6 check (cardinality(image_paths) <= 6);

create table public.reward_components (
  id              uuid primary key default gen_random_uuid(),
  reward_tier_id  uuid not null references public.reward_tiers (id) on delete cascade,
  position        smallint not null default 0,
  name            text not null check (char_length(name) between 1 and 120),
  quantity        smallint not null default 1 check (quantity between 1 and 999)
);
create index reward_components_tier_idx on public.reward_components (reward_tier_id, position);

-- Existing free-text items become components (quantity 1). `items` stays for now
-- so older screens keep working; new screens read components.
insert into public.reward_components (reward_tier_id, position, name)
select t.id, i.ord - 1, left(i.item, 120)
from public.reward_tiers t
cross join lateral unnest(t.items) with ordinality as i(item, ord)
where char_length(trim(i.item)) > 0;

-- ---------------------------------------------------------------------------
-- Who may do what (same pattern as reward_tiers: anyone reads with the project,
-- the owner writes while the project is editable)
-- ---------------------------------------------------------------------------
grant insert (kind, compare_at_amount, image_paths, long_description, is_featured, is_digital, is_hidden,
              per_backer_limit, available_from, available_until)
  on public.reward_tiers to authenticated;
grant update (kind, compare_at_amount, image_paths, long_description, is_featured, is_digital, is_hidden,
              per_backer_limit, available_from, available_until)
  on public.reward_tiers to authenticated;

grant select on public.reward_components to anon, authenticated;
grant insert (reward_tier_id, position, name, quantity), update (position, name, quantity), delete
  on public.reward_components to authenticated;

alter table public.reward_components enable row level security;

create policy "read with project" on public.reward_components for select using (
  exists (select 1 from public.reward_tiers t
          where t.id = reward_tier_id and private.can_view_project(t.project_id))
);
create policy "add while editable" on public.reward_components for insert with check (
  exists (select 1 from public.reward_tiers t
          where t.id = reward_tier_id and private.can_edit_project(t.project_id))
);
create policy "edit while editable" on public.reward_components for update
  using (exists (select 1 from public.reward_tiers t
                 where t.id = reward_tier_id and private.can_edit_project(t.project_id)))
  with check (exists (select 1 from public.reward_tiers t
                      where t.id = reward_tier_id and private.can_edit_project(t.project_id)));
create policy "delete while editable" on public.reward_components for delete using (
  exists (select 1 from public.reward_tiers t
          where t.id = reward_tier_id and private.can_edit_project(t.project_id))
);

-- ---------------------------------------------------------------------------
-- contribute(): same as before, plus the new reward rules
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
  v_tier         public.reward_tiers%rowtype;
  v_terms        public.equity_terms%rowtype;
  v_share        numeric(7,4);
  v_first_time   boolean;
  v_mine         integer;
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
    -- Lock the reward so two people can't take the last unit.
    select * into v_tier from public.reward_tiers
      where id = p_reward_tier_id and project_id = p_project_id
      for update;
    if not found or v_tier.is_hidden then
      raise exception 'reward_not_found' using errcode = 'P0002';
    end if;
    if v_tier.kind = 'addon' then
      raise exception 'addon_needs_reward';
    end if;
    if (v_tier.available_from is not null and now() < v_tier.available_from)
       or (v_tier.available_until is not null and now() >= v_tier.available_until) then
      raise exception 'reward_not_available_now';
    end if;
    if p_amount < v_tier.amount then
      raise exception 'amount_below_reward_price';
    end if;
    if v_tier.quantity_limit is not null and v_tier.claimed_count >= v_tier.quantity_limit then
      raise exception 'reward_sold_out';
    end if;
    if v_tier.per_backer_limit is not null then
      select count(*) into v_mine from public.contributions
      where reward_tier_id = v_tier.id and backer_id = v_user and status = 'confirmed';
      if v_mine >= v_tier.per_backer_limit then
        raise exception 'reward_limit_per_backer';
      end if;
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

-- ---------------------------------------------------------------------------
-- submit_project(): a reward project needs at least one main (non add-on) reward
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
