import { createBrowserClient } from '@supabase/ssr'
import { getSupabasePublicConfig } from './env'

export function createSupabaseBrowserClient() {
  const { url, anonKey } = getSupabasePublicConfig()
  return createBrowserClient(url, anonKey)
}
