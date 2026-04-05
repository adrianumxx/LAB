import type { Metadata } from 'next'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Page not found',
}

/**
 * 404 for URLs that look like dashboard paths but have no matching segment.
 */
export default function DashboardNotFound() {
  return (
    <div
      className="mx-auto flex min-h-[50vh] max-w-lg flex-col justify-center gap-4 px-4 py-12 text-center"
      role="alert"
    >
      <p className="text-sm font-medium text-secondary">404</p>
      <h1 className="text-2xl font-bold text-primary">This dashboard page doesn&apos;t exist</h1>
      <p className="text-sm text-secondary">
        The URL may be wrong, or the page was removed. Use your role home or the menu to continue.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
        <Link href="/manager" className={cn(buttonVariants({ variant: 'secondary' }), 'justify-center')}>
          Manager home
        </Link>
        <Link href="/owner" className={cn(buttonVariants({ variant: 'secondary' }), 'justify-center')}>
          Owner home
        </Link>
        <Link href="/tenant" className={cn(buttonVariants({ variant: 'secondary' }), 'justify-center')}>
          Tenant home
        </Link>
        <Link href="/role-entry" className={cn(buttonVariants({ variant: 'primary' }), 'justify-center')}>
          Sign in
        </Link>
      </div>
    </div>
  )
}
