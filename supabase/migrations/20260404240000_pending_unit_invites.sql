-- Inviti owner/tenant: pending per email → al primo signup collegano automaticamente l'unità

create table if not exists public.pending_unit_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  unit_id uuid not null references public.units (id) on delete cascade,
  link_role text not null check (link_role in ('owner', 'tenant')),
  invited_by uuid not null references auth.users (id) on delete cascade,
  expires_at timestamptz not null default (now() + interval '14 days'),
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists pending_unit_invites_email_idx
  on public.pending_unit_invites (lower(trim(email)))
  where consumed_at is null;

create unique index if not exists pending_unit_invites_open_unique
  on public.pending_unit_invites ((lower(trim(email))), unit_id)
  where consumed_at is null;

-- ---------------------------------------------------------------------------
create or replace function public.consume_pending_unit_invites(
  p_user_id uuid,
  p_email text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  inv public.pending_unit_invites%rowtype;
begin
  if p_email is null or length(trim(p_email)) = 0 then
    return;
  end if;

  for inv in
    select *
    from public.pending_unit_invites
    where consumed_at is null
      and expires_at > now()
      and lower(trim(email)) = lower(trim(p_email))
  loop
    if inv.link_role = 'owner' then
      insert into public.unit_owners (unit_id, owner_id)
      values (inv.unit_id, p_user_id)
      on conflict do nothing;
    elsif inv.link_role = 'tenant' then
      insert into public.unit_tenants (unit_id, tenant_id)
      values (inv.unit_id, p_user_id)
      on conflict do nothing;
    end if;

    update public.pending_unit_invites
      set consumed_at = now()
      where id = inv.id;
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Dopo profilo: consuma inviti in sospeso (nuovi utenti da email invite)
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

  perform public.consume_pending_unit_invites(new.id, new.email);

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
alter table public.pending_unit_invites enable row level security;

drop policy if exists "pending_invites_select" on public.pending_unit_invites;
create policy "pending_invites_select"
  on public.pending_unit_invites for select
  using (
    invited_by = auth.uid()
    or public.is_manager_of_unit(unit_id)
  );

drop policy if exists "pending_invites_insert" on public.pending_unit_invites;
create policy "pending_invites_insert"
  on public.pending_unit_invites for insert
  with check (
    invited_by = auth.uid()
    and public.is_manager_of_unit(unit_id)
  );

drop policy if exists "pending_invites_delete" on public.pending_unit_invites;
create policy "pending_invites_delete"
  on public.pending_unit_invites for delete
  using (
    invited_by = auth.uid()
    or public.is_manager_of_unit(unit_id)
  );

grant select, insert, delete on public.pending_unit_invites to authenticated;
