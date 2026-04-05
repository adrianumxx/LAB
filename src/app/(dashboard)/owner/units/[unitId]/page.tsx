import type { Metadata } from 'next'
import { OwnerUnitDetailPageClient } from './OwnerUnitDetailPageClient'

export const metadata: Metadata = {
  title: 'Owner — Unit',
  description: 'Read-only unit overview for property owners',
}

export default function OwnerUnitDetailPage() {
  return <OwnerUnitDetailPageClient />
}
