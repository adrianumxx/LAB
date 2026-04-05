import { describe, expect, it } from 'vitest'
import { hashRecipientEmail } from '@/lib/notifications/recipient-hash'

describe('hashRecipientEmail', () => {
  it('normalizes case and spacing', () => {
    const a = hashRecipientEmail('Test@Example.com')
    const b = hashRecipientEmail('  test@example.com  ')
    expect(a).toBe(b)
    expect(a).toMatch(/^[a-f0-9]{64}$/)
  })

  it('differs for different addresses', () => {
    expect(hashRecipientEmail('a@b.co')).not.toBe(hashRecipientEmail('b@b.co'))
  })
})
