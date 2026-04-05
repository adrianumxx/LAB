'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button, buttonVariants } from '@/components/ui/Button'
import { NetworkQueryError } from '@/components/ui/NetworkQueryError'
import { useDashboardPreferences } from '@/hooks/useDashboardPreferences'
import { useManagerMaintenanceOpenCount } from '@/hooks/useMaintenanceRequests'
import { useManagerDashboardData } from '@/hooks/useManagerDashboardData'
import { useAuthStore } from '@/lib/auth-store'
import { managerModuleFlags } from '@/lib/dashboard-preferences'
import {
  aggregateCasesDueWithinDays,
  aggregateManagerAttentionUnits,
  aggregateManagerOpenCases,
  countUpcomingLeaseMilestones,
  listUpcomingLeaseMilestones,
} from '@/lib/manager-dashboard-aggregates'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import {
  formatCaseTypeLabel,
  formatIsoDate,
  formatRelativeDayLabel,
  unitStateActionLabel,
} from '@/lib/types/database'
import { cn } from '@/lib/utils'
import { AlertCircle, Clock, CheckCircle2, FileText, TrendingUp, Wrench } from 'lucide-react'

const MOCK_UNITS_ACTION = [
  { id: 'unit-1', name: 'Apt 401', status: 'incoming', action: 'Complete tenant screening', daysLeft: 3 },
  { id: 'unit-2', name: 'Apt 205', status: 'outgoing', action: 'Schedule move-out inspection', daysLeft: 7 },
  { id: 'unit-3', name: 'Apt 312', status: 'occupied', action: 'Follow up on maintenance request', daysLeft: 2 },
]

const MOCK_MISSING = [
  { type: 'Lease Agreement', count: 4, priority: 'high' as const },
  { type: 'ID Verification', count: 2, priority: 'high' as const },
  { type: 'Income Documentation', count: 6, priority: 'medium' as const },
  { type: 'Move-in Checklist', count: 3, priority: 'medium' as const },
]

const MOCK_TRANSITIONS = [
  { unit: 'Apt 108', type: 'move-in' as const, date: 'Apr 7', tenant: 'Jane Smith' },
  { unit: 'Apt 402', type: 'move-out' as const, date: 'Apr 12', tenant: 'John Doe' },
  { unit: 'Apt 201', type: 'move-in' as const, date: 'Apr 15', tenant: 'Sarah Johnson' },
]

const MOCK_CASES = [
  { id: 'case-1', type: 'Maintenance', unit: 'Apt 305', status: 'in-progress', created: '3 days ago' },
  { id: 'case-2', type: 'Move-in', unit: 'Apt 401', status: 'in-progress', created: '5 days ago' },
  { id: 'case-3', type: 'Repair', unit: 'Apt 202', status: 'pending-approval', created: '1 day ago' },
]

const MOCK_BLOCKERS = [
  { id: 1, issue: 'Tenant screening incomplete for Apt 401', severity: 'high' as const, days: 3 },
  { id: 2, issue: 'Missing insurance documents from owner', severity: 'high' as const, days: 5 },
  { id: 3, issue: 'Unit 205 turnover behind schedule', severity: 'medium' as const, days: 7 },
]

