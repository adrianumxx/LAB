'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button, buttonVariants } from '@/components/ui/Button'
import { FormError } from '@/components/ui/Form'
import { useDashboardPreferences } from '@/hooks/useDashboardPreferences'
import { useAuthStore } from '@/lib/auth-store'
import type { DashboardPreferences, TenantLifecyclePhase } from '@/lib/dashboard-preferences'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { cn } from '@/lib/utils'

function phaseLabel(p: TenantLifecyclePhase): string {
  if (p === 'move_in') return 'Sto entrando (move-in)'
  if (p === 'move_out') return 'Sto uscendo (move-out)'
  return 'In locazione (attivo)'
}

export function DashboardPreferencesForm() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const {
    preferences,
    updatePreferences,
    isSaving,
    isLoading,
  } = useDashboardPreferences(user?.id ?? null)

  const [draft, setDraft] = useState<DashboardPreferences | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.replace('/role-entry')
    }
  }, [user, router])

  useEffect(() => {
    if (preferences && draft === null) {
      setDraft({ ...preferences })
    }
  }, [preferences, draft])

  useEffect(() => {
    if (user?.needsRoleSetup) {
      router.replace('/account/setup')
    }
  }, [user, router])

  if (!user || !draft) {
    return (
      <p className="text-sm text-landing-muted text-center" role="status">
        {isLoading ? 'Caricamento preferenze…' : 'Caricamento…'}
      </p>
    )
  }

  const role = user.role
  const canPersist = isSupabaseConfigured() && Boolean(user.id)

  const handleSave = async () => {
    setError(null)
    const payload: DashboardPreferences = {
      ...draft,
      preferencesWizardCompleted: true,
    }
    if (!canPersist) {
      router.push(`/${role}`)
      return
    }
    try {
      await updatePreferences(payload)
      router.push(`/${role}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Salvataggio non riuscito')
    }
  }

  const handleSkip = () => {
    router.push(`/${role}`)
  }

  return (
    <div className="space-y-6">
      <div className="text-center text-landing-fg mb-6 space-y-2">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
          Come usi la dashboard
        </h1>
        <p className="text-landing-muted text-sm">
          Ordiniamo i moduli in base alla tua fase. Puoi cambiare tutto da qui in seguito.
        </p>
      </div>

      {!canPersist && (
        <p className="text-sm text-landing-muted text-center rounded-lg border border-white/10 p-3">
          Supabase non è configurato: le preferenze sono solo in questa sessione demo. Vai alla
          dashboard con Salta.
        </p>
      )}

      <Card className="border-white/15 bg-surface/95 shadow-2xl backdrop-blur-xl dark:border-white/10">
        <CardHeader>
          <CardTitle>Preferenze</CardTitle>
          <CardDescription>Ruolo: {role}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {role === 'tenant' && (
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-landing-fg mb-2">
                Fase locazione
              </legend>
              {(['move_in', 'active', 'move_out'] as const).map((p) => (
                <label
                  key={p}
                  className="flex cursor-pointer items-center gap-2 text-sm text-landing-muted"
                >
                  <input
                    type="radio"
                    name="tenant-phase"
                    checked={draft.tenantPhase === p}
                    onChange={() => setDraft((d) => (d ? { ...d, tenantPhase: p } : d))}
                  />
                  {phaseLabel(p)}
                </label>
              ))}
            </fieldset>
          )}

          {role === 'manager' && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-landing-fg">Moduli manager</p>
              {(
                [
                  ['managerShowDocumentsKpi', 'KPI documenti mancanti'],
                  ['managerShowTransitionsKpi', 'KPI transizioni in arrivo'],
                  ['managerShowBlockersCard', 'Card blocchi e priorità'],
                ] as const
              ).map(([key, label]) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-center gap-2 text-sm text-landing-muted"
                >
                  <input
                    type="checkbox"
                    checked={draft[key] !== false}
                    onChange={(ev) =>
                      setDraft((d) => (d ? { ...d, [key]: ev.target.checked } : d))
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
          )}

          {role === 'owner' && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-landing-fg">Moduli owner</p>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-landing-muted">
                <input
                  type="checkbox"
                  checked={draft.ownerPrioritizeApprovals !== false}
                  onChange={(ev) =>
                    setDraft((d) =>
                      d ? { ...d, ownerPrioritizeApprovals: ev.target.checked } : d,
                    )
                  }
                />
                Metti in evidenza le approvazioni
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-landing-muted">
                <input
                  type="checkbox"
                  checked={draft.ownerShowActivityFeed !== false}
                  onChange={(ev) =>
                    setDraft((d) =>
                      d ? { ...d, ownerShowActivityFeed: ev.target.checked } : d,
                    )
                  }
                />
                Mostra feed attività recente
              </label>
            </div>
          )}

          {error && <FormError>{error}</FormError>}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              disabled={isSaving}
              onClick={handleSkip}
            >
              Salta
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={isSaving}
              onClick={() => void handleSave()}
            >
              {isSaving ? 'Salvataggio…' : 'Salva e vai alla dashboard'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/15 bg-surface/95 shadow-2xl backdrop-blur-xl dark:border-white/10">
        <CardHeader>
          <CardTitle>Fatturazione</CardTitle>
          <CardDescription>Abbonamento Stripe e Customer Portal</CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/account/billing"
            className={cn(buttonVariants({ variant: 'secondary' }), 'w-full justify-center')}
          >
            Apri billing
          </Link>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-landing-muted">
        <Link
          href={`/${role}`}
          className="text-[var(--cta-solid)] font-medium hover:underline underline-offset-4"
        >
          Vai alla dashboard senza salvare
        </Link>
      </p>
    </div>
  )
}
