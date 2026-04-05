import { afterEach, describe, expect, it } from 'vitest'
import { billingEnforcementEnabled, subscriptionStatusGrantsAccess } from '@/lib/billing'

describe('subscriptionStatusGrantsAccess', () => {
  it('returns false for empty or unknown', () => {
    expect(subscriptionStatusGrantsAccess(null)).toBe(false)
    expect(subscriptionStatusGrantsAccess(undefined)).toBe(false)
    expect(subscriptionStatusGrantsAccess('')).toBe(false)
    expect(subscriptionStatusGrantsAccess('past_due')).toBe(false)
    expect(subscriptionStatusGrantsAccess('canceled')).toBe(false)
  })

  it('returns true for active and trialing (case-insensitive)', () => {
    expect(subscriptionStatusGrantsAccess('active')).toBe(true)
    expect(subscriptionStatusGrantsAccess('trialing')).toBe(true)
    expect(subscriptionStatusGrantsAccess('  ACTIVE  ')).toBe(true)
    expect(subscriptionStatusGrantsAccess('Trialing')).toBe(true)
  })
})

describe('billingEnforcementEnabled', () => {
  const key = 'STRIPE_ENFORCE_SUBSCRIPTION'
  const prev = process.env[key]

  afterEach(() => {
    if (prev === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = prev
    }
  })

  it('is false when unset or not a truthy token', () => {
    delete process.env[key]
    expect(billingEnforcementEnabled()).toBe(false)
    process.env[key] = ''
    expect(billingEnforcementEnabled()).toBe(false)
    process.env[key] = '0'
    expect(billingEnforcementEnabled()).toBe(false)
    process.env[key] = 'false'
    expect(billingEnforcementEnabled()).toBe(false)
  })

  it('is true for 1, true, yes (case-insensitive)', () => {
    process.env[key] = '1'
    expect(billingEnforcementEnabled()).toBe(true)
    process.env[key] = 'TRUE'
    expect(billingEnforcementEnabled()).toBe(true)
    process.env[key] = 'Yes'
    expect(billingEnforcementEnabled()).toBe(true)
  })
})
