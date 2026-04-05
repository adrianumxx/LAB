import { describe, expect, it } from 'vitest'
import {
  getManagerUnitCap,
  managerCanAddUnit,
  managerIsFreeTier,
  resolveEffectiveBillingPlan,
} from '@/lib/billing-plan-policy'

describe('managerIsFreeTier', () => {
  it('is true without active subscription', () => {
    expect(managerIsFreeTier(null)).toBe(true)
    expect(
      managerIsFreeTier({ billing_plan: 'start', stripe_subscription_status: 'canceled' }),
    ).toBe(true)
    expect(
      managerIsFreeTier({ billing_plan: null, stripe_subscription_status: null }),
    ).toBe(true)
  })

  it('is false for active or trialing', () => {
    expect(
      managerIsFreeTier({ billing_plan: 'start', stripe_subscription_status: 'active' }),
    ).toBe(false)
    expect(
      managerIsFreeTier({ billing_plan: null, stripe_subscription_status: 'trialing' }),
    ).toBe(false)
  })
})

describe('resolveEffectiveBillingPlan & caps', () => {
  it('free tier → cap 3', () => {
    expect(resolveEffectiveBillingPlan({ billing_plan: null, stripe_subscription_status: null })).toBe(
      'free',
    )
    expect(getManagerUnitCap({ billing_plan: null, stripe_subscription_status: null })).toBe(3)
  })

  it('paid slugs map to caps', () => {
    expect(
      getManagerUnitCap({ billing_plan: 'start', stripe_subscription_status: 'active' }),
    ).toBe(20)
    expect(
      getManagerUnitCap({ billing_plan: 'solo', stripe_subscription_status: 'active' }),
    ).toBe(3)
    expect(
      getManagerUnitCap({ billing_plan: 'enterprise', stripe_subscription_status: 'active' }),
    ).toBe(999_999)
  })

  it('active unknown slug → pro cap', () => {
    expect(
      getManagerUnitCap({ billing_plan: 'weird', stripe_subscription_status: 'active' }),
    ).toBe(100)
  })
})

describe('managerCanAddUnit', () => {
  it('blocks at cap for START', () => {
    const profile = { billing_plan: 'start', stripe_subscription_status: 'active' }
    expect(managerCanAddUnit(19, profile)).toBe(true)
    expect(managerCanAddUnit(20, profile)).toBe(false)
  })
})
