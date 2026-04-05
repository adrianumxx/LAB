import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabasePublicConfig } from './env'

/**
 * Server Components, Server Actions, Route Handlers.
 * Cookie writes can fail in RSC; middleware keeps the session fresh.
 */
export function createSupabaseServerClient() {
  const { url, anonKey } = getSupabasePublicConfig()
  const cookieStore = cookies()

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        } catch {
          /* set from Server Component — refreshed via middleware */
        }
      },
    },
  })
}
