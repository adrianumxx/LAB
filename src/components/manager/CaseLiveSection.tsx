'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { buttonVariants } from '@/components/ui/Button'
import { FormError } from '@/components/ui/Form'
import { CaseDocumentsPanel } from '@/components/manager/CaseDocumentsPanel'
import { CaseTimelinePanel } from '@/components/manager/CaseTimelinePanel'
import { CaseWorkflowPanel } from '@/components/manager/CaseWorkflowPanel'
import { managerCaseQueryKey } from '@/hooks/useManagerCasePageData'
import { managerDashboardQueryKey } from '@/hooks/useManagerDashboardData'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import {
  caseTypeDescription,
  formatIsoDate,
  type CaseChecklistItemRow,
  type CaseRow,
  type CasePhaseRow,
  type CaseTimelineEventRow,
  type UnitRow,
} from '@/lib/types/database'
import { cn } from '@/lib/utils'

const STATUS_OPTIONS = ['open', 'closed', 'blocked'] as const

function statusSelectValues(current: string): string[] {
  const lower = current.toLowerCase()
  const base = [...STATUS_OPTIONS]
  if (!base.includes(lower as (typeof STATUS_OPTIONS)[number])) {
    return [current, ...base]
  }
  return base
}

interface CaseLiveSectionProps {
  caseRow: CaseRow
  unit: UnitRow | null
  caseId: string
  phases: CasePhaseRow[]
  checklist: CaseChecklistItemRow[]
  timeline: CaseTimelineEventRow[]
}

export function CaseLiveSection({
  caseRow,
  unit,
  caseId,
  phases,
  checklist,
  timeline,
}: CaseLiveSectionProps) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState(caseRow.status)
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    setStatus(caseRow.status)
  }, [caseRow.status])

  const updateStatus = useMutation({
    mutationFn: async (next: string) => {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase
        .from('cases')
        .update({ status: next })
        .eq('id', caseId)
      if (error) {
        throw new Error(error.message)
      }
    },
    onSuccess: async () => {
      setLocalError(null)
      await queryClient.invalidateQueries({ queryKey: managerCaseQueryKey(caseId) })
      await queryClient.invalidateQueries({ queryKey: [...managerDashboardQueryKey] })
    },
    onError: (e: Error) => setLocalError(e.message),
  })

  const orderedPhases = [...phases].sort((a, b) => a.position - b.position)
  const progressFromPhases =
    orderedPhases.length > 0
      ? Math.round(
          (orderedPhases.filter((p) => p.status === 'completed').length /
            orderedPhases.length) *
            100,
        )
      : null
  const progress =
    progressFromPhases !== null
      ? progressFromPhases
      : status.toLowerCase() === 'closed'
        ? 100
        : status.toLowerCase() === 'blocked'
          ? 25
          : 50

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Case record</CardTitle>
          <CardDescription>Core record — phases and checklist below</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {localError && <FormError>{localError}</FormError>}
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-secondary">Case ID</dt>
              <dd className="font-mono text-xs break-all mt-1">{caseRow.id}</dd>
            </div>
            <div>
              <dt className="text-secondary">Created</dt>
              <dd className="font-medium mt-1">{formatIsoDate(caseRow.created_at)}</dd>
            </div>
            <div>
              <dt className="text-secondary">Due</dt>
              <dd className="font-medium mt-1">{formatIsoDate(caseRow.due_at)}</dd>
            </div>
            <div>
              <dt className="text-secondary">Status</dt>
              <dd className="mt-1">
                <label htmlFor="case-status" className="sr-only">
                  Case status
                </label>
                <select
                  id="case-status"
                  value={status}
                  onChange={(e) => {
                    const next = e.target.value
                    setStatus(next)
                    updateStatus.mutate(next)
                  }}
                  disabled={updateStatus.isPending}
                  className="w-full max-w-xs px-3 py-2 rounded-md border border-border bg-surface text-primary text-sm"
                >
                  {statusSelectValues(status).map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </dd>
            </div>
          </dl>
          <p className="text-sm text-secondary border-t border-border pt-4">
            {caseTypeDescription(caseRow.case_type)}
          </p>
          <div>
            <div className="flex justify-between text-xs text-secondary mb-2">
              <span>
                Progress
                {progressFromPhases !== null ? ' (phases)' : ' (status)'}
              </span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3">
              <div
                className="bg-primary-500 h-3 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          {unit && (
            <Link
              href={`/manager/units/${unit.id}`}
              className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'inline-flex')}
            >
              Open unit: {unit.name}
            </Link>
          )}
        </CardContent>
      </Card>

      <CaseDocumentsPanel caseId={caseId} />

      <CaseWorkflowPanel
        caseId={caseId}
        caseType={caseRow.case_type}
        phases={phases}
        checklist={checklist}
      />

      <CaseTimelinePanel caseId={caseId} events={timeline} />

      <div className="flex flex-wrap gap-3">
        <Link href="/manager" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
