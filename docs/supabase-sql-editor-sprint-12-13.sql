-- =============================================================================
-- TMP — applica in un colpo Sprint 12 + 13 (Supabase Dashboard → SQL → New query)
-- Idempotente dove possibile. Ordine: colonna profili → funzioni → policy units.
-- =============================================================================

-- --- Sprint 12: stripe_subscription_price_id --------------------------------
alter table public.profiles
  add column if not exists stripe_subscription_price_id text;

comment on column public.profiles.stripe_subscription_price_id is
  'Active subscription recurring price id (price_...) from Stripe; set by webhook.';

-- --- Sprint 13: cap unità + RLS insert --------------------------------------
create or replace function public.manager_owned_unit_count(p_manager uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(count(*)::int, 0)
  from public.units u
  join public.workspaces w on w.id = u.workspace_id
  where w.created_by = p_manager;
$$;

create or replace function public.effective_unit_cap_for_manager(p_manager uuid)
returns integer
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  bp text;
  st text;
begin
  select p.billing_plan, p.stripe_subscription_status
    into bp, st
  from public.profiles p
  where p.id = p_manager;

  if st is null or lower(trim(st)) not in ('active', 'trialing') then
    return 3;
  end if;

  if bp is not null and lower(trim(bp)) = 'enterprise' then
    return 999999;
  end if;

  if bp is not null then
    case lower(trim(bp))
      when 'solo' then return 3;
      when 'start' then return 20;
      when 'core' then return 50;
      when 'pro' then return 100;
      else
        return 100;
    end case;
  end if;

  return 100;
end;
$$;

create or replace function public.manager_can_insert_unit(p_manager uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.manager_owned_unit_count(p_manager) < public.effective_unit_cap_for_manager(p_manager);
$$;

grant execute on function public.manager_owned_unit_count(uuid) to authenticated;
grant execute on function public.effective_unit_cap_for_manager(uuid) to authenticated;
grant execute on function public.manager_can_insert_unit(uuid) to authenticated;

drop policy if exists "units_insert_manager" on public.units;
create policy "units_insert_manager"
  on public.units for insert
  with check (
    public.is_manager_of_workspace(workspace_id)
    and public.manager_can_insert_unit(auth.uid())
  );

-- Fine. Verifica: come manager, prova insert oltre il cap → deve fallire (RLS).
