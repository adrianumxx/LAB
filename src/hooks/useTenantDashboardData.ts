import { useQuery } from '@tanstack/react-query'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import type { CaseRow, UnitRow } from '@/lib/types/database'

export const tenantDashboardQueryKey = ['tenant-dashboard'] as const

export interface TenantLeaseRow {
  unit_id: string
  lease_start: string | null
  lease_end: string | null
}

export interface TenantDashboardPayload {
  units: UnitRow[]
  leases: TenantLeaseRow[]
  cases: CaseRow[]
}

async function fetchTenantDashboard(): Promise<TenantDashboardPayload> {
  const supabase = createSupabaseBrowserClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    throw new Error(userError.message)
  }
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: links, error: linkError } = await supabase
    .from('unit_tenants')
    .select('unit_id, lease_start, lease_end')
    .eq('tenant_id', user.id)

  if (linkError) {
    throw new Error(linkError.message)
  }

  const leaseRows = links ?? []
  const unitIds = leaseRows.map((r) => r.unit_id as string)
  if (unitIds.length === 0) {
    return { units: [], leases: [], cases: [] }
  }

  const { data: units, error: unitsError } = await supabase
    .from('units')
    .select(
      'id, workspace_id, name, address_line, city, postal_code, unit_state, created_at',
    )
    .in('id', unitIds)

  if (unitsError) {
    throw new Error(unitsError.message)
  }

  const leases: TenantLeaseRow[] = leaseRows.map((row) => ({
    unit_id: row.unit_id as string,
    lease_start: row.lease_start as string | null,
    lease_end: row.lease_end as string | null,
  }))

  const { data: cases, error: casesError } = await supabase
    .from('cases')
    .select('id, unit_id, case_type, status, due_at, created_by, created_at')
    .in('unit_id', unitIds)
    .order('created_at', { ascending: false })

  if (casesError) {
    throw new Error(casesError.message)
  }

  return {
    units: (units ?? []) as UnitRow[],
    leases,
    cases: (cases ?? []) as CaseRow[],
  }
}

export function useTenantDashboardData(userId: string | null | undefined) {
  return useQuery({
    queryKey: [...tenantDashboardQueryKey, userId ?? 'none'],
    queryFn: fetchTenantDashboard,
    enabled: Boolean(userId) && isSupabaseConfigured(),
  })
}
