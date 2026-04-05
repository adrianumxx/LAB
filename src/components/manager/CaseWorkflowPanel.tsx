'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/Form'
import { managerCaseQueryKey } from '@/hooks/useManagerCasePageData'
import {
  caseResponsibilities,
  formatAssigneeRole,
} from '@/lib/case-responsibilities'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type {
  CaseChecklistItemRow,
  CasePhaseRow,
  CaseType,
} from '@/lib/types/database'
import { formatIsoDate } from '@/lib/types/database'
import { Calendar, CheckCircle2, Users, Zap } from 'lucide-react'

function phaseStatusBadgeVariant(
  status: string,
): 'success' | 'accent' | 'warning' | 'default' {
  if (status === 'completed') return 'success'
  if (status === 'in_progress') return 'accent'
  if (status === 'pending') return 'warning'
  return 'default'
}

function phaseLabel(status: string): string {
  if (status === 'in_progress') return 'Active'
  if (status === 'completed') return 'Completed'
  if (status === 'pending') return 'Pending'
  return status
}

function workflowProgressPercent(phases: CasePhaseRow[]): number {
  if (phases.length === 0) return 0
  const done = phases.filter((p) => p.status === 'completed').length
  return Math.round((done / phases.length) * 100)
}

interface CaseWorkflowPanelProps {
  caseId: string
  caseType: CaseType
  phases: CasePhaseRow[]
  checklist: CaseChecklistItemRow[]
}

