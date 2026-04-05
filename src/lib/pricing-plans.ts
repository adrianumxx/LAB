/**
 * Piani commerciali pubblici (Sprint 11). Enforcement tecnico in Sprint 13.
 * Prezzi in EUR; allineare Stripe Price ID in Sprint 12.
 */

export type PricingTierId = 'free' | 'solo' | 'start' | 'core' | 'pro' | 'enterprise'

export interface PricingTier {
  id: PricingTierId
  name: string
  priceLabel: string
  priceSubtext: string
  unitCap: string
  overage?: string
  description: string
  highlights: string[]
  ctaLabel: string
  ctaHref: string
  emphasized?: boolean
}

export const PRICING_UNIT_DEFINITION =
  'Un’unità è un immobile (appartamento) gestito nel tuo workspace: ha stato, persone collegate, casi e documenti. Il conteggio si applica alle unità attive nel piano scelto.'

export const PRICING_ICP_LINE =
  'Pensata per property manager e gestori che operano da pochi immobili fino a centinaia di unità in Europa — con owner e inquilini sullo stesso sistema.'

/** Cosa il piano FREE non include rispetto ai piani a pagamento (roadmap enforcement Sprint 13). */
export const FREE_LIMITATIONS = [
  'Versione funzionale ridotta: ideale per provare il flusso con massimo 3 unità.',
  'Niente automazioni email programmate (digest, reminder) come nei piani a pagamento.',
  'Inviti e integrazioni avanzate riservate ai piani SOLO e superiori.',
  'Storage documenti e funzioni premium soggetti a limiti (allineamento prodotto in arrivo).',
] as const

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'FREE',
    priceLabel: '0 €',
    priceSubtext: 'sempre',
    unitCap: 'Fino a 3 appartamenti',
    description: 'Per esplorare TMP con un portfolio minimo.',
    highlights: ['3 unità incluse', 'Percorsi manager / owner / tenant', 'Ideale per demo interna'],
    ctaLabel: 'Inizia gratis',
    ctaHref: '/signup?role=manager',
  },
  {
    id: 'solo',
    name: 'SOLO',
    priceLabel: '14,99 €',
    priceSubtext: '/ mese',
    unitCap: 'Fino a 3 appartamenti',
    description: 'Un professionista: tutte le funzioni core senza scalare oltre tre unità.',
    highlights: ['Versione completa prodotto', 'Stesso tetto unità del Free, zero limitazioni funzionali', 'Fatturazione semplice'],
    ctaLabel: 'Scegli SOLO',
    ctaHref: '/signup?role=manager',
    emphasized: true,
  },
  {
    id: 'start',
    name: 'START',
    priceLabel: '49 €',
    priceSubtext: '/ mese',
    unitCap: 'Fino a 20 appartamenti inclusi',
    overage: 'Poi +4,99 € / appartamento / mese',
    description: 'Il punto di partenza per piccoli portafogli.',
    highlights: ['20 unità senza sorprese', 'Overage trasparente oltre la soglia', 'Adatta a team che crescono'],
    ctaLabel: 'Inizia con START',
    ctaHref: '/signup?role=manager',
  },
  {
    id: 'core',
    name: 'CORE',
    priceLabel: '99 €',
    priceSubtext: '/ mese',
    unitCap: 'Fino a 50 appartamenti inclusi',
    overage: 'Poi +3,99 € / appartamento / mese',
    description: 'Operatività seria su portafogli medi.',
    highlights: ['50 unità base', 'Overage a tariffa decrescente vs START', 'Supporto operativo concentrato'],
    ctaLabel: 'Scegli CORE',
    ctaHref: '/signup?role=manager',
  },
  {
    id: 'pro',
    name: 'PRO',
    priceLabel: '149 €',
    priceSubtext: '/ mese',
    unitCap: 'Fino a 100 appartamenti inclusi',
    overage: 'Poi +2,99 € / appartamento / mese',
    description: 'Per organizzazioni con molte chiavi in gestione.',
    highlights: ['100 unità incluse', 'Miglior unit economics in overage', 'Scalabilità senza cambiare tool'],
    ctaLabel: 'Scegli PRO',
    ctaHref: '/signup?role=manager',
  },
  {
    id: 'enterprise',
    name: 'ENTERPRISE / ISTITUZIONALE',
    priceLabel: 'Su misura',
    priceSubtext: '',
    unitCap: 'Volumi elevati, multi-workspace, requisiti legali',
    description: 'Contratto, SLA, integrazioni e onboarding dedicati.',
    highlights: ['Prezzo e termini concordati', 'Contatto diretto con il team', 'Roadmap condivisa dove serve'],
    ctaLabel: 'Contattaci',
    /** Risolto in UI con `getEnterpriseContactHref()`. */
    ctaHref: '',
  },
]
