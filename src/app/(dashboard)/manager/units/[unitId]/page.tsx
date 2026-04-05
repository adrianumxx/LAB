'use client'

import type { VariantProps } from 'class-variance-authority'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge, badgeVariants } from '@/components/ui/Badge'
import { buttonVariants } from '@/components/ui/Button'
import { FormError } from '@/components/ui/Form'
import { NetworkQueryError } from '@/components/ui/NetworkQueryError'
import { CreateCasePanel } from '@/components/manager/CreateCasePanel'
import { UnitPeoplePanel } from '@/components/manager/UnitPeoplePanel'
import { ManagerUnitChecklistPanel } from '@/components/manager/ManagerUnitChecklistPanel'
import { TenantDocumentsPanel } from '@/components/tenant/TenantDocumentsPanel'
import { useManagerUnitPageData } from '@/hooks/useManagerUnitPageData'
import { caseStatusToBadgeVariant, humanizeCaseStatus } from '@/lib/case-status-badge'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import type { UnitRow, UnitState } from '@/lib/types/database'
import { formatCaseTypeLabel, formatIsoDate } from '@/lib/types/database'
import { cn } from '@/lib/utils'
import { isUuid } from '@/lib/validation/uuid'
import { AlertCircle, CheckCircle2, Clock, FileText, ArrowRight, MapPin } from 'lucide-react'
import { useParams } from 'next/navigation'

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

function formatDbAddress(u: UnitRow): string {
  const line = u.address_line?.trim()
  const cityLine = [u.postal_code?.trim(), u.city?.trim()].filter(Boolean).join(' ')
  const parts = [line, cityLine].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : '—'
}

const STATE_BADGE_VARIANT: Record<UnitState, BadgeVariant> = {
  vacant: 'warning',
  incoming: 'info',
  occupied: 'success',
  notice: 'warning',
  outgoing: 'error',
  turnover: 'warning',
}

