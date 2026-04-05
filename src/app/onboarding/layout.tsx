import type { Metadata } from 'next'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SkipLink } from '@/components/layout/SkipLink'

export const metadata: Metadata = {
  title: 'Onboarding',
  description: 'Set up your workspace, property, or tenancy.',
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary to-bg-secondary flex flex-col">
      <SkipLink href="#onboarding-main">Skip to onboarding</SkipLink>
      <div className="container max-w-2xl py-12 flex-1">
        <main id="onboarding-main" tabIndex={-1}>
          {children}
        </main>
      </div>
      <SiteFooter />
    </div>
  )
}