export function ManagerDashboardView() {
  const user = useAuthStore((s) => s.user)
  const { preferences } = useDashboardPreferences(user?.id ?? null)
  const flags = managerModuleFlags(preferences, user?.role ?? 'tenant')
  const useLive =
    isSupabaseConfigured() &&
    user?.role === 'manager' &&
    Boolean(user.id) &&
    !user.needsRoleSetup

  const { data, isLoading, isError, error, refetch, isFetching } =
    useManagerDashboardData(useLive ? user?.id : null)
  const maintenanceOpen = useManagerMaintenanceOpenCount(useLive ? user?.id : null)

  const attentionUnits = data ? aggregateManagerAttentionUnits(data.units) : []
  const openCases = data ? aggregateManagerOpenCases(data.cases) : []
  const dueSoonCases = data ? aggregateCasesDueWithinDays(data.cases, 30) : []

  const unitNameById = new Map(data?.units.map((u) => [u.id, u.name]) ?? [])

  const showMock = !useLive
  const showLiveEmpty =
    useLive && !isLoading && data && data.units.length === 0 && data.workspaces.length === 0

  const leaseMilestones =
    useLive && data
      ? listUpcomingLeaseMilestones(data.unitTenants ?? [], 30)
      : []

  const kpiAction = showMock
    ? MOCK_UNITS_ACTION.length
    : attentionUnits.length
  const kpiMissing = showMock
    ? MOCK_MISSING.reduce((a, r) => a + r.count, 0)
    : (data?.openChecklistTaskCount ?? 0)
  const kpiCases = showMock ? MOCK_CASES.length : openCases.length
  const kpiTransitions = showMock
    ? MOCK_TRANSITIONS.length
    : countUpcomingLeaseMilestones(data?.unitTenants ?? [], 30)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Action Center</h1>
        <p className="text-secondary mt-2">
          Manage your units, cases, and operations
        </p>
        {useLive && (isLoading || isFetching) && (
          <p className="text-sm text-secondary mt-2">Loading workspace data…</p>
        )}
        {useLive && isError && (
          <NetworkQueryError
            className="mt-4"
            error={error}
            onRetry={() => void refetch()}
          />
        )}
      </div>

      {showLiveEmpty && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-secondary">
              No workspace yet. Complete{' '}
              <Link href="/onboarding/manager" className="text-primary underline">
                manager onboarding
              </Link>{' '}
              to create your first workspace and unit.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-4">
        <Link
          href="/manager/units?filter=attention"
          className={cn(
            'block flex-1 min-w-[var(--s20)] rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary',
          )}
        >
          <Card className="h-full transition-colors hover:border-border-strong">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-secondary">Units Requiring Action</p>
                  <p className="text-3xl font-bold mt-1">{kpiAction}</p>
                </div>
                <AlertCircle className="text-warning-600" size={24} />
              </div>
              <p className="text-xs text-muted mt-2">Open unit list (filtered)</p>
            </CardContent>
          </Card>
        </Link>

        {flags.showDocumentsKpi && (
          <Link
            href="/manager/units"
            className={cn(
              'block flex-1 min-w-[var(--s20)] rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary',
            )}
          >
            <Card className="h-full transition-colors hover:border-border-strong">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-secondary">Open checklist tasks</p>
                    <p className="text-3xl font-bold mt-1">{kpiMissing}</p>
                  </div>
                  <FileText className="text-info-600" size={24} />
                </div>
                <p className="text-xs text-muted mt-2">
                  {useLive
                    ? 'Incomplete tenant move-in items across your units'
                    : 'Demo aggregate — live count from Supabase'}
                </p>
              </CardContent>
            </Card>
          </Link>
        )}

        <Link
          href="/manager/cases?status=open"
          className={cn(
            'block flex-1 min-w-[var(--s20)] rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary',
          )}
        >
          <Card className="h-full transition-colors hover:border-border-strong">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-secondary">Open Cases</p>
                  <p className="text-3xl font-bold mt-1">{kpiCases}</p>
                </div>
                <Clock className="text-primary-500" size={24} />
              </div>
              <p className="text-xs text-muted mt-2">Cases index (open filter)</p>
            </CardContent>
          </Card>
        </Link>

        {flags.showTransitionsKpi && (
          <Link
            href="/manager/units"
            className={cn(
              'block flex-1 min-w-[var(--s20)] rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary',
            )}
          >
            <Card className="h-full transition-colors hover:border-border-strong">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-secondary">Upcoming Transitions</p>
                    <p className="text-3xl font-bold mt-1">{kpiTransitions}</p>
                  </div>
                  <TrendingUp className="text-success-600" size={24} />
                </div>
                <p className="text-xs text-muted mt-2">
                  {useLive
                    ? 'Lease start/end in the next 30 days'
                    : 'Demo — live from tenant lease dates'}
                </p>
              </CardContent>
            </Card>
          </Link>
        )}

        <Link
          href="/manager/maintenance"
          className={cn(
            'block flex-1 min-w-[var(--s20)] rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary',
          )}
        >
          <Card className="h-full transition-colors hover:border-border-strong">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-secondary">Open maintenance</p>
                  <p className="text-3xl font-bold mt-1">
                    {showMock
                      ? 3
                      : maintenanceOpen.isLoading
                        ? '…'
                        : (maintenanceOpen.data ?? 0)}
                  </p>
                </div>
                <Wrench className="text-info-600" size={24} />
              </div>
              <p className="text-xs text-primary mt-2 underline-offset-4 hover:underline">
                View requests
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
              <div>
                <CardTitle>Units Requiring Action</CardTitle>
                <CardDescription>Operational states that need follow-up</CardDescription>
              </div>
              <Link
                href="/manager/units?filter=attention"
                className="text-sm text-primary underline-offset-4 hover:underline shrink-0"
              >
                View all in Units
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {showMock &&
              MOCK_UNITS_ACTION.map((unit) => (
                <div
                  key={unit.id}
                  className="flex items-start justify-between pb-3 border-b border-border last:border-0"
                >
                  <div>
                    <p className="font-medium">{unit.name}</p>
                    <p className="text-sm text-secondary mt-1">{unit.action}</p>
                  </div>
                  <Badge variant={unit.daysLeft <= 3 ? 'error' : 'warning'}>
                    {unit.daysLeft}d
                  </Badge>
                </div>
              ))}

            {useLive &&
              !showLiveEmpty &&
              attentionUnits.map((unit) => (
                <div
                  key={unit.id}
                  className="flex items-start justify-between pb-3 border-b border-border last:border-0"
                >
                  <div className="min-w-0 pr-2">
                    <Link
                      href={`/manager/units/${unit.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {unit.name}
                    </Link>
                    <p className="text-sm text-secondary mt-1">
                      {unitStateActionLabel(unit.unit_state)}
                    </p>
                  </div>
                  <Badge variant="warning">{unit.unit_state}</Badge>
                </div>
              ))}

            {useLive && !showLiveEmpty && attentionUnits.length === 0 && (
              <div className="flex items-center gap-2 text-secondary text-sm">
                <CheckCircle2 className="text-success shrink-0" size={20} />
                <span>No units in critical workflow states right now.</span>
              </div>
            )}
          </CardContent>
        </Card>

        {flags.showDocumentsKpi && (
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                <div>
                  <CardTitle>{useLive ? 'Open checklist tasks' : 'Missing Records'}</CardTitle>
                  <CardDescription>
                    {useLive
                      ? 'Tenant move-in checklist items not yet completed'
                      : 'Documents to collect'}
                  </CardDescription>
                </div>
                {useLive && (
                  <Link
                    href="/manager/units"
                    className="text-sm text-primary underline-offset-4 hover:underline shrink-0"
                  >
                    Open Units
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {showMock &&
                MOCK_MISSING.map((record) => (
                  <div
                    key={record.type}
                    className="flex items-center justify-between pb-3 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="font-medium">{record.type}</p>
                      <p className="text-sm text-secondary">{record.count} missing</p>
                    </div>
                    <Badge variant={record.priority === 'high' ? 'error' : 'warning'}>
                      {record.priority}
                    </Badge>
                  </div>
                ))}
              {useLive && !showLiveEmpty && (
                <div className="space-y-2">
                  <p className="text-sm text-secondary">
                    {(data?.openChecklistTaskCount ?? 0) === 0
                      ? 'No open checklist tasks across linked tenants.'
                      : `${data?.openChecklistTaskCount ?? 0} open task(s) — open each unit to review tenant checklists.`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {flags.showTransitionsKpi && (
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                <div>
                  <CardTitle>Upcoming Transitions</CardTitle>
                  <CardDescription>Lease milestones in the next 30 days</CardDescription>
                </div>
                {useLive && (
                  <Link
                    href="/manager/units"
                    className="text-sm text-primary underline-offset-4 hover:underline shrink-0"
                  >
                    Open Units
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {showMock &&
                MOCK_TRANSITIONS.map((transition, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between pb-3 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="font-medium">{transition.unit}</p>
                      <p className="text-sm text-secondary">{transition.tenant}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={transition.type === 'move-in' ? 'success' : 'info'}>
                        {transition.type === 'move-in' ? '→ In' : '← Out'}
                      </Badge>
                      <p className="text-xs text-secondary mt-1">{transition.date}</p>
                    </div>
                  </div>
                ))}
              {useLive && !showLiveEmpty && leaseMilestones.length === 0 && (
                <p className="text-sm text-secondary">
                  No lease start or end dates in the next 30 days (add dates when linking
                  tenants on a unit).
                </p>
              )}
              {useLive &&
                !showLiveEmpty &&
                leaseMilestones.map((m) => {
                  const label = unitNameById.get(m.unitId) ?? 'Unit'
                  return (
                    <div
                      key={`${m.unitId}-${m.kind}-${m.at}`}
                      className="flex items-start justify-between pb-3 border-b border-border last:border-0"
                    >
                      <div className="min-w-0 pr-2">
                        <Link
                          href={`/manager/units/${m.unitId}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {label}
                        </Link>
                        <p className="text-sm text-secondary">
                          {m.kind === 'lease_start' ? 'Lease starts' : 'Lease ends'}{' '}
                          {formatIsoDate(m.at)}
                        </p>
                      </div>
                      <Badge variant={m.kind === 'lease_start' ? 'success' : 'info'}>
                        {m.kind === 'lease_start' ? 'Start' : 'End'}
                      </Badge>
                    </div>
                  )
                })}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
              <div>
                <CardTitle>Open Cases</CardTitle>
                <CardDescription>Active lifecycle cases</CardDescription>
              </div>
              <Link
                href="/manager/cases?status=open"
                className="text-sm text-primary underline-offset-4 hover:underline shrink-0"
              >
                View all open
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {showMock &&
              MOCK_CASES.map((caseItem) => (
                <div
                  key={caseItem.id}
                  className="flex items-start justify-between pb-3 border-b border-border last:border-0"
                >
                  <div>
                    <p className="font-medium">{caseItem.type}</p>
                    <p className="text-sm text-secondary">
                      {caseItem.unit} • {caseItem.created}
                    </p>
                  </div>
                  <Badge
                    variant={caseItem.status === 'in-progress' ? 'accent' : 'warning'}
                  >
                    {caseItem.status === 'in-progress' ? 'Active' : 'Pending'}
                  </Badge>
                </div>
              ))}

            {useLive &&
              !showLiveEmpty &&
              openCases.map((c) => {
                const unitLabel = unitNameById.get(c.unit_id) ?? 'Unit'
                return (
                  <div
                    key={c.id}
                    className="flex items-start justify-between pb-3 border-b border-border last:border-0"
                  >
                    <div className="min-w-0 pr-2">
                      <Link
                        href={`/manager/cases/${c.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {formatCaseTypeLabel(c.case_type)}
                      </Link>
                      <p className="text-sm text-secondary">
                        {unitLabel} • {formatRelativeDayLabel(c.created_at)}
                      </p>
                    </div>
                    <Badge variant="accent">{c.status}</Badge>
                  </div>
                )
              })}

            {useLive && !showLiveEmpty && openCases.length === 0 && (
              <p className="text-sm text-secondary">No open cases yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {flags.showBlockersCard && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
              <div>
                <CardTitle>Blockers & Priorities</CardTitle>
                <CardDescription>Issues that need resolution</CardDescription>
              </div>
              {useLive && (
                <Link
                  href="/manager/cases?status=open"
                  className="text-sm text-primary underline-offset-4 hover:underline shrink-0"
                >
                  Open cases
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {showMock &&
              MOCK_BLOCKERS.map((blocker) => (
                <div
                  key={blocker.id}
                  className="flex items-start gap-4 pb-4 border-b border-border last:border-0"
                >
                  <div
                    className={`pt-1 ${blocker.severity === 'high' ? 'text-error-600' : 'text-warning-600'}`}
                  >
                    <AlertCircle size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{blocker.issue}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={blocker.severity === 'high' ? 'error' : 'warning'}>
                        {blocker.severity}
                      </Badge>
                      <span className="text-xs text-secondary">
                        Deadline: {blocker.days} days
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/manager/units"
                    className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}
                  >
                    Open units
                  </Link>
                </div>
              ))}
            {useLive && !showLiveEmpty && dueSoonCases.length === 0 && (
              <p className="text-sm text-secondary">
                No open cases with a due date in the next 30 days.{' '}
                <Link href="/manager/cases" className="text-primary underline">
                  Browse all cases
                </Link>
                .
              </p>
            )}
            {useLive &&
              !showLiveEmpty &&
              dueSoonCases.map((c) => {
                const unitLabel = unitNameById.get(c.unit_id) ?? 'Unit'
                return (
                  <div
                    key={c.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border last:border-0"
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="pt-1 text-warning-600 shrink-0">
                        <AlertCircle size={20} />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/manager/cases/${c.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {formatCaseTypeLabel(c.case_type)}
                        </Link>
                        <p className="text-sm text-secondary mt-1">
                          {unitLabel}
                          {c.due_at && (
                            <>
                              {' '}
                              · Due {formatIsoDate(c.due_at)}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/manager/cases/${c.id}`}
                      className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'shrink-0')}
                    >
                      Open case
                    </Link>
                  </div>
                )
              })}
          </CardContent>
        </Card>
      )}

      {useLive && !showLiveEmpty && data && data.units.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
              <div>
                <CardTitle>All units</CardTitle>
                <CardDescription>Quick links to operational cockpit</CardDescription>
              </div>
              <Link
                href="/manager/units"
                className="text-sm text-primary underline-offset-4 hover:underline shrink-0"
              >
                Full units list
              </Link>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {data.units.map((u) => (
              <Link
                key={u.id}
                href={`/manager/units/${u.id}`}
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
              >
                {u.name}
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
