import type { Metadata } from 'next'
import { OwnerDashboardView } from './OwnerDashboardView'

export const metadata: Metadata = {
  title: 'Owner overview',
  description: 'Units, tenancies, approvals, and activity.',
}

export default function OwnerDashboardPage() {
  return <OwnerDashboardView />
}
