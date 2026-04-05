import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ManagerCasesPageClient } from './ManagerCasesPageClient'

export const metadata: Metadata = {
  title: 'Manager — Cases',
  description: 'All lifecycle cases in your workspace',
}

export default function ManagerCasesIndexPage() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-secondary" role="status">
          Loading…
        </p>
      }
    >
      <ManagerCasesPageClient />
    </Suspense>
  )
}
