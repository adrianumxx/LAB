'use client'

import { Button } from '@/components/ui/Button'
import { userFacingNetworkError } from '@/lib/network-error-message'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const message =
    error.message && error.message.length > 0
      ? userFacingNetworkError(error)
      : 'An unexpected error occurred in the dashboard.'

  return (
    <div
      className="max-w-lg mx-auto py-16 px-4 text-center space-y-4"
      role="alert"
    >
      <h2 className="text-2xl font-bold text-primary">Something went wrong</h2>
      <p className="text-sm text-secondary break-words">{message}</p>
      <Button type="button" variant="primary" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  )
}
