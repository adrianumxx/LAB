import type { Metadata } from 'next'
import { OwnerUnitsPageClient } from './OwnerUnitsPageClient'

export const metadata: Metadata = {
  title: 'Owner — Units',
  description: 'Properties you co-own with your manager',
}

export default function OwnerUnitsIndexPage() {
  return <OwnerUnitsPageClient />
}
