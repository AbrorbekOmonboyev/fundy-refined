-- =============================================================================
-- Hackathon showcase: sample projects can live next to real ones, clearly marked.
--
--   projects.is_demo   shows a "Sample" badge and a notice on the project page.
--                      Only the showcase script sets it; founders cannot.
--   Accounts at @demo.fundy.uz have no password and cannot log in. They do not
--   trigger "new user" alerts and are left out of the /getreports user list, so
--   the owner's reports keep counting real people only.
--
-- The data itself is loaded and removed by supabase/scripts/showcase*.sql.
-- =============================================================================

alter table public.projects add column is_demo boolean not null default false;

create or replace function private.notify_admins_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_email text;
begin
  select email into v_email from auth.users where id = new.id;
  if v_email like '%@demo.fundy.uz' then
    return new;
  end if;
  insert into public.notifications (user_id, type, data)
  select a.id, 'user_signed_up',
         jsonb_build_object('user_id', new.id, 'name', new.full_name, 'email', v_email)
  from public.profiles a
  where a.role = 'admin' and not a.is_blocked and a.id <> new.id;
  return new;
end;
$$;

create or replace function public.telegram_admin_report(p_chat_id bigint)
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
  where u.email not like '%@demo.fundy.uz'
  order by p.created_at desc;
end;
$$;
