import type { Metadata } from 'next'
import { OwnerMobileNav } from '@/components/layout/OwnerMobileNav'
import { RoleGuardShell } from '@/components/layout/RoleGuardShell'

export const metadata: Metadata = {
  title: 'Owner',
  description: 'Property owner overview — units, tenancies, and approvals.',
}

export default function OwnerSectionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleGuardShell allowedRoles={['owner']}>
      <OwnerMobileNav />
      {children}
    </RoleGuardShell>
  )
}
