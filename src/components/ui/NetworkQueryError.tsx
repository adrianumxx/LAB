'use client'

import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/Form'
import { userFacingNetworkError } from '@/lib/network-error-message'
import { cn } from '@/lib/utils'

type NetworkQueryErrorProps = {
  error: unknown
  onRetry: () => void
  className?: string
  retryLabel?: string
}

export function NetworkQueryError({
  error,
  onRetry,
  className,
  retryLabel = 'Retry',
}: NetworkQueryErrorProps) {
  return (
    <div className={cn('space-y-2', className)} role="alert">
      <FormError>{userFacingNetworkError(error)}</FormError>
      <Button type="button" variant="secondary" size="sm" onClick={() => onRetry()}>
        {retryLabel}
      </Button>
    </div>
  )
}
