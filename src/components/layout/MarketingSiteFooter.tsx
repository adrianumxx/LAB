'use client'

import Link from 'next/link'

export function MarketingSiteFooter() {
  return (
    <footer
      className="border-t border-white/10 bg-landing-ink text-landing-muted py-12"
      role="contentinfo"
    >
      <div className="container flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-center md:text-left">
          <p className="font-display text-lg font-semibold text-landing-fg">TMP</p>
          <p className="mt-1 text-sm max-w-xs text-pretty">
            Tenant Management Platform — operatività su unità e lifecycle.
          </p>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm" aria-label="Footer">
          <Link
            href="/pricing"
            className="min-h-11 inline-flex items-center hover:text-landing-fg transition-colors"
          >
            Prezzi
          </Link>
          <Link
            href="/role-entry"
            className="text-landing-fg font-medium min-h-11 inline-flex items-center hover:text-[var(--cta-solid)] transition-colors"
          >
            Accesso
          </Link>
          <Link href="/login" className="min-h-11 inline-flex items-center hover:text-landing-fg transition-colors">
            Accedi
          </Link>
          <Link href="/privacy" className="min-h-11 inline-flex items-center hover:text-landing-fg transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="min-h-11 inline-flex items-center hover:text-landing-fg transition-colors">
            Termini
          </Link>
        </nav>
      </div>
    </footer>
  )
}
