/**
 * Subscription access rules (mirror of `profiles.stripe_subscription_status`).
 * Webhook keeps this column in sync with Stripe.
 */
export function subscriptionStatusGrantsAccess(
  status: string | null | undefined,
): boolean {
  if (!status) return false
  const s = status.trim().toLowerCase()
  return s === 'active' || s === 'trialing'
}

export function billingEnforcementEnabled(): boolean {
  const v = process.env['STRIPE_ENFORCE_SUBSCRIPTION']?.trim().toLowerCase()
  return v === '1' || v === 'true' || v === 'yes'
}
