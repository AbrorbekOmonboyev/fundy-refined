-- =============================================================================
-- Phase 8 — Contact page messages
--   * contact_messages: anyone (signed in or not) can send; only admins read
--   * at most 5 messages per hour from the same email (simple spam brake)
--   * admins are notified of every new message
--   * admin_set_message_handled(): mark done / reopen (audited)
-- =============================================================================

alter type public.notification_type add value if not exists 'contact_message';

create type public.contact_topic as enum ('general', 'founder', 'backer', 'report', 'partnership');
create type public.contact_status as enum ('new', 'handled');

create table public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(trim(name)) between 2 and 120),
  email       text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$' and char_length(email) <= 254),
  topic       public.contact_topic not null default 'general',
  message     text not null check (char_length(trim(message)) between 10 and 4000),
  user_id     uuid references public.profiles (id) on delete set null,   -- set when the sender was signed in
  status      public.contact_status not null default 'new',
  handled_by  uuid references public.profiles (id),
  handled_at  timestamptz,
  created_at  timestamptz not null default now()
);

create index contact_messages_status_idx on public.contact_messages (status, created_at desc);
create index contact_messages_email_idx on public.contact_messages (lower(email), created_at desc);

-- Spam brake + notify admins.
create function private.before_contact_message()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if (select count(*) from public.contact_messages
      where lower(email) = lower(new.email) and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'too_many_messages';
  end if;
  new.email := lower(trim(new.email));
  new.name := trim(new.name);
  return new;
end;
$$;

create trigger before_contact_message before insert on public.contact_messages
  for each row execute function private.before_contact_message();

create function private.notify_contact_message()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.notifications (user_id, type, data)
  select id, 'contact_message', jsonb_build_object('message_id', new.id, 'topic', new.topic)
  from public.profiles where role = 'admin' and not is_blocked;
  return null;
end;
$$;

create trigger notify_contact_message after insert on public.contact_messages
  for each row execute function private.notify_contact_message();

create function public.admin_set_message_handled(p_message_id uuid, p_handled boolean)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  perform private.require_admin();
  update public.contact_messages
  set status = case when p_handled then 'handled' else 'new' end::public.contact_status,
      handled_by = case when p_handled then auth.uid() end,
      handled_at = case when p_handled then now() end
  where id = p_message_id;
  if not found then
    raise exception 'message_not_found' using errcode = 'P0002';
  end if;
  perform private.audit(case when p_handled then 'message.handled' else 'message.reopened' end, 'contact_message', p_message_id::text);
end;
$$;

-- Access: anyone may send (only these columns); only admins read.
alter table public.contact_messages enable row level security;
grant insert (name, email, topic, message, user_id) on public.contact_messages to anon, authenticated;
grant select on public.contact_messages to authenticated;

create policy "anyone can send a message" on public.contact_messages for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());
create policy "admins read messages" on public.contact_messages for select to authenticated
  using (private.is_admin());

revoke all on function public.admin_set_message_handled(uuid, boolean) from public, anon;
grant execute on function public.admin_set_message_handled(uuid, boolean) to authenticated;
