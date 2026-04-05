'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/Form'
import { NetworkQueryError } from '@/components/ui/NetworkQueryError'
import { billingProfileQueryKey, useBillingProfile } from '@/hooks/useBillingProfile'
import { useAuthStore } from '@/lib/auth-store'
import { subscriptionStatusGrantsAccess } from '@/lib/billing'
import { type BillingPlanSlug, billingPlanLabel } from '@/lib/stripe/checkout-plans'
import { getStripePublishableKey, isStripeCheckoutConfigured } from '@/lib/stripe/env'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { cn } from '@/lib/utils'
import { CreditCard } from 'lucide-react'

export interface BillingPageClientProps {
  configuredPlans: readonly BillingPlanSlug[]
}

export function BillingPageClient({ configuredPlans }: BillingPageClientProps) {
  const user = useAuthStore((s) => s.user)
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const billing = useBillingProfile(user?.id ?? null)

  const [actionError, setActionError] = useState<string | null>(null)
  const [checkoutPending, setCheckoutPending] = useState(false)
  const [portalPending, setPortalPending] = useState(false)

  const checkoutConfigured = isStripeCheckoutConfigured()
  const publishablePresent = Boolean(getStripePublishableKey())

  useEffect(() => {
    if (!user) {
      return
    }
    if (searchParams.get('checkout') === 'success') {
      void queryClient.invalidateQueries({ queryKey: billingProfileQueryKey })
    }
  }, [searchParams, queryClient, user])

  useEffect(() => {
    if (!user) {
      router.replace('/role-entry')
    }
  }, [user, router])

  if (!user) {
    return (
      <p className="text-sm text-landing-muted text-center" role="status">
        Redirecting…
      </p>
    )
  }

  const row = billing.data
  const active = subscriptionStatusGrantsAccess(row?.stripe_subscription_status)

  async function startCheckout(plan: BillingPlanSlug) {
    setActionError(null)
    setCheckoutPending(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = (await res.json()) as { url?: string; error?: string }
      if (!res.ok) {
        throw new Error(data.error ?? 'Checkout failed')
      }
      if (!data.url) {
        throw new Error('No checkout URL returned')
      }
      window.location.href = data.url
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Checkout failed')
    } finally {
      setCheckoutPending(false)
    }
  }

  async function openPortal() {
    setActionError(null)
    setPortalPending(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = (await res.json()) as { url?: string; error?: string }
      if (!res.ok) {
        throw new Error(data.error ?? 'Portal failed')
      }
      if (!data.url) {
        throw new Error('No portal URL returned')
      }
      window.location.href = data.url
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Portal failed')
    } finally {
      setPortalPending(false)
    }
  }

  return (
    <div className="space-y-6 w-full max-w-lg mx-auto">
      <div className="text-center text-landing-fg mb-2 space-y-2">
        <div className="flex justify-center mb-2">
          <CreditCard className="text-[var(--cta-solid)]" size={32} aria-hidden />
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
          Billing
        </h1>
        <p className="text-landing-muted text-sm">
          Manage your subscription with Stripe. Secrets stay on the server.{' '}
          <Link
            href="/pricing"
            className="text-[var(--cta-solid)] font-medium hover:underline underline-offset-4"
          >
            View plans
          </Link>
        </p>
      </div>

      {searchParams.get('checkout') === 'success' && (
        <p className="text-sm text-center text-landing-muted rounded-lg border border-white/10 p-3">
          Payment received — your plan should update within a few seconds. Refresh if status still
          shows inactive.
        </p>
      )}
      {searchParams.get('checkout') === 'canceled' && (
        <p className="text-sm text-center text-landing-muted rounded-lg border border-white/10 p-3">
          Checkout canceled. You can try again when ready.
        </p>
      )}

      {!isSupabaseConfigured() && (
        <p className="text-sm text-landing-muted text-center rounded-lg border border-white/10 p-3">
          Supabase is not configured — billing state is not persisted in this demo.
        </p>
      )}

      {!publishablePresent && (
        <p className="text-sm text-landing-muted text-center rounded-lg border border-white/10 p-3">
          Add <code className="text-xs">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to{' '}
          <code className="text-xs">.env.local</code> for client-side Stripe features (Checkout opens
          in a hosted page regardless).
        </p>
      )}

      <Card className="border-white/15 bg-surface/95 shadow-2xl backdrop-blur-xl dark:border-white/10">
        <CardHeader>
          <CardTitle>Plan status</CardTitle>
          <CardDescription>Synced from Stripe via webhook</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {billing.isLoading && (
            <p className="text-sm text-landing-muted" role="status">
              Loading billing profile…
            </p>
          )}
          {billing.isError && (
            <NetworkQueryError
              error={billing.error}
              onRetry={() => void billing.refetch()}
            />
          )}
          {!billing.isLoading && row && (
            <ul className="text-sm text-landing-muted space-y-2">
              <li>
                <span className="text-landing-fg font-medium">Access: </span>
                {active ? 'Active subscription' : 'No active subscription'}
              </li>
              <li>
                <span className="text-landing-fg font-medium">Status: </span>
                {row.stripe_subscription_status ?? '—'}
              </li>
              <li>
                <span className="text-landing-fg font-medium">Plan: </span>
                {row.billing_plan ? row.billing_plan.toUpperCase() : '—'}
              </li>
              {row.stripe_subscription_price_id ? (
                <li>
                  <span className="text-landing-fg font-medium">Stripe price: </span>
                  <code className="text-xs break-all">{row.stripe_subscription_price_id}</code>
                </li>
              ) : null}
            </ul>
          )}

          {actionError && <FormError>{actionError}</FormError>}

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-landing-muted">
              Subscribe
            </p>
            <div className="flex flex-col gap-2">
              {configuredPlans.map((plan) => (
                <Button
                  key={plan}
                  type="button"
                  variant="cta"
                  disabled={!checkoutConfigured || checkoutPending || !isSupabaseConfigured()}
                  onClick={() => void startCheckout(plan)}
                >
                  {checkoutPending ? 'Redirecting…' : `Checkout — ${billingPlanLabel(plan)}`}
                </Button>
              ))}
            </div>
            {configuredPlans.length === 0 && checkoutConfigured && (
              <p className="text-xs text-landing-muted">
                No plan prices resolved — check server env mapping.
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              disabled={!row?.stripe_customer_id || portalPending || !isSupabaseConfigured()}
              onClick={() => void openPortal()}
              className={cn('w-full border-white/20 text-landing-fg hover:bg-white/10')}
            >
              {portalPending ? 'Opening…' : 'Manage billing (Customer Portal)'}
            </Button>
          </div>

          {!checkoutConfigured && (
            <p className="text-xs text-landing-muted">
              Set <code>STRIPE_SECRET_KEY</code> and at least one of{' '}
              <code>STRIPE_PRICE_ID_SOLO</code>, <code>STRIPE_PRICE_ID_START</code>,{' '}
              <code>STRIPE_PRICE_ID_CORE</code>, <code>STRIPE_PRICE_ID_PRO</code> (or legacy{' '}
              <code>STRIPE_PRICE_ID</code> for PRO only) in <code>.env.local</code>. See{' '}
              <code>docs/stripe-setup.md</code>.
            </p>
          )}

          {checkoutConfigured && (
            <p className="text-xs text-landing-muted leading-relaxed">
              <strong className="text-landing-fg font-medium">Upgrade / change plan:</strong> use
              Customer Portal if your Stripe configuration allows switching products; otherwise cancel
              and start a new Checkout for the target plan (same account email).
            </p>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-sm text-landing-muted">
        <Link
          href={`/${user.role}`}
          className="text-[var(--cta-solid)] font-medium hover:underline underline-offset-4"
        >
          Back to dashboard
        </Link>
        {' · '}
        <Link
          href="/account/preferences"
          className="text-[var(--cta-solid)] font-medium hover:underline underline-offset-4"
        >
          Preferences
        </Link>
      </p>
    </div>
  )
}
