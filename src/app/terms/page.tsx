import type { Metadata } from 'next'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Terms',
  description: 'Terms of use for the Tenant Management Platform.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-app">
      <div className="container max-w-2xl py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Terms of use</h1>
          <p className="text-secondary mt-2 text-sm">
            Last updated: April 4, 2026. This page is a placeholder for your legal team.
          </p>
        </div>
        <div className="max-w-none space-y-4 text-sm text-primary">
          <p className="text-secondary">
            These terms govern access to and use of TMP. A complete agreement should cover:
            acceptable use, accounts, fees (if any), disclaimers, limitation of liability, and
            termination.
          </p>
          <p className="text-secondary">
            Replace this content with counsel-approved terms before production launch.
          </p>
        </div>
        <Link href="/role-entry" className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}>
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
