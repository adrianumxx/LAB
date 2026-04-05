import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ManagerUnitsPageClient } from './ManagerUnitsPageClient'

export const metadata: Metadata = {
  title: 'Manager — Units',
  description: 'All units in your workspace',
}

export default function ManagerUnitsIndexPage() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-secondary" role="status">
          Loading…
        </p>
      }
    >
      <ManagerUnitsPageClient />
    </Suspense>
  )
}
