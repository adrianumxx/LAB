import type { CaseRow, UnitRow, UnitState, UnitTenantLeaseRow } from '@/lib/types/database'
import { MANAGER_ATTENTION_STATES } from '@/lib/types/database'

const attentionSet: ReadonlySet<UnitState> = new Set(MANAGER_ATTENTION_STATES)

export function aggregateManagerAttentionUnits(units: UnitRow[]): UnitRow[] {
  return units.filter((u) => attentionSet.has(u.unit_state))
}

export function aggregateManagerOpenCases(cases: CaseRow[]): CaseRow[] {
  return cases.filter((c) => c.status.toLowerCase() === 'open')
}

export interface LeaseMilestonePreview {
  unitId: string
  kind: 'lease_start' | 'lease_end'
  at: string
}

/** Lease start/end dates falling between today (inclusive) and today + daysAhead (inclusive). */
export function listUpcomingLeaseMilestones(
  unitTenants: UnitTenantLeaseRow[],
  daysAhead: number,
): LeaseMilestonePreview[] {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const endWindow = new Date(start)
  endWindow.setDate(endWindow.getDate() + daysAhead)
  endWindow.setHours(23, 59, 59, 999)

  const out: LeaseMilestonePreview[] = []
  for (const row of unitTenants) {
    if (row.lease_start) {
      const d = new Date(row.lease_start)
      if (!Number.isNaN(d.getTime()) && d >= start && d <= endWindow) {
        out.push({ unitId: row.unit_id, kind: 'lease_start', at: row.lease_start })
      }
    }
    if (row.lease_end) {
      const d = new Date(row.lease_end)
      if (!Number.isNaN(d.getTime()) && d >= start && d <= endWindow) {
        out.push({ unitId: row.unit_id, kind: 'lease_end', at: row.lease_end })
      }
    }
  }
  out.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
  return out
}

export function countUpcomingLeaseMilestones(
  unitTenants: UnitTenantLeaseRow[],
  daysAhead: number,
): number {
  return listUpcomingLeaseMilestones(unitTenants, daysAhead).length
}

/** Open cases with a due date on or before `daysAhead` from today (for “priority” strip). */
export function aggregateCasesDueWithinDays(cases: CaseRow[], daysAhead: number): CaseRow[] {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const endWindow = new Date(start)
  endWindow.setDate(endWindow.getDate() + daysAhead)
  endWindow.setHours(23, 59, 59, 999)

  return cases.filter((c) => {
    if (c.status.toLowerCase() !== 'open' || !c.due_at) return false
    const d = new Date(c.due_at)
    if (Number.isNaN(d.getTime())) return false
    return d >= start && d <= endWindow
  })
}
