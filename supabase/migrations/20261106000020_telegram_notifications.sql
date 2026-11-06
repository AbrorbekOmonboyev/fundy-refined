-- =============================================================================
-- Telegram notifications (optional, per user).
--
--   1. Settings → "Connect Telegram": telegram_link_token() gives a one-time code,
--      the site opens t.me/<bot>?start=<code>.
--   2. The bot (Edge Function supabase/functions/telegram) receives /start <code>
--      and calls telegram_link_chat() → the chat is linked to that user.
--   3. Every minute pg_cron asks the same function to send new notifications;
--      it reads them with telegram_pending() and marks them with telegram_mark_sent().
--
-- Chat ids live in a private table: profiles are public, chat ids are not.
-- The website (anon/authenticated) can only get a link code, see whether it's
-- linked, and unlink. Everything else is for the service role (the Edge Function).
-- =============================================================================

create table private.telegram_chats (
  user_id    uuid primary key references public.profiles (id) on delete cascade,
  chat_id    bigint not null unique,
  linked_at  timestamptz not null default now()
);

create table private.telegram_link_codes (
  code        text primary key,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now()
);

create table private.settings (
  key    text primary key,
  value  text not null
);

-- Secret the scheduled job sends to the Edge Function. Made when the migration runs,
-- so it never appears in the code.
insert into private.settings (key, value)
values ('telegram_cron_secret', replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''))
on conflict (key) do nothing;

alter table public.notifications add column telegram_sent_at timestamptz;

-- ---------------------------------------------------------------------------
-- For signed-in users (the website)
-- ---------------------------------------------------------------------------
create function public.telegram_link_token()
returns text
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_code text := replace(gen_random_uuid()::text, '-', '');
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  delete from private.telegram_link_codes where user_id = v_user or created_at < now() - interval '1 day';
  insert into private.telegram_link_codes (code, user_id) values (v_code, v_user);
  return v_code;
end;
$$;

create function public.telegram_status()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from private.telegram_chats where user_id = auth.uid());
$$;

create function public.telegram_unlink()
returns void
language sql volatile security definer set search_path = ''
as $$
  delete from private.telegram_chats where user_id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- For the Edge Function (service role only)
-- ---------------------------------------------------------------------------
create function public.telegram_link_chat(p_code text, p_chat_id bigint)
returns boolean
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_user uuid;
begin
  delete from private.telegram_link_codes
  where code = p_code and created_at > now() - interval '1 day'
  returning user_id into v_user;
  if v_user is null then return false; end if;
  delete from private.telegram_chats where chat_id = p_chat_id; -- one chat ↔ one account
  insert into private.telegram_chats (user_id, chat_id) values (v_user, p_chat_id)
  on conflict (user_id) do update set chat_id = excluded.chat_id, linked_at = now();
  return true;
end;
$$;

create function public.telegram_cron_secret_ok(p_secret text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from private.settings where key = 'telegram_cron_secret' and value = p_secret);
$$;

-- New notifications (last 24 h, not sent yet) for people who linked Telegram.
create function public.telegram_pending(p_limit integer default 50)
returns table (id uuid, chat_id bigint, type public.notification_type, data jsonb, language text, project_slug text, project_title text)
language sql stable security definer set search_path = ''
as $$
  select n.id, c.chat_id, n.type, n.data, pr.preferred_language::text,
         p.slug,
         coalesce(
           (select t.title from public.project_translations t where t.project_id = p.id and t.language = pr.preferred_language),
           (select t.title from public.project_translations t where t.project_id = p.id and t.language = p.original_language)
         )
  from public.notifications n
  join private.telegram_chats c on c.user_id = n.user_id
  join public.profiles pr on pr.id = n.user_id
  left join public.projects p on p.id = (n.data ->> 'project_id')::uuid
  where n.telegram_sent_at is null and n.created_at > now() - interval '1 day'
  order by n.created_at
  limit least(greatest(coalesce(p_limit, 50), 1), 200);
$$;

create function public.telegram_mark_sent(p_ids uuid[])
returns void
language sql volatile security definer set search_path = ''
as $$
  update public.notifications set telegram_sent_at = now() where id = any (p_ids);
$$;

-- Someone who blocks the bot: forget their chat.
create function public.telegram_forget_chat(p_chat_id bigint)
returns void
language sql volatile security definer set search_path = ''
as $$
  delete from private.telegram_chats where chat_id = p_chat_id;
$$;

revoke all on function
  public.telegram_link_token(), public.telegram_status(), public.telegram_unlink(),
  public.telegram_link_chat(text, bigint), public.telegram_cron_secret_ok(text),
  public.telegram_pending(integer), public.telegram_mark_sent(uuid[]), public.telegram_forget_chat(bigint)
from public, anon, authenticated;

grant execute on function public.telegram_link_token(), public.telegram_status(), public.telegram_unlink()
to authenticated;

grant execute on function
  public.telegram_link_chat(text, bigint), public.telegram_cron_secret_ok(text),
  public.telegram_pending(integer), public.telegram_mark_sent(uuid[]), public.telegram_forget_chat(bigint)
to service_role;

-- ---------------------------------------------------------------------------
-- Every minute: ask the Edge Function to send new notifications.
-- Only where pg_cron and pg_net exist (the live project), never in tests.
-- The function does nothing until the bot token is set.
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron')
     and exists (select 1 from pg_available_extensions where name = 'pg_net') then
    create extension if not exists pg_net;
    create extension if not exists pg_cron;
    perform cron.schedule(
      'telegram-send',
      '* * * * *',
      $job$
        select net.http_post(
          url := 'https://fjhywrgtexzpbwimfhyd.supabase.co/functions/v1/telegram',
          headers := '{"Content-Type": "application/json"}'::jsonb,
          body := jsonb_build_object('task', 'send', 'secret',
                    (select value from private.settings where key = 'telegram_cron_secret'))
        )
        where exists (select 1 from private.telegram_chats)
          and exists (select 1 from public.notifications where telegram_sent_at is null
                      and created_at > now() - interval '1 day')
      $job$
    );
  else
    raise notice 'pg_cron/pg_net not available — Telegram sending not scheduled';
  end if;
end;
$$;
