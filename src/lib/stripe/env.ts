export type StripeCheckoutPlanId = 'solo' | 'start' | 'core' | 'pro'

export function getStripeSecretKey(): string | undefined {
  return process.env['STRIPE_SECRET_KEY']?.trim()
}

export function getStripeWebhookSecret(): string | undefined {
  return process.env['STRIPE_WEBHOOK_SECRET']?.trim()
}

/**
 * Price id ricorrente per piano (Dashboard Stripe → Product → Price).
 * `STRIPE_PRICE_ID` legacy: usato solo come fallback per il piano PRO se `STRIPE_PRICE_ID_PRO` è assente.
 */
export function getStripePriceIdForPlan(plan: StripeCheckoutPlanId): string | undefined {
  switch (plan) {
    case 'solo':
      return process.env['STRIPE_PRICE_ID_SOLO']?.trim()
    case 'start':
      return process.env['STRIPE_PRICE_ID_START']?.trim()
    case 'core':
      return process.env['STRIPE_PRICE_ID_CORE']?.trim()
    case 'pro':
      return (
        process.env['STRIPE_PRICE_ID_PRO']?.trim() ?? process.env['STRIPE_PRICE_ID']?.trim()
      )
    default:
      return undefined
  }
}

/**
 * @deprecated Preferisci `getStripePriceIdForPlan('pro')` o le variabili per piano (Sprint 12).
 */
export function getStripePriceId(): string | undefined {
  return getStripePriceIdForPlan('pro')
}

export function getStripePublishableKey(): string | undefined {
  return process.env['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY']?.trim()
}

/** Checkout: secret Stripe + almeno un prezzo ricorrente configurato per uno dei piani. */
export function isStripeCheckoutConfigured(): boolean {
  if (!getStripeSecretKey()) return false
  const plans: StripeCheckoutPlanId[] = ['solo', 'start', 'core', 'pro']
  return plans.some((p) => Boolean(getStripePriceIdForPlan(p)))
}

/** Customer portal: secret only (customer id from profile) */
export function isStripePortalConfigured(): boolean {
  return Boolean(getStripeSecretKey())
}

export function isStripeWebhookConfigured(): boolean {
  return Boolean(getStripeSecretKey() && getStripeWebhookSecret())
}
