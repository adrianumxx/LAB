import { describe, expect, it, afterEach } from 'vitest'
import { userFacingNetworkError } from '@/lib/network-error-message'

describe('userFacingNetworkError', () => {
  const onLineDescriptor = Object.getOwnPropertyDescriptor(navigator, 'onLine')

  afterEach(() => {
    if (onLineDescriptor) {
      Object.defineProperty(navigator, 'onLine', onLineDescriptor)
    } else {
      delete (navigator as { onLine?: boolean }).onLine
    }
  })

  it('returns offline message when navigator.onLine is false', () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false })
    expect(userFacingNetworkError(new Error('anything'))).toMatch(/offline/i)
  })

  it('maps fetch-style messages to connection copy', () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true })
    expect(userFacingNetworkError(new Error('Failed to fetch'))).toMatch(/connection problem/i)
    expect(userFacingNetworkError(new Error('NetworkError when attempting to fetch'))).toMatch(
      /connection problem/i,
    )
  })

  it('returns Error.message for other errors', () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true })
    expect(userFacingNetworkError(new Error('Row level security'))).toBe('Row level security')
  })

  it('returns generic string for non-Error', () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true })
    expect(userFacingNetworkError(undefined)).toMatch(/something went wrong/i)
  })
})
