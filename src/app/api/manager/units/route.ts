import { NextResponse } from 'next/server'
import {
  getManagerUnitCap,
  managerCanAddUnit,
  type ProfileBillingFields,
} from '@/lib/billing-plan-policy'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { parseUnitState } from '@/lib/types/database'
import { isUuid } from '@/lib/validation/uuid'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { workspaceId?: string; name?: string; unitState?: string }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const workspaceId = typeof body.workspaceId === 'string' ? body.workspaceId.trim() : ''
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!workspaceId || !name) {
    return NextResponse.json({ error: 'workspaceId and name are required' }, { status: 400 })
  }
  if (!isUuid(workspaceId)) {
    return NextResponse.json({ error: 'Invalid workspaceId' }, { status: 400 })
  }

  const { data: ws, error: wsErr } = await supabase
    .from('workspaces')
    .select('id')
    .eq('id', workspaceId)
    .eq('created_by', user.id)
    .maybeSingle()

  if (wsErr || !ws) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 403 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('billing_plan, stripe_subscription_status')
    .eq('id', user.id)
    .maybeSingle()

  const profileRow = profile as ProfileBillingFields | null

  const { data: workspaces } = await supabase
    .from('workspaces')
    .select('id')
    .eq('created_by', user.id)

  const wsIds = (workspaces ?? []).map((w) => w.id as string)
  let count = 0
  if (wsIds.length > 0) {
    const { count: c, error: countError } = await supabase
      .from('units')
      .select('id', { count: 'exact', head: true })
      .in('workspace_id', wsIds)

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 400 })
    }
    count = c ?? 0
  }

  if (!managerCanAddUnit(count, profileRow)) {
    return NextResponse.json(
      {
        error: `Unit limit reached (${count}/${getManagerUnitCap(profileRow)} for your plan). Upgrade in Billing to add more units.`,
        code: 'UNIT_CAP_REACHED',
      },
      { status: 403 },
    )
  }

  const unitState = parseUnitState(
    typeof body.unitState === 'string' ? body.unitState : 'vacant',
  )

  const { data: unit, error: insErr } = await supabase
    .from('units')
    .insert({
      workspace_id: workspaceId,
      name,
      unit_state: unitState,
    })
    .select('id')
    .single()

  if (insErr) {
    const msg = insErr.message.toLowerCase()
    if (msg.includes('row-level security')) {
      return NextResponse.json(
        {
          error:
            'Cannot add this unit (plan limit or permissions). Open Billing to upgrade, or refresh and try again.',
          code: 'UNIT_INSERT_BLOCKED',
        },
        { status: 403 },
      )
    }
    return NextResponse.json({ error: insErr.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true, unitId: unit.id as string })
}
