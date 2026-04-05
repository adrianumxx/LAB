import { useQuery } from '@tanstack/react-query'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import type { CaseRow, UnitRow } from '@/lib/types/database'

export const ownerDashboardQueryKey = ['owner-dashboard'] as const

export interface OwnerTenancyRow {
  unit_id: string
  unit_name: string
  tenant_id: string
  lease_start: string | null
  lease_end: string | null
}

export interface OwnerDashboardPayload {
  units: UnitRow[]
  cases: CaseRow[]
  tenancies: OwnerTenancyRow[]
  pendingOwnerApprovalCount: number
}

async function fetchOwnerDashboard(): Promise<OwnerDashboardPayload> {
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

  const { data: ownerLinks, error: linkError } = await supabase
    .from('unit_owners')
    .select('unit_id')
    .eq('owner_id', user.id)

  if (linkError) {
    throw new Error(linkError.message)
  }

  const unitIds = (ownerLinks ?? []).map((r) => r.unit_id as string)
  if (unitIds.length === 0) {
    return {
      units: [],
      cases: [],
      tenancies: [],
      pendingOwnerApprovalCount: 0,
    }
  }

  const { data: units, error: unitsError } = await supabase
    .from('units')
    .select(
      'id, workspace_id, name, address_line, city, postal_code, unit_state, created_at',
    )
    .in('id', unitIds)
    .order('created_at', { ascending: false })

  if (unitsError) {
    throw new Error(unitsError.message)
  }

  const unitList = (units ?? []) as UnitRow[]
  const nameById = new Map(unitList.map((u) => [u.id, u.name]))

  const { data: tenantRows, error: tenantError } = await supabase
    .from('unit_tenants')
    .select('unit_id, tenant_id, lease_start, lease_end')
    .in('unit_id', unitIds)

  if (tenantError) {
    throw new Error(tenantError.message)
  }

  const tenancies: OwnerTenancyRow[] = (tenantRows ?? []).map((row) => ({
    unit_id: row.unit_id as string,
    unit_name: nameById.get(row.unit_id as string) ?? '—',
    tenant_id: row.tenant_id as string,
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

  const caseList = (cases ?? []) as CaseRow[]
  const caseIds = caseList.map((c) => c.id)

  let pendingOwnerApprovalCount = 0
  if (caseIds.length > 0) {
    const { count, error: approvalCountError } = await supabase
      .from('case_checklist_items')
      .select('*', { count: 'exact', head: true })
      .in('case_id', caseIds)
      .eq('assignee_role', 'owner')
      .eq('completed', false)

    if (approvalCountError) {
      const msg = approvalCountError.message.toLowerCase()
      if (!msg.includes('does not exist') && !msg.includes('schema cache')) {
        throw new Error(approvalCountError.message)
      }
    } else {
      pendingOwnerApprovalCount = count ?? 0
    }
  }

  return {
    units: unitList,
    cases: caseList,
    tenancies,
    pendingOwnerApprovalCount,
  }
}

export function useOwnerDashboardData(userId: string | null | undefined) {
  return useQuery({
    queryKey: [...ownerDashboardQueryKey, userId ?? 'none'],
    queryFn: fetchOwnerDashboard,
    enabled: Boolean(userId) && isSupabaseConfigured(),
  })
}
