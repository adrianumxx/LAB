import { describe, expect, it } from 'vitest'
import { isUuid } from '@/lib/validation/uuid'

describe('isUuid', () => {
  it('accepts lowercase v4-style uuid', () => {
    expect(isUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
  })

  it('accepts uppercase', () => {
    expect(isUuid('550E8400-E29B-41D4-A716-446655440000')).toBe(true)
  })

  it('trims whitespace', () => {
    expect(isUuid('  550e8400-e29b-41d4-a716-446655440000  ')).toBe(true)
  })

  it('rejects empty and invalid', () => {
    expect(isUuid('')).toBe(false)
    expect(isUuid(null)).toBe(false)
    expect(isUuid(undefined)).toBe(false)
    expect(isUuid('not-a-uuid')).toBe(false)
    expect(isUuid('550e8400-e29b-41d4-a716')).toBe(false)
  })
})
