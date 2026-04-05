'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Button, buttonVariants } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { FormError } from '@/components/ui/Form'
import { useOwnerDashboardData } from '@/hooks/useOwnerDashboardData'
import { useAuthStore } from '@/lib/auth-store'
import { caseStatusToBadgeVariant, humanizeCaseStatus } from '@/lib/case-status-badge'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { formatCaseTypeLabel, formatIsoDate, formatRelativeDayLabel } from '@/lib/types/database'
import { cn } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'

export function OwnerCasesPageClient() {
  const user = useAuthStore((s) => s.user)
  const useLive =
    isSupabaseConfigured() &&
    user?.role === 'owner' &&
    Boolean(user.id) &&
    !user.needsRoleSetup

  const { data, isLoading, isError, error, refetch } = useOwnerDashboardData(
    useLive ? user.id : null,
  )

  const cases = data?.cases ?? []
  const unitNameById = new Map(data?.units.map((u) => [u.id, u.name]) ?? [])

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
        <h1 className="text-3xl font-bold">Cases</h1>
        <p className="text-secondary mt-2">
          Lifecycle cases on your units — read-only except checklist items explicitly assigned to
          you.
        </p>
      </div>

      {!useLive && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-secondary">
              Connect Supabase and sign in as an owner to see cases on your linked units.
            </p>
          </CardContent>
        </Card>
      )}

      {useLive && isLoading && (
        <p className="text-sm text-secondary" role="status">
          Loading cases…
        </p>
      )}

      {useLive && isError && (
        <div className="space-y-2">
          <FormError>
            {error instanceof Error ? error.message : 'Failed to load'}
          </FormError>
          <Button type="button" variant="secondary" size="sm" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      )}

      {useLive && !isLoading && cases.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-secondary">No cases on your units yet.</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {cases.map((c) => {
          const unitLabel = unitNameById.get(c.unit_id) ?? 'Unit'
          return (
            <Card key={c.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{formatCaseTypeLabel(c.case_type)}</CardTitle>
                    <CardDescription>
                      {unitLabel} · {formatRelativeDayLabel(c.created_at)}
                      {c.due_at && <> · Due {formatIsoDate(c.due_at)}</>}
                    </CardDescription>
                  </div>
                  <Badge variant={caseStatusToBadgeVariant(c.status)}>
                    {humanizeCaseStatus(c.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0 flex flex-wrap gap-2">
                <Link
                  href={`/owner/cases/${c.id}`}
                  className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}
                >
                  Open case
                </Link>
                <Link
                  href={`/owner/units/${c.unit_id}`}
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                >
                  Unit
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
