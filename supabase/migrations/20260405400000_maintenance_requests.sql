-- Richieste manutenzione / guasti — tenant crea, manager aggiorna stato, owner legge

create table if not exists public.maintenance_requests (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units (id) on delete cascade,
  tenant_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'open'
    check (status in ('open', 'in_progress', 'resolved', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_by uuid references auth.users (id) on delete set null
);

create index if not exists maintenance_requests_unit_id_idx
  on public.maintenance_requests (unit_id);

create index if not exists maintenance_requests_tenant_id_idx
  on public.maintenance_requests (tenant_id);

create index if not exists maintenance_requests_status_idx
  on public.maintenance_requests (status);

alter table public.maintenance_requests enable row level security;

drop policy if exists "maintenance_requests_select" on public.maintenance_requests;
create policy "maintenance_requests_select"
  on public.maintenance_requests for select
  using (
    tenant_id = auth.uid()
    or public.is_manager_of_unit(unit_id)
    or exists (
      select 1 from public.unit_owners o
      where o.unit_id = maintenance_requests.unit_id
        and o.owner_id = auth.uid()
    )
  );

drop policy if exists "maintenance_requests_insert_tenant" on public.maintenance_requests;
create policy "maintenance_requests_insert_tenant"
  on public.maintenance_requests for insert
  with check (
    tenant_id = auth.uid()
    and coalesce(created_by, auth.uid()) = auth.uid()
    and exists (
      select 1 from public.unit_tenants ut
      where ut.unit_id = maintenance_requests.unit_id
        and ut.tenant_id = auth.uid()
    )
  );

drop policy if exists "maintenance_requests_update_manager" on public.maintenance_requests;
create policy "maintenance_requests_update_manager"
  on public.maintenance_requests for update
  using (public.is_manager_of_unit(unit_id))
  with check (public.is_manager_of_unit(unit_id));

grant select, insert, update on public.maintenance_requests to authenticated;

create or replace function public.maintenance_requests_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists maintenance_requests_updated_at_trg on public.maintenance_requests;
create trigger maintenance_requests_updated_at_trg
  before update on public.maintenance_requests
  for each row
  execute procedure public.maintenance_requests_set_updated_at();
