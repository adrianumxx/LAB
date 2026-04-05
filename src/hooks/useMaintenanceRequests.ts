import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import type {
  MaintenanceRequestRow,
  MaintenanceRequestStatus,
} from '@/lib/types/database'
import { isUuid } from '@/lib/validation/uuid'

export const tenantMaintenanceQueryKey = ['tenant-maintenance'] as const
export const managerMaintenanceQueryKey = ['manager-maintenance'] as const
export const managerMaintenanceOpenCountKey = [
  'manager-maintenance-open-count',
] as const
export const maintenanceRequestQueryKey = (id: string) =>
  ['maintenance-request', id] as const

const SELECT_FIELDS =
  'id, unit_id, tenant_id, title, description, status, created_at, updated_at, resolved_at, created_by'

async function fetchTenantMaintenance(): Promise<MaintenanceRequestRow[]> {
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
  const { data, error } = await supabase
    .from('maintenance_requests')
    .select(SELECT_FIELDS)
    .eq('tenant_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }
  return (data ?? []) as MaintenanceRequestRow[]
}

async function fetchManagerMaintenance(): Promise<MaintenanceRequestRow[]> {
  const supabase = createSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('maintenance_requests')
    .select(SELECT_FIELDS)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }
  return (data ?? []) as MaintenanceRequestRow[]
}

async function fetchMaintenanceOpenCount(): Promise<number> {
  const supabase = createSupabaseBrowserClient()
  const { count, error } = await supabase
    .from('maintenance_requests')
    .select('id', { count: 'exact', head: true })
    .in('status', ['open', 'in_progress'])

  if (error) {
    throw new Error(error.message)
  }
  return count ?? 0
}

async function fetchMaintenanceById(
  id: string,
): Promise<MaintenanceRequestRow | null> {
  const supabase = createSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('maintenance_requests')
    .select(SELECT_FIELDS)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }
  return data as MaintenanceRequestRow | null
}

export function useTenantMaintenanceRequests(userId: string | null | undefined) {
  return useQuery({
    queryKey: [...tenantMaintenanceQueryKey, userId ?? 'none'],
    queryFn: fetchTenantMaintenance,
    enabled: Boolean(userId) && isSupabaseConfigured(),
  })
}

export function useManagerMaintenanceRequests(
  userId: string | null | undefined,
) {
  const enabled = Boolean(userId) && isSupabaseConfigured()

  return useQuery({
    queryKey: [...managerMaintenanceQueryKey, userId ?? 'none'],
    queryFn: fetchManagerMaintenance,
    enabled,
  })
}

export function useManagerMaintenanceOpenCount(
  userId: string | null | undefined,
) {
  return useQuery({
    queryKey: [...managerMaintenanceOpenCountKey, userId ?? 'none'],
    queryFn: fetchMaintenanceOpenCount,
    enabled: Boolean(userId) && isSupabaseConfigured(),
  })
}

export function useMaintenanceRequestDetail(requestId: string | undefined) {
  const id = requestId?.trim() ?? ''
  return useQuery({
    queryKey: maintenanceRequestQueryKey(id || 'none'),
    queryFn: () => fetchMaintenanceById(id),
    enabled: Boolean(id) && isUuid(id) && isSupabaseConfigured(),
  })
}

export function useCreateMaintenanceRequest() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      unit_id: string
      title: string
      description: string
    }) => {
      const supabase = createSupabaseBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Not authenticated')
      }
      const { data, error } = await supabase
        .from('maintenance_requests')
        .insert({
          unit_id: payload.unit_id,
          tenant_id: user.id,
          title: payload.title.trim(),
          description: payload.description.trim() || null,
          created_by: user.id,
        })
        .select(SELECT_FIELDS)
        .single()

      if (error) {
        throw new Error(error.message)
      }
      return data as MaintenanceRequestRow
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: tenantMaintenanceQueryKey })
      await qc.invalidateQueries({ queryKey: managerMaintenanceQueryKey })
      await qc.invalidateQueries({ queryKey: managerMaintenanceOpenCountKey })
    },
  })
}

export function useUpdateMaintenanceRequestStatus() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      id: string
      status: MaintenanceRequestStatus
    }) => {
      const supabase = createSupabaseBrowserClient()
      const resolvedAt =
        payload.status === 'resolved' ? new Date().toISOString() : null
      const { error } = await supabase
        .from('maintenance_requests')
        .update({
          status: payload.status,
          resolved_at: resolvedAt,
        })
        .eq('id', payload.id)

      if (error) {
        throw new Error(error.message)
      }
    },
    onSuccess: async (_, v) => {
      await qc.invalidateQueries({ queryKey: managerMaintenanceQueryKey })
      await qc.invalidateQueries({ queryKey: managerMaintenanceOpenCountKey })
      await qc.invalidateQueries({
        queryKey: maintenanceRequestQueryKey(v.id),
      })
      await qc.invalidateQueries({ queryKey: tenantMaintenanceQueryKey })
    },
  })
}
