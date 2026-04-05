import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  billingPlanSlugFromStripePriceId,
  isBillingPlanSlug,
} from '@/lib/stripe/checkout-plans'

const ENV_KEYS = [
  'STRIPE_PRICE_ID_SOLO',
  'STRIPE_PRICE_ID_START',
  'STRIPE_PRICE_ID_CORE',
  'STRIPE_PRICE_ID_PRO',
  'STRIPE_PRICE_ID',
] as const

describe('isBillingPlanSlug', () => {
  it('accepts checkout slugs only', () => {
    expect(isBillingPlanSlug('solo')).toBe(true)
    expect(isBillingPlanSlug('start')).toBe(true)
    expect(isBillingPlanSlug('core')).toBe(true)
    expect(isBillingPlanSlug('pro')).toBe(true)
    expect(isBillingPlanSlug('free')).toBe(false)
    expect(isBillingPlanSlug('enterprise')).toBe(false)
    expect(isBillingPlanSlug('PRO')).toBe(false)
  })
})

describe('billingPlanSlugFromStripePriceId', () => {
  let prev: Record<string, string | undefined> = {}

  beforeEach(() => {
    prev = {}
    for (const k of ENV_KEYS) {
      prev[k] = process.env[k]
      delete process.env[k]
    }
  })

  afterEach(() => {
    for (const k of ENV_KEYS) {
      const v = prev[k]
      if (v === undefined) {
        delete process.env[k]
      } else {
        process.env[k] = v
      }
    }
  })

  it('maps each configured price id to its slug', () => {
    process.env['STRIPE_PRICE_ID_SOLO'] = 'price_solo_x'
    process.env['STRIPE_PRICE_ID_START'] = 'price_start_x'
    process.env['STRIPE_PRICE_ID_CORE'] = 'price_core_x'
    process.env['STRIPE_PRICE_ID_PRO'] = 'price_pro_x'
    expect(billingPlanSlugFromStripePriceId('price_solo_x')).toBe('solo')
    expect(billingPlanSlugFromStripePriceId('price_start_x')).toBe('start')
    expect(billingPlanSlugFromStripePriceId('price_core_x')).toBe('core')
    expect(billingPlanSlugFromStripePriceId('price_pro_x')).toBe('pro')
    expect(billingPlanSlugFromStripePriceId('price_unknown')).toBe(null)
  })

  it('uses legacy STRIPE_PRICE_ID for pro when STRIPE_PRICE_ID_PRO is unset', () => {
    process.env['STRIPE_PRICE_ID'] = 'price_legacy'
    expect(billingPlanSlugFromStripePriceId('price_legacy')).toBe('pro')
  })

  it('prefers STRIPE_PRICE_ID_PRO over legacy', () => {
    process.env['STRIPE_PRICE_ID_PRO'] = 'price_pro_new'
    process.env['STRIPE_PRICE_ID'] = 'price_legacy'
    expect(billingPlanSlugFromStripePriceId('price_pro_new')).toBe('pro')
    expect(billingPlanSlugFromStripePriceId('price_legacy')).toBe(null)
  })
})
