import { describe, expect, it } from 'vitest'
import {
  getRequiredDashboardRole,
  parseRoleFromMetadata,
  parseValidDashboardRoleFromMetadata,
} from '@/lib/route-guard'

describe('parseRoleFromMetadata', () => {
  it('parses valid roles', () => {
    expect(parseRoleFromMetadata({ role: 'manager' })).toBe('manager')
    expect(parseRoleFromMetadata({ role: 'owner' })).toBe('owner')
    expect(parseRoleFromMetadata({ role: 'tenant' })).toBe('tenant')
  })

  it('defaults to tenant when missing or invalid', () => {
    expect(parseRoleFromMetadata(undefined)).toBe('tenant')
    expect(parseRoleFromMetadata({})).toBe('tenant')
    expect(parseRoleFromMetadata({ role: 'admin' })).toBe('tenant')
  })
})

describe('parseValidDashboardRoleFromMetadata', () => {
  it('parses valid roles', () => {
    expect(parseValidDashboardRoleFromMetadata({ role: 'manager' })).toBe(
      'manager',
    )
    expect(parseValidDashboardRoleFromMetadata({ role: 'owner' })).toBe('owner')
    expect(parseValidDashboardRoleFromMetadata({ role: 'tenant' })).toBe(
      'tenant',
    )
  })

  it('returns null when missing or invalid', () => {
    expect(parseValidDashboardRoleFromMetadata(undefined)).toBeNull()
    expect(parseValidDashboardRoleFromMetadata({})).toBeNull()
    expect(parseValidDashboardRoleFromMetadata({ role: 'admin' })).toBeNull()
  })
})

describe('getRequiredDashboardRole', () => {
  it('returns null for non-dashboard paths', () => {
    expect(getRequiredDashboardRole('/')).toBeNull()
    expect(getRequiredDashboardRole('/login')).toBeNull()
    expect(getRequiredDashboardRole('/privacy')).toBeNull()
    expect(getRequiredDashboardRole('/account/setup')).toBeNull()
    expect(getRequiredDashboardRole('/account/preferences')).toBeNull()
  })

  it('maps paths to roles', () => {
    expect(getRequiredDashboardRole('/manager')).toBe('manager')
    expect(getRequiredDashboardRole('/manager/units/x')).toBe('manager')
    expect(getRequiredDashboardRole('/owner')).toBe('owner')
    expect(getRequiredDashboardRole('/tenant')).toBe('tenant')
    expect(getRequiredDashboardRole('/onboarding/manager')).toBe('manager')
    expect(getRequiredDashboardRole('/onboarding/owner')).toBe('owner')
    expect(getRequiredDashboardRole('/onboarding/tenant')).toBe('tenant')
  })
})
