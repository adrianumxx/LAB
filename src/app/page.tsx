import type { Metadata } from 'next'
import { HomeClient } from './HomeClient'

export const metadata: Metadata = {
  title: 'Home',
  description:
    'Piattaforma operativa per property manager, proprietari e inquilini: unità, case di lifecycle e documenti in un unico posto.',
}

export default function HomePage() {
  return <HomeClient />
}
