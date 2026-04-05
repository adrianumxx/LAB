'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/Form'
import {
  appUserFromSupabase,
  useAuthStore,
  type UserRole,
} from '@/lib/auth-store'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'

const ROLE_OPTIONS: {
  value: UserRole
  label: string
  description: string
}[] = [
  {
    value: 'manager',
    label: 'Property manager',
    description: 'Workspace, unità e casi operativi',
  },
  {
    value: 'owner',
    label: 'Proprietario',
    description: 'Panoramica immobili e approvazioni',
  },
  {
    value: 'tenant',
    label: 'Inquilino',
    description: 'Checklist, documenti e richieste',
  },
]

export function CompleteRoleSetupForm() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const [selected, setSelected] = useState<UserRole | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) {
      router.replace('/role-entry')
      return
    }
    if (!user.needsRoleSetup) {
      router.replace(`/${user.role}`)
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected || !user) return
    setError(null)
    setSaving(true)
    try {
      if (isSupabaseConfigured()) {
        const supabase = createSupabaseBrowserClient()
        const { data, error: upErr } = await supabase.auth.updateUser({
          data: { role: selected },
        })
        if (upErr) {
          setError(upErr.message)
          return
        }
        const authUser = data.user
        if (!authUser) {
          setError('Sessione non aggiornata. Riprova.')
          return
        }
        const { error: profileErr } = await supabase
          .from('profiles')
          .update({
            app_role: selected,
            updated_at: new Date().toISOString(),
          })
          .eq('id', authUser.id)
        if (profileErr) {
          setError(profileErr.message)
          return
        }
        setUser(appUserFromSupabase(authUser))
        router.push('/account/preferences')
        return
      }
      setUser({ ...user, role: selected, needsRoleSetup: false })
      router.push(`/${selected}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore imprevisto')
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <p className="text-sm text-landing-muted text-center" role="status">
        Caricamento sessione…
      </p>
    )
  }

  if (!user.needsRoleSetup) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="text-center text-landing-fg mb-6 space-y-2">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
          Completa il profilo
        </h1>
        <p className="text-landing-muted text-sm">
          Scegli il tuo ruolo nell&apos;app. Potrai adattare la dashboard subito dopo.
        </p>
      </div>

      <Card className="border-white/15 bg-surface/95 shadow-2xl backdrop-blur-xl dark:border-white/10">
        <CardHeader>
          <CardTitle>Il tuo ruolo</CardTitle>
          <CardDescription>
            Allineato ai metadata di accesso sicuro (JWT), come in produzione.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div className="space-y-2">
              {ROLE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer flex-col rounded-lg border p-4 transition-colors ${
                    selected === opt.value
                      ? 'border-[var(--accent)] bg-[var(--accent-subtle)]'
                      : 'border-white/15 hover:border-white/25'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="app-role"
                      value={opt.value}
                      checked={selected === opt.value}
                      onChange={() => setSelected(opt.value)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-landing-fg">{opt.label}</p>
                      <p className="text-sm text-landing-muted mt-0.5">
                        {opt.description}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {error && <FormError>{error}</FormError>}

            <Button
              type="submit"
              disabled={saving || !selected}
              className="w-full"
              size="md"
            >
              {saving ? 'Salvataggio…' : 'Continua'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-landing-muted">
        <Link
          href="/role-entry"
          className="text-[var(--cta-solid)] font-medium hover:underline underline-offset-4"
        >
          Torna alla scelta accesso
        </Link>
      </p>
    </div>
  )
}
