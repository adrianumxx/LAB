-- Per-case lifecycle phases + checklist (seeded on insert; backfill for existing cases)

create table if not exists public.case_phases (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  position int not null check (position >= 0),
  title text not null,
  status text not null default 'pending'
    check (status in ('pending', 'in_progress', 'completed')),
  unique (case_id, position)
);

create table if not exists public.case_checklist_items (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  position int not null check (position >= 0),
  title text not null,
  completed boolean not null default false,
  assignee_role text,
  due_at date,
  created_at timestamptz not null default now(),
  unique (case_id, position)
);

create index if not exists case_phases_case_id_idx on public.case_phases (case_id);
create index if not exists case_checklist_items_case_id_idx
  on public.case_checklist_items (case_id);

alter table public.case_phases enable row level security;
alter table public.case_checklist_items enable row level security;

-- SELECT: anyone who can see the parent case’s unit
drop policy if exists "case_phases_select" on public.case_phases;
create policy "case_phases_select"
  on public.case_phases for select
  using (
    exists (
      select 1 from public.cases c
      where c.id = case_phases.case_id
        and public.can_view_unit(c.unit_id)
    )
  );

drop policy if exists "case_phases_insert_manager" on public.case_phases;
create policy "case_phases_insert_manager"
  on public.case_phases for insert
  with check (
    exists (
      select 1 from public.cases c
      where c.id = case_phases.case_id
        and public.is_manager_of_unit(c.unit_id)
    )
  );

drop policy if exists "case_phases_update_manager" on public.case_phases;
create policy "case_phases_update_manager"
  on public.case_phases for update
  using (
    exists (
      select 1 from public.cases c
      where c.id = case_phases.case_id
        and public.is_manager_of_unit(c.unit_id)
    )
  );

drop policy if exists "case_phases_delete_manager" on public.case_phases;
create policy "case_phases_delete_manager"
  on public.case_phases for delete
  using (
    exists (
      select 1 from public.cases c
      where c.id = case_phases.case_id
        and public.is_manager_of_unit(c.unit_id)
    )
  );

drop policy if exists "case_checklist_select" on public.case_checklist_items;
create policy "case_checklist_select"
  on public.case_checklist_items for select
  using (
    exists (
      select 1 from public.cases c
      where c.id = case_checklist_items.case_id
        and public.can_view_unit(c.unit_id)
    )
  );

drop policy if exists "case_checklist_insert_manager" on public.case_checklist_items;
create policy "case_checklist_insert_manager"
  on public.case_checklist_items for insert
  with check (
    exists (
      select 1 from public.cases c
      where c.id = case_checklist_items.case_id
        and public.is_manager_of_unit(c.unit_id)
    )
  );

drop policy if exists "case_checklist_update_manager" on public.case_checklist_items;
create policy "case_checklist_update_manager"
  on public.case_checklist_items for update
  using (
    exists (
      select 1 from public.cases c
      where c.id = case_checklist_items.case_id
        and public.is_manager_of_unit(c.unit_id)
    )
  );

drop policy if exists "case_checklist_delete_manager" on public.case_checklist_items;
create policy "case_checklist_delete_manager"
  on public.case_checklist_items for delete
  using (
    exists (
      select 1 from public.cases c
      where c.id = case_checklist_items.case_id
        and public.is_manager_of_unit(c.unit_id)
    )
  );

grant select, insert, update, delete on public.case_phases to authenticated;
grant select, insert, update, delete on public.case_checklist_items to authenticated;

