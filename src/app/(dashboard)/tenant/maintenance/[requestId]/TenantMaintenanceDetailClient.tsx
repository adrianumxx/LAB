'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { buttonVariants } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { FormError } from '@/components/ui/Form'
import { useMaintenanceRequestDetail } from '@/hooks/useMaintenanceRequests'
import { useTenantDashboardData } from '@/hooks/useTenantDashboardData'
import { useAuthStore } from '@/lib/auth-store'
import {
  maintenanceStatusBadgeVariant,
  maintenanceStatusLabel,
} from '@/lib/maintenance-status'
import { formatIsoDateTime } from '@/lib/types/database'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { cn } from '@/lib/utils'
import { isUuid } from '@/lib/validation/uuid'
import { ArrowLeft } from 'lucide-react'

export function TenantMaintenanceDetailClient() {
  const params = useParams()
  const rawId = params['requestId']
  const requestId = typeof rawId === 'string' ? rawId : ''
  const validId = isUuid(requestId)

  const user = useAuthStore((s) => s.user)
  const useLive =
    isSupabaseConfigured() &&
    user?.role === 'tenant' &&
    Boolean(user?.id) &&
    !user.needsRoleSetup

  const dash = useTenantDashboardData(useLive ? user.id : null)
  const detail = useMaintenanceRequestDetail(validId ? requestId : undefined)

  const unitName =
    dash.data?.units.find((u) => u.id === detail.data?.unit_id)?.name ?? 'Unit'

  if (!validId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-secondary">Invalid request id.</p>
          <Link
            href="/tenant/maintenance"
            className={cn(buttonVariants({ variant: 'secondary' }), 'mt-4 inline-flex')}
          >
            Back to list
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/tenant/maintenance"
          className="text-sm text-secondary hover:text-primary inline-flex items-center gap-1 mb-4"
        >
          <ArrowLeft size={16} aria-hidden />
          All requests
        </Link>
        <h1 className="text-3xl font-bold">Request detail</h1>
      </div>

      {detail.isLoading && (
        <p className="text-sm text-secondary" role="status">
          Loading…
        </p>
      )}

      {detail.isError && (
        <FormError>
          {detail.error instanceof Error ? detail.error.message : 'Failed to load'}
        </FormError>
      )}

      {!detail.isLoading && !detail.data && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm text-secondary">
              This request was not found or you do not have access.
            </p>
            <Link
              href="/tenant/maintenance"
              className={cn(buttonVariants({ variant: 'secondary' }), 'inline-flex')}
            >
              Back to list
            </Link>
          </CardContent>
        </Card>
      )}

      {detail.data && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div>
                <CardTitle>{detail.data.title}</CardTitle>
                <CardDescription>{unitName}</CardDescription>
              </div>
              <Badge variant={maintenanceStatusBadgeVariant(detail.data.status)}>
                {maintenanceStatusLabel(detail.data.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {detail.data.description ? (
              <div>
                <p className="text-secondary font-medium mb-1">Description</p>
                <p className="text-primary whitespace-pre-wrap">{detail.data.description}</p>
              </div>
            ) : null}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-secondary">
              <div>
                <p className="text-xs uppercase tracking-wide">Submitted</p>
                <p className="text-primary">{formatIsoDateTime(detail.data.created_at)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide">Last updated</p>
                <p className="text-primary">{formatIsoDateTime(detail.data.updated_at)}</p>
              </div>
              {detail.data.resolved_at ? (
                <div>
                  <p className="text-xs uppercase tracking-wide">Resolved</p>
                  <p className="text-primary">{formatIsoDateTime(detail.data.resolved_at)}</p>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
