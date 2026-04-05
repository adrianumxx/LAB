import { getStripePriceIdForPlan } from '@/lib/stripe/env'

/** Piani acquistabili via Checkout (allineati a `/pricing` e Stripe Price env). */
export const CHECKOUT_BILLING_PLAN_SLUGS = ['solo', 'start', 'core', 'pro'] as const

export type BillingPlanSlug = (typeof CHECKOUT_BILLING_PLAN_SLUGS)[number]

export function isBillingPlanSlug(value: string): value is BillingPlanSlug {
  return (CHECKOUT_BILLING_PLAN_SLUGS as readonly string[]).includes(value)
}

const PLAN_LABELS: Record<BillingPlanSlug, string> = {
  solo: 'SOLO',
  start: 'START',
  core: 'CORE',
  pro: 'PRO',
}

export function billingPlanLabel(slug: BillingPlanSlug): string {
  return PLAN_LABELS[slug]
}

export function getConfiguredCheckoutPlanSlugs(): BillingPlanSlug[] {
  return CHECKOUT_BILLING_PLAN_SLUGS.filter((slug) => Boolean(getStripePriceIdForPlan(slug)))
}

/**
 * Risolve lo slug profilo da un Price Stripe, confrontando gli id configurati in env.
 * Ritorna null se il price non è mappato (subscription esterna o env incompleto).
 */
export function billingPlanSlugFromStripePriceId(priceId: string | null | undefined): BillingPlanSlug | null {
  if (!priceId?.trim()) return null
  for (const slug of CHECKOUT_BILLING_PLAN_SLUGS) {
    const configured = getStripePriceIdForPlan(slug)
    if (configured && configured === priceId) return slug
  }
  return null
}
