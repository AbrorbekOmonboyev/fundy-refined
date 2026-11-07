-- =============================================================================
-- For the owner (admins):
--   1. "New user signed up" notification — shown in the site's bell and sent to
--      Telegram (if the admin connected it), with the new person's name and email.
--   2. telegram_admin_report(): the bot's /getreports command. Answers ONLY when the
--      chat is linked to an admin account; lists every user with email, sign-up date,
--      how much they contributed and how many projects / updates / comments they have.
-- =============================================================================

alter type public.notification_type add value if not exists 'user_signed_up';

create function private.notify_admins_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_email text;
begin
  select email into v_email from auth.users where id = new.id;
  insert into public.notifications (user_id, type, data)
  select a.id, 'user_signed_up',
         jsonb_build_object('user_id', new.id, 'name', new.full_name, 'email', v_email)
  from public.profiles a
  where a.role = 'admin' and not a.is_blocked and a.id <> new.id;
  return new;
end;
$$;

create trigger notify_admins_new_user after insert on public.profiles
  for each row execute function private.notify_admins_new_user();

-- ---------------------------------------------------------------------------
-- /getreports (service role only — called by the Telegram Edge Function)
-- ---------------------------------------------------------------------------
create function public.telegram_admin_report(p_chat_id bigint)
returns table (
  full_name     text,
  email         text,
  role          text,
  signed_up_at  timestamptz,
  contributed   bigint,
  contributions integer,
  projects      integer,
  updates       integer,
  comments      integer
)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not exists (
    select 1 from private.telegram_chats c
    join public.profiles p on p.id = c.user_id
    where c.chat_id = p_chat_id and p.role = 'admin' and not p.is_blocked
  ) then
    raise exception 'admin_only';
  end if;

  return query
  select p.full_name, u.email::text, p.role::text, p.created_at,
         coalesce((select sum(x.amount) from public.contributions x
                   where x.backer_id = p.id and x.status = 'confirmed'), 0)::bigint,
         (select count(*) from public.contributions x where x.backer_id = p.id and x.status = 'confirmed')::integer,
         (select count(*) from public.projects pr where pr.owner_id = p.id)::integer,
         (select count(*) from public.project_updates pu where pu.author_id = p.id)::integer,
         (select count(*) from public.comments cm where cm.author_id = p.id)::integer
  from public.profiles p
  join auth.users u on u.id = p.id
  order by p.created_at desc;
end;
$$;

revoke all on function public.telegram_admin_report(bigint) from public, anon, authenticated;
grant execute on function public.telegram_admin_report(bigint) to service_role;
