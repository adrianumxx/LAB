export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env['NEXT_PUBLIC_SUPABASE_URL']?.trim() &&
      process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']?.trim(),
  )
}

export function getSupabasePublicConfig(): {
  url: string
  anonKey: string
} {
  const url = process.env['NEXT_PUBLIC_SUPABASE_URL']?.trim() ?? ''
  const anonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']?.trim() ?? ''
  if (!url || !anonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.local.',
    )
  }
  return { url, anonKey }
}
