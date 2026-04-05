import type { Metadata } from 'next'
import { Suspense } from 'react'
import { BillingPageClient } from './BillingPageClient'
import { getConfiguredCheckoutPlanSlugs } from '@/lib/stripe/checkout-plans'

export const metadata: Metadata = {
  title: 'Billing',
  description: 'Subscription and Stripe Customer Portal',
}

export default function AccountBillingPage() {
  const configuredPlans = getConfiguredCheckoutPlanSlugs()

  return (
    <Suspense
      fallback={
        <p className="text-sm text-landing-muted text-center" role="status">
          Loading…
        </p>
      }
    >
      <BillingPageClient configuredPlans={configuredPlans} />
    </Suspense>
  )
}
