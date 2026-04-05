'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Button, buttonVariants } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { FormError } from '@/components/ui/Form'
import { useCompleteOwnerApprovalItem } from '@/hooks/useOwnerApprovals'
import { useOwnerCasePageData } from '@/hooks/useOwnerCasePageData'
import { useAuthStore } from '@/lib/auth-store'
import { caseStatusToBadgeVariant, humanizeCaseStatus } from '@/lib/case-status-badge'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import {
  caseTypeDescription,
  formatCaseTypeLabel,
  formatIsoDate,
  formatIsoDateTime,
} from '@/lib/types/database'
import { cn } from '@/lib/utils'
import { isUuid } from '@/lib/validation/uuid'
import { ArrowLeft, CheckCircle2, Clock } from 'lucide-react'

export function OwnerCaseDetailPageClient() {
  const params = useParams()
  const caseId = params['caseId'] as string
  const user = useAuthStore((s) => s.user)
  const useLive =
    isSupabaseConfigured() &&
    user?.role === 'owner' &&
    Boolean(user.id) &&
    !user.needsRoleSetup

  const q = useOwnerCasePageData(caseId, useLive ? user.id : null)
  const completeItem = useCompleteOwnerApprovalItem()

  const c = q.data?.case ?? null
  const unit = q.data?.unit ?? null
  const phases = q.data?.phases ?? []
  const checklist = q.data?.checklist ?? []
  const timeline = q.data?.timeline ?? []

  const validId = isUuid(caseId)

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/owner/cases"
          className="text-sm text-secondary hover:text-primary inline-flex items-center gap-1 mb-4"
        >
          <ArrowLeft size={16} aria-hidden />
          All cases
        </Link>

        {useLive && validId && q.isLoading && (
          <p className="text-sm text-secondary mb-2" role="status">
            Loading case…
          </p>
        )}

        {useLive && validId && q.isError && (
          <FormError className="mb-4">
            {q.error instanceof Error ? q.error.message : 'Failed to load case'}
          </FormError>
        )}

        {useLive && validId && !q.isLoading && !c && (
          <FormError className="mb-4">
            Case not found or you don&apos;t have access.{' '}
            <Link href="/owner/cases" className="underline underline-offset-2">
              Browse cases
            </Link>
            .
          </FormError>
        )}

        {!validId && (
          <FormError className="mb-4">Invalid case link.</FormError>
        )}

        {c && unit && (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
              <Badge variant={caseStatusToBadgeVariant(c.status)} className="text-sm px-3 py-1">
                {humanizeCaseStatus(c.status)}
              </Badge>
              <p className="text-sm text-secondary">
                Due {formatIsoDate(c.due_at)} · Opened {formatIsoDate(c.created_at)}
              </p>
            </div>
            <h1 className="text-3xl font-bold">{formatCaseTypeLabel(c.case_type)}</h1>
            <p className="text-secondary mt-2">
              {unit.name} · {caseTypeDescription(c.case_type)}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Link
                href={`/owner/units/${unit.id}`}
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
              >
                View unit
              </Link>
              <Link
                href="/owner/approvals"
                className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}
              >
                Approvals inbox
              </Link>
            </div>
          </>
        )}
      </div>

      {c && (
        <Card>
          <CardHeader>
            <CardTitle>Phases</CardTitle>
            <CardDescription>Progress as managed by your property manager</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {phases.length === 0 ? (
              <p className="text-sm text-secondary">No phases loaded.</p>
            ) : (
              phases.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <span className="text-sm font-medium">{p.title}</span>
                  <Badge variant={p.status === 'completed' ? 'success' : 'default'}>
                    {p.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {c && (
        <Card>
          <CardHeader>
            <CardTitle>Checklist</CardTitle>
            <CardDescription>
              Rows assigned to &quot;owner&quot; can be marked approved by you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {checklist.length === 0 ? (
              <p className="text-sm text-secondary">No checklist items.</p>
            ) : (
              checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 pb-4 border-b border-border last:border-0"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p
                      className={cn(
                        'text-sm font-medium',
                        item.completed && 'line-through text-secondary',
                      )}
                    >
                      {item.title}
                    </p>
                    {item.assignee_role && (
                      <Badge variant="default">{item.assignee_role}</Badge>
                    )}
                  </div>
                  {item.assignee_role === 'owner' && !item.completed && useLive && (
                    <Button
                      type="button"
                      size="sm"
                      variant="primary"
                      disabled={completeItem.isPending}
                      onClick={() => completeItem.mutate(item.id)}
                    >
                      {completeItem.isPending ? 'Saving…' : 'Mark approved'}
                    </Button>
                  )}
                  {item.completed && (
                    <p className="text-xs text-success-600 flex items-center gap-1">
                      <CheckCircle2 size={14} aria-hidden />
                      Completed
                    </p>
                  )}
                </div>
              ))
            )}
            {completeItem.isError && (
              <FormError>
                {completeItem.error instanceof Error
                  ? completeItem.error.message
                  : 'Update failed'}
              </FormError>
            )}
          </CardContent>
        </Card>
      )}

      {c && (
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
            <CardDescription>Activity on this case</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {timeline.length === 0 ? (
              <p className="text-sm text-secondary">No events yet.</p>
            ) : (
              timeline.map((ev) => (
                <div key={ev.id} className="flex gap-3 pb-3 border-b border-border last:border-0">
                  <div className="mt-0.5 text-primary-500">
                    <Clock size={18} aria-hidden />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{ev.body}</p>
                    <p className="text-xs text-secondary mt-1">
                      {formatIsoDateTime(ev.sort_at)} · {ev.event_source}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
