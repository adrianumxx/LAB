'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button, buttonVariants } from '@/components/ui/Button'
import { FormError } from '@/components/ui/Form'
import { NetworkQueryError } from '@/components/ui/NetworkQueryError'
import { TenantChecklistList } from '@/components/tenant/TenantChecklistList'
import { useDashboardPreferences } from '@/hooks/useDashboardPreferences'
import {
  checklistOpenCount,
  itemsForUnit,
  useTenantChecklistItems,
  useToggleTenantChecklistItem,
} from '@/hooks/useTenantChecklistItems'
import { useTenantMaintenanceRequests } from '@/hooks/useMaintenanceRequests'
import { useTenantDashboardData } from '@/hooks/useTenantDashboardData'
import { useAuthStore } from '@/lib/auth-store'
import { tenantSectionOrder } from '@/lib/dashboard-preferences'
import { caseStatusToBadgeVariant, humanizeCaseStatus } from '@/lib/case-status-badge'
import {
  maintenanceStatusBadgeVariant,
  maintenanceStatusLabel,
} from '@/lib/maintenance-status'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { TenantDocumentsPanel } from '@/components/tenant/TenantDocumentsPanel'
import { formatCaseTypeLabel, formatIsoDate, formatIsoDateTime } from '@/lib/types/database'
import { cn } from '@/lib/utils'
import { CheckCircle2, Clock, FileText, AlertCircle, DollarSign, Home } from 'lucide-react'

const DEMO_CHECKLIST = [
  { id: 1, item: 'Complete move-in checklist', completed: false, dueDate: '2026-04-07' },
  { id: 2, item: 'Submit ID verification', completed: true, dueDate: '2026-04-05' },
  { id: 3, item: 'Review and sign lease', completed: true, dueDate: '2026-04-05' },
  { id: 4, item: 'Upload proof of income', completed: false, dueDate: '2026-04-08' },
]

const DEMO_MY_STATUS = {
  unit: 'Apt 401 - 123 Main St',
  leaseStart: 'April 7, 2026',
  leaseEnd: 'April 6, 2027',
  rent: '$2,500/month',
  nextPaymentDue: 'April 7, 2026',
  status: 'pending-move-in',
  lastPayment: 'Not yet paid',
}

const DEMO_DOCS = [
  { id: 1, name: 'Lease Agreement', type: 'document', uploadedDate: '2026-04-04' },
  { id: 2, name: 'Move-in Inspection Report', type: 'form', uploadedDate: '—' },
  { id: 3, name: 'House Rules & Policies', type: 'document', uploadedDate: '2026-04-04' },
  { id: 4, name: 'Emergency Contacts', type: 'document', uploadedDate: '2026-04-04' },
]

const DEMO_ISSUES = [
  { id: 1, type: 'Maintenance Request', title: 'No heat in bedroom', status: 'open', reportedDate: '—' },
]

function statusBadgeVariant(status: string): 'info' | 'success' | 'warning' | 'default' {
  if (status === 'pending-move-in') return 'info'
  if (status === 'active') return 'success'
  if (status === 'notice-given') return 'warning'
  return 'default'
}

function statusLabel(status: string): string {
  if (status === 'pending-move-in') return 'Pending Move-in'
  if (status === 'active') return 'Active Lease'
  if (status === 'notice-given') return 'Notice Given'
  return status
}

