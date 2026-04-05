import Link from 'next/link'
import { DashboardSignOut } from '@/components/layout/DashboardSignOut'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SkipLink } from '@/components/layout/SkipLink'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-app flex flex-col">
      <SkipLink href="#dashboard-main">Vai al contenuto principale</SkipLink>
      <nav
        className="sticky top-0 z-sticky border-b border-border/80 bg-surface/90 backdrop-blur-md"
        aria-label="Navigazione dashboard"
      >
        <div className="container h-16 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="font-display font-semibold text-lg tracking-tight text-primary hover:text-primary-700 dark:hover:text-primary-300 transition-colors min-h-11 inline-flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
          >
            TMP
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-sm text-secondary hidden sm:inline self-center">
              Dashboard
            </span>
            <Link
              href="/account/preferences"
              className="text-sm text-secondary hover:text-primary transition-colors min-h-11 inline-flex items-center px-2 -mx-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
            >
              Preferenze
            </Link>
            <DashboardSignOut />
          </div>
        </div>
      </nav>

      <main id="dashboard-main" className="container py-8 flex-1" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}
