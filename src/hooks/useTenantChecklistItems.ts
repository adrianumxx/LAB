import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import type { TenantChecklistItemRow } from '@/lib/types/database'

export const tenantChecklistQueryKey = (userId: string) =>
  ['tenant-checklist-items', 'user', userId] as const

export const tenantChecklistUnitQueryKey = (unitId: string) =>
  ['tenant-checklist-items', 'unit', unitId] as const

export const tenantChecklistRootKey = ['tenant-checklist-items'] as const

async function fetchChecklistForCurrentUser(): Promise<TenantChecklistItemRow[]> {
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
    .from('tenant_checklist_items')
    .select(
      'id, unit_id, tenant_id, item_key, title, sort_order, completed, completed_at, due_at, created_at',
    )
    .eq('tenant_id', user.id)
    .order('unit_id', { ascending: true })
    .order('sort_order', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }
  return (data ?? []) as TenantChecklistItemRow[]
}

async function fetchChecklistForUnitAsManager(
  unitId: string,
): Promise<TenantChecklistItemRow[]> {
  const supabase = createSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('tenant_checklist_items')
    .select(
      'id, unit_id, tenant_id, item_key, title, sort_order, completed, completed_at, due_at, created_at',
    )
    .eq('unit_id', unitId)
    .order('tenant_id', { ascending: true })
    .order('sort_order', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }
  return (data ?? []) as TenantChecklistItemRow[]
}

export function useTenantChecklistItems(userId: string | null | undefined) {
  return useQuery({
    queryKey: tenantChecklistQueryKey(userId ?? 'none'),
    queryFn: fetchChecklistForCurrentUser,
    enabled: Boolean(userId) && isSupabaseConfigured(),
  })
}

export function useTenantChecklistItemsForUnit(
  unitId: string | undefined,
  enabled: boolean,
) {
  const id = unitId?.trim() ?? ''
  return useQuery({
    queryKey: tenantChecklistUnitQueryKey(id || 'none'),
    queryFn: () => fetchChecklistForUnitAsManager(id),
    enabled: Boolean(id) && enabled && isSupabaseConfigured(),
  })
}

export function useToggleTenantChecklistItem() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { id: string; completed: boolean }) => {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase
        .from('tenant_checklist_items')
        .update({
          completed: payload.completed,
          completed_at: payload.completed
            ? new Date().toISOString()
            : null,
        })
        .eq('id', payload.id)

      if (error) {
        throw new Error(error.message)
      }
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: tenantChecklistRootKey })
    },
  })
}

export function itemsForUnit(
  items: TenantChecklistItemRow[] | undefined,
  unitId: string,
): TenantChecklistItemRow[] {
  if (!items?.length) return []
  return items.filter((i) => i.unit_id === unitId)
}

export function checklistOpenCount(items: TenantChecklistItemRow[] | undefined): number {
  if (!items?.length) return 0
  return items.filter((i) => !i.completed).length
}
