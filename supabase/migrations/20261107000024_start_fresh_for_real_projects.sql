-- =============================================================================
-- Start fresh for real projects (owner's request, 7 Nov 2026).
--
-- Removes every project (with rewards, budgets, stages, updates, comments, likes,
-- payments, reports, notifications) and every account EXCEPT the real admin(s):
-- admins whose email is not a demo address. All totals start from zero because
-- they are calculated from what remains.
--
-- Kept: the real admin account(s), contact-form messages, the audit log,
-- reference lists (regions, categories), all settings.
--
-- Safety: if no real admin is found (a fresh or test database), nothing is deleted.
-- =============================================================================

do $$
declare
  v_keep uuid[];
begin
  select array_agg(p.id) into v_keep
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.role = 'admin' and u.email is not null and u.email not like '%@demo.fundy.uz';

  if v_keep is null or cardinality(v_keep) = 0 then
    raise notice 'No real admin found — nothing deleted.';
    return;
  end if;

  -- Payments first (they block deleting projects and people).
  delete from public.contribution_items;
  delete from public.contributions;

  -- Everything about the old projects.
  delete from public.reports;
  delete from public.notifications;
  delete from public.projects; -- cascades: texts, budget, stages, rewards, updates, likes, comments, follows, documents, evaluations

  -- Links that point at people who are about to go.
  update public.founder_profiles set verified_by = null, verified_at = null, is_verified = false
    where verified_by is not null and not (verified_by = any (v_keep));
  update public.contact_messages set handled_by = null
    where handled_by is not null and not (handled_by = any (v_keep));

  -- Every other account (profiles, founder profiles, Telegram links follow automatically).
  delete from auth.users where not (id = any (v_keep));

  raise notice 'Kept % account(s); everything else removed.', cardinality(v_keep);
end;
$$;
