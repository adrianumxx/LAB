import Stripe from 'stripe'
import { getStripeSecretKey } from '@/lib/stripe/env'

let stripeSingleton: Stripe | null = null

export function getStripe(): Stripe {
  const key = getStripeSecretKey()
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(key, { typescript: true })
  }
  return stripeSingleton
}
