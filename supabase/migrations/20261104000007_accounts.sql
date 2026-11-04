-- =============================================================================
-- Phase 2 — accounts
--   * profiles.onboarded_at: set when the user finishes the welcome step
--   * delete_my_account(): lets users delete their own account
-- =============================================================================

alter table public.profiles add column onboarded_at timestamptz;

grant update (onboarded_at) on public.profiles to authenticated;

-- Delete the signed-in user's account (profile, saved projects, likes,
-- comments and notifications go with it).
-- Accounts with contributions or projects are kept, because those are
-- financial and public records — the app tells the user to contact support.
create function public.delete_my_account()
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'not_signed_in' using errcode = '28000';
  end if;
  if exists (select 1 from public.contributions where backer_id = v_user)
     or exists (select 1 from public.projects where owner_id = v_user) then
    raise exception 'account_has_activity';
  end if;

  delete from auth.users where id = v_user;
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
