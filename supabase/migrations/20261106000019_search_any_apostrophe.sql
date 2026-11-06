-- =============================================================================
-- Search treats every Uzbek apostrophe the same: o'  oʻ  o’  o‘  o`  (and ʼ).
-- Texts now use the official letters (oʻ gʻ ʼ), but people type a plain '
-- on their keyboards — "Farg'ona" must still find "Fargʻona".
-- =============================================================================

create function private.fold_apostrophes(p text)
returns text
language sql immutable
set search_path = ''
as $$
  select translate(p, 'ʻʼ’‘`', '''''''''''');
$$;

create or replace function public.search_project_ids(p_query text)
returns setof uuid
language sql stable
set search_path = ''
as $$
  with q as (
    -- escape LIKE wildcards typed by the user, and fold apostrophes
    select '%' || replace(replace(replace(private.fold_apostrophes(trim(p_query)), '\', '\'), '%', '\%'), '_', '\_') || '%' as pattern
  )
  select p.id
  from public.projects p, q
  where char_length(trim(p_query)) >= 2
    and (
      private.fold_apostrophes(p.location) ilike q.pattern
      or exists (
        select 1 from public.project_translations t
        where t.project_id = p.id
          and (private.fold_apostrophes(t.title) ilike q.pattern
               or private.fold_apostrophes(t.tagline) ilike q.pattern
               or private.fold_apostrophes(t.summary) ilike q.pattern)
      )
      or exists (
        select 1 from public.founder_profiles f
        where f.user_id = p.owner_id
          and (private.fold_apostrophes(f.display_name) ilike q.pattern
               or private.fold_apostrophes(f.organization) ilike q.pattern)
      )
    );
$$;
