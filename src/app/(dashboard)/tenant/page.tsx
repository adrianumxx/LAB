import type { Metadata } from 'next'
import { TenantDashboardView } from './TenantDashboardView'

export const metadata: Metadata = {
  title: 'Tenant home',
  description: 'Lease status, checklist, documents, and issues.',
}

export default function TenantDashboardPage() {
  return <TenantDashboardView />
}
