/**
 * Sprint 13 — limiti e feature gate per piano (mirror numerico in migration SQL `unit_cap_rls`).
 * Modello workspace: somma unità su **tutti** i workspace con `created_by = manager`.
 *
 * Overage (13.5): niente billing metered in prodotto — blocco hard fino a upgrade piano / Enterprise.
 */

import { subscriptionStatusGrantsAccess } from '@/lib/billing'

export type EffectiveBillingPlan = 'free' | 'solo' | 'start' | 'core' | 'pro' | 'enterprise'

export interface ProfileBillingFields {
  billing_plan: string | null
  stripe_subscription_status: string | null
}

export function managerIsFreeTier(row: ProfileBillingFields | null | undefined): boolean {
  return !subscriptionStatusGrantsAccess(row?.stripe_subscription_status)
}

/**
 * Piano effettivo per calcolo **cap unità**. Abbonamento attivo senza slug noto → trattato come PRO (cap 100).
 */
export function resolveEffectiveBillingPlan(
  row: ProfileBillingFields | null | undefined,
): EffectiveBillingPlan {
  if (!row || managerIsFreeTier(row)) {
    return 'free'
  }
  const bp = row.billing_plan?.trim().toLowerCase() ?? ''
  if (bp === 'enterprise') return 'enterprise'
  if (bp === 'solo' || bp === 'start' || bp === 'core' || bp === 'pro') {
    return bp
  }
  return 'pro'
}

export function unitCapForEffectivePlan(plan: EffectiveBillingPlan): number {
  switch (plan) {
    case 'free':
      return 3
    case 'solo':
      return 3
    case 'start':
      return 20
    case 'core':
      return 50
    case 'pro':
      return 100
    case 'enterprise':
      return 999_999
  }
}

export function getManagerUnitCap(row: ProfileBillingFields | null | undefined): number {
  return unitCapForEffectivePlan(resolveEffectiveBillingPlan(row))
}

export function managerCanAddUnit(currentCount: number, profile: ProfileBillingFields | null | undefined): boolean {
  return currentCount < getManagerUnitCap(profile)
}
