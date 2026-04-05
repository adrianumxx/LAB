'use client'

import { useAuthStore, type UserRole } from '@/lib/auth-store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface RoleGuardProps {
  allowedRoles: UserRole[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleGuard({
  allowedRoles,
  children,
  fallback = null,
}: RoleGuardProps) {
  const user = useAuthStore((state) => state.user)
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/role-entry')
      return
    }

    if (user.needsRoleSetup) {
      router.replace('/account/setup')
      return
    }

    if (!allowedRoles.includes(user.role)) {
      router.push('/')
    }
  }, [user, allowedRoles, router])

  if (!user) {
    return fallback
  }

  if (user.needsRoleSetup) {
    return fallback
  }

  if (!allowedRoles.includes(user.role)) {
    return fallback
  }

  return <>{children}</>
}
