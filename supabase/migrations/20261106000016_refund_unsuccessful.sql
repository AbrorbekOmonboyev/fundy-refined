-- =============================================================================
-- Campaigns that miss their goal refund their backers.
-- The site promises "if the goal isn't reached, backers get their money back";
-- this makes it true: when the closing job marks a project 'unsuccessful', every
-- confirmed contribution to it becomes 'refunded' (payments are simulated in the
-- demo; a real payment provider's refund call will hook in here later).
-- =============================================================================

create or replace function private.close_ended_projects()
returns integer
language plpgsql security definer set search_path = ''
as $$
declare
  v_project record;
  v_count   integer := 0;
begin
  for v_project in
    update public.projects
    set status = case when raised_amount >= target_amount then 'funded' else 'unsuccessful' end::public.project_status
    where status = 'active' and ends_at <= now()
    returning id, owner_id, status
  loop
    v_count := v_count + 1;

    if v_project.status = 'unsuccessful' then
      update public.contributions
      set status = 'refunded'
      where project_id = v_project.id and status = 'confirmed';
    end if;

    perform private.notify(v_project.owner_id, 'project_ended',
      jsonb_build_object('project_id', v_project.id, 'status', v_project.status));
    perform private.notify_project_audience(v_project.id, 'project_ended',
      jsonb_build_object('project_id', v_project.id, 'status', v_project.status), v_project.owner_id);
  end loop;
  return v_count;
end;
$$;
