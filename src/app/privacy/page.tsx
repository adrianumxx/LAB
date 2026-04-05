import type { Metadata } from 'next'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'Privacy information for the Tenant Management Platform.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-app">
      <div className="container max-w-2xl py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Privacy</h1>
          <p className="text-secondary mt-2 text-sm">
            Last updated: April 4, 2026. This page is a placeholder for your legal team.
          </p>
        </div>
        <div className="max-w-none space-y-4 text-sm text-primary">
          <p className="text-secondary">
            Tenant Management Platform (&quot;TMP&quot;) processes account and property-related
            information that you or your organization provide when using the product. A full privacy
            policy should describe: what data is collected, legal basis, retention, subprocessors,
            international transfers, and how users exercise their rights.
          </p>
          <p className="text-secondary">
            Replace this content with jurisdiction-specific text before production launch.
          </p>
        </div>
        <Link href="/role-entry" className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}>
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
