import type { VariantProps } from 'class-variance-authority'
import { badgeVariants } from '@/components/ui/Badge'

export type CaseBadgeVariant = NonNullable<
  VariantProps<typeof badgeVariants>['variant']
>

/** Mappa `cases.status` (testo libero) a variante Badge. */
export function caseStatusToBadgeVariant(status: string): CaseBadgeVariant {
  const s = status.toLowerCase().replace(/-/g, '_')
  if (s === 'open' || s === 'in_progress') return 'accent'
  if (s === 'closed' || s === 'completed') return 'success'
  if (s === 'blocked') return 'error'
  return 'warning'
}

export function humanizeCaseStatus(status: string): string {
  const s = status.toLowerCase()
  if (s === 'in_progress' || s === 'in-progress') return 'In progress'
  if (s === 'open') return 'Open'
  if (s === 'closed') return 'Closed'
  if (s === 'blocked') return 'Blocked'
  return status.charAt(0).toUpperCase() + status.slice(1)
}
