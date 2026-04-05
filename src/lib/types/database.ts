/** Allineato a public.units.unit_state e UI onboarding manager */
export type UnitState =
  | 'vacant'
  | 'incoming'
  | 'occupied'
  | 'notice'
  | 'outgoing'
  | 'turnover'

const UNIT_STATES: readonly UnitState[] = [
  'vacant',
  'incoming',
  'occupied',
  'notice',
  'outgoing',
  'turnover',
]

export function parseUnitState(value: string): UnitState {
  if ((UNIT_STATES as readonly string[]).includes(value)) {
    return value as UnitState
  }
  return 'vacant'
}

export type CaseType =
  | 'move_in'
  | 'move_out'
  | 'incident'
  | 'repair'
  | 'turnover'

/** Righe PostgREST (public schema) */
export interface WorkspaceRow {
  id: string
  name: string
  created_by: string
  created_at: string
}

export interface UnitRow {
  id: string
  workspace_id: string
  name: string
  address_line: string | null
  city: string | null
  postal_code: string | null
  unit_state: UnitState
  created_at: string
}

export type CasePhaseStatus = 'pending' | 'in_progress' | 'completed'

export interface CasePhaseRow {
  id: string
  case_id: string
  position: number
  title: string
  status: CasePhaseStatus
}

export interface CaseChecklistItemRow {
  id: string
  case_id: string
  position: number
  title: string
  completed: boolean
  assignee_role: string | null
  due_at: string | null
  created_at: string
}

export interface CaseRow {
  id: string
  unit_id: string
  case_type: CaseType
  status: string
  due_at: string | null
  created_by: string | null
  created_at: string
}

export interface CaseDocumentRow {
  id: string
  case_id: string
  storage_path: string
  original_name: string | null
  content_type: string | null
  size_bytes: number | null
  uploaded_by: string | null
  created_at: string
}

export interface TenantDocumentRow {
  id: string
  unit_id: string
  tenant_id: string
  storage_path: string
  original_name: string | null
  content_type: string | null
  size_bytes: number | null
  uploaded_by: string | null
  created_at: string
}

/** Checklist move-in persistente (per unità + inquilino) */
export interface TenantChecklistItemRow {
  id: string
  unit_id: string
  tenant_id: string
  item_key: string
  title: string
  sort_order: number
  completed: boolean
  completed_at: string | null
  due_at: string | null
  created_at: string
}

export type MaintenanceRequestStatus =
  | 'open'
  | 'in_progress'
  | 'resolved'
  | 'cancelled'

export interface MaintenanceRequestRow {
  id: string
  unit_id: string
  tenant_id: string
  title: string
  description: string | null
  status: MaintenanceRequestStatus
  created_at: string
  updated_at: string
  resolved_at: string | null
  created_by: string | null
}

export type CaseTimelineEventSource = 'system' | 'user'

export interface CaseTimelineEventRow {
  id: string
  case_id: string
  body: string
  event_source: CaseTimelineEventSource
  sort_at: string
  created_by: string | null
  created_at: string
}

/** Lease rows for manager units (dashboard KPIs / transitions). */
export interface UnitTenantLeaseRow {
  unit_id: string
  lease_start: string | null
  lease_end: string | null
}

export interface ManagerDashboardPayload {
  workspaces: WorkspaceRow[]
  units: UnitRow[]
  cases: CaseRow[]
  unitTenants: UnitTenantLeaseRow[]
  /** Incomplete move-in checklist tasks across manager-visible units */
  openChecklistTaskCount: number
}

/** Unità che richiedono attenzione operativa (vista manager). */
export const MANAGER_ATTENTION_STATES: readonly UnitState[] = [
  'incoming',
  'notice',
  'outgoing',
  'turnover',
]

export function formatCaseTypeLabel(caseType: string): string {
  const labels: Record<string, string> = {
    move_in: 'Move-in',
    move_out: 'Move-out',
    incident: 'Incident',
    repair: 'Repair',
    turnover: 'Turnover',
  }
  return labels[caseType] ?? caseType
}

export function unitStateActionLabel(state: UnitState): string {
  switch (state) {
    case 'vacant':
      return 'Prepare unit for marketing / next tenancy'
    case 'incoming':
      return 'Complete move-in checklist and screening'
    case 'occupied':
      return 'Routine monitoring — no critical workflow'
    case 'notice':
      return 'Plan move-out and deposit handling'
    case 'outgoing':
      return 'Finalize move-out and handover'
    case 'turnover':
      return 'Turnover prep — repairs and readiness'
    default:
      return 'Review unit status'
  }
}

export function formatRelativeDayLabel(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return '—'
  const days = Math.floor((Date.now() - then) / 86_400_000)
  if (days <= 0) return 'Today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

export function formatIsoDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatIsoDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function caseTypeDescription(caseType: string): string {
  switch (caseType) {
    case 'move_in':
      return 'Coordinate tenant move-in, screening, and unit readiness.'
    case 'move_out':
      return 'Coordinate move-out, inspection, and deposit handling.'
    case 'incident':
      return 'Track an incident affecting the unit or tenancy.'
    case 'repair':
      return 'Manage maintenance or repair work for the unit.'
    case 'turnover':
      return 'Prepare the unit between tenancies.'
    default:
      return 'Lifecycle case for this unit.'
  }
}
