'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Button, buttonVariants } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { FormError } from '@/components/ui/Form'
import { useOwnerDashboardData } from '@/hooks/useOwnerDashboardData'
import { useAuthStore } from '@/lib/auth-store'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import type { UnitState } from '@/lib/types/database'
import { cn } from '@/lib/utils'
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

function formatAddress(u: {
  address_line: string | null
  city: string | null
  postal_code: string | null
}): string {
  const parts = [u.address_line, u.city, u.postal_code].filter(Boolean)
  return parts.length > 0 ? parts.join(' · ') : 'No address on file'
}

export function OwnerUnitsPageClient() {
  const user = useAuthStore((s) => s.user)
  const useLive =
    isSupabaseConfigured() &&
    user?.role === 'owner' &&
    Boolean(user.id) &&
    !user.needsRoleSetup

  const { data, isLoading, isError, error, refetch } = useOwnerDashboardData(
    useLive ? user.id : null,
  )

  const units = data?.units ?? []

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
        <h1 className="text-3xl font-bold">Your units</h1>
        <p className="text-secondary mt-2">
          Read-only overview — your manager runs day-to-day operations.
        </p>
      </div>

      {!useLive && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-secondary">
              Connect Supabase and sign in as an owner to see units linked to your account.
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
        <div className="space-y-2">
          <FormError>
            {error instanceof Error ? error.message : 'Failed to load'}
          </FormError>
          <Button type="button" variant="secondary" size="sm" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      )}

      {useLive && !isLoading && units.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-secondary">
              No units yet. When your manager adds you as an owner on a unit, it will show here.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {units.map((u) => (
          <Card key={u.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg">
                  <Link href={`/owner/units/${u.id}`} className="text-primary hover:underline">
                    {u.name}
                  </Link>
                </CardTitle>
                <Badge variant={UNIT_STATE_BADGE[u.unit_state]}>{u.unit_state}</Badge>
              </div>
              <CardDescription>{formatAddress(u)}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Link
                href={`/owner/units/${u.id}`}
                className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}
              >
                View unit
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
