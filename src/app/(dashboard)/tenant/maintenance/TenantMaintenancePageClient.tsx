'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { FormError, FormField, FormLabel } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import {
  useCreateMaintenanceRequest,
  useTenantMaintenanceRequests,
} from '@/hooks/useMaintenanceRequests'
import { useTenantDashboardData } from '@/hooks/useTenantDashboardData'
import { useAuthStore } from '@/lib/auth-store'
import {
  maintenanceStatusBadgeVariant,
  maintenanceStatusLabel,
} from '@/lib/maintenance-status'
import { formatIsoDateTime } from '@/lib/types/database'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { ArrowLeft } from 'lucide-react'

export function TenantMaintenancePageClient() {
  const user = useAuthStore((s) => s.user)
  const useLive =
    isSupabaseConfigured() &&
    user?.role === 'tenant' &&
    Boolean(user?.id) &&
    !user.needsRoleSetup

  const dash = useTenantDashboardData(useLive ? user.id : null)
  const list = useTenantMaintenanceRequests(useLive ? user.id : null)
  const createReq = useCreateMaintenanceRequest()

  const units = useMemo(() => dash.data?.units ?? [], [dash.data])
  const [unitId, setUnitId] = useState('')

  useEffect(() => {
    const first = units[0]
    if (!first) return
    if (!unitId || !units.some((u) => u.id === unitId)) {
      setUnitId(first.id)
    }
  }, [units, unitId])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const [soleUnit] = units
  const effectiveUnitId = units.length === 1 && soleUnit ? soleUnit.id : unitId

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!effectiveUnitId) {
      setFormError('Select a unit.')
      return
    }
    if (!title.trim()) {
      setFormError('Add a short title.')
      return
    }
    try {
      const created = await createReq.mutateAsync({
        unit_id: effectiveUnitId,
        title: title.trim(),
        description: description.trim(),
      })
      setTitle('')
      setDescription('')
      void fetch('/api/notify/maintenance-created', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: created.id }),
      }).catch(() => {
        /* notifica best-effort */
      })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Request failed')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/tenant"
          className="text-sm text-secondary hover:text-primary inline-flex items-center gap-1 mb-4"
        >
          <ArrowLeft size={16} aria-hidden />
          Back to home
        </Link>
        <h1 className="text-3xl font-bold">Maintenance requests</h1>
        <p className="text-secondary mt-2">
          Report non-urgent issues. For emergencies, contact your property manager directly.
        </p>
      </div>

      {!useLive && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-secondary">
              Connect Supabase and sign in as a tenant linked to a unit to submit real requests.
            </p>
          </CardContent>
        </Card>
      )}

      {useLive && dash.isLoading && (
        <p className="text-sm text-secondary" role="status">
          Loading your units…
        </p>
      )}

      {useLive && !dash.isLoading && units.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-secondary">
              You are not linked to a unit yet. When your manager adds you, you can file requests
              here.
            </p>
          </CardContent>
        </Card>
      )}

      {useLive && units.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>New request</CardTitle>
            <CardDescription>Describe the issue. Your manager will see it in their dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
              {units.length > 1 && (
                <FormField>
                  <FormLabel htmlFor="unit">Unit</FormLabel>
                  <select
                    id="unit"
                    className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary"
                    value={unitId}
                    onChange={(e) => setUnitId(e.target.value)}
                    disabled={createReq.isPending}
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </FormField>
              )}
              <FormField>
                <FormLabel htmlFor="title">Title</FormLabel>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Heating not working in bedroom"
                  disabled={createReq.isPending}
                />
              </FormField>
              <FormField>
                <FormLabel htmlFor="description">Details (optional)</FormLabel>
                <textarea
                  id="description"
                  className="w-full min-h-[var(--s20)] rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What happened, when, and any photos you uploaded elsewhere…"
                  disabled={createReq.isPending}
                />
              </FormField>
              {formError && <FormError>{formError}</FormError>}
              <Button type="submit" disabled={createReq.isPending}>
                {createReq.isPending ? 'Submitting…' : 'Submit request'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your requests</CardTitle>
          <CardDescription>Newest first — status updates from your manager.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
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
            <p className="text-sm text-secondary">No requests yet.</p>
          )}
          {list.data?.map((row) => (
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
        </CardContent>
      </Card>
    </div>
  )
}