export function TenantDashboardView() {
  const user = useAuthStore((s) => s.user)
  const { preferences } = useDashboardPreferences(user?.id ?? null)
  const ord = tenantSectionOrder(preferences)
  const useLive =
    isSupabaseConfigured() &&
    user?.role === 'tenant' &&
    Boolean(user?.id) &&
    !user.needsRoleSetup

  const { data, isLoading, isError, error, refetch } = useTenantDashboardData(
    useLive ? user?.id : null,
  )

  const checklistQuery = useTenantChecklistItems(useLive ? user?.id : null)
  const toggleChecklist = useToggleTenantChecklistItem()
  const maintenanceQuery = useTenantMaintenanceRequests(useLive ? user?.id : null)

  const showMock = !useLive
  const primaryUnit = data?.units[0]
  const primaryLease = primaryUnit
    ? data?.leases.find((l) => l.unit_id === primaryUnit.id)
    : undefined

  const checklistItems = checklistQuery.data ?? []
  const liveChecklistTotal = checklistItems.length
  const liveChecklistDone = checklistItems.filter((i) => i.completed).length
  const completionPercentage = showMock
    ? Math.round(
        (DEMO_CHECKLIST.filter((c) => c.completed).length / DEMO_CHECKLIST.length) * 100,
      )
    : liveChecklistTotal > 0
      ? Math.round((liveChecklistDone / liveChecklistTotal) * 100)
      : 0

  const openTasks = checklistOpenCount(checklistItems)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Your Home</h1>
        <p className="text-secondary mt-2">Your rental information, documents, and requests</p>
        {useLive && openTasks > 0 && (
          <p className="text-sm text-warning-600 mt-2" role="status">
            {openTasks} move-in task{openTasks === 1 ? '' : 's'} remaining on your checklist
          </p>
        )}
        {useLive && isLoading && (
          <p className="text-sm text-secondary mt-2">Loading your tenancy…</p>
        )}
        {useLive && isError && (
          <NetworkQueryError
            className="mt-4"
            error={error}
            onRetry={() => void refetch()}
          />
        )}
      </div>

      {useLive && !isLoading && data && data.units.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-secondary text-sm">
              You are not linked to a unit yet. When your manager completes onboarding and adds you as
              a tenant, your lease and tasks will show here.               Puoi mettere la checklist in primo piano da{' '}
              <Link href="/account/preferences" className="text-primary underline">
                Preferenze
              </Link>{' '}
              se stai entrando in una nuova unità.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-8" style={{ order: ord.status }}>
          {useLive && !isLoading && data && data.units.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Your tenancy</CardTitle>
                <CardDescription>From your property manager</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Home className="text-primary-500 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-secondary">Your unit</p>
                      <p className="font-semibold">{primaryUnit?.name ?? '—'}</p>
                      <p className="text-sm text-secondary mt-1">
                        {[primaryUnit?.address_line, primaryUnit?.city].filter(Boolean).join(', ') ||
                          '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="text-primary-500 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-secondary">Lease period</p>
                      <p className="font-semibold">
                        {formatIsoDate(primaryLease?.lease_start ?? null)} →{' '}
                        {formatIsoDate(primaryLease?.lease_end ?? null)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-info-600 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-secondary">Unit state</p>
                      <p className="font-semibold">{primaryUnit?.unit_state ?? '—'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {showMock && (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>My Status</CardTitle>
                    <CardDescription>Your lease information</CardDescription>
                  </div>
                  <Badge variant={statusBadgeVariant(DEMO_MY_STATUS.status)}>
                    {statusLabel(DEMO_MY_STATUS.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Home className="text-primary-500 mt-1" size={20} />
                      <div>
                        <p className="text-sm text-secondary">Your Unit</p>
                        <p className="font-semibold">{DEMO_MY_STATUS.unit}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="text-primary-500 mt-1" size={20} />
                      <div>
                        <p className="text-sm text-secondary">Lease Period</p>
                        <p className="font-semibold">
                          {DEMO_MY_STATUS.leaseStart} to {DEMO_MY_STATUS.leaseEnd}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <DollarSign className="text-primary-500 mt-1" size={20} />
                      <div>
                        <p className="text-sm text-secondary">Monthly Rent</p>
                        <p className="font-semibold">{DEMO_MY_STATUS.rent}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-warning-600 mt-1" size={20} />
                      <div>
                        <p className="text-sm text-secondary">Next Payment Due</p>
                        <p className="font-semibold">{DEMO_MY_STATUS.nextPaymentDue}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-8" style={{ order: ord.checklist }}>
          {showMock && (
            <Card className="bg-gradient-to-r from-primary-50 to-accent-50 border-primary-200">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-lg">Setup Progress</p>
                      <p className="text-sm text-secondary">
                        Demo — connect Supabase for your real checklist
                      </p>
                    </div>
                    <p className="text-4xl font-bold text-primary-500">{completionPercentage}%</p>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {useLive && data && data.units.length > 0 && (
            <Card className="bg-gradient-to-r from-primary-50 to-accent-50 border-primary-200">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-lg">Move-in progress</p>
                      <p className="text-sm text-secondary">
                        {checklistQuery.isLoading
                          ? 'Loading checklist…'
                          : liveChecklistTotal === 0
                            ? 'Checklist will populate after DB migration is applied.'
                            : 'Saved to your account — survives sign-out.'}
                      </p>
                    </div>
                    <p className="text-4xl font-bold text-primary-500">
                      {liveChecklistTotal === 0 && !checklistQuery.isLoading ? '—' : `${completionPercentage}%`}
                    </p>
                  </div>
                  {liveChecklistTotal > 0 && (
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-all"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {useLive && data && data.units.length > 0 ? (
            data.units.map((u) => {
              const unitItems = itemsForUnit(checklistItems, u.id)
              return (
                <Card key={u.id}>
                  <CardHeader>
                    <CardTitle>Your Checklist · {u.name}</CardTitle>
                    <CardDescription>
                      Mark tasks as you complete them — your manager sees the same status on the unit
                      page.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TenantChecklistList
                      items={unitItems}
                      disabled={toggleChecklist.isPending || checklistQuery.isLoading}
                      errorMessage={
                        checklistQuery.isError
                          ? checklistQuery.error instanceof Error
                            ? checklistQuery.error.message
                            : 'Failed to load checklist'
                          : null
                      }
                      emptyMessage="No checklist rows for this unit yet. Ask your manager to re-save your tenancy link after the database migration, or wait a moment and refresh."
                      onToggle={(id, next) => {
                        void toggleChecklist.mutateAsync({ id, completed: next })
                      }}
                    />
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Your Checklist</CardTitle>
                <CardDescription>Complete these items before move-in</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {DEMO_CHECKLIST.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 pb-3 border-b border-soft last:border-0"
                  >
                    <div
                      className={`mt-1 ${item.completed ? 'text-success-600' : 'text-neutral-400'}`}
                    >
                      <CheckCircle2 size={20} />
                    </div>
                    <div className="flex-1">
                      <p
                        className={`font-medium ${item.completed ? 'line-through text-secondary' : ''}`}
                      >
                        {item.item}
                      </p>
                      <p className="text-xs text-secondary mt-1">Due: {item.dueDate}</p>
                    </div>
                    {!item.completed && (
                      <Button size="sm" variant="secondary">
                        Complete
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div style={{ order: ord.documents }} className="flex flex-col gap-6">
          {useLive && data && data.units.length > 0 ? (
            data.units.map((u) => (
              <TenantDocumentsPanel
                key={u.id}
                unitId={u.id}
                unitLabel={u.name}
                variant="tenant"
              />
            ))
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Your lease and important files</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {DEMO_DOCS.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between pb-3 border-b border-soft last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="text-primary-500" size={20} />
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-secondary">{doc.uploadedDate}</p>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm">
                      View
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-6" style={{ order: ord.issues }}>
          {useLive && !isLoading && data && data.cases.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Cases on your unit</CardTitle>
                <CardDescription>Updates from your property manager</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.cases.slice(0, 8).map((c) => (
                  <div
                    key={c.id}
                    className="flex items-start justify-between pb-3 border-b border-soft last:border-0"
                  >
                    <div>
                      <p className="font-medium text-sm">{formatCaseTypeLabel(c.case_type)}</p>
                      <p className="text-xs text-secondary">
                        {data.units.find((u) => u.id === c.unit_id)?.name ?? 'Unit'}
                      </p>
                    </div>
                    <Badge variant={caseStatusToBadgeVariant(c.status)}>
                      {humanizeCaseStatus(c.status)}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Issues & Requests</CardTitle>
              <CardDescription>Maintenance requests and issues</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {showMock ? (
                DEMO_ISSUES.length > 0 ? (
                  DEMO_ISSUES.map((issue) => (
                    <div
                      key={issue.id}
                      className="flex items-start justify-between pb-4 border-b border-soft"
                    >
                      <div>
                        <p className="font-medium">{issue.title}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="info">{issue.type}</Badge>
                          <Badge variant={issue.status === 'open' ? 'warning' : 'success'}>
                            {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-secondary">{issue.reportedDate}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-secondary text-sm">No open issues</p>
                )
              ) : (
                <>
                  {maintenanceQuery.isLoading && (
                    <p className="text-sm text-secondary" role="status">
                      Loading requests…
                    </p>
                  )}
                  {maintenanceQuery.isError && (
                    <NetworkQueryError
                      error={maintenanceQuery.error}
                      onRetry={() => void maintenanceQuery.refetch()}
                    />
                  )}
                  {!maintenanceQuery.isLoading &&
                    (maintenanceQuery.data?.length ?? 0) === 0 && (
                      <p className="text-sm text-secondary">
                        No requests yet. Use the button below to report an issue for your unit.
                      </p>
                    )}
                  {(maintenanceQuery.data ?? []).slice(0, 5).map((row) => (
                    <Link
                      key={row.id}
                      href={`/tenant/maintenance/${row.id}`}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-soft last:border-0 hover:opacity-90"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{row.title}</p>
                        <p className="text-xs text-secondary">
                          {formatIsoDateTime(row.created_at)}
                        </p>
                      </div>
                      <Badge variant={maintenanceStatusBadgeVariant(row.status)}>
                        {maintenanceStatusLabel(row.status)}
                      </Badge>
                    </Link>
                  ))}
                  {(maintenanceQuery.data?.length ?? 0) > 5 && (
                    <Link
                      href="/tenant/maintenance"
                      className="text-sm text-primary underline underline-offset-4"
                    >
                      View all requests
                    </Link>
                  )}
                </>
              )}
              <Link
                href="/tenant/maintenance"
                className={cn(buttonVariants({ variant: 'primary' }), 'w-full mt-2 text-center')}
              >
                Report a New Issue
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
              <CardDescription>Contact your property manager</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="font-medium">Questions or concerns?</p>
                  <p className="text-sm text-secondary mt-1">
                    Our property management team is here to help
                  </p>
                </div>
                {useLive ? (
                  <Link
                    href="/tenant/maintenance"
                    className={cn(
                      buttonVariants({ variant: 'primary' }),
                      'whitespace-nowrap text-center',
                    )}
                  >
                    Open maintenance
                  </Link>
                ) : (
                  <Button variant="primary">Contact Manager</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
