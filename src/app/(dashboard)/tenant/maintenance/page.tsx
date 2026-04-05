import type { Metadata } from 'next'
import { TenantMaintenancePageClient } from './TenantMaintenancePageClient'

export const metadata: Metadata = {
  title: 'Maintenance',
  description: 'Submit and track maintenance requests for your unit.',
}

export default function TenantMaintenancePage() {
  return <TenantMaintenancePageClient />
}
