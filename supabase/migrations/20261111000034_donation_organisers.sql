-- =============================================================================
-- Donation organisers: funds and people (owner's decision 2026-11-11)
--
-- While Fundy is donation-only, a fundraiser is run by a registered fund (NNT) or by a
-- person / group. Sole traders (YaTT) and companies (MChJ) return with rewards and
-- Musharakah. A person needs no YaTT/MChJ certificate for a donation campaign; trust
-- comes from OneID (or the interim video call), the team's review, stage-by-stage
-- payouts with receipts, and these rules:
--   * a person's first campaign is capped (private.settings 'individual_first_cap',
--     50,000,000 so'm) until they have a completed campaign;
--   * a person's stage money is released only once their identity is confirmed, and
--     only to a card or account in that same name (admins see the name when paying);
--   * the old "register as YaTT/MChJ before payout" rule now applies to non-donation
--     projects only.
-- =============================================================================

insert into private.settings (key, value) values ('individual_first_cap', '50000000')
on conflict (key) do nothing;

create or replace function private.block_non_donation_submit()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_cap bigint;
begin
  if new.status = 'pending_review' and old.status is distinct from 'pending_review' and private.donation_only() then
    if new.model <> 'donation' then
      raise exception 'donation_only';
    end if;
    if new.organizer_type not in ('ngo', 'individual') then
      raise exception 'organizer_not_open';
    end if;
    if new.organizer_type = 'individual' then
      v_cap := coalesce((select value::bigint from private.settings where key = 'individual_first_cap'), 50000000);
      if new.target_amount > v_cap
         and not exists (select 1 from public.projects
                         where owner_id = new.owner_id and id <> new.id and status = 'completed') then
        raise exception 'individual_cap_exceeded' using detail = v_cap::text;
      end if;
    end if;
  end if;
  return new;
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

  -- People raising rewards or investment still register before the money is paid out.
  if exists (
    select 1
    from public.milestones m
    join public.projects p on p.id = m.project_id
    left join public.founder_profiles f on f.user_id = p.owner_id
    where m.id = p_milestone_id
      and p.organizer_type = 'individual'
      and p.model <> 'donation'
      and char_length(trim(coalesce(f.registration_number, ''))) = 0
  ) then
    raise exception 'registration_required_before_payout';
  end if;
  -- A person's donation money goes only to them, so their identity must be confirmed.
  if exists (
    select 1
    from public.milestones m
    join public.projects p on p.id = m.project_id
    where m.id = p_milestone_id
      and p.organizer_type = 'individual'
      and not exists (select 1 from public.founder_identities i where i.user_id = p.owner_id)
  ) then
    raise exception 'identity_not_confirmed';
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

revoke all on function public.admin_approve_milestone(uuid) from public, anon;
grant execute on function public.admin_approve_milestone(uuid) to authenticated;
