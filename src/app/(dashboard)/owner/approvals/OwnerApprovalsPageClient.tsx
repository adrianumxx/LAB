'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { FormError } from '@/components/ui/Form'
import {
  useCompleteOwnerApprovalItem,
  useOwnerApprovals,
  type OwnerApprovalCaseEmbed,
  type OwnerApprovalRow,
} from '@/hooks/useOwnerApprovals'
import { useOwnerDashboardData } from '@/hooks/useOwnerDashboardData'
import { useAuthStore } from '@/lib/auth-store'
import { caseStatusToBadgeVariant, humanizeCaseStatus } from '@/lib/case-status-badge'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { formatCaseTypeLabel, formatIsoDate } from '@/lib/types/database'
import { ArrowLeft } from 'lucide-react'

function caseEmbed(row: OwnerApprovalRow): OwnerApprovalCaseEmbed | null {
  const c = row.cases
  if (!c) return null
  if (Array.isArray(c)) {
    const first = c[0]
    return first && typeof first === 'object' ? (first as OwnerApprovalCaseEmbed) : null
  }
  return c as OwnerApprovalCaseEmbed
}

export function OwnerApprovalsPageClient() {
  const user = useAuthStore((s) => s.user)
  const useLive =
    isSupabaseConfigured() &&
    user?.role === 'owner' &&
    Boolean(user.id) &&
    !user.needsRoleSetup

  const list = useOwnerApprovals(useLive ? user.id : null)
  const dash = useOwnerDashboardData(useLive ? user.id : null)
  const completeItem = useCompleteOwnerApprovalItem()

  const unitNameById = useMemo(
    () => new Map(dash.data?.units.map((u) => [u.id, u.name]) ?? []),
    [dash.data?.units],
  )

  const rows = list.data ?? []
  const pending = rows.filter((r) => !r.completed)
  const history = rows.filter((r) => r.completed).slice(0, 25)

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/owner"
          className="text-sm text-secondary hover:text-primary inline-flex items-center gap-1 mb-4"
        >
          <ArrowLeft size={16} aria-hidden />
          Back to overview
        </Link>
        <h1 className="text-3xl font-bold">Approvals</h1>
        <p className="text-secondary mt-2">
          Case checklist items assigned to you as property owner — typically repair spend or policy
          sign-off. Completing a row records your approval in the case workflow.
        </p>
      </div>

      {!useLive && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-secondary">
              Connect Supabase and sign in as an owner linked to a unit to load real approvals.
            </p>
          </CardContent>
        </Card>
      )}

      {useLive && list.isLoading && (
        <p className="text-sm text-secondary" role="status">
          Loading…
        </p>
      )}

      {useLive && list.isError && (
        <FormError>
          {list.error instanceof Error ? list.error.message : 'Failed to load'}
        </FormError>
      )}

      {useLive && !list.isLoading && pending.length > 0 && (
        <div
          className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-primary"
          role="status"
        >
          You have {pending.length} pending decision
          {pending.length === 1 ? '' : 's'}. Manager is notified when you complete an item.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Pending</CardTitle>
          <CardDescription>Items waiting on you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {useLive && !list.isLoading && pending.length === 0 && (
            <p className="text-sm text-secondary">Nothing pending right now.</p>
          )}
          {pending.map((row) => {
            const c = caseEmbed(row)
            const unitName = c?.unit_id ? (unitNameById.get(c.unit_id) ?? 'Unit') : 'Unit'
            return (
              <div
                key={row.id}
                className="flex flex-col gap-3 pb-4 border-b border-border last:border-0"
              >
                <div>
                  <p className="font-medium">{row.title}</p>
                  <p className="text-xs text-secondary mt-1">
                    {c ? (
                      <>
                        {formatCaseTypeLabel(c.case_type)} ·{' '}
                        <Link
                          href={`/owner/cases/${row.case_id}`}
                          className="text-primary underline underline-offset-2"
                        >
                          Open case
                        </Link>
                        {' · '}
                        <Link
                          href={c.unit_id ? `/owner/units/${c.unit_id}` : '/owner/units'}
                          className="text-primary underline underline-offset-2"
                        >
                          {unitName}
                        </Link>
                      </>
                    ) : (
                      <Link
                        href={`/owner/cases/${row.case_id}`}
                        className="text-primary underline underline-offset-2"
                      >
                        Case detail
                      </Link>
                    )}
                  </p>
                  {row.due_at && (
                    <p className="text-xs text-muted mt-1">Due {formatIsoDate(row.due_at)}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {c && (
                    <Badge variant={caseStatusToBadgeVariant(c.status)}>
                      {humanizeCaseStatus(c.status)}
                    </Badge>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    disabled={completeItem.isPending}
                    onClick={() => completeItem.mutate(row.id)}
                  >
                    {completeItem.isPending ? 'Saving…' : 'Mark approved'}
                  </Button>
                </div>
              </div>
            )
          })}
          {completeItem.isError && (
            <FormError>
              {completeItem.error instanceof Error
                ? completeItem.error.message
                : 'Update failed'}
            </FormError>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent history</CardTitle>
          <CardDescription>Items you already completed (newest first)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {useLive && history.length === 0 && (
            <p className="text-sm text-secondary">No completed approvals yet.</p>
          )}
          {history.map((row) => {
            const c = caseEmbed(row)
            return (
              <div
                key={row.id}
                className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 pb-3 border-b border-border last:border-0"
              >
                <div>
                  <p className="font-medium text-sm">{row.title}</p>
                  <p className="text-xs text-secondary mt-1">
                    {c ? formatCaseTypeLabel(c.case_type) : 'Case'} ·{' '}
                    <Link
                      href={`/owner/cases/${row.case_id}`}
                      className="text-primary underline underline-offset-2"
                    >
                      View case
                    </Link>
                  </p>
                </div>
                <Badge variant="success">Done</Badge>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
