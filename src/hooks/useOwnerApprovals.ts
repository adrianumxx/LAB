import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import type { CaseChecklistItemRow, CaseType } from '@/lib/types/database'
import { ownerDashboardQueryKey } from '@/hooks/useOwnerDashboardData'

export const ownerApprovalsQueryKey = ['owner-approvals'] as const

export interface OwnerApprovalCaseEmbed {
  unit_id: string
  case_type: CaseType
  status: string
}

export interface OwnerApprovalRow extends CaseChecklistItemRow {
  /** PostgREST may return a single object or a one-element array for the embedded `cases` row */
  cases: OwnerApprovalCaseEmbed | OwnerApprovalCaseEmbed[] | null
}

async function fetchOwnerApprovals(): Promise<OwnerApprovalRow[]> {
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
    .from('case_checklist_items')
    .select(
      `
      id,
      case_id,
      position,
      title,
      completed,
      assignee_role,
      due_at,
      created_at,
      cases (
        unit_id,
        case_type,
        status
      )
    `,
    )
    .eq('assignee_role', 'owner')
    .order('completed', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as unknown as OwnerApprovalRow[]
}

export function useOwnerApprovals(userId: string | null | undefined) {
  return useQuery({
    queryKey: [...ownerApprovalsQueryKey, userId ?? 'none'],
    queryFn: fetchOwnerApprovals,
    enabled: Boolean(userId) && isSupabaseConfigured(),
  })
}

export function useCompleteOwnerApprovalItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (itemId: string) => {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase
        .from('case_checklist_items')
        .update({ completed: true })
        .eq('id', itemId)

      if (error) {
        throw new Error(error.message)
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ownerApprovalsQueryKey })
      await queryClient.invalidateQueries({ queryKey: ownerDashboardQueryKey })
      await queryClient.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'owner-case',
      })
    },
  })
}
