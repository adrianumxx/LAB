-- Owner approvals (Sprint 6): owners may mark completion on checklist rows assigned to them.
-- SPEC mapping: "Approve repair / spend" → case checklist item assignee_role = 'owner' (e.g. repair case seed).

-- ---------------------------------------------------------------------------
-- Trigger: non-managers may only toggle `completed` on rows they are allowed to touch via RLS
-- ---------------------------------------------------------------------------

create or replace function public.case_checklist_items_update_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  mgr boolean;
begin
  select public.is_manager_of_unit(c.unit_id) into mgr
  from public.cases c
  where c.id = new.case_id;

  if coalesce(mgr, false) then
    return new;
  end if;

  if old.assignee_role = 'owner'
     and new.completed is distinct from old.completed
     and new.title is not distinct from old.title
     and new.position is not distinct from old.position
     and new.assignee_role is not distinct from old.assignee_role
     and new.due_at is not distinct from old.due_at
     and new.case_id is not distinct from old.case_id
     and new.created_at is not distinct from old.created_at
     and new.id is not distinct from old.id
  then
    return new;
  end if;

  raise exception 'case_checklist_items: insufficient permission for this update';
end;
$$;

drop trigger if exists case_checklist_items_update_guard_trg on public.case_checklist_items;
create trigger case_checklist_items_update_guard_trg
  before update on public.case_checklist_items
  for each row
  execute procedure public.case_checklist_items_update_guard();

-- ---------------------------------------------------------------------------
-- RLS: owner of the unit may update owner-assigned checklist rows (trigger narrows columns)
-- ---------------------------------------------------------------------------

drop policy if exists "case_checklist_update_owner_assigned" on public.case_checklist_items;
create policy "case_checklist_update_owner_assigned"
  on public.case_checklist_items for update
  using (
    assignee_role = 'owner'
    and exists (
      select 1
      from public.cases c
      inner join public.unit_owners o
        on o.unit_id = c.unit_id and o.owner_id = auth.uid()
      where c.id = case_checklist_items.case_id
    )
  )
  with check (
    assignee_role = 'owner'
    and exists (
      select 1
      from public.cases c
      inner join public.unit_owners o
        on o.unit_id = c.unit_id and o.owner_id = auth.uid()
      where c.id = case_checklist_items.case_id
    )
  );
