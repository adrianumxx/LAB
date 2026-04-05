'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { buttonVariants } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export function MarketingSiteHeader() {
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 z-sticky border-b border-white/10 bg-landing-ink/80 backdrop-blur-xl text-landing-fg supports-[backdrop-filter]:bg-landing-ink/70">
      <div className="container h-16 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-tight text-landing-fg flex items-center gap-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cta-solid)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--landing-ink)]"
        >
          <span
            className="flex size-11 min-h-11 min-w-11 items-center justify-center rounded-xl bg-[var(--cta-solid)] text-[var(--cta-on-solid)] motion-safe:transition-transform motion-safe:duration-base motion-safe:hover:scale-[1.03]"
            aria-hidden
          >
            <Sparkles className="size-4" aria-hidden />
          </span>
          TMP
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3" aria-label="Accesso e informazioni">
          <Link
            href="/pricing"
            className={cn(
              'inline-flex min-h-11 items-center px-2 text-sm font-medium rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cta-solid)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--landing-ink)] transition-colors',
              pathname === '/pricing' ? 'text-[var(--cta-solid)]' : 'text-landing-fg hover:text-[var(--cta-solid)]',
            )}
          >
            Prezzi
          </Link>
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: 'onDarkGhost', size: 'sm' }), 'hidden sm:inline-flex')}
          >
            Accedi
          </Link>
          <Link href="/role-entry" className={cn(buttonVariants({ variant: 'cta', size: 'sm' }))}>
            Entra
          </Link>
        </nav>
      </div>
    </header>
  )
}
