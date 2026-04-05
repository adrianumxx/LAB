'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { buttonVariants } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { NetworkQueryError } from '@/components/ui/NetworkQueryError'
import { useManagerDashboardData } from '@/hooks/useManagerDashboardData'
import { aggregateManagerOpenCases } from '@/lib/manager-dashboard-aggregates'
import { useAuthStore } from '@/lib/auth-store'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import {
  formatCaseTypeLabel,
  formatIsoDateTime,
  formatRelativeDayLabel,
} from '@/lib/types/database'
import { cn } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'

export function ManagerCasesPageClient() {
  const searchParams = useSearchParams()
  const openOnly = searchParams.get('status') === 'open'

  const user = useAuthStore((s) => s.user)
  const useLive =
    isSupabaseConfigured() &&
    user?.role === 'manager' &&
    Boolean(user.id) &&
    !user.needsRoleSetup

  const { data, isLoading, isError, error, refetch } = useManagerDashboardData(
    useLive ? user.id : null,
  )

  const cases = data?.cases ?? []
  const displayed = openOnly ? aggregateManagerOpenCases(cases) : cases
  const unitNameById = new Map(data?.units.map((u) => [u.id, u.name]) ?? [])

  const showEmptyWorkspace =
    useLive && !isLoading && data && data.units.length === 0 && data.workspaces.length === 0

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
        <h1 className="text-3xl font-bold">Cases</h1>
        <p className="text-secondary mt-2">
          Lifecycle cases across all units — newest first.
        </p>
        {openOnly ? (
          <p className="text-sm text-secondary mt-2">
            Filter: <strong className="text-primary">open only</strong> ({displayed.length} shown).{' '}
            <Link href="/manager/cases" className="text-primary underline underline-offset-4">
              Show all cases
            </Link>
          </p>
        ) : (
          cases.some((c) => c.status.toLowerCase() === 'open') && (
            <p className="text-sm mt-2">
              <Link
                href="/manager/cases?status=open"
                className="text-primary underline underline-offset-4"
              >
                Show open cases only
              </Link>
            </p>
          )
        )}
      </div>

      {!useLive && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-secondary">
              Connect Supabase and sign in as a manager to load cases from your units.
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
        <NetworkQueryError error={error} onRetry={() => void refetch()} />
      )}

      {showEmptyWorkspace && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-secondary">
              No units yet — add a unit in{' '}
              <Link href="/onboarding/manager" className="text-primary underline">
                onboarding
              </Link>{' '}
              to create cases.
            </p>
          </CardContent>
        </Card>
      )}

      {useLive && !isLoading && !showEmptyWorkspace && displayed.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-secondary">
              {openOnly ? 'No open cases.' : 'No cases yet. Open a unit and create a case.'}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {displayed.map((c) => {
          const unitLabel = unitNameById.get(c.unit_id) ?? 'Unit'
          return (
            <Card key={c.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-lg">
                      <Link
                        href={`/manager/cases/${c.id}`}
                        className="text-primary hover:underline"
                      >
                        {formatCaseTypeLabel(c.case_type)}
                      </Link>
                    </CardTitle>
                    <CardDescription>
                      {unitLabel} · {formatRelativeDayLabel(c.created_at)}
                      {c.due_at && (
                        <>
                          {' '}
                          · Due {formatIsoDateTime(c.due_at)}
                        </>
                      )}
                    </CardDescription>
                  </div>
                  <Badge variant={c.status.toLowerCase() === 'open' ? 'accent' : 'default'}>
                    {c.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Link
                  href={`/manager/cases/${c.id}`}
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                >
                  Open case
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
