import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Solo server (Route Handler / Server Action). Mai importare in componenti client.
 * Richiede SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
export function createSupabaseAdminClient(): SupabaseClient {
  const url = process.env['NEXT_PUBLIC_SUPABASE_URL']?.trim()
  const key = process.env['SUPABASE_SERVICE_ROLE_KEY']?.trim()
  if (!url || !key) {
    throw new Error(
      'Server misconfigured: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required for invites',
    )
  }
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/** Service role available (webhook, invites, admin writes). */
export function isServiceRoleConfigured(): boolean {
  return Boolean(
    process.env['NEXT_PUBLIC_SUPABASE_URL']?.trim() &&
      process.env['SUPABASE_SERVICE_ROLE_KEY']?.trim(),
  )
}

export function isInviteServerConfigured(): boolean {
  return isServiceRoleConfigured()
}
