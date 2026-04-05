import type { VariantProps } from 'class-variance-authority'
import type { badgeVariants } from '@/components/ui/Badge'
import type { MaintenanceRequestStatus } from '@/lib/types/database'

export const MAINTENANCE_STATUSES: readonly MaintenanceRequestStatus[] = [
  'open',
  'in_progress',
  'resolved',
  'cancelled',
] as const

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

export function maintenanceStatusLabel(s: string): string {
  if (s === 'open') return 'Open'
  if (s === 'in_progress') return 'In progress'
  if (s === 'resolved') return 'Resolved'
  if (s === 'cancelled') return 'Cancelled'
  return s
}

export function maintenanceStatusBadgeVariant(status: string): BadgeVariant {
  if (status === 'open') return 'warning'
  if (status === 'in_progress') return 'info'
  if (status === 'resolved') return 'success'
  if (status === 'cancelled') return 'default'
  return 'default'
}

export function parseMaintenanceStatus(
  value: string,
): MaintenanceRequestStatus {
  if ((MAINTENANCE_STATUSES as readonly string[]).includes(value)) {
    return value as MaintenanceRequestStatus
  }
  return 'open'
}
