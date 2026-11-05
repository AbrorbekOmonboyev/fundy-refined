-- =============================================================================
-- Phase 5 — milestone reviews and content reports
--   * admins are notified when a founder reports a milestone as done
--   * admin_return_milestone(): send a milestone back for more evidence (with a note)
--   * admins are notified of every new report; one open report per person per item
-- =============================================================================

alter type public.notification_type add value if not exists 'milestone_submitted';
alter type public.notification_type add value if not exists 'milestone_returned';
alter type public.notification_type add value if not exists 'content_reported';

alter table public.milestones add column review_note text check (char_length(review_note) <= 2000);

-- Notify admins when a milestone is reported done (status pending → submitted).
create function private.notify_milestone_submitted()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.status = 'submitted' and old.status is distinct from 'submitted' then
    insert into public.notifications (user_id, type, data)
    select id, 'milestone_submitted', jsonb_build_object('project_id', new.project_id, 'milestone_id', new.id)
    from public.profiles where role = 'admin' and not is_blocked;
  end if;
  return null;
end;
$$;

create trigger notify_milestone_submitted after update of status on public.milestones
  for each row execute function private.notify_milestone_submitted();

-- Admin sends a submitted milestone back to the founder for more evidence.
create function public.admin_return_milestone(p_milestone_id uuid, p_note text)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_project_id uuid;
begin
  perform private.require_admin();
  perform private.require_not_own_project((select project_id from public.milestones where id = p_milestone_id));
  if coalesce(char_length(trim(p_note)), 0) < 10 then
    raise exception 'review_note_required';
  end if;

  update public.milestones
  set status = 'pending', review_note = trim(p_note)
  where id = p_milestone_id and status = 'submitted'
  returning project_id into v_project_id;
  if v_project_id is null then
    raise exception 'milestone_not_submitted';
  end if;

  perform private.notify((select owner_id from public.projects where id = v_project_id), 'milestone_returned',
    jsonb_build_object('project_id', v_project_id, 'milestone_id', p_milestone_id));
  perform private.audit('milestone.return', 'milestone', p_milestone_id::text, jsonb_build_object('note', p_note));
end;
$$;

revoke all on function public.admin_return_milestone(uuid, text) from public, anon;
grant execute on function public.admin_return_milestone(uuid, text) to authenticated;

-- Approving clears an old "send back" note.
create function private.clear_milestone_note()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'approved' then
    new.review_note := null;
  end if;
  return new;
end;
$$;

create trigger clear_milestone_note before update of status on public.milestones
  for each row execute function private.clear_milestone_note();

-- Reports: one open report per person per item, and admins hear about each one.
create unique index reports_one_open_per_person
  on public.reports (reporter_id, target_type, target_id) where status = 'open';

create function private.notify_content_reported()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.notifications (user_id, type, data)
  select id, 'content_reported', jsonb_build_object('report_id', new.id, 'target_type', new.target_type)
  from public.profiles where role = 'admin' and not is_blocked and id <> new.reporter_id;
  return null;
end;
$$;

create trigger notify_content_reported after insert on public.reports
  for each row execute function private.notify_content_reported();
