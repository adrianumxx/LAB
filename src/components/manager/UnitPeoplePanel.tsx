'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField, FormLabel, FormError } from '@/components/ui/Form'
import {
  managerUnitQueryKey,
  type UnitOwnerLink,
  type UnitTenantLink,
} from '@/hooks/useManagerUnitPageData'
import { InviteUnitMemberError } from '@/hooks/invite-unit-member-error'
import { useUnitMemberInvite } from '@/hooks/useUnitMemberInvite'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { isUuid } from '@/lib/validation/uuid'
import { UserMinus, Users } from 'lucide-react'

function mapLinkError(message: string): string {
  if (
    message.includes('foreign key') ||
    message.includes('23503') ||
    message.includes('violates foreign key')
  ) {
    return 'That user ID is not registered. They must sign up before you can link them.'
  }
  if (message.includes('duplicate key') || message.includes('23505')) {
    return 'This user is already linked to this unit.'
  }
  return message
}

interface UnitPeoplePanelProps {
  unitId: string
  owners: UnitOwnerLink[]
  tenants: UnitTenantLink[]
}

export function UnitPeoplePanel({
  unitId,
  owners,
  tenants,
}: UnitPeoplePanelProps) {
  const queryClient = useQueryClient()
  const [ownerIdInput, setOwnerIdInput] = useState('')
  const [tenantIdInput, setTenantIdInput] = useState('')
  const [leaseStart, setLeaseStart] = useState('')
  const [leaseEnd, setLeaseEnd] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'owner' | 'tenant'>('tenant')
  const [inviteNotice, setInviteNotice] = useState<string | null>(null)
  const [inviteHint, setInviteHint] = useState<string | null>(null)

  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: managerUnitQueryKey(unitId) })

  const inviteMutation = useUnitMemberInvite(invalidate)

  const addOwner = useMutation({
    mutationFn: async (ownerId: string) => {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase
        .from('unit_owners')
        .insert({ unit_id: unitId, owner_id: ownerId.trim() })
      if (error) {
        throw new Error(mapLinkError(error.message))
      }
    },
    onSuccess: () => {
      setOwnerIdInput('')
      setFormError(null)
      invalidate()
    },
    onError: (e: Error) => setFormError(e.message),
  })

  const removeOwner = useMutation({
    mutationFn: async (ownerId: string) => {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase
        .from('unit_owners')
        .delete()
        .eq('unit_id', unitId)
        .eq('owner_id', ownerId)
      if (error) {
        throw new Error(error.message)
      }
    },
    onSuccess: () => {
      setFormError(null)
      invalidate()
    },
    onError: (e: Error) => setFormError(e.message),
  })

  const addTenant = useMutation({
    mutationFn: async (payload: {
      tenantId: string
      leaseStart: string | null
      leaseEnd: string | null
    }) => {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase.from('unit_tenants').insert({
        unit_id: unitId,
        tenant_id: payload.tenantId.trim(),
        lease_start: payload.leaseStart || null,
        lease_end: payload.leaseEnd || null,
      })
      if (error) {
        throw new Error(mapLinkError(error.message))
      }
    },
    onSuccess: () => {
      setTenantIdInput('')
      setLeaseStart('')
      setLeaseEnd('')
      setFormError(null)
      invalidate()
    },
    onError: (e: Error) => setFormError(e.message),
  })

  const removeTenant = useMutation({
    mutationFn: async (tenantId: string) => {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase
        .from('unit_tenants')
        .delete()
        .eq('unit_id', unitId)
        .eq('tenant_id', tenantId)
      if (error) {
        throw new Error(error.message)
      }
    },
    onSuccess: () => {
      setFormError(null)
      invalidate()
    },
    onError: (e: Error) => setFormError(e.message),
  })

  const busy =
    addOwner.isPending ||
    addTenant.isPending ||
    removeOwner.isPending ||
    removeTenant.isPending ||
    inviteMutation.isPending

  function submitInvite(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    setInviteNotice(null)
    setInviteHint(null)
    const trimmed = inviteEmail.trim().toLowerCase()
    if (!trimmed || !trimmed.includes('@')) {
      setFormError('Enter a valid email address.')
      return
    }
    inviteMutation.mutate(
      { email: trimmed, unitId, linkRole: inviteRole },
      {
        onSuccess: (data) => {
          setInviteEmail('')
          setFormError(null)
          setInviteHint(null)
          setInviteNotice(data.message ?? 'Invitation sent.')
        },
        onError: (err: Error) => {
          setInviteNotice(null)
          if (err instanceof InviteUnitMemberError) {
            setFormError(err.message)
            setInviteHint(err.hint ?? null)
          } else {
            setFormError(err.message)
            setInviteHint(null)
          }
        },
      },
    )
  }

  function submitOwner(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    setInviteHint(null)
    if (!isUuid(ownerIdInput)) {
      setFormError(
        'Enter a valid user UUID (from Supabase → Authentication → Users).',
      )
      return
    }
    addOwner.mutate(ownerIdInput)
  }

  function submitTenant(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    setInviteHint(null)
    if (!isUuid(tenantIdInput)) {
      setFormError(
        'Enter a valid user UUID (from Supabase → Authentication → Users).',
      )
      return
    }
    addTenant.mutate({
      tenantId: tenantIdInput,
      leaseStart: leaseStart.trim() || null,
      leaseEnd: leaseEnd.trim() || null,
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="text-primary shrink-0" size={22} />
          <div>
            <CardTitle>Owners & tenants</CardTitle>
            <CardDescription>
              Link Supabase Auth user IDs to this unit. Users must already have an
              account. Find IDs under Dashboard → Authentication → Users.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {formError && <FormError>{formError}</FormError>}
        {inviteNotice && (
          <p className="text-sm text-secondary" role="status">
            {inviteNotice}
          </p>
        )}
        {inviteHint && (
          <p className="text-sm text-secondary border-l-2 border-border pl-3" role="note">
            {inviteHint}
          </p>
        )}

        <form onSubmit={submitInvite} className="space-y-3 rounded-lg border border-border bg-neutral-50 dark:bg-neutral-900/40 p-4">
          <h3 className="text-sm font-semibold text-primary">Invite by email</h3>
          <p className="text-xs text-secondary">
            For <strong className="text-primary">new</strong> users only: Supabase sends a signup
            link and links them here after they register. Requires{' '}
            <code className="text-xs">SUPABASE_SERVICE_ROLE_KEY</code> and the{' '}
            <code className="text-xs">pending_unit_invites</code> migration.{' '}
            <strong className="text-primary">Existing accounts</strong> cannot use this path — paste
            their Auth user UUID below instead.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField>
              <FormLabel htmlFor="invite-email">Email</FormLabel>
              <Input
                id="invite-email"
                type="email"
                autoComplete="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="name@example.com"
                disabled={busy}
              />
            </FormField>
            <FormField>
              <FormLabel htmlFor="invite-role">Role</FormLabel>
              <select
                id="invite-role"
                value={inviteRole}
                onChange={(e) =>
                  setInviteRole(e.target.value === 'owner' ? 'owner' : 'tenant')
                }
                disabled={busy}
                className="w-full px-4 py-2 border border-border rounded-md bg-surface text-primary text-sm"
              >
                <option value="tenant">Tenant</option>
                <option value="owner">Owner</option>
              </select>
            </FormField>
          </div>
          <Button type="submit" size="sm" disabled={busy}>
            {inviteMutation.isPending ? 'Sending…' : 'Send invite'}
          </Button>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <form onSubmit={submitOwner} className="space-y-3">
            <h3 className="text-sm font-semibold text-primary">Property owners</h3>
            <FormField>
              <FormLabel htmlFor="owner-uuid">Owner user UUID</FormLabel>
              <Input
                id="owner-uuid"
                value={ownerIdInput}
                onChange={(e) => setOwnerIdInput(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                disabled={busy}
                autoComplete="off"
              />
            </FormField>
            <Button type="submit" size="sm" disabled={busy}>
              {addOwner.isPending ? 'Adding…' : 'Link owner'}
            </Button>
          </form>

          <form onSubmit={submitTenant} className="space-y-3">
            <h3 className="text-sm font-semibold text-primary">Tenants</h3>
            <FormField>
              <FormLabel htmlFor="tenant-uuid">Tenant user UUID</FormLabel>
              <Input
                id="tenant-uuid"
                value={tenantIdInput}
                onChange={(e) => setTenantIdInput(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                disabled={busy}
                autoComplete="off"
              />
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField>
                <FormLabel htmlFor="lease-start">Lease start (optional)</FormLabel>
                <Input
                  id="lease-start"
                  type="date"
                  value={leaseStart}
                  onChange={(e) => setLeaseStart(e.target.value)}
                  disabled={busy}
                />
              </FormField>
              <FormField>
                <FormLabel htmlFor="lease-end">Lease end (optional)</FormLabel>
                <Input
                  id="lease-end"
                  type="date"
                  value={leaseEnd}
                  onChange={(e) => setLeaseEnd(e.target.value)}
                  disabled={busy}
                />
              </FormField>
            </div>
            <Button type="submit" size="sm" disabled={busy}>
              {addTenant.isPending ? 'Adding…' : 'Link tenant'}
            </Button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-border">
          <div>
            <p className="text-xs font-medium text-secondary uppercase tracking-wide mb-3">
              Linked owners
            </p>
            {owners.length === 0 ? (
              <p className="text-sm text-secondary">No owners linked yet.</p>
            ) : (
              <ul className="space-y-2">
                {owners.map((o) => (
                  <li
                    key={o.owner_id}
                    className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface px-3 py-2"
                  >
                    <code className="text-xs break-all text-secondary">
                      {o.owner_id}
                    </code>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                      disabled={busy}
                      onClick={() => removeOwner.mutate(o.owner_id)}
                      aria-label={`Remove owner ${o.owner_id}`}
                    >
                      <UserMinus size={16} />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-secondary uppercase tracking-wide mb-3">
              Linked tenants
            </p>
            {tenants.length === 0 ? (
              <p className="text-sm text-secondary">No tenants linked yet.</p>
            ) : (
              <ul className="space-y-2">
                {tenants.map((t) => (
                  <li
                    key={t.tenant_id}
                    className="flex items-start justify-between gap-2 rounded-md border border-border bg-surface px-3 py-2"
                  >
                    <div className="min-w-0">
                      <code className="text-xs break-all text-secondary block">
                        {t.tenant_id}
                      </code>
                      {(t.lease_start || t.lease_end) && (
                        <p className="text-xs text-muted mt-1">
                          {t.lease_start ?? '—'} → {t.lease_end ?? '—'}
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                      disabled={busy}
                      onClick={() => removeTenant.mutate(t.tenant_id)}
                      aria-label={`Remove tenant ${t.tenant_id}`}
                    >
                      <UserMinus size={16} />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
