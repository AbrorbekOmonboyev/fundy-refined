-- =============================================================================
-- Phase 7 — live notifications
-- New rows in public.notifications are pushed to the signed-in user's browser
-- (Supabase Realtime). Row Level Security still applies: each user only
-- receives their own notifications.
-- Skipped where Realtime isn't available (e.g. the test database).
-- =============================================================================

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.notifications;
  else
    raise notice 'supabase_realtime publication not found — live notifications not enabled';
  end if;
end;
$$;

-- Mark every unread notification of the signed-in user as read, in one call.
create function public.mark_all_notifications_read()
returns integer
language sql security invoker set search_path = ''
as $$
  with updated as (
    update public.notifications set read_at = now()
    where user_id = auth.uid() and read_at is null
    returning 1
  )
  select count(*)::integer from updated;
$$;

revoke all on function public.mark_all_notifications_read() from public, anon;
grant execute on function public.mark_all_notifications_read() to authenticated;
