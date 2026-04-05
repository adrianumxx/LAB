import type { Metadata } from 'next'
import { ManagerMaintenancePageClient } from './ManagerMaintenancePageClient'

export const metadata: Metadata = {
  title: 'Maintenance',
  description: 'Tenant maintenance requests across your units.',
}

export default function ManagerMaintenancePage() {
  return <ManagerMaintenancePageClient />
}
