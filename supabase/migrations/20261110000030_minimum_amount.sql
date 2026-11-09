-- =============================================================================
-- The minimum anyone can give to a project is 10,000 so'm, on every project:
-- donation, reward and Musharakah alike. Triggers keep it that way, whatever a
-- founder sends. (A reward can still cost more; this is only the lowest amount.)
-- =============================================================================

create function private.fix_project_minimum()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.min_contribution := 10000;
  return new;
end;
$$;

create function private.fix_investment_minimum()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.min_investment := 10000;
  return new;
end;
$$;

revoke all on function private.fix_project_minimum() from public, anon, authenticated;
revoke all on function private.fix_investment_minimum() from public, anon, authenticated;

create trigger fix_project_minimum before insert or update of min_contribution on public.projects
  for each row execute function private.fix_project_minimum();
create trigger fix_investment_minimum before insert or update of min_investment on public.equity_terms
  for each row execute function private.fix_investment_minimum();

update public.projects set min_contribution = 10000 where min_contribution <> 10000;
update public.equity_terms set min_investment = 10000 where min_investment <> 10000;
