import type { Metadata } from 'next'
import { OwnerCasesPageClient } from './OwnerCasesPageClient'

export const metadata: Metadata = {
  title: 'Owner — Cases',
  description: 'Lifecycle cases across your properties',
}

export default function OwnerCasesIndexPage() {
  return <OwnerCasesPageClient />
}
