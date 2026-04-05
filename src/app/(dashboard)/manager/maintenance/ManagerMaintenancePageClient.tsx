'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { buttonVariants } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { FormError } from '@/components/ui/Form'
import {
  useManagerMaintenanceRequests,
  useUpdateMaintenanceRequestStatus,
} from '@/hooks/useMaintenanceRequests'
import { useManagerDashboardData } from '@/hooks/useManagerDashboardData'
import { useAuthStore } from '@/lib/auth-store'
import {
  MAINTENANCE_STATUSES,
  maintenanceStatusBadgeVariant,
  maintenanceStatusLabel,
} from '@/lib/maintenance-status'
import { formatIsoDateTime } from '@/lib/types/database'
import { cn } from '@/lib/utils'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { ArrowLeft } from 'lucide-react'

export function ManagerMaintenancePageClient() {
  const user = useAuthStore((s) => s.user)
  const useLive =
    isSupabaseConfigured() &&
    user?.role === 'manager' &&
    Boolean(user?.id) &&
    !user.needsRoleSetup

  const dash = useManagerDashboardData(useLive ? user.id : null)
  const list = useManagerMaintenanceRequests(useLive ? user.id : null)
  const updateStatus = useUpdateMaintenanceRequestStatus()

  const unitNameById = new Map(dash.data?.units.map((u) => [u.id, u.name]) ?? [])

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/manager"
          className="text-sm text-secondary hover:text-primary inline-flex items-center gap-1 mb-4"
        >
          <ArrowLeft size={16} aria-hidden />
          Back to Action Center
        </Link>
        <h1 className="text-3xl font-bold">Maintenance requests</h1>
        <p className="text-secondary mt-2">
          Open and in-progress requests from tenants on your units. Updating status is visible to
          them immediately.
        </p>
      </div>

      {!useLive && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-secondary">
              Sign in with Supabase configured as a manager to load tenant requests.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All requests</CardTitle>
          <CardDescription>Sorted by newest first.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
          {useLive && !list.isLoading && (list.data?.length ?? 0) === 0 && (
            <p className="text-sm text-secondary">No maintenance requests yet.</p>
          )}
          {list.data?.map((row) => (
            <div
              key={row.id}
              className="flex flex-col lg:flex-row lg:items-end gap-4 pb-4 border-b border-soft last:border-0"
            >
              <div className="flex-1 min-w-0 space-y-1">
                <p className="font-medium">{row.title}</p>
                <p className="text-xs text-secondary font-mono">
                  Tenant ···{row.tenant_id.slice(-8)} ·{' '}
                  {unitNameById.get(row.unit_id) ?? 'Unit'}
                </p>
                {row.description ? (
                  <p className="text-sm text-secondary line-clamp-2">{row.description}</p>
                ) : null}
                <p className="text-xs text-muted">{formatIsoDateTime(row.created_at)}</p>
                <Link
                  href={`/manager/units/${row.unit_id}`}
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-fit mt-2')}
                >
                  Open unit
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Badge variant={maintenanceStatusBadgeVariant(row.status)}>
                  {maintenanceStatusLabel(row.status)}
                </Badge>
                <label className="sr-only" htmlFor={`status-${row.id}`}>
                  Status for {row.title}
                </label>
                <select
                  id={`status-${row.id}`}
                  className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm text-primary min-w-[var(--s20)]"
                  value={row.status}
                  disabled={updateStatus.isPending}
                  onChange={(e) => {
                    const next = e.target.value as (typeof MAINTENANCE_STATUSES)[number]
                    void updateStatus.mutateAsync({ id: row.id, status: next })
                  }}
                >
                  {MAINTENANCE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {maintenanceStatusLabel(s)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