export default function UnitDetailPage() {
  const params = useParams()
  const unitId = params['unitId'] as string

  const useLive = isSupabaseConfigured() && isUuid(unitId)
  const unitQuery = useManagerUnitPageData(unitId)
  const dbUnit = unitQuery.data?.unit ?? null

  // Mock data when DB off or non-UUID routes (e.g. legacy demo ids)
  const mockUnit = {
    id: unitId,
    name: 'Apt 401',
    address: '123 Main Street, Suite 401',
    state: 'incoming' as UnitState,
    rent: '$2,500/month',
    squareFeet: 950,
    bedrooms: 2,
    bathrooms: 1,
    leaseStart: '2026-04-07',
  }

  const unitData =
    useLive && dbUnit
      ? {
          id: dbUnit.id,
          name: dbUnit.name,
          address: formatDbAddress(dbUnit),
          state: dbUnit.unit_state,
          rent: '—',
          squareFeet: 0,
          bedrooms: 0,
          bathrooms: 0,
          leaseStart: '—',
        }
      : mockUnit

  const unitStates = [
    { state: 'vacant' as const, label: 'Vacant', color: 'warning', icon: '📭' },
    { state: 'incoming' as const, label: 'Incoming', color: 'info', icon: '📬' },
    { state: 'occupied' as const, label: 'Occupied', color: 'success', icon: '👤' },
    { state: 'notice' as const, label: 'Notice', color: 'warning', icon: '⏰' },
    { state: 'outgoing' as const, label: 'Outgoing', color: 'error', icon: '🚪' },
    { state: 'turnover' as const, label: 'Turnover', color: 'warning', icon: '🔄' },
  ]

  const currentTenancy = {
    tenant: 'Jane Smith',
    leaseStart: 'April 7, 2026',
    leaseEnd: 'April 6, 2027',
    rent: '$2,500/month',
    status: 'signed',
    email: 'jane.smith@email.com',
    phone: '(555) 123-4567',
  }

  const activeCase = {
    id: 'case-001',
    type: 'Move-in',
    status: 'in-progress',
    phase: 'Tenant Screening',
    progress: 75,
    dueDate: '2026-04-07',
  }

  const blockers = [
    { id: 1, issue: 'Tenant screening incomplete', severity: 'high', days: 3 },
    { id: 2, issue: 'Insurance document pending from owner', severity: 'high', days: 5 },
  ]

  const missingRecords = [
    { type: 'ID Verification', status: 'missing' },
    { type: 'Income Documentation', status: 'missing' },
    { type: 'Move-in Checklist', status: 'received' },
  ]

  const keyDocuments = [
    { name: 'Lease Agreement', date: '2026-04-04', status: 'signed' },
    { name: 'Background Check', date: '2026-04-05', status: 'completed' },
    { name: 'Move-in Inspection Form', date: '—', status: 'pending' },
  ]

  const timeline = [
    { date: '2026-04-04', action: 'Lease agreement signed', status: 'completed' },
    { date: '2026-04-05', action: 'Background check completed', status: 'completed' },
    { date: '2026-04-07', action: 'Move-in day', status: 'upcoming' },
    { date: '2026-04-08', action: 'Move-in inspection', status: 'upcoming' },
  ]

  const currentState = unitData.state
  const stateColor = STATE_BADGE_VARIANT[currentState]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        {useLive && unitQuery.isLoading && (
          <p className="text-sm text-secondary mb-2">Loading unit…</p>
        )}
        {useLive && unitQuery.isError && (
          <NetworkQueryError
            className="mb-4"
            error={unitQuery.error}
            onRetry={() => void unitQuery.refetch()}
          />
        )}
        {useLive && !unitQuery.isLoading && !dbUnit && (
          <FormError className="mb-4">
            Unit not found or you don&apos;t have access.{' '}
            <Link href="/manager/units" className="underline underline-offset-2">
              Back to all units
            </Link>
            .
          </FormError>
        )}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold">{unitData.name}</h1>
            <div className="flex items-center gap-2 mt-2 text-secondary">
              <MapPin size={16} />
              <p>{unitData.address}</p>
            </div>
          </div>
          <Badge variant={stateColor} className="text-lg px-4 py-2">
            {currentState.charAt(0).toUpperCase() + currentState.slice(1)}
          </Badge>
        </div>

        {/* Unit Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
            <p className="text-xs text-secondary">Rent</p>
            <p className="font-semibold mt-1">{unitData.rent}</p>
          </div>
          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
            <p className="text-xs text-secondary">Size</p>
            <p className="font-semibold mt-1">
              {useLive && dbUnit ? '—' : `${unitData.squareFeet} sq ft`}
            </p>
          </div>
          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
            <p className="text-xs text-secondary">Bedrooms</p>
            <p className="font-semibold mt-1">
              {useLive && dbUnit ? '—' : unitData.bedrooms}
            </p>
          </div>
          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
            <p className="text-xs text-secondary">Bathrooms</p>
            <p className="font-semibold mt-1">
              {useLive && dbUnit ? '—' : unitData.bathrooms}
            </p>
          </div>
        </div>
      </div>

      {useLive && dbUnit && unitQuery.data && (
        <UnitPeoplePanel
          unitId={unitId}
          owners={unitQuery.data.owners}
          tenants={unitQuery.data.tenants}
        />
      )}

      {useLive && dbUnit && (
        <TenantDocumentsPanel
          unitId={unitId}
          unitLabel={dbUnit.name}
          variant="manager_view"
        />
      )}

      {useLive && dbUnit && <ManagerUnitChecklistPanel unitId={unitId} />}

      {useLive && dbUnit && unitQuery.data && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cases</CardTitle>
              <CardDescription>Lifecycle cases for this unit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {unitQuery.data.cases.length === 0 ? (
                <p className="text-sm text-secondary">No cases yet. Create one below.</p>
              ) : (
                <ul className="space-y-3">
                  {unitQuery.data.cases.map((c) => (
                    <li
                      key={c.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-soft last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium text-sm">{formatCaseTypeLabel(c.case_type)}</p>
                        <p className="text-xs text-secondary">
                          Due {formatIsoDate(c.due_at)} · Created {formatIsoDate(c.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={caseStatusToBadgeVariant(c.status)}>
                          {humanizeCaseStatus(c.status)}
                        </Badge>
                        <Link
                          href={`/manager/cases/${c.id}`}
                          className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}
                        >
                          Open
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <CreateCasePanel unitId={unitId} />
        </div>
      )}

      {/* Unit State Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Unit State</CardTitle>
          <CardDescription>Manage unit lifecycle stage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {unitStates.map((item) => (
              <button
                key={item.state}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition ${
                  currentState === item.state
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
                    : 'border-soft hover:border-primary-500'
                }`}
              >
                <span className="text-2xl mb-1">{item.icon}</span>
                <span className="text-xs font-medium text-center">{item.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {!useLive && (
        <>
      {/* Main Grid (demo only — live workspace uses Cases + panels above) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Tenancy */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Current Tenancy</CardTitle>
            <CardDescription>Tenant information and lease details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-soft">
              <div>
                <p className="text-sm text-secondary">Tenant Name</p>
                <p className="font-semibold">{currentTenancy.tenant}</p>
              </div>
              <Badge variant="success">Lease Signed</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-secondary">Lease Start</p>
                <p className="font-medium">{currentTenancy.leaseStart}</p>
              </div>
              <div>
                <p className="text-xs text-secondary">Lease End</p>
                <p className="font-medium">{currentTenancy.leaseEnd}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-secondary">Contact</p>
              <p className="font-medium text-sm">{currentTenancy.email}</p>
              <p className="font-medium text-sm">{currentTenancy.phone}</p>
            </div>
            <Link href="/manager/units" className={cn(buttonVariants({ variant: 'primary' }), 'w-full justify-center')}>
              Back to all units
            </Link>
          </CardContent>
        </Card>

        {/* Active Case */}
        <Card>
          <CardHeader>
            <CardTitle>Active Case</CardTitle>
            <CardDescription>Current lifecycle case</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Badge variant="accent" className="mb-2">
                {activeCase.type}
              </Badge>
              <p className="font-semibold">{activeCase.phase}</p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <p className="text-xs text-secondary">Progress</p>
                <p className="text-sm font-medium">{activeCase.progress}%</p>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div
                  className="bg-primary-500 h-2 rounded-full"
                  style={{ width: `${activeCase.progress}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-soft">
              <p className="text-xs text-secondary">Due Date</p>
              <p className="font-medium text-sm">{activeCase.dueDate}</p>
            </div>

            <Link
              href="/manager/cases"
              className={cn(buttonVariants({ variant: 'primary' }), 'w-full justify-center')}
            >
              View cases list
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Blockers & Missing Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Blockers</CardTitle>
            <CardDescription>Issues blocking progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {blockers.map((blocker) => (
              <div key={blocker.id} className="flex items-start gap-3 pb-3 border-b border-soft last:border-0">
                <AlertCircle className="text-error-600 flex-shrink-0 mt-1" size={18} />
                <div className="flex-1">
                  <p className="font-medium text-sm">{blocker.issue}</p>
                  <p className="text-xs text-secondary mt-1">Deadline: {blocker.days} days</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Missing Records</CardTitle>
            <CardDescription>Documentation status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {missingRecords.map((record) => (
              <div key={record.type} className="flex items-center justify-between pb-3 border-b border-soft last:border-0">
                <p className="text-sm">{record.type}</p>
                {record.status === 'received' ? (
                  <CheckCircle2 className="text-success-600" size={18} />
                ) : (
                  <AlertCircle className="text-warning-600" size={18} />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Documents & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Key Documents</CardTitle>
            <CardDescription>Important files and records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {keyDocuments.map((doc) => (
              <div key={doc.name} className="flex items-center justify-between pb-3 border-b border-soft last:border-0">
                <div className="flex items-center gap-2">
                  <FileText className="text-primary-500" size={18} />
                  <div>
                    <p className="font-medium text-sm">{doc.name}</p>
                    <p className="text-xs text-secondary">{doc.date}</p>
                  </div>
                </div>
                <Badge variant={doc.status === 'pending' ? 'warning' : 'success'}>
                  {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
            <CardDescription>Key events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {timeline.map((event, i) => (
              <div key={i} className="flex gap-3 pb-3 border-b border-soft last:border-0">
                <div className={`mt-1 ${event.status === 'completed' ? 'text-success-600' : 'text-primary-500'}`}>
                  {event.status === 'completed' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{event.action}</p>
                  <p className="text-xs text-secondary">{event.date}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 sticky bottom-0 bg-app border-t border-soft p-4 rounded-lg">
        <Link
          href="/manager/cases"
          className={cn(buttonVariants({ variant: 'primary' }), 'flex-1 justify-center')}
        >
          Open cases <ArrowRight className="ml-2" size={16} aria-hidden />
        </Link>
        <Link
          href="/manager/units"
          className={cn(buttonVariants({ variant: 'secondary' }), 'flex-1 justify-center')}
        >
          All units
        </Link>
      </div>
        </>
      )}
    </div>
  )
}
