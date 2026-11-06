-- =============================================================================
-- Recent backers of a public project, for the "who backed this lately" list.
-- Shows only a first name and city — never amounts, emails or full names — and
-- never people who chose to stay anonymous. Real records only.
-- =============================================================================

create function public.recent_backers(p_project_id uuid, p_limit integer default 5)
returns table (first_name text, city text, backed_at timestamptz)
language sql stable security definer
set search_path = ''
as $$
  select split_part(trim(pr.full_name), ' ', 1), pr.city, x.created_at
  from public.contributions x
  join public.profiles pr on pr.id = x.backer_id
  join public.projects p on p.id = x.project_id
  where x.project_id = p_project_id
    and x.status = 'confirmed'
    and not x.is_anonymous
    and private.is_public_status(p.status)
    and coalesce(trim(pr.full_name), '') <> ''
  order by x.created_at desc
  limit least(greatest(coalesce(p_limit, 5), 1), 10);
$$;

grant execute on function public.recent_backers(uuid, integer) to anon, authenticated;
