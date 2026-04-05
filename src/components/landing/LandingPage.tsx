'use client'

import Link from 'next/link'
import { MarketingSiteFooter } from '@/components/layout/MarketingSiteFooter'
import { MarketingSiteHeader } from '@/components/layout/MarketingSiteHeader'
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  ClipboardList,
  FileStack,
  Home,
  LayoutDashboard,
  Shield,
  User,
} from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { buttonVariants } from '@/components/ui/Button'
import { PRICING_ICP_LINE } from '@/lib/pricing-plans'
import { cn } from '@/lib/utils'

const stats = [
  { label: 'Ruoli', value: '3', hint: 'Manager · Owner · Tenant' },
  { label: 'Focus', value: 'Unità', hint: 'Stato e case collegati' },
  { label: 'Obiettivo', value: 'Zero', hint: 'Richieste perse in inbox' },
]

const audience = [
  {
    title: 'Property manager',
    description:
      'Workspace operativo: unità, case di lifecycle, documenti e scadenze in un flusso solo.',
    href: '/signup?role=manager',
    icon: Building2,
    cta: 'Registrati',
  },
  {
    title: 'Proprietario',
    description:
      'Linea diretta su occupazione, interventi e documenti — senza inseguire aggiornamenti.',
    href: '/signup?role=owner',
    icon: Home,
    cta: 'Registrati',
  },
  {
    title: 'Inquilino',
    description: 'Lease, checklist e contatti con il gestore, ordinati e tracciabili.',
    href: '/login?role=tenant',
    icon: User,
    cta: 'Accedi',
  },
]

const features = [
  {
    title: 'Vista per unità',
    body: 'Ogni immobile ha stato, persone e case: niente più “dove avevo messo quel file?”.',
    icon: LayoutDashboard,
  },
  {
    title: 'Case e fasi',
    body: 'Move-in, turnover, repair: fasi, checklist e timeline condivise con il team.',
    icon: ClipboardList,
  },
  {
    title: 'Documenti agganciati',
    body: 'Allegati e attività legati al caso giusto — meno email, più responsabilità chiara.',
    icon: FileStack,
  },
  {
    title: 'Permessi per ruolo',
    body: 'Manager, owner e tenant vedono solo ciò che serve: meno rumore, più fiducia.',
    icon: Shield,
  },
]

const easeOut = [0.16, 1, 0.3, 1] as const

const MotionLink = motion.create(Link)

