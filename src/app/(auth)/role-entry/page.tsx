'use client'

import Link from 'next/link'
import { Building2, Home, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

const cardClass =
  'border-white/15 bg-surface/95 shadow-2xl backdrop-blur-xl dark:bg-surface/90 dark:border-white/10 hover:border-[var(--cta-solid)]/40 transition-colors duration-base'

export default function RoleEntryPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <Link
          href="/"
          className="inline-flex text-sm text-landing-muted hover:text-landing-fg underline-offset-4 hover:underline"
        >
          ← Torna alla presentazione
        </Link>
      </div>

      <div className="text-center text-landing-fg space-y-2">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
          Chi sei in questo affitto?
        </h1>
        <p className="text-landing-muted text-base sm:text-lg max-w-md mx-auto leading-relaxed">
          Scegli il ruolo per continuare con login o registrazione.
        </p>
      </div>

      <div className="space-y-4">
        <Link href="/signup?role=manager" className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cta-solid)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--landing-ink)]">
          <Card className={cn(cardClass, 'cursor-pointer motion-safe:hover:-translate-y-0.5 motion-safe:transition-transform')}>
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary-700 dark:text-primary-300">
                  <Building2 className="size-5" aria-hidden />
                </div>
                <div>
                  <CardTitle>Property manager</CardTitle>
                  <CardDescription className="text-base mt-1">
                    Gestione operativa di unità, inquilini e case
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-secondary leading-relaxed">
              <p className="mb-5">
                Centro di controllo per più appartamenti, lifecycle degli inquilini e manutenzione —
                tutto collegato alle unità.
              </p>
              <Button size="sm" variant="primary" type="button" className="pointer-events-none">
                Continua come manager
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/signup?role=owner" className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cta-solid)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--landing-ink)]">
          <Card className={cn(cardClass, 'cursor-pointer motion-safe:hover:-translate-y-0.5 motion-safe:transition-transform')}>
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent-700 dark:text-accent-300">
                  <Home className="size-5" aria-hidden />
                </div>
                <div>
                  <CardTitle>Proprietario</CardTitle>
                  <CardDescription className="text-base mt-1">
                    Visione sui tuoi immobili in affitto
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-secondary leading-relaxed">
              <p className="mb-5">
                Stato occupazione, approvazioni, documenti condivisi: meno telefonate, più chiarezza.
              </p>
              <Button size="sm" variant="primary" type="button" className="pointer-events-none">
                Continua come owner
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/login?role=tenant" className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cta-solid)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--landing-ink)]">
          <Card className={cn(cardClass, 'cursor-pointer motion-safe:hover:-translate-y-0.5 motion-safe:transition-transform')}>
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-info-50 text-info-700 dark:bg-info-900/30 dark:text-info-50">
                  <User className="size-5" aria-hidden />
                </div>
                <div>
                  <CardTitle>Inquilino</CardTitle>
                  <CardDescription className="text-base mt-1">
                    Il tuo affitto in un posto solo
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-secondary leading-relaxed">
              <p className="mb-5">
                Contratto, documenti, segnalazioni e stato della tua tenancy — senza perderti tra le
                mail.
              </p>
              <Button size="sm" variant="primary" type="button" className="pointer-events-none">
                Accedi come inquilino
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="text-center text-sm text-landing-muted pt-2">
        <p>
          Hai già un account?{' '}
          <Link href="/login" className="text-[var(--cta-solid)] font-medium hover:underline underline-offset-4">
            Accedi
          </Link>
        </p>
      </div>
    </div>
  )
}
