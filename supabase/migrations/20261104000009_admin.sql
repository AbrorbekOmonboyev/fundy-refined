-- =============================================================================
-- Phase 6 — admin panel helpers
--   * admin_list_users()      users with email and activity (emails live in auth.users,
--                             which the website can't read — so admins get this function)
--   * admin_recent_comments() newest comments across all projects, hidden ones included
-- Both refuse non-admins.
-- =============================================================================

create function public.admin_list_users(
  p_search text default null,
  p_limit  integer default 50,
  p_offset integer default 0
)
returns table (
  id                 uuid,
  full_name          text,
  email              text,
  city               text,
  role               public.app_role,
  is_blocked         boolean,
  onboarded          boolean,
  is_founder         boolean,
  project_count      bigint,
  contribution_total bigint,
  created_at         timestamptz,
  total_count        bigint
)
language plpgsql stable security definer set search_path = ''
as $$
begin
  perform private.require_admin();
  return query
  with matches as (
    select p.*, u.email::text as email
    from public.profiles p
    join auth.users u on u.id = p.id
    where p_search is null or trim(p_search) = ''
       or p.full_name ilike '%' || trim(p_search) || '%'
       or u.email ilike '%' || trim(p_search) || '%'
  )
  select
    m.id, m.full_name, m.email, m.city, m.role, m.is_blocked,
    m.onboarded_at is not null,
    exists (select 1 from public.founder_profiles f where f.user_id = m.id),
    (select count(*) from public.projects pr where pr.owner_id = m.id),
    (select coalesce(sum(c.amount), 0)::bigint from public.contributions c where c.backer_id = m.id and c.status = 'confirmed'),
    m.created_at,
    count(*) over ()
  from matches m
  order by m.created_at desc
  limit least(greatest(p_limit, 1), 200)
  offset greatest(p_offset, 0);
end;
$$;

create function public.admin_recent_comments(p_limit integer default 50, p_only_hidden boolean default false)
returns table (
  id            uuid,
  body          text,
  is_hidden     boolean,
  created_at    timestamptz,
  author_id     uuid,
  author_name   text,
  project_id    uuid,
  project_slug  text,
  parent_id     uuid
)
language plpgsql stable security definer set search_path = ''
as $$
begin
  perform private.require_admin();
  return query
  select c.id, c.body, c.is_hidden, c.created_at, c.author_id, p.full_name, c.project_id, pr.slug, c.parent_id
  from public.comments c
  join public.profiles p on p.id = c.author_id
  join public.projects pr on pr.id = c.project_id
  where not p_only_hidden or c.is_hidden
  order by c.created_at desc
  limit least(greatest(p_limit, 1), 200);
end;
$$;

revoke all on function public.admin_list_users(text, integer, integer) from public, anon;
revoke all on function public.admin_recent_comments(integer, boolean) from public, anon;
grant execute on function public.admin_list_users(text, integer, integer) to authenticated;
grant execute on function public.admin_recent_comments(integer, boolean) to authenticated;
