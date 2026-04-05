-- TMP — schema minimo + RLS (manager / owner / tenant)
-- Applica da Supabase Dashboard → SQL → New query, oppure: supabase db push
-- Richiede: estensione pgcrypto (già attiva su Supabase)

-- ---------------------------------------------------------------------------
-- Tabelle
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  app_role text not null
    check (app_role in ('manager', 'owner', 'tenant'))
    default 'tenant',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.units (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  address_line text,
  city text,
  postal_code text,
  unit_state text not null default 'vacant'
    check (unit_state in (
      'vacant', 'incoming', 'occupied', 'notice', 'outgoing', 'turnover'
    )),
  created_at timestamptz not null default now()
);

create table if not exists public.unit_owners (
  unit_id uuid not null references public.units (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  primary key (unit_id, owner_id)
);

create table if not exists public.unit_tenants (
  unit_id uuid not null references public.units (id) on delete cascade,
  tenant_id uuid not null references auth.users (id) on delete cascade,
  lease_start date,
  lease_end date,
  primary key (unit_id, tenant_id)
);

create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units (id) on delete cascade,
  case_type text not null
    check (case_type in (
      'move_in', 'move_out', 'incident', 'repair', 'turnover'
    )),
  status text not null default 'open',
  due_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists units_workspace_id_idx on public.units (workspace_id);
create index if not exists unit_owners_owner_id_idx on public.unit_owners (owner_id);
create index if not exists unit_tenants_tenant_id_idx on public.unit_tenants (tenant_id);
create index if not exists cases_unit_id_idx on public.cases (unit_id);

-- ---------------------------------------------------------------------------
-- Profilo da Auth (user_metadata.role + full_name)
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  r text;
begin
  r := coalesce(new.raw_user_meta_data->>'role', 'tenant');
  if r not in ('manager', 'owner', 'tenant') then
    r := 'tenant';
  end if;

  insert into public.profiles (id, email, full_name, app_role)
  values (
    new.id,
    new.email,
    nullif(trim(coalesce(new.raw_user_meta_data->>'full_name', '')), ''),
    r
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        app_role = excluded.app_role,
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

-- Utenti già esistenti (es. creati prima della migration)
insert into public.profiles (id, email, full_name, app_role)
select
  u.id,
  u.email,
  nullif(trim(coalesce(u.raw_user_meta_data->>'full_name', '')), ''),
  case
    when coalesce(u.raw_user_meta_data->>'role', '') in ('manager', 'owner', 'tenant')
      then u.raw_user_meta_data->>'role'
    else 'tenant'
  end
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Helper SECURITY DEFINER (evitano ricorsione RLS sulle stesse tabelle)
-- ---------------------------------------------------------------------------

create or replace function public.is_manager_of_workspace(p_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspaces w
    where w.id = p_workspace_id
      and w.created_by = auth.uid()
  );
$$;

create or replace function public.is_manager_of_unit(p_unit_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.units u
    join public.workspaces w on w.id = u.workspace_id
    where u.id = p_unit_id
      and w.created_by = auth.uid()
  );
$$;

create or replace function public.can_view_unit(p_unit_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_manager_of_unit(p_unit_id)
    or exists (
      select 1 from public.unit_owners o
      where o.unit_id = p_unit_id and o.owner_id = auth.uid()
    )
    or exists (
      select 1 from public.unit_tenants t
      where t.unit_id = p_unit_id and t.tenant_id = auth.uid()
    );
$$;

grant execute on function public.is_manager_of_workspace(uuid) to authenticated;
grant execute on function public.is_manager_of_unit(uuid) to authenticated;
grant execute on function public.can_view_unit(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.units enable row level security;
alter table public.unit_owners enable row level security;
alter table public.unit_tenants enable row level security;
alter table public.cases enable row level security;

-- profiles
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid());

-- workspaces (solo creatore = manager di quel workspace)
drop policy if exists "workspaces_select_own" on public.workspaces;
create policy "workspaces_select_own"
  on public.workspaces for select
  using (created_by = auth.uid());

drop policy if exists "workspaces_insert_self" on public.workspaces;
create policy "workspaces_insert_self"
  on public.workspaces for insert
  with check (created_by = auth.uid());

drop policy if exists "workspaces_update_own" on public.workspaces;
create policy "workspaces_update_own"
  on public.workspaces for update
  using (created_by = auth.uid());

drop policy if exists "workspaces_delete_own" on public.workspaces;
create policy "workspaces_delete_own"
  on public.workspaces for delete
  using (created_by = auth.uid());

-- units
drop policy if exists "units_select_if_linked" on public.units;
create policy "units_select_if_linked"
  on public.units for select
  using (public.can_view_unit(id));

drop policy if exists "units_insert_manager" on public.units;
create policy "units_insert_manager"
  on public.units for insert
  with check (public.is_manager_of_workspace(workspace_id));

drop policy if exists "units_update_manager" on public.units;
create policy "units_update_manager"
  on public.units for update
  using (public.is_manager_of_unit(id));

drop policy if exists "units_delete_manager" on public.units;
create policy "units_delete_manager"
  on public.units for delete
  using (public.is_manager_of_unit(id));

-- unit_owners
drop policy if exists "unit_owners_select" on public.unit_owners;
create policy "unit_owners_select"
  on public.unit_owners for select
  using (
    owner_id = auth.uid()
    or public.is_manager_of_unit(unit_id)
  );

drop policy if exists "unit_owners_insert_manager" on public.unit_owners;
create policy "unit_owners_insert_manager"
  on public.unit_owners for insert
  with check (public.is_manager_of_unit(unit_id));

drop policy if exists "unit_owners_delete_manager" on public.unit_owners;
create policy "unit_owners_delete_manager"
  on public.unit_owners for delete
  using (public.is_manager_of_unit(unit_id));

-- unit_tenants
drop policy if exists "unit_tenants_select" on public.unit_tenants;
create policy "unit_tenants_select"
  on public.unit_tenants for select
  using (
    tenant_id = auth.uid()
    or public.is_manager_of_unit(unit_id)
    or exists (
      select 1 from public.unit_owners o
      where o.unit_id = unit_tenants.unit_id and o.owner_id = auth.uid()
    )
  );

drop policy if exists "unit_tenants_insert_manager" on public.unit_tenants;
create policy "unit_tenants_insert_manager"
  on public.unit_tenants for insert
  with check (public.is_manager_of_unit(unit_id));

drop policy if exists "unit_tenants_update_manager" on public.unit_tenants;
create policy "unit_tenants_update_manager"
  on public.unit_tenants for update
  using (public.is_manager_of_unit(unit_id));

drop policy if exists "unit_tenants_delete_manager" on public.unit_tenants;
create policy "unit_tenants_delete_manager"
  on public.unit_tenants for delete
  using (public.is_manager_of_unit(unit_id));

-- cases
drop policy if exists "cases_select_if_unit_visible" on public.cases;
create policy "cases_select_if_unit_visible"
  on public.cases for select
  using (public.can_view_unit(unit_id));

drop policy if exists "cases_insert_manager" on public.cases;
create policy "cases_insert_manager"
  on public.cases for insert
  with check (public.is_manager_of_unit(unit_id));

drop policy if exists "cases_update_manager" on public.cases;
create policy "cases_update_manager"
  on public.cases for update
  using (public.is_manager_of_unit(unit_id));

drop policy if exists "cases_delete_manager" on public.cases;
create policy "cases_delete_manager"
  on public.cases for delete
  using (public.is_manager_of_unit(unit_id));

-- ---------------------------------------------------------------------------
-- Grant (API PostgREST)
-- ---------------------------------------------------------------------------

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
