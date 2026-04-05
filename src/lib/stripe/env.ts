export function getStripeSecretKey(): string | undefined {
  return process.env['STRIPE_SECRET_KEY']?.trim()
}

export function getStripeWebhookSecret(): string | undefined {
  return process.env['STRIPE_WEBHOOK_SECRET']?.trim()
}

export function getStripePriceId(): string | undefined {
  return process.env['STRIPE_PRICE_ID']?.trim()
}

export function getStripePublishableKey(): string | undefined {
  return process.env['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY']?.trim()
}

/** Checkout: needs secret + recurring price id */
export function isStripeCheckoutConfigured(): boolean {
  return Boolean(getStripeSecretKey() && getStripePriceId())
}

/** Customer portal: secret only (customer id from profile) */
export function isStripePortalConfigured(): boolean {
  return Boolean(getStripeSecretKey())
}

export function isStripeWebhookConfigured(): boolean {
  return Boolean(getStripeSecretKey() && getStripeWebhookSecret())
}
