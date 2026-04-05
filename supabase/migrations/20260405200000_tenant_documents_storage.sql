-- Tenant documents: metadata in Postgres + Storage bucket `tenant-files`
-- Path: `{unit_id}/{tenant_id}/{uuid}_{filename}` — tenant isolato nel secondo segmento

-- ---------------------------------------------------------------------------
-- Tabella metadati
-- ---------------------------------------------------------------------------

create table if not exists public.tenant_documents (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units (id) on delete cascade,
  tenant_id uuid not null references auth.users (id) on delete cascade,
  storage_path text not null,
  original_name text,
  content_type text,
  size_bytes bigint,
  uploaded_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (unit_id, storage_path)
);

create index if not exists tenant_documents_unit_id_idx
  on public.tenant_documents (unit_id);

create index if not exists tenant_documents_tenant_id_idx
  on public.tenant_documents (tenant_id);

alter table public.tenant_documents enable row level security;

drop policy if exists "tenant_documents_select" on public.tenant_documents;
create policy "tenant_documents_select"
  on public.tenant_documents for select
  using (
    public.is_manager_of_unit(unit_id)
    or exists (
      select 1 from public.unit_owners o
      where o.unit_id = tenant_documents.unit_id
        and o.owner_id = auth.uid()
    )
    or tenant_id = auth.uid()
  );

drop policy if exists "tenant_documents_insert_tenant" on public.tenant_documents;
create policy "tenant_documents_insert_tenant"
  on public.tenant_documents for insert
  with check (
    tenant_id = auth.uid()
    and uploaded_by = auth.uid()
    and exists (
      select 1 from public.unit_tenants ut
      where ut.unit_id = tenant_documents.unit_id
        and ut.tenant_id = auth.uid()
    )
  );

drop policy if exists "tenant_documents_delete" on public.tenant_documents;
create policy "tenant_documents_delete"
  on public.tenant_documents for delete
  using (
    public.is_manager_of_unit(unit_id)
    or (
      tenant_id = auth.uid()
      and uploaded_by = auth.uid()
    )
  );

grant select, insert, delete on public.tenant_documents to authenticated;

-- ---------------------------------------------------------------------------
-- Bucket Storage (privato)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('tenant-files', 'tenant-files', false)
on conflict (id) do update set public = excluded.public;

-- name = unit_id / tenant_user_id / object file
drop policy if exists "tenant_files_select" on storage.objects;
create policy "tenant_files_select"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'tenant-files'
    and public.can_view_unit(split_part(name, '/', 1)::uuid)
    and (
      public.is_manager_of_unit(split_part(name, '/', 1)::uuid)
      or exists (
        select 1 from public.unit_owners o
        where o.unit_id = split_part(name, '/', 1)::uuid
          and o.owner_id = auth.uid()
      )
      or split_part(name, '/', 2) = auth.uid()::text
    )
  );

drop policy if exists "tenant_files_insert_tenant" on storage.objects;
create policy "tenant_files_insert_tenant"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'tenant-files'
    and split_part(name, '/', 2) = auth.uid()::text
    and exists (
      select 1 from public.unit_tenants ut
      where ut.unit_id = split_part(name, '/', 1)::uuid
        and ut.tenant_id = auth.uid()
    )
  );

drop policy if exists "tenant_files_delete" on storage.objects;
create policy "tenant_files_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'tenant-files'
    and (
      public.is_manager_of_unit(split_part(name, '/', 1)::uuid)
      or (
        split_part(name, '/', 2) = auth.uid()::text
        and exists (
          select 1 from public.unit_tenants ut
          where ut.unit_id = split_part(name, '/', 1)::uuid
            and ut.tenant_id = auth.uid()
        )
      )
    )
  );