export function LandingPage() {
  const reduceMotion = useReducedMotion()

  const viewTransition = {
    duration: reduceMotion ? 0 : 0.55,
    ease: easeOut,
  }

  const hiddenY = reduceMotion ? 0 : 26

  return (
    <div className="min-h-screen flex flex-col bg-app text-primary">
      <MarketingSiteHeader />

      <main id="main-content" className="flex-1">
        {/* Hero — CSS stagger (primo paint leggero) */}
        <section className="landing-hero min-h-[min(100vh,920px)] flex flex-col justify-center pb-16 sm:pb-20 pt-24 sm:pt-28">
          <div className="landing-hero-inner container max-w-5xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-landing-muted mb-6 animate-in-up">
              Operatività affitti
            </p>
            <h1 className="font-display text-landing-fg text-hero font-semibold leading-[1.05] tracking-tight max-w-4xl text-balance animate-in-up animate-delay-1">
              Una piattaforma che tratta ogni affitto come un{' '}
              <span className="italic text-[var(--cta-solid)]">progetto</span>, non come una mail in
              più.
            </h1>
            <p className="mt-8 text-lg sm:text-xl text-landing-muted max-w-2xl leading-relaxed text-pretty animate-in-up animate-delay-2">
              Unità, persone, case e documenti collegati. Per chi gestisce, possiede o vive l’immobile
              — con accesso chiaro dalla home.
            </p>
            <p className="mt-6 text-sm sm:text-base text-landing-muted/90 max-w-2xl leading-relaxed text-pretty animate-in-up animate-delay-2">
              {PRICING_ICP_LINE}{' '}
              <Link
                href="/pricing"
                className="font-medium text-[var(--cta-solid)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cta-solid)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--landing-ink)] rounded-sm"
              >
                Vedi i piani
              </Link>
              .
            </p>
            <div className="mt-10 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 animate-in-up animate-delay-3">
              <Link href="/role-entry" className={cn(buttonVariants({ variant: 'cta', size: 'lg' }), 'gap-2')}>
                Accedi alla piattaforma
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: 'onDarkGhost', size: 'lg' }), 'justify-center')}
              >
                Ho già un account
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <motion.section
          className="border-y border-border bg-secondary py-12 sm:py-14"
          aria-label="In sintesi"
          initial={{ opacity: reduceMotion ? 1 : 0, y: hiddenY }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25, margin: '0px 0px -10% 0px' }}
          transition={viewTransition}
        >
          <div className="container">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
              {stats.map((s) => (
                <div key={s.label} className="pt-8 first:pt-0 sm:pt-0 sm:px-8 text-center sm:text-left">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">{s.label}</p>
                  <p className="font-display mt-2 text-4xl sm:text-5xl font-semibold text-primary tabular-nums">
                    {s.value}
                  </p>
                  <p className="mt-1 text-sm text-secondary">{s.hint}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Audience — bento */}
        <section className="py-20 sm:py-28" aria-labelledby="audience-heading">
          <div className="container">
            <motion.div
              className="max-w-2xl mb-14 sm:mb-16"
              initial={{ opacity: reduceMotion ? 1 : 0, y: hiddenY }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={viewTransition}
            >
              <h2
                id="audience-heading"
                className="font-display text-3xl sm:text-4xl font-semibold text-primary tracking-tight text-balance"
              >
                Tre porte, un solo motore
              </h2>
              <p className="mt-4 text-lg text-secondary leading-relaxed text-pretty">
                Stessa infrastruttura: viste e permessi costruiti sul tuo ruolo reale nel rapporto di
                affitto.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
              {audience.map((item, i) => (
                <MotionLink
                  key={item.title}
                  href={item.href}
                  className={cn(
                    'group relative flex flex-col rounded-2xl border border-border/80 bg-surface p-6 sm:p-8 shadow-lg transition-[box-shadow] duration-base hover:shadow-xl',
                    i === 0 && 'lg:col-span-7',
                    i === 1 && 'lg:col-span-5',
                    i === 2 && 'lg:col-span-12 lg:flex-row lg:items-center lg:gap-10',
                  )}
                  initial={{ opacity: reduceMotion ? 1 : 0, y: hiddenY }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2, margin: '0px 0px -8% 0px' }}
                  transition={{
                    ...viewTransition,
                    delay: reduceMotion ? 0 : i * 0.07,
                  }}
                  whileHover={reduceMotion ? undefined : { y: -3 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.998 }}
                >
                  <div
                    className={cn(
                      'mb-6 flex size-12 min-h-12 min-w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary-700 dark:bg-primary/20 dark:text-primary-300 motion-safe:transition-transform motion-safe:duration-base motion-safe:group-hover:scale-[1.04]',
                      i === 2 && 'lg:mb-0',
                    )}
                  >
                    <item.icon className="size-6" aria-hidden />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-display text-xl sm:text-2xl font-semibold text-primary">
                        {item.title}
                      </h3>
                      <ArrowUpRight
                        className="size-5 shrink-0 text-muted opacity-0 transition-opacity duration-base group-hover:opacity-100"
                        aria-hidden
                      />
                    </div>
                    <p className="mt-3 text-secondary leading-relaxed max-w-prose text-pretty">{item.description}</p>
                    <span
                      className={cn(
                        buttonVariants({ variant: 'secondary', size: 'sm' }),
                        'mt-6 pointer-events-none inline-flex w-fit',
                      )}
                    >
                      {item.cta}
                    </span>
                  </div>
                </MotionLink>
              ))}
            </div>
          </div>
        </section>

        {/* Features — editorial list */}
        <section
          className="py-20 sm:py-28 border-t border-border bg-secondary/80"
          aria-labelledby="features-heading"
        >
          <div className="container">
            <motion.h2
              id="features-heading"
              className="font-display text-3xl sm:text-4xl font-semibold text-primary tracking-tight max-w-xl text-balance"
              initial={{ opacity: reduceMotion ? 1 : 0, y: hiddenY }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={viewTransition}
            >
              Costruita per chi deve chiudere il cerchio
            </motion.h2>
            <ul className="mt-14 sm:mt-16 space-y-12 sm:space-y-16">
              {features.map((f, idx) => (
                <motion.li
                  key={f.title}
                  className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-start border-b border-border/60 pb-12 sm:pb-16 last:border-0 last:pb-0"
                  initial={{ opacity: reduceMotion ? 1 : 0, y: hiddenY }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25, margin: '0px 0px -12% 0px' }}
                  transition={{
                    ...viewTransition,
                    delay: reduceMotion ? 0 : idx * 0.06,
                  }}
                >
                  <div className="md:col-span-1 font-display text-sm font-semibold text-muted tabular-nums">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <div className="md:col-span-4 flex items-center gap-4">
                    <div className="flex size-11 min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl bg-surface border border-border shadow-sm text-primary-600 dark:text-primary-400">
                      <f.icon className="size-5" aria-hidden />
                    </div>
                    <h3 className="font-display text-xl sm:text-2xl font-semibold text-primary">{f.title}</h3>
                  </div>
                  <p className="md:col-span-7 text-lg text-secondary leading-relaxed text-pretty">{f.body}</p>
                </motion.li>
              ))}
            </ul>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="landing-hero py-20 sm:py-28" aria-labelledby="cta-heading">
          <motion.div
            className="landing-hero-inner container max-w-3xl text-center"
            initial={{ opacity: reduceMotion ? 1 : 0, y: hiddenY }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={viewTransition}
          >
            <h2
              id="cta-heading"
              className="font-display text-3xl sm:text-5xl font-semibold text-landing-fg tracking-tight text-balance"
            >
              Basta presentazioni vuote: entra e usa la dashboard.
            </h2>
            <p className="mt-6 text-lg text-landing-muted max-w-xl mx-auto leading-relaxed text-pretty">
              Scegli il ruolo, accedi o crea l’account — il percorso è lo stesso, cambia solo ciò che
              vedi.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/role-entry" className={cn(buttonVariants({ variant: 'cta', size: 'lg' }), 'gap-2')}>
                Apri accesso piattaforma
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link href="/" className={cn(buttonVariants({ variant: 'onDarkGhost', size: 'lg' }))}>
                Torna su in alto
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      <MarketingSiteFooter />
    </div>
  )
}
