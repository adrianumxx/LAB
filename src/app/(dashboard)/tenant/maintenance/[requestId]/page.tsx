import type { Metadata } from 'next'
import { TenantMaintenanceDetailClient } from './TenantMaintenanceDetailClient'

export const metadata: Metadata = {
  title: 'Request detail',
  description: 'Maintenance request status and details.',
}

export default function TenantMaintenanceDetailPage() {
  return <TenantMaintenanceDetailClient />
}
