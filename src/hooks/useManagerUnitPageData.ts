import { useQuery } from '@tanstack/react-query'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import type { CaseRow, UnitRow } from '@/lib/types/database'
import { isUuid } from '@/lib/validation/uuid'

export const managerUnitQueryKey = (unitId: string) =>
  ['manager-unit', unitId] as const

export interface UnitOwnerLink {
  owner_id: string
}

export interface UnitTenantLink {
  tenant_id: string
  lease_start: string | null
  lease_end: string | null
}

export interface ManagerUnitPagePayload {
  unit: UnitRow | null
  owners: UnitOwnerLink[]
  tenants: UnitTenantLink[]
  cases: CaseRow[]
}

async function fetchManagerUnitPage(
  unitId: string,
): Promise<ManagerUnitPagePayload> {
  const supabase = createSupabaseBrowserClient()

  const [unitRes, ownersRes, tenantsRes, casesRes] = await Promise.all([
    supabase
      .from('units')
      .select(
        'id, workspace_id, name, address_line, city, postal_code, unit_state, created_at',
      )
      .eq('id', unitId)
      .maybeSingle(),
    supabase.from('unit_owners').select('owner_id').eq('unit_id', unitId),
    supabase
      .from('unit_tenants')
      .select('tenant_id, lease_start, lease_end')
      .eq('unit_id', unitId),
    supabase
      .from('cases')
      .select(
        'id, unit_id, case_type, status, due_at, created_by, created_at',
      )
      .eq('unit_id', unitId)
      .order('created_at', { ascending: false }),
  ])

  if (unitRes.error) {
    throw new Error(unitRes.error.message)
  }
  if (ownersRes.error) {
    throw new Error(ownersRes.error.message)
  }
  if (tenantsRes.error) {
    throw new Error(tenantsRes.error.message)
  }
  if (casesRes.error) {
    throw new Error(casesRes.error.message)
  }

  return {
    unit: unitRes.data as UnitRow | null,
    owners: (ownersRes.data ?? []) as UnitOwnerLink[],
    tenants: (tenantsRes.data ?? []) as UnitTenantLink[],
    cases: (casesRes.data ?? []) as CaseRow[],
  }
}

export function useManagerUnitPageData(unitId: string | undefined) {
  const id = unitId?.trim() ?? ''
  const valid = isUuid(id)

  return useQuery({
    queryKey: managerUnitQueryKey(id),
    queryFn: () => fetchManagerUnitPage(id),
    enabled: valid && isSupabaseConfigured(),
  })
}
