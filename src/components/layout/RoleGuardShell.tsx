'use client'

import type { ReactNode } from 'react'
import { RoleGuard } from '@/components/RoleGuard'
import type { UserRole } from '@/lib/auth-store'

interface RoleGuardShellProps {
  allowedRoles: readonly UserRole[]
  children: ReactNode
}

export function RoleGuardShell({ allowedRoles, children }: RoleGuardShellProps) {
  return <RoleGuard allowedRoles={[...allowedRoles]}>{children}</RoleGuard>
}
