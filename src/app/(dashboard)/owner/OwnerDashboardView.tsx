'use client'

import type { VariantProps } from 'class-variance-authority'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge, badgeVariants } from '@/components/ui/Badge'
import { Button, buttonVariants } from '@/components/ui/Button'
import { NetworkQueryError } from '@/components/ui/NetworkQueryError'
import { useDashboardPreferences } from '@/hooks/useDashboardPreferences'
import { useOwnerDashboardData } from '@/hooks/useOwnerDashboardData'
import { useAuthStore } from '@/lib/auth-store'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import {
  formatCaseTypeLabel,
  formatIsoDate,
  type UnitState,
} from '@/lib/types/database'
import { caseStatusToBadgeVariant, humanizeCaseStatus } from '@/lib/case-status-badge'
import { cn } from '@/lib/utils'
import { CheckCircle2, AlertCircle, FileText, Users, TrendingUp, FileCheck } from 'lucide-react'

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

const UNIT_STATE_BADGE: Record<UnitState, BadgeVariant> = {
  vacant: 'warning',
  incoming: 'info',
  occupied: 'success',
  notice: 'warning',
  outgoing: 'error',
  turnover: 'warning',
}

type DemoUnitCardStatus = 'occupied' | 'vacant' | 'pending'
const DEMO_UNIT_BADGE: Record<DemoUnitCardStatus, BadgeVariant> = {
  occupied: 'success',
  vacant: 'warning',
  pending: 'info',
}

const DEMO_UNIT_STATUS_CARDS: {
  id: string
  name: string
  status: DemoUnitCardStatus
  tenant: string
  rent: string
}[] = [
  { id: 'unit-1', name: 'Apt 401', status: 'occupied', tenant: 'Jane Smith', rent: '$2,500/mo' },
  { id: 'unit-2', name: 'Apt 205', status: 'vacant', tenant: 'Turnover in progress', rent: '$2,800/mo' },
  { id: 'unit-3', name: 'Apt 312', status: 'occupied', tenant: 'Mike Johnson', rent: '$2,200/mo' },
  { id: 'unit-4', name: 'Apt 108', status: 'pending', tenant: 'Move-in 4/7', rent: '$2,600/mo' },
]

const DEMO_ACTIVE_TENANCIES = [
  { unit: 'Apt 401', tenant: 'Jane Smith', leaseEnd: 'Dec 31, 2026', status: 'active' },
  { unit: 'Apt 312', tenant: 'Mike Johnson', leaseEnd: 'Jun 30, 2026', status: 'active' },
]

const DEMO_OPEN_ISSUES = [
  { id: 1, type: 'Maintenance', unit: 'Apt 305', description: 'Plumbing issue reported', severity: 'high' as const },
  { id: 2, type: 'Payment', unit: 'Apt 202', description: 'Late rent payment', severity: 'high' as const },
  { id: 3, type: 'Complaint', unit: 'Apt 401', description: 'Noise complaint from neighbor', severity: 'medium' as const },
]

const DEMO_APPROVALS = [
  { id: 1, action: 'Approve maintenance expense', unit: 'Apt 305', amount: '$650', daysWaiting: 2 },
  { id: 2, action: 'Review tenant screening', unit: 'Apt 108', tenant: 'Alex Chen', daysWaiting: 1 },
  { id: 3, action: 'Approve lease renewal terms', unit: 'Apt 312', tenant: 'Mike Johnson', daysWaiting: 3 },
]

const DEMO_ACTIVITY = [
  { timestamp: '2 hours ago', action: 'Rent payment received', unit: 'Apt 401', detail: '$2,500' },
  { timestamp: '1 day ago', action: 'Move-out inspection completed', unit: 'Apt 205', detail: 'Minor repairs noted' },
  { timestamp: '2 days ago', action: 'New tenant application received', unit: 'Apt 108', detail: 'Pending approval' },
  { timestamp: '3 days ago', action: 'Lease renewed', unit: 'Apt 312', detail: '12 months' },
]

const DEMO_DOCS = [
  { title: 'Property Insurance Policy', type: 'insurance', updated: '30 days ago' },
  { title: 'Maintenance Records 2026', type: 'document', updated: '2 weeks ago' },
  { title: 'Tax Documentation', type: 'document', updated: '1 month ago' },
]