-- Idempotent seed (SECURITY DEFINER bypasses RLS)
create or replace function public.seed_case_workflow_for_case(p_case_id uuid, p_case_type text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from public.case_phases where case_id = p_case_id) then
    return;
  end if;

  if p_case_type = 'move_in' then
    insert into public.case_phases (case_id, position, title, status) values
      (p_case_id, 0, 'Tenant screening', 'in_progress'),
      (p_case_id, 1, 'Background check', 'pending'),
      (p_case_id, 2, 'Move-in inspection', 'pending'),
      (p_case_id, 3, 'Key handoff', 'pending'),
      (p_case_id, 4, 'Lease activation', 'pending');
    insert into public.case_checklist_items (case_id, position, title, completed, assignee_role, due_at) values
      (p_case_id, 0, 'Verify tenant application', false, 'manager', null),
      (p_case_id, 1, 'Conduct background check', false, 'manager', null),
      (p_case_id, 2, 'Review credit report', false, 'manager', null),
      (p_case_id, 3, 'Schedule move-in inspection', false, 'manager', null),
      (p_case_id, 4, 'Prepare unit access credentials', false, 'manager', null),
      (p_case_id, 5, 'Confirm lease signatures', false, 'tenant', null);
  elsif p_case_type = 'move_out' then
    insert into public.case_phases (case_id, position, title, status) values
      (p_case_id, 0, 'Notice recorded', 'in_progress'),
      (p_case_id, 1, 'Pre move-out inspection', 'pending'),
      (p_case_id, 2, 'Move-out walkthrough', 'pending'),
      (p_case_id, 3, 'Deposit handling', 'pending'),
      (p_case_id, 4, 'Unit vacated & ready', 'pending');
    insert into public.case_checklist_items (case_id, position, title, completed, assignee_role, due_at) values
      (p_case_id, 0, 'Confirm notice dates and obligations', false, 'manager', null),
      (p_case_id, 1, 'Schedule pre move-out inspection', false, 'manager', null),
      (p_case_id, 2, 'Coordinate move-out walkthrough', false, 'manager', null),
      (p_case_id, 3, 'Process deposit within legal timeline', false, 'manager', null),
      (p_case_id, 4, 'Update unit state after vacancy', false, 'manager', null);
  elsif p_case_type = 'incident' then
    insert into public.case_phases (case_id, position, title, status) values
      (p_case_id, 0, 'Intake & triage', 'in_progress'),
      (p_case_id, 1, 'Assessment', 'pending'),
      (p_case_id, 2, 'Action plan', 'pending'),
      (p_case_id, 3, 'Resolution', 'pending'),
      (p_case_id, 4, 'Verification & close', 'pending');
    insert into public.case_checklist_items (case_id, position, title, completed, assignee_role, due_at) values
      (p_case_id, 0, 'Document incident details and parties', false, 'manager', null),
      (p_case_id, 1, 'Notify owner if required', false, 'manager', null),
      (p_case_id, 2, 'Coordinate vendor or emergency response', false, 'manager', null),
      (p_case_id, 3, 'Capture photos and written follow-up', false, 'manager', null),
      (p_case_id, 4, 'Confirm resolution with tenant', false, 'manager', null);
  elsif p_case_type = 'repair' then
    insert into public.case_phases (case_id, position, title, status) values
      (p_case_id, 0, 'Request received', 'in_progress'),
      (p_case_id, 1, 'Diagnosis / quote', 'pending'),
      (p_case_id, 2, 'Approval & scheduling', 'pending'),
      (p_case_id, 3, 'Work completed', 'pending'),
      (p_case_id, 4, 'Tenant sign-off', 'pending');
    insert into public.case_checklist_items (case_id, position, title, completed, assignee_role, due_at) values
      (p_case_id, 0, 'Acknowledge request and priority', false, 'manager', null),
      (p_case_id, 1, 'Obtain quote or scope from vendor', false, 'manager', null),
      (p_case_id, 2, 'Secure owner approval if needed', false, 'owner', null),
      (p_case_id, 3, 'Schedule access with tenant', false, 'manager', null),
      (p_case_id, 4, 'Verify completion and close ticket', false, 'manager', null);
  elsif p_case_type = 'turnover' then
    insert into public.case_phases (case_id, position, title, status) values
      (p_case_id, 0, 'Vacancy confirmed', 'in_progress'),
      (p_case_id, 1, 'Repairs & vendors', 'pending'),
      (p_case_id, 2, 'Cleaning & prep', 'pending'),
      (p_case_id, 3, 'Marketing readiness', 'pending'),
      (p_case_id, 4, 'Ready for new tenancy', 'pending');
    insert into public.case_checklist_items (case_id, position, title, completed, assignee_role, due_at) values
      (p_case_id, 0, 'Confirm unit access and keys', false, 'manager', null),
      (p_case_id, 1, 'Complete repair punch list', false, 'manager', null),
      (p_case_id, 2, 'Schedule deep clean', false, 'manager', null),
      (p_case_id, 3, 'Update listing photos and copy', false, 'manager', null),
      (p_case_id, 4, 'Hand off to leasing / move-in', false, 'manager', null);
  else
    insert into public.case_phases (case_id, position, title, status) values
      (p_case_id, 0, 'Kickoff', 'in_progress'),
      (p_case_id, 1, 'In progress', 'pending'),
      (p_case_id, 2, 'Review', 'pending'),
      (p_case_id, 3, 'Complete', 'pending');
    insert into public.case_checklist_items (case_id, position, title, completed, assignee_role, due_at) values
      (p_case_id, 0, 'Review case objectives', false, 'manager', null),
      (p_case_id, 1, 'Document key decisions', false, 'manager', null),
      (p_case_id, 2, 'Close open items', false, 'manager', null);
  end if;
end;
$$;

create or replace function public.trg_cases_seed_workflow()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.seed_case_workflow_for_case(new.id, new.case_type);
  return new;
end;
$$;

drop trigger if exists cases_after_insert_seed_workflow on public.cases;
create trigger cases_after_insert_seed_workflow
  after insert on public.cases
  for each row
  execute procedure public.trg_cases_seed_workflow();

-- Existing cases (created before this migration)
do $$
declare
  r record;
begin
  for r in
    select c.id, c.case_type
    from public.cases c
    where not exists (
      select 1 from public.case_phases p where p.case_id = c.id
    )
  loop
    perform public.seed_case_workflow_for_case(r.id, r.case_type);
  end loop;
end $$;
