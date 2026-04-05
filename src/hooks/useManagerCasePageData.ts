import { useQuery } from '@tanstack/react-query'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import type {
  CaseChecklistItemRow,
  CasePhaseRow,
  CaseRow,
  CaseTimelineEventRow,
  UnitRow,
} from '@/lib/types/database'
import { isUuid } from '@/lib/validation/uuid'

export const managerCaseQueryKey = (caseId: string) =>
  ['manager-case', caseId] as const

export interface ManagerCasePagePayload {
  case: CaseRow | null
  unit: UnitRow | null
  phases: CasePhaseRow[]
  checklist: CaseChecklistItemRow[]
  timeline: CaseTimelineEventRow[]
}

async function fetchManagerCasePage(caseId: string): Promise<ManagerCasePagePayload> {
  const supabase = createSupabaseBrowserClient()

  const { data: caseRow, error: caseError } = await supabase
    .from('cases')
    .select(
      'id, unit_id, case_type, status, due_at, created_by, created_at',
    )
    .eq('id', caseId)
    .maybeSingle()

  if (caseError) {
    throw new Error(caseError.message)
  }

  if (!caseRow) {
    return { case: null, unit: null, phases: [], checklist: [], timeline: [] }
  }

  const c = caseRow as CaseRow

  const { data: unitRow, error: unitError } = await supabase
    .from('units')
    .select(
      'id, workspace_id, name, address_line, city, postal_code, unit_state, created_at',
    )
    .eq('id', c.unit_id)
    .maybeSingle()

  if (unitError) {
    throw new Error(unitError.message)
  }

  const { data: phaseRows, error: phasesError } = await supabase
    .from('case_phases')
    .select('id, case_id, position, title, status')
    .eq('case_id', caseId)
    .order('position', { ascending: true })

  if (phasesError) {
    throw new Error(phasesError.message)
  }

  const { data: checklistRows, error: checklistError } = await supabase
    .from('case_checklist_items')
    .select(
      'id, case_id, position, title, completed, assignee_role, due_at, created_at',
    )
    .eq('case_id', caseId)
    .order('position', { ascending: true })

  if (checklistError) {
    throw new Error(checklistError.message)
  }

  const { data: timelineRows, error: timelineError } = await supabase
    .from('case_timeline_events')
    .select('id, case_id, body, event_source, sort_at, created_by, created_at')
    .eq('case_id', caseId)
    .order('sort_at', { ascending: true })

  if (timelineError) {
    throw new Error(timelineError.message)
  }

  return {
    case: c,
    unit: (unitRow as UnitRow | null) ?? null,
    phases: (phaseRows as CasePhaseRow[] | null) ?? [],
    checklist: (checklistRows as CaseChecklistItemRow[] | null) ?? [],
    timeline: (timelineRows as CaseTimelineEventRow[] | null) ?? [],
  }
}

export function useManagerCasePageData(caseId: string | undefined) {
  const id = caseId?.trim() ?? ''
  const valid = isUuid(id)

  return useQuery({
    queryKey: managerCaseQueryKey(id),
    queryFn: () => fetchManagerCasePage(id),
    enabled: valid && isSupabaseConfigured(),
  })
}
