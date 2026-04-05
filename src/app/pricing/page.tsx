import type { Metadata } from 'next'
import { MarketingSiteFooter } from '@/components/layout/MarketingSiteFooter'
import { MarketingSiteHeader } from '@/components/layout/MarketingSiteHeader'
import { PricingContent } from '@/components/pricing/PricingContent'
import { getMetadataBase } from '@/lib/site-config'

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: 'Prezzi',
  description:
    'Piani TMP: FREE, SOLO, START, CORE, PRO e Enterprise. Prezzi mensili in euro, unità incluse e overage trasparente.',
  alternates: { canonical: '/pricing' },
}

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-app text-primary">
      <MarketingSiteHeader />
      <PricingContent />
      <MarketingSiteFooter />
    </div>
  )
}
