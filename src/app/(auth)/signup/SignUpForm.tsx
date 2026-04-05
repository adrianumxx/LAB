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

export default function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = parseUserRole(searchParams.get('role'))

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const setUser = useAuthStore((state) => state.setUser)

  const roleLabels = {
    manager: 'Property Manager',
    owner: 'Property Owner',
    tenant: 'Tenant',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!email || !password || !name) {
      setError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    setNotice(null)

    const onboardingRoutes = {
      manager: '/onboarding/manager',
      owner: '/onboarding/owner',
      tenant: '/onboarding/tenant',
    }

    try {
      if (isSupabaseConfigured()) {
        const supabase = createSupabaseBrowserClient()
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role,
              full_name: name,
            },
          },
        })
        if (authError) {
          setError(authError.message)
          return
        }
        if (data.session && data.user) {
          const appUser = appUserFromSupabase(data.user)
          setUser(appUser)
          if (appUser.needsRoleSetup) {
            router.push('/account/setup')
          } else {
            router.push(onboardingRoutes[role])
          }
          return
        }
        setNotice(
          'Check your email to confirm your account, then sign in.',
        )
        return
      }

      await new Promise((resolve) => setTimeout(resolve, 500))
      setUser({
        id: Math.random().toString(36).substring(7),
        email,
        role,
        needsRoleSetup: false,
      })
      router.push(onboardingRoutes[role])
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
          Crea account
        </h1>
        <p className="text-landing-muted">{roleLabels[role]}</p>
      </div>

      <Card className="border-white/15 bg-surface/95 shadow-2xl backdrop-blur-xl dark:border-white/10">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Create your account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField>
              <FormLabel htmlFor="name">Full Name</FormLabel>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </FormField>

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

            <FormField>
              <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </FormField>

            {error && <FormError>{error}</FormError>}
            {notice && (
              <p className="text-sm text-secondary" role="status">
                {notice}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="md"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-landing-muted">
        <p>
          Hai già un account?{' '}
          <Link
            href="/login"
            className="text-[var(--cta-solid)] font-medium hover:underline underline-offset-4"
          >
            Accedi
          </Link>
        </p>
      </div>
    </div>
  )
}
