-- =============================================================================
-- Scheduled jobs (pg_cron)
--
-- Every 15 minutes, close campaigns whose deadline has passed
-- (see private.close_ended_projects).
-- Skipped automatically where pg_cron isn't available (e.g. the test database).
-- =============================================================================

do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;
    perform cron.schedule(
      'close-ended-projects',
      '*/15 * * * *',
      'select private.close_ended_projects()'
    );
  else
    raise notice 'pg_cron not available — scheduled jobs not installed';
  end if;
end;
$$;
