'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField, FormLabel, FormError } from '@/components/ui/Form'
import {
  appUserFromSupabase,
  parseUserRole,
  useAuthStore,
} from '@/lib/auth-store'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import Link from 'next/link'

const roleLabels = {
  manager: 'Property Manager',
  owner: 'Property Owner',
  tenant: 'Tenant',
} as const

export default function LoginForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const intendedRole = parseUserRole(searchParams.get('role'))

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setUser = useAuthStore((state) => state.setUser)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)

    try {
      if (isSupabaseConfigured()) {
        const supabase = createSupabaseBrowserClient()
        const { data, error: authError } =
          await supabase.auth.signInWithPassword({ email, password })
        if (authError) {
          setError(authError.message)
          return
        }
        if (!data.user) {
          setError('Sign in failed — no user returned')
          return
        }
        const appUser = appUserFromSupabase(data.user)
        setUser(appUser)
        if (appUser.needsRoleSetup) {
          router.push('/account/setup')
        } else {
          router.push(`/${appUser.role}`)
        }
        return
      }

      await new Promise((resolve) => setTimeout(resolve, 500))
      setUser({
        id: Math.random().toString(36).substring(7),
        email,
        role: intendedRole,
        needsRoleSetup: false,
      })
      router.push(`/${intendedRole}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center text-landing-fg mb-8 space-y-2">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
          Bentornato
        </h1>
        <p className="text-landing-muted">Accesso come {roleLabels[intendedRole]}</p>
      </div>

      <Card className="border-white/15 bg-surface/95 shadow-2xl backdrop-blur-xl dark:border-white/10">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField>
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </FormField>

            <FormField>
              <FormLabel htmlFor="password">Password</FormLabel>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </FormField>

            {error && <FormError>{error}</FormError>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="md"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              className="text-primary hover:underline"
              disabled={loading}
            >
              Forgot password?
            </button>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-landing-muted">
        <p>
          Non hai un account?{' '}
          <Link
            href="/role-entry"
            className="text-[var(--cta-solid)] font-medium hover:underline underline-offset-4"
          >
            Registrati
          </Link>
        </p>
      </div>
    </div>
  )
}
