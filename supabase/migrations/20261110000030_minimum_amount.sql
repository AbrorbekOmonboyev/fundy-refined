-- =============================================================================
-- Every donation project has the same minimum donation: 10,000 so'm.
-- A trigger keeps it that way, also when a draft is switched to donation.
-- Reward and Musharakah projects keep their own minimums.
-- =============================================================================

create function private.fix_donation_minimum()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.model = 'donation' then
    new.min_contribution := 10000;
  end if;
  return new;
end;
$$;

revoke all on function private.fix_donation_minimum() from public, anon, authenticated;

create trigger fix_donation_minimum before insert or update of model, min_contribution on public.projects
  for each row execute function private.fix_donation_minimum();

update public.projects set min_contribution = 10000
where model = 'donation' and min_contribution <> 10000;
