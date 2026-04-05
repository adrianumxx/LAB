import { create } from 'zustand'
import type { User as SupabaseAuthUser } from '@supabase/supabase-js'

export type UserRole = 'manager' | 'owner' | 'tenant'

export type AppUser = {
  id: string
  email: string
  /** Ruolo effettivo da usare dopo setup; se `needsRoleSetup`, è solo placeholder interno */
  role: UserRole
  /** true se `user_metadata.role` non è uno di manager|owner|tenant — obbligo /account/setup */
  needsRoleSetup: boolean
}

const USER_ROLES: readonly UserRole[] = ['manager', 'owner', 'tenant']

export function parseUserRole(
  value: string | null,
  fallback: UserRole = 'manager',
): UserRole {
  if (value && (USER_ROLES as readonly string[]).includes(value)) {
    return value as UserRole
  }
  return fallback
}

/** Legge solo i metadata JWT — fonte di verità allineata al middleware. */
export function parseUserRoleFromMetadata(
  meta: Record<string, unknown> | undefined,
): UserRole | null {
  const r = meta?.['role']
  if (typeof r === 'string' && (USER_ROLES as readonly string[]).includes(r)) {
    return r as UserRole
  }
  return null
}

/**
 * Mappa utente Supabase → store. Se manca `role` nei metadata, `needsRoleSetup: true`
 * e `role` è `tenant` solo come placeholder (non usare per permessi finché setup non fatto).
 */
export function appUserFromSupabase(user: SupabaseAuthUser): AppUser {
  const meta = user.user_metadata as Record<string, unknown> | undefined
  const resolved = parseUserRoleFromMetadata(meta)
  const needsRoleSetup = resolved === null
  return {
    id: user.id,
    email: user.email ?? '',
    role: resolved ?? 'tenant',
    needsRoleSetup,
  }
}

interface AuthState {
  user: AppUser | null
  isLoading: boolean
  error: string | null
  setUser: (user: AppUser | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  setUser: (user) => set({ user, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  logout: () => set({ user: null, error: null }),
}))
