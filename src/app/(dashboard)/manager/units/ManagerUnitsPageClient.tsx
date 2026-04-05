'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Button, buttonVariants } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { FormError, FormField, FormLabel } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { NetworkQueryError } from '@/components/ui/NetworkQueryError'
import { useBillingProfile } from '@/hooks/useBillingProfile'
import { managerDashboardQueryKey, useManagerDashboardData } from '@/hooks/useManagerDashboardData'
import { aggregateManagerAttentionUnits } from '@/lib/manager-dashboard-aggregates'
import { getManagerUnitCap, managerCanAddUnit } from '@/lib/billing-plan-policy'
import { useAuthStore } from '@/lib/auth-store'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { cn } from '@/lib/utils'
import { ArrowLeft, Plus } from 'lucide-react'

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
  const queryClient = useQueryClient()

  const user = useAuthStore((s) => s.user)
  const useLive =
    isSupabaseConfigured() &&
    user?.role === 'manager' &&
    Boolean(user.id) &&
    !user.needsRoleSetup

  const billing = useBillingProfile(useLive ? user.id : null)

  const { data, isLoading, isError, error, refetch } = useManagerDashboardData(
    useLive ? user.id : null,
  )

  const units = data?.units ?? []
  const workspaces = useMemo(() => data?.workspaces ?? [], [data])
  const displayed = attentionOnly ? aggregateManagerAttentionUnits(units) : units
  const showEmptyWorkspace =
    useLive && !isLoading && data && data.units.length === 0 && data.workspaces.length === 0

  const unitCount = units.length
  const cap = getManagerUnitCap(billing.data ?? null)
  const canAddUnit = managerCanAddUnit(unitCount, billing.data ?? null)

  const [workspaceId, setWorkspaceId] = useState('')
  const [newName, setNewName] = useState('')
  const [newState, setNewState] = useState('vacant')
  const [addError, setAddError] = useState<string | null>(null)

  useEffect(() => {
    if (workspaces.length === 0) return
    const first = workspaces[0]
    if (!first) return
    const valid = workspaces.some((w) => w.id === workspaceId)
    if (!workspaceId || !valid) {
      setWorkspaceId(first.id)
    }
  }, [workspaces, workspaceId])

  const addUnit = useMutation({
    mutationFn: async (payload: { workspaceId: string; name: string; unitState: string }) => {
      const res = await fetch('/api/manager/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const body = (await res.json()) as { error?: string; unitId?: string }
      if (!res.ok) {
        throw new Error(body.error ?? 'Failed to add unit')
      }
      return body.unitId
    },
    onSuccess: async () => {
      setAddError(null)
      setNewName('')
      await queryClient.invalidateQueries({ queryKey: [...managerDashboardQueryKey] })
      await queryClient.invalidateQueries({ queryKey: ['billing-profile'] })
    },
    onError: (e: Error) => setAddError(e.message),
  })

  function submitAddUnit(e: React.FormEvent) {
    e.preventDefault()
    setAddError(null)
    const name = newName.trim()
    if (!workspaceId || !name) {
      setAddError('Choose a workspace and enter a unit name.')
      return
    }
    addUnit.mutate({ workspaceId, name, unitState: newState })
  }

  const showAddCard = useLive && !isLoading && !showEmptyWorkspace && workspaces.length > 0

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
        {showAddCard && (
          <p className="text-sm text-secondary mt-2">
            Plan usage:{' '}
            <strong className="text-primary">
              {unitCount} / {cap} units
            </strong>
            {billing.isLoading ? ' (loading plan…)' : null}
            {!canAddUnit && (
              <>
                {' '}
                —{' '}
                <Link
                  href="/account/billing"
                  className="text-primary underline underline-offset-4 font-medium"
                >
                  Upgrade in Billing
                </Link>{' '}
                to add more.
              </>
            )}
          </p>
        )}
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

      {showAddCard && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Plus className="size-5 text-primary shrink-0" aria-hidden />
              <div>
                <CardTitle className="text-lg">Add unit</CardTitle>
                <CardDescription>
                  New units count toward your plan limit across all your workspaces.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!canAddUnit ? (
              <p className="text-sm text-secondary">
                You have reached the unit cap for your current plan ({unitCount}/{cap}).{' '}
                <Link
                  href="/account/billing"
                  className="text-primary font-medium underline underline-offset-4"
                >
                  Open Billing
                </Link>{' '}
                to upgrade, or remove units you no longer manage.
              </p>
            ) : (
              <form onSubmit={submitAddUnit} className="space-y-4 max-w-xl">
                {workspaces.length > 1 && (
                  <FormField>
                    <FormLabel htmlFor="add-unit-workspace">Workspace</FormLabel>
                    <select
                      id="add-unit-workspace"
                      value={workspaceId}
                      onChange={(e) => setWorkspaceId(e.target.value)}
                      disabled={addUnit.isPending}
                      className="w-full px-4 py-2 border border-border rounded-md bg-surface text-primary text-sm"
                    >
                      {workspaces.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </FormField>
                )}
                <FormField>
                  <FormLabel htmlFor="add-unit-name">Unit name / address</FormLabel>
                  <Input
                    id="add-unit-name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. 12 Rue Example"
                    disabled={addUnit.isPending}
                  />
                </FormField>
                <FormField>
                  <FormLabel htmlFor="add-unit-state">State</FormLabel>
                  <select
                    id="add-unit-state"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    disabled={addUnit.isPending}
                    className="w-full px-4 py-2 border border-border rounded-md bg-surface text-primary text-sm"
                  >
                    <option value="vacant">Vacant</option>
                    <option value="incoming">Incoming tenant</option>
                    <option value="occupied">Occupied</option>
                    <option value="notice">Notice given</option>
                    <option value="outgoing">Outgoing</option>
                    <option value="turnover">Turnover</option>
                  </select>
                </FormField>
                {addError && <FormError>{addError}</FormError>}
                <Button type="submit" disabled={addUnit.isPending}>
                  {addUnit.isPending ? 'Adding…' : 'Add unit'}
                </Button>
              </form>
            )}
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
