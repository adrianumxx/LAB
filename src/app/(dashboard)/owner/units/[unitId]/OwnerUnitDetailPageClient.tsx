'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Button, buttonVariants } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { FormError } from '@/components/ui/Form'
import { TenantDocumentsPanel } from '@/components/tenant/TenantDocumentsPanel'
import { useOwnerDashboardData } from '@/hooks/useOwnerDashboardData'
import { useAuthStore } from '@/lib/auth-store'
import { caseStatusToBadgeVariant, humanizeCaseStatus } from '@/lib/case-status-badge'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { formatCaseTypeLabel, formatIsoDate, type UnitState } from '@/lib/types/database'
import { cn } from '@/lib/utils'
import { isUuid } from '@/lib/validation/uuid'
import { ArrowLeft } from 'lucide-react'
import type { VariantProps } from 'class-variance-authority'
import { badgeVariants } from '@/components/ui/Badge'

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

const UNIT_STATE_BADGE: Record<UnitState, BadgeVariant> = {
  vacant: 'warning',
  incoming: 'info',
  occupied: 'success',
  notice: 'warning',
  outgoing: 'error',
  turnover: 'warning',
}

export function OwnerUnitDetailPageClient() {
  const params = useParams()
  const unitId = params['unitId'] as string
  const user = useAuthStore((s) => s.user)
  const validUnitId = isUuid(unitId)
  const sessionOwner =
    isSupabaseConfigured() &&
    user?.role === 'owner' &&
    Boolean(user.id) &&
    !user.needsRoleSetup

  const { data, isLoading, isError, error, refetch } = useOwnerDashboardData(
    sessionOwner ? user.id : null,
  )

  const unit = validUnitId ? data?.units.find((u) => u.id === unitId) : undefined
  const casesOnUnit = data?.cases.filter((c) => c.unit_id === unitId) ?? []
  const tenanciesOnUnit = data?.tenancies.filter((t) => t.unit_id === unitId) ?? []

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/owner/units"
          className="text-sm text-secondary hover:text-primary inline-flex items-center gap-1 mb-4"
        >
          <ArrowLeft size={16} aria-hidden />
          All units
        </Link>
        {!sessionOwner && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <p className="text-sm text-secondary">
                Connect Supabase and sign in as an owner to load this unit.
              </p>
            </CardContent>
          </Card>
        )}
        {!validUnitId && (
          <FormError className="mb-4">
            Invalid unit link. Open a unit from your owner overview.
          </FormError>
        )}
        {sessionOwner && validUnitId && isLoading && (
          <p className="text-sm text-secondary mb-2" role="status">
            Loading…
          </p>
        )}
        {sessionOwner && validUnitId && isError && (
          <div className="mb-4 space-y-2">
            <FormError>
              {error instanceof Error ? error.message : 'Failed to load'}
            </FormError>
            <Button type="button" variant="secondary" size="sm" onClick={() => void refetch()}>
              Retry
            </Button>
          </div>
        )}
        {sessionOwner && validUnitId && !isLoading && !unit && (
          <FormError className="mb-4">
            Unit not found or not linked to your account.{' '}
            <Link href="/owner/units" className="underline underline-offset-2">
              Back to units
            </Link>
            .
          </FormError>
        )}
        {unit && (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">{unit.name}</h1>
                <p className="text-secondary mt-2">
                  {[unit.address_line, unit.city, unit.postal_code].filter(Boolean).join(' · ') ||
                    '—'}
                </p>
              </div>
              <Badge variant={UNIT_STATE_BADGE[unit.unit_state]} className="text-sm px-3 py-1">
                {unit.unit_state}
              </Badge>
            </div>
            <p className="text-xs text-muted mt-4">
              Read-only snapshot. Contact your manager to change state or tenancy.
            </p>
          </>
        )}
      </div>

      {unit && sessionOwner && (
        <TenantDocumentsPanel
          unitId={unit.id}
          unitLabel={unit.name}
          variant="manager_view"
        />
      )}

      {unit && (
        <Card>
          <CardHeader>
            <CardTitle>Tenancies</CardTitle>
            <CardDescription>Linked tenants (IDs masked)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {tenanciesOnUnit.length === 0 ? (
              <p className="text-sm text-secondary">No tenant links on this unit.</p>
            ) : (
              tenanciesOnUnit.map((t) => (
                <div
                  key={t.tenant_id}
                  className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-border last:border-0"
                >
                  <p className="text-xs font-mono text-secondary">
                    Tenant ···{t.tenant_id.slice(-8)}
                  </p>
                  <div className="text-right text-sm">
                    <p className="text-secondary">Lease end</p>
                    <p className="font-medium">{formatIsoDate(t.lease_end)}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {unit && (
        <Card>
          <CardHeader>
            <CardTitle>Cases</CardTitle>
            <CardDescription>Lifecycle cases on this unit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {casesOnUnit.length === 0 ? (
              <p className="text-sm text-secondary">No cases yet.</p>
            ) : (
              casesOnUnit.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-border last:border-0"
                >
                  <div>
                    <p className="font-medium text-sm">{formatCaseTypeLabel(c.case_type)}</p>
                    <p className="text-xs text-secondary">
                      Due {formatIsoDate(c.due_at)} · Opened {formatIsoDate(c.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={caseStatusToBadgeVariant(c.status)}>
                      {humanizeCaseStatus(c.status)}
                    </Badge>
                    <Link
                      href={`/owner/cases/${c.id}`}
                      className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}
                    >
                      View case
                    </Link>
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
