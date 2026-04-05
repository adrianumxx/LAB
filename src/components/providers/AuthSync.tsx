'use client'

import { useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { appUserFromSupabase, useAuthStore } from '@/lib/auth-store'

/**
 * Keeps Zustand auth in sync with Supabase session (cookies + refresh via middleware).
 */
export function AuthSync() {
  const setUser = useAuthStore((s) => s.setUser)
  const logout = useAuthStore((s) => s.logout)

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return
    }

    let supabase: ReturnType<typeof createSupabaseBrowserClient>
    try {
      supabase = createSupabaseBrowserClient()
    } catch {
      return
    }

    const applyUser = (
      user: import('@supabase/supabase-js').User | null,
    ) => {
      if (!user) {
        logout()
        return
      }
      setUser(appUserFromSupabase(user))
    }

    void supabase.auth
      .getUser()
      .then(({ data }) => {
        applyUser(data.user)
      })
      .catch(() => {
        logout()
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applyUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [setUser, logout])

  return null
}
