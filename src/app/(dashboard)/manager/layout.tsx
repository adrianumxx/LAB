import type { Metadata } from 'next'
import { ManagerMobileNav } from '@/components/layout/ManagerMobileNav'
import { RoleGuardShell } from '@/components/layout/RoleGuardShell'

export const metadata: Metadata = {
  title: 'Manager',
  description: 'Manager workspace — units, cases, and operations.',
}

export default function ManagerSectionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleGuardShell allowedRoles={['manager']}>
      <ManagerMobileNav />
      {children}
    </RoleGuardShell>
  )
}
