import { NextResponse } from 'next/server'
import { managerIsFreeTier, type ProfileBillingFields } from '@/lib/billing-plan-policy'
import { createSupabaseAdminClient, isServiceRoleConfigured } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { isUuid } from '@/lib/validation/uuid'

export const runtime = 'nodejs'

/**
 * Tenant (o sessione autenticata) verifica se il manager del workspace dell’unità ha abbonamento attivo.
 * Usato per gate upload documenti (storage) lato client.
 */
export async function GET(request: Request) {
  const unitId = new URL(request.url).searchParams.get('unitId')?.trim() ?? ''
  if (!isUuid(unitId)) {
    return NextResponse.json({ error: 'unitId must be a valid UUID' }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: lease, error: leaseError } = await supabase
    .from('unit_tenants')
    .select('unit_id')
    .eq('unit_id', unitId)
    .eq('tenant_id', user.id)
    .maybeSingle()

  if (leaseError || !lease) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!isServiceRoleConfigured()) {
    return NextResponse.json(
      { error: 'Server misconfigured for tier lookup' },
      { status: 503 },
    )
  }

  const admin = createSupabaseAdminClient()

  const { data: unit, error: unitError } = await admin
    .from('units')
    .select('workspace_id')
    .eq('id', unitId)
    .maybeSingle()

  if (unitError || !unit?.workspace_id) {
    return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
  }

  const { data: workspace, error: wsError } = await admin
    .from('workspaces')
    .select('created_by')
    .eq('id', unit.workspace_id as string)
    .maybeSingle()

  if (wsError || !workspace?.created_by) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
  }

  const { data: managerProfile, error: profError } = await admin
    .from('profiles')
    .select('billing_plan, stripe_subscription_status')
    .eq('id', workspace.created_by as string)
    .maybeSingle()

  if (profError) {
    return NextResponse.json({ error: profError.message }, { status: 500 })
  }

  const row = managerProfile as ProfileBillingFields | null
  const managerFreeTier = managerIsFreeTier(row)

  return NextResponse.json({
    storageAllowed: !managerFreeTier,
    managerFreeTier,
  })
}
