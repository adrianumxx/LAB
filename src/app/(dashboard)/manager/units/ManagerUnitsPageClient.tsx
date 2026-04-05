'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { buttonVariants } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { NetworkQueryError } from '@/components/ui/NetworkQueryError'
import { useManagerDashboardData } from '@/hooks/useManagerDashboardData'
import { aggregateManagerAttentionUnits } from '@/lib/manager-dashboard-aggregates'
import { useAuthStore } from '@/lib/auth-store'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { cn } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'

function formatUnitSubtitle(u: {
  address_line: string | null
  city: string | null
  postal_code: string | null
}): string {
  const parts = [u.address_line, u.city, u.postal_code].filter(Boolean)
  return parts.length > 0 ? parts.join(' · ') : 'No address on file'
}

export function ManagerUnitsPageClient() {
  const searchParams = useSearchParams()
  const attentionOnly = searchParams.get('filter') === 'attention'

  const user = useAuthStore((s) => s.user)
  const useLive =
    isSupabaseConfigured() &&
    user?.role === 'manager' &&
    Boolean(user.id) &&
    !user.needsRoleSetup

  const { data, isLoading, isError, error, refetch } = useManagerDashboardData(
    useLive ? user.id : null,
  )

  const units = data?.units ?? []
  const displayed = attentionOnly ? aggregateManagerAttentionUnits(units) : units
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
        <h1 className="text-3xl font-bold">Units</h1>
        <p className="text-secondary mt-2">
          Open any unit for state, people, documents, and cases.
        </p>
        {attentionOnly && (
          <p className="text-sm text-secondary mt-2">
            Filter: <strong className="text-primary">needs follow-up</strong> (
            {displayed.length} shown).{' '}
            <Link href="/manager/units" className="text-primary underline underline-offset-4">
              Show all units
            </Link>
          </p>
        )}
        {!attentionOnly && units.length > 0 && (
          <p className="text-sm mt-2">
            <Link
              href="/manager/units?filter=attention"
              className="text-primary underline underline-offset-4"
            >
              Show only units requiring action
            </Link>
          </p>
        )}
      </div>

      {!useLive && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-secondary">
              Connect Supabase and sign in as a manager to load units from your workspace.
            </p>
          </CardContent>
        </Card>
      )}

      {useLive && isLoading && (
        <p className="text-sm text-secondary" role="status">
          Loading units…
        </p>
      )}

      {useLive && isError && (
        <NetworkQueryError error={error} onRetry={() => void refetch()} />
      )}

      {showEmptyWorkspace && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-secondary">
              No workspace yet.{' '}
              <Link href="/onboarding/manager" className="text-primary underline">
                Complete manager onboarding
              </Link>{' '}
              to add units.
            </p>
          </CardContent>
        </Card>
      )}

      {useLive && !isLoading && !showEmptyWorkspace && displayed.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-secondary">
              {attentionOnly
                ? 'No units in follow-up states right now.'
                : 'No units in this workspace yet.'}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayed.map((u) => (
          <Card key={u.id} className="flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg">
                  <Link
                    href={`/manager/units/${u.id}`}
                    className="text-primary hover:underline"
                  >
                    {u.name}
                  </Link>
                </CardTitle>
                <Badge variant="default">{u.unit_state}</Badge>
              </div>
              <CardDescription>{formatUnitSubtitle(u)}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 mt-auto">
              <Link
                href={`/manager/units/${u.id}`}
                className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}
              >
                Open cockpit
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