export function OwnerDashboardView() {
  const user = useAuthStore((s) => s.user)
  const { preferences } = useDashboardPreferences(user?.id ?? null)
  const prioritizeApprovals = preferences.ownerPrioritizeApprovals !== false
  const showActivityFeed = preferences.ownerShowActivityFeed !== false
  const useLive =
    isSupabaseConfigured() &&
    user?.role === 'owner' &&
    Boolean(user?.id) &&
    !user.needsRoleSetup

  const { data, isLoading, isError, error, refetch } = useOwnerDashboardData(
    useLive ? user?.id : null,
  )

  const orderMock = {
    tenancies: prioritizeApprovals ? 1 : 0,
    issues: prioritizeApprovals ? 2 : 1,
    approvals: prioritizeApprovals ? 0 : 2,
    activity: 3,
  }

  const showMock = !useLive

  const openCaseCount =
    data?.cases.filter((c) => c.status.toLowerCase() === 'open').length ?? 0
  const occupiedCount =
    data?.units.filter((u) => u.unit_state === 'occupied').length ?? 0

  const pendingApprovals = data?.pendingOwnerApprovalCount ?? 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Property Overview</h1>
        <p className="text-secondary mt-2">Monitor your units, tenancies, and operations</p>
        {useLive && isLoading && (
          <p className="text-sm text-secondary mt-2">Loading your properties…</p>
        )}
        {useLive && isError && (
          <NetworkQueryError
            className="mt-4"
            error={error}
            onRetry={() => void refetch()}
          />
        )}
      </div>

      {useLive && !isLoading && pendingApprovals > 0 && (
        <div
          className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-primary flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          role="status"
        >
          <span>
            You have{' '}
            <span className="font-semibold text-primary">{pendingApprovals}</span> pending approval
            {pendingApprovals === 1 ? '' : 's'} on case checklists.
          </span>
          <Link
            href="/owner/approvals"
            className={cn(buttonVariants({ variant: 'primary', size: 'sm' }), 'shrink-0')}
          >
            Open approvals
          </Link>
        </div>
      )}

      {useLive && !isLoading && data && data.units.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-secondary text-sm">
              No units linked to your account yet. When your property manager adds you as an owner
              on a unit, it will appear here.
            </p>
          </CardContent>
        </Card>
      )}

      {showMock && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              href="/owner/units"
              className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            >
              <Card className="h-full transition-colors hover:border-border-strong">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-secondary">Total Units</p>
                      <p className="text-3xl font-bold mt-1">{DEMO_UNIT_STATUS_CARDS.length}</p>
                    </div>
                    <TrendingUp className="text-primary-500" size={24} />
                  </div>
                  <p className="text-xs text-muted mt-2">Units index</p>
                </CardContent>
              </Card>
            </Link>
            <Link
              href="/owner/units"
              className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            >
              <Card className="h-full transition-colors hover:border-border-strong">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-secondary">Occupied</p>
                      <p className="text-3xl font-bold mt-1">
                        {DEMO_UNIT_STATUS_CARDS.filter((u) => u.status === 'occupied').length}
                      </p>
                    </div>
                    <Users className="text-success-600" size={24} />
                  </div>
                  <p className="text-xs text-muted mt-2">View units</p>
                </CardContent>
              </Card>
            </Link>
            <Link
              href="/owner/cases"
              className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            >
              <Card className="h-full transition-colors hover:border-border-strong">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-secondary">Open Issues</p>
                      <p className="text-3xl font-bold mt-1">{DEMO_OPEN_ISSUES.length}</p>
                    </div>
                    <AlertCircle className="text-error-600" size={24} />
                  </div>
                  <p className="text-xs text-muted mt-2">Cases list (demo)</p>
                </CardContent>
              </Card>
            </Link>
            <Link
              href="/owner/approvals"
              className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            >
              <Card className="h-full transition-colors hover:border-border-strong">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-secondary">Approvals Pending</p>
                      <p className="text-3xl font-bold mt-1">{DEMO_APPROVALS.length}</p>
                    </div>
                    <FileCheck className="text-warning-600" size={24} />
                  </div>
                  <p className="text-xs text-muted mt-2">Approvals inbox</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Unit Status</CardTitle>
              <CardDescription>Demo data — connect Supabase to see your real units</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DEMO_UNIT_STATUS_CARDS.map((unit) => (
                  <Link
                    key={unit.id}
                    href="/owner/units"
                    className="block border border-soft rounded-lg p-4 space-y-2 hover:border-border-strong transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold">{unit.name}</h3>
                      <Badge variant={DEMO_UNIT_BADGE[unit.status]}>
                        {unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-secondary">{unit.tenant}</p>
                    <p className="text-sm font-medium text-primary-500">{unit.rent}</p>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card style={{ order: orderMock.tenancies }}>
              <CardHeader>
                <CardTitle>Active Tenancies</CardTitle>
                <CardDescription>Current leases</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {DEMO_ACTIVE_TENANCIES.map((tenancy) => (
                  <div
                    key={tenancy.unit}
                    className="flex items-start justify-between pb-3 border-b border-soft last:border-0"
                  >
                    <div>
                      <p className="font-medium">{tenancy.tenant}</p>
                      <p className="text-sm text-secondary">{tenancy.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-secondary">Lease ends</p>
                      <p className="text-sm font-medium">{tenancy.leaseEnd}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card style={{ order: orderMock.issues }}>
              <CardHeader>
                <CardTitle>Open Issues</CardTitle>
                <CardDescription>Items requiring attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {DEMO_OPEN_ISSUES.map((issue) => (
                  <div
                    key={issue.id}
                    className="flex items-start justify-between pb-3 border-b border-soft last:border-0"
                  >
                    <div>
                      <p className="font-medium">{issue.description}</p>
                      <p className="text-sm text-secondary">
                        {issue.unit} • {issue.type}
                      </p>
                    </div>
                    <Badge variant={issue.severity === 'high' ? 'error' : 'warning'}>
                      {issue.severity}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card style={{ order: orderMock.approvals }}>
              <CardHeader>
                <CardTitle>Approvals Required</CardTitle>
                <CardDescription>Pending your decision</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {DEMO_APPROVALS.map((approval) => (
                  <div key={approval.id} className="pb-3 border-b border-soft last:border-0">
                    <p className="font-medium text-sm">{approval.action}</p>
                    <p className="text-xs text-secondary mt-1">{approval.unit}</p>
                    {approval.amount ? (
                      <p className="text-sm font-semibold text-primary-500 mt-1">{approval.amount}</p>
                    ) : null}
                    <div className="flex gap-2 mt-2">
                      <Link
                        href="/owner/approvals"
                        className={cn(buttonVariants({ size: 'sm', variant: 'primary' }))}
                      >
                        Approve
                      </Link>
                      <Link
                        href="/owner/approvals"
                        className={cn(buttonVariants({ size: 'sm', variant: 'secondary' }))}
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            {showActivityFeed && (
              <Card style={{ order: orderMock.activity }}>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {DEMO_ACTIVITY.map((activity, i) => (
                    <div key={i} className="flex gap-3 pb-3 border-b border-soft last:border-0">
                      <CheckCircle2 className="text-success-600 flex-shrink-0 mt-0.5" size={18} />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{activity.action}</p>
                        <p className="text-xs text-secondary">{activity.unit}</p>
                        <p className="text-xs text-secondary mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Shared Documents</CardTitle>
              <CardDescription>Access your property documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {DEMO_DOCS.map((doc) => (
                <div
                  key={doc.title}
                  className="flex items-center justify-between pb-3 border-b border-soft last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="text-primary-500" size={20} />
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      <p className="text-xs text-secondary">Updated {doc.updated}</p>
                    </div>
                  </div>
                  <Link
                    href="/owner/units"
                    className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}
                  >
                    View
                  </Link>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      {useLive && !isLoading && data && data.units.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              href="/owner/units"
              className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            >
              <Card className="h-full transition-colors hover:border-border-strong">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-secondary">Total Units</p>
                      <p className="text-3xl font-bold mt-1">{data.units.length}</p>
                    </div>
                    <TrendingUp className="text-primary-500" size={24} />
                  </div>
                  <p className="text-xs text-muted mt-2">Units index</p>
                </CardContent>
              </Card>
            </Link>
            <Link
              href="/owner/units"
              className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            >
              <Card className="h-full transition-colors hover:border-border-strong">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-secondary">Occupied</p>
                      <p className="text-3xl font-bold mt-1">{occupiedCount}</p>
                    </div>
                    <Users className="text-success-600" size={24} />
                  </div>
                  <p className="text-xs text-muted mt-2">View units</p>
                </CardContent>
              </Card>
            </Link>
            <Link
              href="/owner/cases"
              className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            >
              <Card className="h-full transition-colors hover:border-border-strong">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-secondary">Open cases</p>
                      <p className="text-3xl font-bold mt-1">{openCaseCount}</p>
                    </div>
                    <AlertCircle className="text-warning-600" size={24} />
                  </div>
                  <p className="text-xs text-muted mt-2">Cases index</p>
                </CardContent>
              </Card>
            </Link>
            <Link
              href="/owner/approvals"
              className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            >
              <Card className="h-full transition-colors hover:border-border-strong">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-secondary">Approvals</p>
                      <p className="text-3xl font-bold mt-1">{pendingApprovals}</p>
                    </div>
                    <FileCheck className="text-warning-600" size={24} />
                  </div>
                  <p className="text-xs text-muted mt-2">Checklist inbox</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                <div>
                  <CardTitle>Your units</CardTitle>
                  <CardDescription>Linked by your property manager</CardDescription>
                </div>
                <Link
                  href="/owner/units"
                  className="text-sm text-primary underline-offset-4 hover:underline shrink-0"
                >
                  Full list
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.units.map((unit) => (
                  <Link
                    key={unit.id}
                    href={`/owner/units/${unit.id}`}
                    className="block border border-soft rounded-lg p-4 space-y-2 hover:border-border-strong transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold">{unit.name}</h3>
                      <Badge variant={UNIT_STATE_BADGE[unit.unit_state]}>
                        {unit.unit_state}
                      </Badge>
                    </div>
                    <p className="text-sm text-secondary">
                      {[unit.address_line, unit.city].filter(Boolean).join(', ') || '—'}
                    </p>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Leases on your units</CardTitle>
                <CardDescription>Tenant links and dates (names shown when policy allows)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.tenancies.length === 0 ? (
                  <p className="text-sm text-secondary">No active tenant links on these units yet.</p>
                ) : (
                  data.tenancies.map((t) => (
                    <div
                      key={`${t.unit_id}-${t.tenant_id}`}
                      className="flex items-start justify-between pb-3 border-b border-soft last:border-0"
                    >
                      <div>
                        <p className="font-medium">{t.unit_name}</p>
                        <p className="text-xs text-secondary font-mono mt-1">
                          Tenant ID · ···{t.tenant_id.slice(-6)}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-secondary">End</p>
                        <p className="font-medium">{formatIsoDate(t.lease_end)}</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                  <div>
                    <CardTitle>Cases</CardTitle>
                    <CardDescription>Lifecycle activity on your units</CardDescription>
                  </div>
                  <Link
                    href="/owner/cases"
                    className="text-sm text-primary underline-offset-4 hover:underline shrink-0"
                  >
                    View all
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.cases.length === 0 ? (
                  <p className="text-sm text-secondary">No cases recorded yet.</p>
                ) : (
                  data.cases.slice(0, 12).map((c) => {
                    const unitName =
                      data.units.find((u) => u.id === c.unit_id)?.name ?? 'Unit'
                    return (
                      <div
                        key={c.id}
                        className="flex items-start justify-between gap-2 pb-3 border-b border-soft last:border-0"
                      >
                        <div className="min-w-0">
                          <Link
                            href={`/owner/cases/${c.id}`}
                            className="font-medium text-sm text-primary hover:underline"
                          >
                            {formatCaseTypeLabel(c.case_type)}
                          </Link>
                          <p className="text-xs text-secondary">{unitName}</p>
                        </div>
                        <Badge variant={caseStatusToBadgeVariant(c.status)}>
                          {humanizeCaseStatus(c.status)}
                        </Badge>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>
          </div>

        </>
      )}
    </div>
  )
}
