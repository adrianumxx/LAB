'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { managerDashboardQueryKey } from '@/hooks/useManagerDashboardData'
import { useAuthStore } from '@/lib/auth-store'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'

export function DashboardSignOut() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const logout = useAuthStore((s) => s.logout)

  async function handleSignOut() {
    if (isSupabaseConfigured()) {
      const supabase = createSupabaseBrowserClient()
      await supabase.auth.signOut()
    }
    queryClient.removeQueries({ queryKey: [...managerDashboardQueryKey] })
    logout()
    router.push('/role-entry')
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => void handleSignOut()}
    >
      Sign out
    </Button>
  )
}
