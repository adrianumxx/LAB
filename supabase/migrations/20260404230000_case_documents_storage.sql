-- Case documents: metadata in Postgres + file in Storage bucket `case-files`
-- Path object: `{case_id}/{uuid}_{filename}` — primo segmento = case id (per RLS Storage)

-- ---------------------------------------------------------------------------
-- Tabella metadati
-- ---------------------------------------------------------------------------

create table if not exists public.case_documents (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  storage_path text not null,
  original_name text,
  content_type text,
  size_bytes bigint,
  uploaded_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (case_id, storage_path)
);

create index if not exists case_documents_case_id_idx
  on public.case_documents (case_id);

alter table public.case_documents enable row level security;

drop policy if exists "case_documents_select" on public.case_documents;
create policy "case_documents_select"
  on public.case_documents for select
  using (
    exists (
      select 1 from public.cases c
      where c.id = case_documents.case_id
        and public.can_view_unit(c.unit_id)
    )
  );

drop policy if exists "case_documents_insert_manager" on public.case_documents;
create policy "case_documents_insert_manager"
  on public.case_documents for insert
  with check (
    exists (
      select 1 from public.cases c
      where c.id = case_documents.case_id
        and public.is_manager_of_unit(c.unit_id)
    )
    and uploaded_by = auth.uid()
  );

drop policy if exists "case_documents_delete_manager" on public.case_documents;
create policy "case_documents_delete_manager"
  on public.case_documents for delete
  using (
    exists (
      select 1 from public.cases c
      where c.id = case_documents.case_id
        and public.is_manager_of_unit(c.unit_id)
    )
  );

grant select, insert, delete on public.case_documents to authenticated;

-- ---------------------------------------------------------------------------
-- Bucket Storage (privato)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('case-files', 'case-files', false)
on conflict (id) do update set public = excluded.public;

-- RLS: path = case_id / file — split_part(..., 1) = case UUID
drop policy if exists "case_files_select_visible" on storage.objects;
create policy "case_files_select_visible"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'case-files'
    and exists (
      select 1 from public.cases c
      where c.id::text = split_part(name, '/', 1)
        and public.can_view_unit(c.unit_id)
    )
  );

drop policy if exists "case_files_insert_manager" on storage.objects;
create policy "case_files_insert_manager"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'case-files'
    and exists (
      select 1 from public.cases c
      where c.id::text = split_part(name, '/', 1)
        and public.is_manager_of_unit(c.unit_id)
    )
  );

drop policy if exists "case_files_delete_manager" on storage.objects;
create policy "case_files_delete_manager"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'case-files'
    and exists (
      select 1 from public.cases c
      where c.id::text = split_part(name, '/', 1)
        and public.is_manager_of_unit(c.unit_id)
    )
  );
