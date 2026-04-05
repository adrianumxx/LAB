/** Ruolo applicativo (da `user_metadata.role` su Supabase Auth). */
export type DashboardRole = 'manager' | 'owner' | 'tenant'

/** Solo valori JWT validi; `null` → utente deve completare `/account/setup`. */
export function parseValidDashboardRoleFromMetadata(
  meta: { [key: string]: unknown } | undefined,
): DashboardRole | null {
  const r = meta?.['role']
  if (r === 'manager' || r === 'owner' || r === 'tenant') {
    return r
  }
  return null
}

export function parseRoleFromMetadata(
  meta: { [key: string]: unknown } | undefined,
): DashboardRole {
  return parseValidDashboardRoleFromMetadata(meta) ?? 'tenant'
}

/**
 * Se la route richiede un ruolo loggato, restituisce quel ruolo; altrimenti `null` (pubblica o non gestita qui).
 */
export function getRequiredDashboardRole(pathname: string): DashboardRole | null {
  if (pathname.startsWith('/account')) return null
  if (pathname.startsWith('/onboarding/manager')) return 'manager'
  if (pathname.startsWith('/onboarding/owner')) return 'owner'
  if (pathname.startsWith('/onboarding/tenant')) return 'tenant'
  if (pathname.startsWith('/manager')) return 'manager'
  if (pathname.startsWith('/owner')) return 'owner'
  if (pathname.startsWith('/tenant')) return 'tenant'
  return null
}

export function isApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api')
}
