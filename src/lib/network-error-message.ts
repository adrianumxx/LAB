/**
 * Maps query/fetch errors to short, actionable copy (offline + generic network).
 */
export function userFacingNetworkError(error: unknown): string {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return 'You appear to be offline. Check your connection and try again.'
  }

  if (error instanceof Error) {
    const m = error.message
    if (/failed to fetch|networkerror|network request failed|load failed|fetch/i.test(m)) {
      return 'Connection problem. Check your network and try again.'
    }
    return m
  }

  return 'Something went wrong. Please try again.'
}
