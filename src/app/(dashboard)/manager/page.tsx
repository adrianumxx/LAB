import type { Metadata } from 'next'
import { ManagerDashboardView } from './ManagerDashboardView'

export const metadata: Metadata = {
  title: 'Manager — Action Center',
  description: 'Operational dashboard for property managers',
}

export default function ManagerDashboardPage() {
  return <ManagerDashboardView />
}
