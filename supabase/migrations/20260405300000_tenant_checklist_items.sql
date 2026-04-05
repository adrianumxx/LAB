-- Checklist move-in per tenant + unità (persistente, RLS)
-- Seed automatico su nuovo link unit_tenants + backfill righe esistenti

-- ---------------------------------------------------------------------------
-- Tabella
-- ---------------------------------------------------------------------------

create table if not exists public.tenant_checklist_items (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units (id) on delete cascade,
  tenant_id uuid not null references auth.users (id) on delete cascade,
  item_key text not null,
  title text not null,
  sort_order int not null default 0,
  completed boolean not null default false,
  completed_at timestamptz,
  due_at date,
  created_at timestamptz not null default now(),
  unique (unit_id, tenant_id, item_key)
);

create index if not exists tenant_checklist_items_unit_id_idx
  on public.tenant_checklist_items (unit_id);

create index if not exists tenant_checklist_items_tenant_id_idx
  on public.tenant_checklist_items (tenant_id);

alter table public.tenant_checklist_items enable row level security;

drop policy if exists "tenant_checklist_select" on public.tenant_checklist_items;
create policy "tenant_checklist_select"
  on public.tenant_checklist_items for select
  using (
    tenant_id = auth.uid()
    or public.is_manager_of_unit(unit_id)
    or exists (
      select 1 from public.unit_owners o
      where o.unit_id = tenant_checklist_items.unit_id
        and o.owner_id = auth.uid()
    )
  );

drop policy if exists "tenant_checklist_update_tenant" on public.tenant_checklist_items;
create policy "tenant_checklist_update_tenant"
  on public.tenant_checklist_items for update
  using (tenant_id = auth.uid())
  with check (tenant_id = auth.uid());

grant select, update on public.tenant_checklist_items to authenticated;
revoke insert on public.tenant_checklist_items from authenticated;
revoke delete on public.tenant_checklist_items from authenticated;

-- Solo completed* modificabili dal tenant (trigger)
create or replace function public.tenant_checklist_items_guard()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' then
    if new.unit_id is distinct from old.unit_id
       or new.tenant_id is distinct from old.tenant_id
       or new.item_key is distinct from old.item_key
       or new.title is distinct from old.title
       or new.sort_order is distinct from old.sort_order
       or new.due_at is distinct from old.due_at
       or new.created_at is distinct from old.created_at
    then
      raise exception 'tenant_checklist_items: only completion fields may change';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists tenant_checklist_items_guard_trg on public.tenant_checklist_items;
create trigger tenant_checklist_items_guard_trg
  before update on public.tenant_checklist_items
  for each row
  execute procedure public.tenant_checklist_items_guard();

-- ---------------------------------------------------------------------------
-- Seed (SECURITY DEFINER — bypass RLS)
-- ---------------------------------------------------------------------------

create or replace function public.seed_tenant_checklist_for_link(p_unit_id uuid, p_tenant_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.tenant_checklist_items (
    unit_id, tenant_id, item_key, title, sort_order
  )
  values
    (p_unit_id, p_tenant_id, 'move_in_walkthrough', 'Complete move-in checklist', 1),
    (p_unit_id, p_tenant_id, 'id_verification', 'Submit ID verification', 2),
    (p_unit_id, p_tenant_id, 'lease_review', 'Review and sign lease', 3),
    (p_unit_id, p_tenant_id, 'income_proof', 'Upload proof of income', 4)
  on conflict (unit_id, tenant_id, item_key) do nothing;
end;
$$;

create or replace function public.tenant_checklist_after_unit_tenant_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.seed_tenant_checklist_for_link(new.unit_id, new.tenant_id);
  return new;
end;
$$;

drop trigger if exists tenant_checklist_on_unit_tenant_insert on public.unit_tenants;
create trigger tenant_checklist_on_unit_tenant_insert
  after insert on public.unit_tenants
  for each row
  execute procedure public.tenant_checklist_after_unit_tenant_insert();

-- Backfill collegamenti già presenti
do $$
declare
  r record;
begin
  for r in select unit_id, tenant_id from public.unit_tenants
  loop
    perform public.seed_tenant_checklist_for_link(r.unit_id, r.tenant_id);
  end loop;
end $$;
