-- Case timeline: audit-style events (system triggers + manager “user” notes/activity)

create table if not exists public.case_timeline_events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  body text not null,
  event_source text not null
    check (event_source in ('system', 'user')),
  sort_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists case_timeline_events_case_sort_idx
  on public.case_timeline_events (case_id, sort_at);

alter table public.case_timeline_events enable row level security;

drop policy if exists "case_timeline_select" on public.case_timeline_events;
create policy "case_timeline_select"
  on public.case_timeline_events for select
  using (
    exists (
      select 1 from public.cases c
      where c.id = case_timeline_events.case_id
        and public.can_view_unit(c.unit_id)
    )
  );

drop policy if exists "case_timeline_insert_user_manager" on public.case_timeline_events;
create policy "case_timeline_insert_user_manager"
  on public.case_timeline_events for insert
  with check (
    event_source = 'user'
    and exists (
      select 1 from public.cases c
      where c.id = case_timeline_events.case_id
        and public.is_manager_of_unit(c.unit_id)
    )
  );

drop policy if exists "case_timeline_delete_manager" on public.case_timeline_events;
create policy "case_timeline_delete_manager"
  on public.case_timeline_events for delete
  using (
    exists (
      select 1 from public.cases c
      where c.id = case_timeline_events.case_id
        and public.is_manager_of_unit(c.unit_id)
    )
  );

grant select, insert, delete on public.case_timeline_events to authenticated;

-- System rows (RLS bypass) — do not grant execute to authenticated
create or replace function public.append_case_timeline_system(
  p_case_id uuid,
  p_body text,
  p_sort_at timestamptz,
  p_created_by uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.case_timeline_events (case_id, body, event_source, sort_at, created_by)
  values (p_case_id, p_body, 'system', coalesce(p_sort_at, now()), p_created_by);
end;
$$;

create or replace function public.trg_cases_timeline_on_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.append_case_timeline_system(
    new.id,
    'Case opened',
    new.created_at,
    new.created_by
  );
  return new;
end;
$$;

drop trigger if exists cases_after_insert_timeline on public.cases;
create trigger cases_after_insert_timeline
  after insert on public.cases
  for each row
  execute procedure public.trg_cases_timeline_on_insert();

create or replace function public.trg_cases_timeline_on_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status then
    perform public.append_case_timeline_system(
      new.id,
      'Case status set to ' || new.status,
      now(),
      auth.uid()
    );
  end if;
  return new;
end;
$$;

drop trigger if exists cases_after_update_status_timeline on public.cases;
create trigger cases_after_update_status_timeline
  after update of status on public.cases
  for each row
  execute procedure public.trg_cases_timeline_on_status();

-- Cases without any timeline row (pre-migration)
do $$
declare
  r record;
begin
  for r in
    select c.id, c.created_at, c.created_by
    from public.cases c
    where not exists (
      select 1
      from public.case_timeline_events e
      where e.case_id = c.id
    )
  loop
    perform public.append_case_timeline_system(
      r.id,
      'Case opened',
      r.created_at,
      r.created_by
    );
  end loop;
end $$;
