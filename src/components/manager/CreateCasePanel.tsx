'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/Form'
import { managerDashboardQueryKey } from '@/hooks/useManagerDashboardData'
import { managerUnitQueryKey } from '@/hooks/useManagerUnitPageData'
import { useAuthStore } from '@/lib/auth-store'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { formatCaseTypeLabel, type CaseType } from '@/lib/types/database'

const CASE_TYPES: readonly CaseType[] = [
  'move_in',
  'move_out',
  'incident',
  'repair',
  'turnover',
]

interface CreateCasePanelProps {
  unitId: string
}

export function CreateCasePanel({ unitId }: CreateCasePanelProps) {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id ?? null)
  const [caseType, setCaseType] = useState<CaseType>('move_in')
  const [dueAt, setDueAt] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const createCase = useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error('You must be signed in to create a case.')
      }
      const supabase = createSupabaseBrowserClient()
      const payload: {
        unit_id: string
        case_type: CaseType
        status: string
        created_by: string
        due_at?: string | null
      } = {
        unit_id: unitId,
        case_type: caseType,
        status: 'open',
        created_by: userId,
      }
      if (dueAt.trim()) {
        payload.due_at = new Date(dueAt).toISOString()
      }
      const { error } = await supabase.from('cases').insert(payload)
      if (error) {
        throw new Error(error.message)
      }
    },
    onSuccess: async () => {
      setLocalError(null)
      await queryClient.invalidateQueries({ queryKey: managerUnitQueryKey(unitId) })
      await queryClient.invalidateQueries({ queryKey: [...managerDashboardQueryKey] })
    },
    onError: (e: Error) => setLocalError(e.message),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create case</CardTitle>
        <CardDescription>Open a new lifecycle case for this unit</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {localError && <FormError>{localError}</FormError>}
        <div className="space-y-2">
          <label htmlFor="new-case-type" className="text-sm font-medium text-primary">
            Case type
          </label>
          <select
            id="new-case-type"
            value={caseType}
            onChange={(e) => setCaseType(e.target.value as CaseType)}
            className="w-full max-w-md px-3 py-2 rounded-md border border-border bg-surface text-primary text-sm"
          >
            {CASE_TYPES.map((t) => (
              <option key={t} value={t}>
                {formatCaseTypeLabel(t)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="new-case-due" className="text-sm font-medium text-primary">
            Due date (optional)
          </label>
          <input
            id="new-case-due"
            type="datetime-local"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            className="w-full max-w-md px-3 py-2 rounded-md border border-border bg-surface text-primary text-sm"
          />
        </div>
        <Button
          type="button"
          variant="primary"
          disabled={createCase.isPending || !userId}
          onClick={() => createCase.mutate()}
        >
          {createCase.isPending ? 'Creating…' : 'Create case'}
        </Button>
      </CardContent>
    </Card>
  )
}
