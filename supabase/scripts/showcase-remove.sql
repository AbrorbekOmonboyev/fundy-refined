-- =============================================================================
-- Removes the hackathon showcase: every project marked is_demo and every account
-- at @demo.fundy.uz. Real projects and real accounts are not touched.
-- =============================================================================
begin;

delete from public.contribution_items
where contribution_id in (
  select c.id from public.contributions c
  join public.projects p on p.id = c.project_id
  where p.is_demo
);
delete from public.contributions
where project_id in (select id from public.projects where is_demo);

delete from public.projects where is_demo;  -- texts, budgets, stages, rewards, updates, comments follow

delete from auth.users where email like '%@demo.fundy.uz';  -- profiles and notifications follow

commit;
