-- =============================================================================
-- "Shu sahifada nima kamchilik koʻrdingiz?" — quick feedback about the page you are on.
--   * page_feedback: anyone (signed in or not) can send; only admins read
--   * the page address and a little context (language, screen width, dark mode, app)
--     come along automatically, so a bug report can be reproduced
--   * spam brake: 5 per 10 minutes per signed-in person, 60 per hour for all guests together
--   * admins get a bell notification (and a Telegram message if connected)
--   * admin_set_feedback_handled(): mark done / reopen (audited)
-- =============================================================================

alter type public.notification_type add value if not exists 'page_feedback';

create table public.page_feedback (
  id          uuid primary key default gen_random_uuid(),
  -- a path on this site only ("/explore?q=…"), never a full or protocol-relative link
  page        text not null check (char_length(page) between 1 and 500 and (page = '/' or page ~ '^/[^/\\]')),
  kind        text not null default 'other' check (kind in ('bug', 'confusing', 'idea', 'other')),
  message     text not null check (char_length(trim(message)) between 3 and 2000),
  email       text check (email is null or (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$' and char_length(email) <= 254)),
  context     jsonb not null default '{}' check (pg_column_size(context) <= 2000),
  user_id     uuid references public.profiles (id) on delete set null,
  status      public.contact_status not null default 'new',
  handled_by  uuid references public.profiles (id) on delete set null,
  handled_at  timestamptz,
  created_at  timestamptz not null default now()
);

create index page_feedback_status_idx on public.page_feedback (status, created_at desc);

create function private.before_page_feedback()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.user_id is not null then
    if (select count(*) from public.page_feedback
        where user_id = new.user_id and created_at > now() - interval '10 minutes') >= 5 then
      raise exception 'too_many_messages';
    end if;
  elsif (select count(*) from public.page_feedback
         where user_id is null and created_at > now() - interval '1 hour') >= 60 then
    raise exception 'too_many_messages';
  end if;
  new.message := trim(new.message);
  new.email := nullif(lower(trim(coalesce(new.email, ''))), '');
  return new;
end;
$$;

create trigger before_page_feedback before insert on public.page_feedback
  for each row execute function private.before_page_feedback();

create function private.notify_page_feedback()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.notifications (user_id, type, data)
  select id, 'page_feedback',
         jsonb_build_object('feedback_id', new.id, 'page', new.page, 'kind', new.kind,
                            'message', left(new.message, 300))
  from public.profiles where role = 'admin' and not is_blocked;
  return null;
end;
$$;

create trigger notify_page_feedback after insert on public.page_feedback
  for each row execute function private.notify_page_feedback();

create function public.admin_set_feedback_handled(p_feedback_id uuid, p_handled boolean)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  perform private.require_admin();
  update public.page_feedback
  set status = case when p_handled then 'handled' else 'new' end::public.contact_status,
      handled_by = case when p_handled then auth.uid() end,
      handled_at = case when p_handled then now() end
  where id = p_feedback_id;
  if not found then
    raise exception 'message_not_found' using errcode = 'P0002';
  end if;
  perform private.audit(case when p_handled then 'feedback.handled' else 'feedback.reopened' end, 'page_feedback', p_feedback_id::text);
end;
$$;

-- Access: anyone may send (only these columns); only admins read.
alter table public.page_feedback enable row level security;
grant insert (page, kind, message, email, context, user_id) on public.page_feedback to anon, authenticated;
grant select on public.page_feedback to authenticated;

create policy "anyone can send feedback" on public.page_feedback for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());
create policy "admins read feedback" on public.page_feedback for select to authenticated
  using (private.is_admin());

revoke all on function public.admin_set_feedback_handled(uuid, boolean) from public, anon;
grant execute on function public.admin_set_feedback_handled(uuid, boolean) to authenticated;
