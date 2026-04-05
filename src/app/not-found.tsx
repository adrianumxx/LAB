import type { Metadata } from 'next'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Page not found',
}

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-medium text-secondary">404</p>
      <h1 className="text-3xl font-bold text-primary">Page not found</h1>
      <p className="max-w-md text-sm text-secondary">
        The page you requested does not exist or you do not have access.
      </p>
      <Link href="/role-entry" className={cn(buttonVariants({ variant: 'primary' }))}>
        Go to sign in
      </Link>
    </div>
  )
}
