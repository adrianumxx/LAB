import type { UserRole } from '@/lib/auth-store'

/** Fase operativa tenant — ordina i moduli in home */
export type TenantLifecyclePhase = 'move_in' | 'active' | 'move_out'

export type DashboardPreferences = {
  /** Tenant: cosa stai vivendo adesso */
  tenantPhase?: TenantLifecyclePhase
  /** Manager: mostra riga KPI documenti / transizioni (può nascondere rumore) */
  managerShowDocumentsKpi?: boolean
  managerShowTransitionsKpi?: boolean
  managerShowBlockersCard?: boolean
  /** Owner: metti in evidenza approvazioni in cima */
  ownerPrioritizeApprovals?: boolean
  /** Owner: sezione attività recente */
  ownerShowActivityFeed?: boolean
  /** Utente ha completato wizard preferenze almeno una volta */
  preferencesWizardCompleted?: boolean
}

export const defaultDashboardPreferences = (): DashboardPreferences => ({
  tenantPhase: 'active',
  managerShowDocumentsKpi: true,
  managerShowTransitionsKpi: true,
  managerShowBlockersCard: true,
  ownerPrioritizeApprovals: true,
  ownerShowActivityFeed: true,
  preferencesWizardCompleted: false,
})

export function mergeDashboardPreferences(
  raw: unknown,
): DashboardPreferences {
  const base = defaultDashboardPreferences()
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return base
  }
  const o = raw as Record<string, unknown>
  const tenantPhase = o['tenantPhase']
  if (
    tenantPhase === 'move_in' ||
    tenantPhase === 'active' ||
    tenantPhase === 'move_out'
  ) {
    base.tenantPhase = tenantPhase
  }
  if (typeof o['managerShowDocumentsKpi'] === 'boolean') {
    base.managerShowDocumentsKpi = o['managerShowDocumentsKpi']
  }
  if (typeof o['managerShowTransitionsKpi'] === 'boolean') {
    base.managerShowTransitionsKpi = o['managerShowTransitionsKpi']
  }
  if (typeof o['managerShowBlockersCard'] === 'boolean') {
    base.managerShowBlockersCard = o['managerShowBlockersCard']
  }
  if (typeof o['ownerPrioritizeApprovals'] === 'boolean') {
    base.ownerPrioritizeApprovals = o['ownerPrioritizeApprovals']
  }
  if (typeof o['ownerShowActivityFeed'] === 'boolean') {
    base.ownerShowActivityFeed = o['ownerShowActivityFeed']
  }
  if (typeof o['preferencesWizardCompleted'] === 'boolean') {
    base.preferencesWizardCompleted = o['preferencesWizardCompleted']
  }
  return base
}

export function preferencesToJson(p: DashboardPreferences): Record<string, unknown> {
  return { ...p }
}

/** Ordine sezioni tenant: indici per reorder visuale (0 = prima) */
export function tenantSectionOrder(prefs: DashboardPreferences): {
  status: number
  checklist: number
  documents: number
  issues: number
} {
  const phase = prefs.tenantPhase ?? 'active'
  if (phase === 'move_in') {
    return { checklist: 0, status: 1, documents: 2, issues: 3 }
  }
  if (phase === 'move_out') {
    return { status: 0, checklist: 1, documents: 2, issues: 3 }
  }
  return { status: 0, checklist: 1, documents: 2, issues: 3 }
}

export function managerModuleFlags(
  prefs: DashboardPreferences,
  role: UserRole,
): {
  showDocumentsKpi: boolean
  showTransitionsKpi: boolean
  showBlockersCard: boolean
} {
  if (role !== 'manager') {
    return {
      showDocumentsKpi: true,
      showTransitionsKpi: true,
      showBlockersCard: true,
    }
  }
  return {
    showDocumentsKpi: prefs.managerShowDocumentsKpi !== false,
    showTransitionsKpi: prefs.managerShowTransitionsKpi !== false,
    showBlockersCard: prefs.managerShowBlockersCard !== false,
  }
}
