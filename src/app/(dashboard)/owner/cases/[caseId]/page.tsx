import type { Metadata } from 'next'
import { OwnerCaseDetailPageClient } from './OwnerCaseDetailPageClient'

export const metadata: Metadata = {
  title: 'Owner — Case',
  description: 'Read-only case view with owner approvals',
}

export default function OwnerCaseDetailPage() {
  return <OwnerCaseDetailPageClient />
}
