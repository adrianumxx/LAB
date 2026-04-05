import { useQuery } from '@tanstack/react-query'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import type {
  CaseRow,
  ManagerDashboardPayload,
  UnitRow,
  UnitTenantLeaseRow,
  WorkspaceRow,
} from '@/lib/types/database'

export const managerDashboardQueryKey = ['manager-dashboard'] as const

async function fetchManagerDashboard(): Promise<ManagerDashboardPayload> {
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

  const { data: workspaces, error: workspacesError } = await supabase
    .from('workspaces')
    .select('id, name, created_by, created_at')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  if (workspacesError) {
    throw new Error(workspacesError.message)
  }

  const ws = (workspaces ?? []) as WorkspaceRow[]
  const workspaceIds = ws.map((w) => w.id)

  if (workspaceIds.length === 0) {
    return {
      workspaces: ws,
      units: [],
      cases: [],
      unitTenants: [],
      openChecklistTaskCount: 0,
    }
  }

  const { data: units, error: unitsError } = await supabase
    .from('units')
    .select(
      'id, workspace_id, name, address_line, city, postal_code, unit_state, created_at',
    )
    .in('workspace_id', workspaceIds)
    .order('created_at', { ascending: false })

  if (unitsError) {
    throw new Error(unitsError.message)
  }

  const unitList = (units ?? []) as UnitRow[]
  const unitIds = unitList.map((u) => u.id)

  if (unitIds.length === 0) {
    return {
      workspaces: ws,
      units: unitList,
      cases: [],
      unitTenants: [],
      openChecklistTaskCount: 0,
    }
  }

  const { data: tenantRows, error: tenantsError } = await supabase
    .from('unit_tenants')
    .select('unit_id, lease_start, lease_end')
    .in('unit_id', unitIds)

  if (tenantsError) {
    throw new Error(tenantsError.message)
  }

  const unitTenants = (tenantRows ?? []) as UnitTenantLeaseRow[]

  let openChecklistTaskCount = 0
  const { count: checklistOpen, error: checklistError } = await supabase
    .from('tenant_checklist_items')
    .select('*', { count: 'exact', head: true })
    .in('unit_id', unitIds)
    .eq('completed', false)

  if (checklistError) {
    const msg = checklistError.message.toLowerCase()
    if (!msg.includes('does not exist') && !msg.includes('schema cache')) {
      throw new Error(checklistError.message)
    }
  } else {
    openChecklistTaskCount = checklistOpen ?? 0
  }

  const { data: cases, error: casesError } = await supabase
    .from('cases')
    .select('id, unit_id, case_type, status, due_at, created_by, created_at')
    .in('unit_id', unitIds)
    .order('created_at', { ascending: false })

  if (casesError) {
    throw new Error(casesError.message)
  }

  return {
    workspaces: ws,
    units: unitList,
    cases: (cases ?? []) as CaseRow[],
    unitTenants,
    openChecklistTaskCount,
  }
}

export function useManagerDashboardData(userId: string | null | undefined) {
  return useQuery({
    queryKey: [...managerDashboardQueryKey, userId ?? 'none'],
    queryFn: fetchManagerDashboard,
    enabled: Boolean(userId) && isSupabaseConfigured(),
  })
}
