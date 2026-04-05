import type { Metadata } from 'next'
import { RoleGuardShell } from '@/components/layout/RoleGuardShell'
import { TenantMobileNav } from '@/components/layout/TenantMobileNav'

export const metadata: Metadata = {
  title: 'Tenant',
  description: 'Tenant home — lease status, tasks, and documents.',
}

export default function TenantSectionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleGuardShell allowedRoles={['tenant']}>
      <TenantMobileNav />
      {children}
    </RoleGuardShell>
  )
}