export function CaseWorkflowPanel({
  caseId,
  caseType,
  phases,
  checklist,
}: CaseWorkflowPanelProps) {
  const queryClient = useQueryClient()
  const [workflowError, setWorkflowError] = useState<string | null>(null)

  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: managerCaseQueryKey(caseId) })

  const toggleChecklist = useMutation({
    mutationFn: async (payload: {
      id: string
      completed: boolean
      title: string
    }) => {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase
        .from('case_checklist_items')
        .update({ completed: payload.completed })
        .eq('id', payload.id)
      if (error) {
        throw new Error(error.message)
      }
      const logBody = payload.completed
        ? `Checklist completed: ${payload.title}`
        : `Checklist reopened: ${payload.title}`
      const { error: logError } = await supabase.from('case_timeline_events').insert({
        case_id: caseId,
        body: logBody,
        event_source: 'user',
      })
      if (logError) {
        await supabase
          .from('case_checklist_items')
          .update({ completed: !payload.completed })
          .eq('id', payload.id)
        throw new Error(logError.message)
      }
    },
    onSuccess: () => {
      setWorkflowError(null)
      invalidate()
    },
    onError: (e: Error) => setWorkflowError(e.message),
  })

  const advancePhase = useMutation({
    mutationFn: async () => {
      const ordered = [...phases].sort((a, b) => a.position - b.position)
      const activeIdx = ordered.findIndex((p) => p.status === 'in_progress')
      if (activeIdx === -1) {
        throw new Error('No active phase to complete.')
      }
      const current = ordered[activeIdx]
      if (!current) {
        throw new Error('No active phase to complete.')
      }
      const next = ordered.find(
        (p) => p.position > current.position && p.status === 'pending',
      )

      const supabase = createSupabaseBrowserClient()

      const { error: e1 } = await supabase
        .from('case_phases')
        .update({ status: 'completed' })
        .eq('id', current.id)
      if (e1) {
        throw new Error(e1.message)
      }

      if (!next) {
        const logBodyOnly = `Completed phase: ${current.title}.`
        const { error: logOnlyErr } = await supabase
          .from('case_timeline_events')
          .insert({
            case_id: caseId,
            body: logBodyOnly,
            event_source: 'user',
          })
        if (logOnlyErr) {
          await supabase
            .from('case_phases')
            .update({ status: 'in_progress' })
            .eq('id', current.id)
          throw new Error(logOnlyErr.message)
        }
        return
      }

      if (next) {
        const { error: e2 } = await supabase
          .from('case_phases')
          .update({ status: 'in_progress' })
          .eq('id', next.id)
        if (e2) {
          await supabase
            .from('case_phases')
            .update({ status: 'in_progress' })
            .eq('id', current.id)
          throw new Error(e2.message)
        }
      }

      const logBody = `Completed phase: ${current.title}. Started: ${next.title}.`
      const { error: logError } = await supabase.from('case_timeline_events').insert({
        case_id: caseId,
        body: logBody,
        event_source: 'user',
      })
      if (logError) {
        await supabase
          .from('case_phases')
          .update({ status: 'in_progress' })
          .eq('id', current.id)
        if (next) {
          await supabase
            .from('case_phases')
            .update({ status: 'pending' })
            .eq('id', next.id)
        }
        throw new Error(logError.message)
      }
    },
    onSuccess: () => {
      setWorkflowError(null)
      invalidate()
    },
    onError: (e: Error) => setWorkflowError(e.message),
  })

  const orderedPhases = [...phases].sort((a, b) => a.position - b.position)
  const hasActivePhase = orderedPhases.some((p) => p.status === 'in_progress')
  const allPhasesDone =
    orderedPhases.length > 0 &&
    orderedPhases.every((p) => p.status === 'completed')
  const progress = workflowProgressPercent(orderedPhases)
  const responsibilities = caseResponsibilities(caseType)

  return (
    <div className="space-y-6">
      {workflowError && <FormError>{workflowError}</FormError>}

      <Card>
        <CardHeader>
          <CardTitle>Case phases</CardTitle>
          <CardDescription>Lifecycle progression — {progress}% by phases</CardDescription>
        </CardHeader>
        <CardContent>
          {orderedPhases.length === 0 ? (
            <p className="text-sm text-secondary">
              No phases yet. Run the database migration that seeds{' '}
              <code className="text-xs">case_phases</code> or open a newly created case.
            </p>
          ) : (
            <div className="space-y-3">
              {orderedPhases.map((phase) => (
                <div key={phase.id} className="flex items-center gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {phase.status === 'completed' && (
                      <CheckCircle2 className="text-success-600 shrink-0" size={20} />
                    )}
                    {phase.status === 'in_progress' && (
                      <div className="w-5 h-5 rounded-full border-2 border-primary-500 flex items-center justify-center shrink-0">
                        <div className="w-3 h-3 rounded-full bg-primary-500" />
                      </div>
                    )}
                    {phase.status === 'pending' && (
                      <div className="w-5 h-5 rounded-full border-2 border-neutral-300 dark:border-neutral-600 shrink-0" />
                    )}
                    <span
                      className={`font-medium truncate ${
                        phase.status === 'pending' ? 'text-secondary' : ''
                      }`}
                    >
                      {phase.title}
                    </span>
                  </div>
                  <Badge variant={phaseStatusBadgeVariant(phase.status)}>
                    {phaseLabel(phase.status)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Case checklist</CardTitle>
            <CardDescription>Tasks stored in Supabase — toggle as you go</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {checklist.length === 0 ? (
              <p className="text-sm text-secondary">No checklist items for this case.</p>
            ) : (
              checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 pb-3 border-b border-border last:border-0"
                >
                  <button
                    type="button"
                    onClick={() =>
                      toggleChecklist.mutate({
                        id: item.id,
                        completed: !item.completed,
                        title: item.title,
                      })
                    }
                    disabled={toggleChecklist.isPending}
                    className={`mt-1 shrink-0 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
                      item.completed ? 'text-success-600' : 'text-neutral-400'
                    }`}
                    aria-label={
                      item.completed ? `Mark incomplete: ${item.title}` : `Mark complete: ${item.title}`
                    }
                  >
                    <CheckCircle2 size={18} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium text-sm ${
                        item.completed ? 'line-through text-secondary' : ''
                      }`}
                    >
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-secondary flex-wrap">
                      <Users size={14} className="shrink-0" />
                      <span>{formatAssigneeRole(item.assignee_role)}</span>
                      <span aria-hidden>•</span>
                      <Calendar size={14} className="shrink-0" />
                      <span>{formatIsoDate(item.due_at)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Responsibilities</CardTitle>
            <CardDescription>Typical roles for this case type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {responsibilities.map((resp) => (
              <div key={resp.role} className="pb-4 border-b border-border last:border-0">
                <p className="font-semibold text-sm mb-2">{resp.role}</p>
                {resp.tasks.length === 0 ? (
                  <p className="text-xs text-secondary">—</p>
                ) : (
                  <ul className="space-y-1">
                    {resp.tasks.map((task, i) => (
                      <li key={i} className="text-xs text-secondary flex items-start gap-2">
                        <span className="mt-1">•</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {orderedPhases.length > 0 && (
        <div className="sticky bottom-0 bg-app border border-border p-4 rounded-lg">
          <Button
            variant="primary"
            className="w-full sm:w-auto"
            disabled={
              advancePhase.isPending || !hasActivePhase || allPhasesDone
            }
            onClick={() => advancePhase.mutate()}
          >
            <Zap className="mr-2" size={16} />
            Complete current phase & continue
          </Button>
          {allPhasesDone && (
            <p className="text-sm text-secondary mt-3">
              All phases are complete. You can still update checklist items or close the case
              from the record above.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
