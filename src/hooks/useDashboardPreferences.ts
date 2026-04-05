'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import {
  mergeDashboardPreferences,
  preferencesToJson,
  type DashboardPreferences,
} from '@/lib/dashboard-preferences'

const qk = (userId: string | null) => ['dashboard-preferences', userId] as const

export function useDashboardPreferences(userId: string | null) {
  const qc = useQueryClient()
  const enabled = isSupabaseConfigured() && Boolean(userId)

  const query = useQuery({
    queryKey: qk(userId),
    enabled,
    queryFn: async (): Promise<DashboardPreferences> => {
      if (!userId) {
        return mergeDashboardPreferences({})
      }
      const supabase = createSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('dashboard_preferences')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        throw new Error(error.message)
      }
      return mergeDashboardPreferences(data?.dashboard_preferences)
    },
  })

  const mutation = useMutation({
    mutationFn: async (next: DashboardPreferences) => {
      if (!userId) {
        throw new Error('No user')
      }
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase
        .from('profiles')
        .update({
          dashboard_preferences: preferencesToJson(next),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (error) {
        throw new Error(error.message)
      }
      return next
    },
    onSuccess: (data) => {
      qc.setQueryData(qk(userId), data)
    },
  })

  return {
    preferences: query.data ?? mergeDashboardPreferences({}),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    updatePreferences: mutation.mutateAsync,
    isSaving: mutation.isPending,
  }
}
