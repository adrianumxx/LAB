'use client'

import { LandingPage } from '@/components/landing/LandingPage'
import { useAuthStore } from '@/lib/auth-store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const roleRoutes = {
  manager: '/manager',
  owner: '/owner',
  tenant: '/tenant',
} as const

export function HomeClient() {
  const user = useAuthStore((s) => s.user)
  const router = useRouter()

  useEffect(() => {
    if (user?.needsRoleSetup) {
      router.replace('/account/setup')
      return
    }
    if (user) {
      router.replace(roleRoutes[user.role])
    }
  }, [user, router])

  if (user?.needsRoleSetup) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center px-4">
        <p className="text-secondary text-sm">Reindirizzamento al completamento profilo…</p>
      </div>
    )
  }

  if (user) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center px-4">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-primary">Accesso in corso…</p>
          <p className="text-sm text-secondary">Reindirizzamento alla tua dashboard</p>
        </div>
      </div>
    )
  }

  return <LandingPage />
}
