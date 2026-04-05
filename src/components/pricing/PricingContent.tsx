import Link from 'next/link'
import { buttonVariants } from '@/components/ui/Button'
import { getEnterpriseContactHref, getEnterpriseContactLabel } from '@/lib/enterprise-contact'
import {
  FREE_LIMITATIONS,
  PRICING_ICP_LINE,
  PRICING_TIERS,
  PRICING_UNIT_DEFINITION,
} from '@/lib/pricing-plans'
import { cn } from '@/lib/utils'

export function PricingContent() {
  const enterpriseHref = getEnterpriseContactHref()
  const enterpriseLabel = getEnterpriseContactLabel()

  return (
    <main id="main-content" className="flex-1 pt-16">
      <section className="border-b border-border bg-secondary/60 py-12 sm:py-16" aria-labelledby="pricing-heading">
        <div className="container max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted mb-4">Piani e prezzi</p>
          <h1
            id="pricing-heading"
            className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-primary tracking-tight text-balance"
          >
            Scala il tuo portafoglio con chiarezza
          </h1>
          <p className="mt-6 text-lg text-secondary max-w-3xl leading-relaxed text-pretty">{PRICING_ICP_LINE}</p>
          <div className="mt-8 rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm max-w-3xl">
            <h2 className="font-display text-lg font-semibold text-primary">Cos’è un’unità?</h2>
            <p className="mt-3 text-secondary leading-relaxed text-pretty">{PRICING_UNIT_DEFINITION}</p>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16" aria-label="Tabella piani">
        <div className="container max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
            {PRICING_TIERS.map((tier) => {
              const href = tier.id === 'enterprise' ? enterpriseHref : tier.ctaHref
              return (
                <article
                  key={tier.id}
                  className={cn(
                    'flex flex-col rounded-2xl border bg-surface p-6 sm:p-8 shadow-md transition-shadow duration-base hover:shadow-lg',
                    tier.emphasized
                      ? 'border-[var(--cta-solid)] ring-2 ring-[var(--cta-solid)]/25'
                      : 'border-border',
                  )}
                >
                  {tier.emphasized ? (
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--cta-solid)] mb-2">
                      Più scelto per professionisti
                    </p>
                  ) : null}
                  <h2 className="font-display text-xl sm:text-2xl font-semibold text-primary">{tier.name}</h2>
                  <p className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="text-3xl sm:text-4xl font-semibold text-primary tabular-nums">
                      {tier.priceLabel}
                    </span>
                    {tier.priceSubtext ? (
                      <span className="text-sm text-muted">{tier.priceSubtext}</span>
                    ) : null}
                  </p>
                  <p className="mt-2 text-sm font-medium text-primary">{tier.unitCap}</p>
                  {tier.overage ? <p className="mt-1 text-sm text-secondary">{tier.overage}</p> : null}
                  <p className="mt-4 text-secondary text-sm leading-relaxed">{tier.description}</p>
                  <ul className="mt-6 space-y-2 text-sm text-secondary flex-1">
                    {tier.highlights.map((line) => (
                      <li key={line} className="flex gap-2">
                        <span className="text-[var(--cta-solid)] shrink-0" aria-hidden>
                          ·
                        </span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={href}
                    className={cn(
                      buttonVariants({
                        variant: tier.emphasized ? 'cta' : 'primary',
                        size: 'lg',
                      }),
                      'mt-8 w-full justify-center',
                    )}
                  >
                    {tier.ctaLabel}
                  </Link>
                </article>
              )
            })}
          </div>

          <div className="mt-12 rounded-2xl border border-border bg-secondary/40 p-6 sm:p-8 max-w-3xl">
            <h2 className="font-display text-lg font-semibold text-primary">Piano FREE: cosa non include</h2>
            <p className="mt-2 text-sm text-secondary leading-relaxed">
              Il FREE serve a provare il prodotto; i piani a pagamento sbloccano capacità operative complete e
              automazioni (in rollout — vedi roadmap).
            </p>
            <ul className="mt-4 space-y-2 text-sm text-secondary list-disc pl-5">
              {FREE_LIMITATIONS.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          <div
            id="contatti-enterprise"
            className="mt-12 scroll-mt-24 rounded-2xl border border-border bg-surface p-6 sm:p-8 max-w-3xl shadow-sm"
          >
            <h2 className="font-display text-xl font-semibold text-primary">Enterprise / istituzionale</h2>
            <p className="mt-3 text-secondary leading-relaxed">
              Volumi elevati, multi-workspace, requisiti legali o procurement: parliamone e costruiamo un accordo
              adatto al tuo contesto.
            </p>
            <Link
              href={enterpriseHref}
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'mt-6 inline-flex')}
            >
              {enterpriseLabel}
            </Link>
          </div>

          <p className="mt-10 text-sm text-muted max-w-2xl leading-relaxed">
            Hai già un abbonamento? Gestiscilo da{' '}
            <Link href="/account/billing" className="font-medium text-primary underline-offset-4 hover:underline">
              Account → Fatturazione
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  )
}
