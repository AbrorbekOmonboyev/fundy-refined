-- =============================================================================
-- Phase 3 — public browsing
--   * projects.funded_percent  sortable "% funded" (kept in sync automatically)
--   * search_project_ids()     text search across all languages, place and founder
--   * platform_stats()         numbers for the home page
--   * is_backer(comments)      "Backer" badge next to a comment
-- =============================================================================

alter table public.projects
  add column funded_percent numeric(8,2)
  generated always as (round(raised_amount * 100.0 / target_amount, 2)) stored;

create index projects_funded_percent_idx on public.projects (funded_percent desc);

-- Ids of visible projects matching a search, in any language.
-- Runs with the caller's rights, so drafts stay hidden.
create function public.search_project_ids(p_query text)
returns setof uuid
language sql stable
set search_path = ''
as $$
  with q as (
    -- escape LIKE wildcards typed by the user
    select '%' || replace(replace(replace(trim(p_query), '\', '\\'), '%', '\%'), '_', '\_') || '%' as pattern
  )
  select p.id
  from public.projects p, q
  where char_length(trim(p_query)) >= 2
    and (
      p.location ilike q.pattern
      or exists (
        select 1 from public.project_translations t
        where t.project_id = p.id
          and (t.title ilike q.pattern or t.tagline ilike q.pattern or t.summary ilike q.pattern)
      )
      or exists (
        select 1 from public.founder_profiles f
        where f.user_id = p.owner_id
          and (f.display_name ilike q.pattern or f.organization ilike q.pattern)
      )
    );
$$;

-- Totals for the home page. Counts distinct backers without exposing who they are.
create function public.platform_stats()
returns jsonb
language sql stable security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'raised',          coalesce(sum(p.raised_amount), 0),
    'live_projects',   count(*) filter (where p.status = 'active'),
    'public_projects', count(*),
    'equity_projects', count(*) filter (where p.model = 'equity'),
    'regions',         count(distinct p.region_id),
    'backers', (
      select count(distinct c.backer_id) from public.contributions c
      join public.projects pp on pp.id = c.project_id
      where c.status = 'confirmed' and private.is_public_status(pp.status)
    )
  )
  from public.projects p
  where private.is_public_status(p.status);
$$;

-- Computed field: select('…, is_backer') on comments.
-- True when the comment's author backed the project (and didn't choose to stay anonymous).
create function public.is_backer(c public.comments)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.contributions x
    where x.project_id = c.project_id and x.backer_id = c.author_id
      and x.status = 'confirmed' and not x.is_anonymous
  );
$$;

grant execute on function
  public.search_project_ids(text),
  public.platform_stats(),
  public.is_backer(public.comments)
to anon, authenticated;
