import type { CaseType } from '@/lib/types/database'

export interface CaseResponsibilityGroup {
  role: string
  tasks: readonly string[]
}

const MOVE_IN: readonly CaseResponsibilityGroup[] = [
  {
    role: 'Manager',
    tasks: [
      'Conduct background check',
      'Schedule inspection',
      'Prepare access credentials',
      'Execute lease workflow',
    ],
  },
  {
    role: 'Owner',
    tasks: ['Approve tenant when required', 'Review lease terms if applicable'],
  },
  {
    role: 'Tenant',
    tasks: ['Sign lease', 'Attend move-in', 'Complete onboarding tasks'],
  },
]

const MOVE_OUT: readonly CaseResponsibilityGroup[] = [
  {
    role: 'Manager',
    tasks: [
      'Coordinate inspections',
      'Process deposit',
      'Update unit state',
    ],
  },
  { role: 'Owner', tasks: ['Approve deposit deductions if applicable'] },
  { role: 'Tenant', tasks: ['Return keys', 'Complete move-out requirements'] },
]

const INCIDENT: readonly CaseResponsibilityGroup[] = [
  {
    role: 'Manager',
    tasks: ['Document incident', 'Coordinate response', 'Follow up with parties'],
  },
  { role: 'Owner', tasks: ['Stay informed on material issues'] },
  { role: 'Tenant', tasks: ['Report details accurately', 'Allow access if needed'] },
]

const REPAIR: readonly CaseResponsibilityGroup[] = [
  {
    role: 'Manager',
    tasks: ['Triage request', 'Schedule vendor', 'Confirm completion'],
  },
  { role: 'Owner', tasks: ['Approve spend above threshold if applicable'] },
  { role: 'Tenant', tasks: ['Grant access windows', 'Confirm resolution'] },
]

const TURNOVER: readonly CaseResponsibilityGroup[] = [
  {
    role: 'Manager',
    tasks: ['Repairs', 'Cleaning', 'Marketing readiness', 'Handoff to leasing'],
  },
  { role: 'Owner', tasks: ['Approve major capex if applicable'] },
  { role: 'Tenant', tasks: [] },
]

const DEFAULT: readonly CaseResponsibilityGroup[] = [
  { role: 'Manager', tasks: ['Drive case to completion', 'Document decisions'] },
  { role: 'Owner', tasks: ['Review as needed'] },
  { role: 'Tenant', tasks: ['Cooperate with scheduled work'] },
]

export function caseResponsibilities(caseType: CaseType): readonly CaseResponsibilityGroup[] {
  switch (caseType) {
    case 'move_in':
      return MOVE_IN
    case 'move_out':
      return MOVE_OUT
    case 'incident':
      return INCIDENT
    case 'repair':
      return REPAIR
    case 'turnover':
      return TURNOVER
    default:
      return DEFAULT
  }
}

export function formatAssigneeRole(role: string | null | undefined): string {
  if (!role || !role.trim()) return 'Unassigned'
  const r = role.toLowerCase()
  if (r === 'manager') return 'Manager'
  if (r === 'owner') return 'Owner'
  if (r === 'tenant') return 'Tenant'
  return role.charAt(0).toUpperCase() + role.slice(1)
}
