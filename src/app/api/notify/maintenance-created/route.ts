import { NextResponse } from 'next/server'
import { maintenanceNewForManagerEmail } from '@/emails/templates/maintenance-new-for-manager'
import { createSupabaseAdminClient, isServiceRoleConfigured } from '@/lib/supabase/admin'
import { absoluteAppOrigin } from '@/lib/request-origin'
import { isResendConfigured } from '@/lib/resend/env'
import { sendTransactionalEmail } from '@/lib/resend/send-transactional'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  if (!isResendConfigured()) {
    return NextResponse.json(
      { ok: true, skipped: true, reason: 'Resend not configured' },
      { status: 200 },
    )
  }

  if (!isServiceRoleConfigured()) {
    return NextResponse.json(
      {
        error:
          'Server needs SUPABASE_SERVICE_ROLE_KEY to resolve manager email for notifications.',
      },
      { status: 503 },
    )
  }

  let body: { requestId?: string }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const requestId = typeof body.requestId === 'string' ? body.requestId.trim() : ''
  if (!requestId) {
    return NextResponse.json({ error: 'requestId is required' }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: row, error: rowError } = await supabase
    .from('maintenance_requests')
    .select('id, unit_id, tenant_id, title, description')
    .eq('id', requestId)
    .maybeSingle()

  if (rowError || !row) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  }

  if (row.tenant_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createSupabaseAdminClient()

  const { data: unit, error: unitError } = await admin
    .from('units')
    .select('id, name, address_line, city, workspace_id')
    .eq('id', row.unit_id)
    .maybeSingle()

  if (unitError || !unit) {
    return NextResponse.json({ error: 'Unit not found' }, { status: 400 })
  }

  const { data: workspace, error: wsError } = await admin
    .from('workspaces')
    .select('created_by')
    .eq('id', unit.workspace_id)
    .maybeSingle()

  if (wsError || !workspace?.created_by) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 400 })
  }

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('email')
    .eq('id', workspace.created_by)
    .maybeSingle()

  const managerEmail =
    profile && typeof profile.email === 'string' ? profile.email.trim() : ''

  if (profileError || !managerEmail || !managerEmail.includes('@')) {
    return NextResponse.json(
      { error: 'Manager email not available for this workspace.' },
      { status: 422 },
    )
  }

  const origin = absoluteAppOrigin(request)
  const unitLabel =
    [unit.name, unit.address_line, unit.city].filter(Boolean).join(' — ') || 'Unit'

  const { subject, html } = maintenanceNewForManagerEmail({
    unitLabel,
    requestTitle: row.title,
    requestDescription: row.description,
    managerDashboardUrl: origin,
  })

  const result = await sendTransactionalEmail({
    notificationType: 'maintenance_new_for_manager',
    to: managerEmail,
    subject,
    html,
    metadata: { maintenance_request_id: requestId, unit_id: row.unit_id },
  })

  if (result.ok === false && 'skipped' in result && result.skipped) {
    return NextResponse.json({ ok: true, skipped: true, reason: result.reason })
  }
  if (result.ok === false && 'error' in result) {
    return NextResponse.json({ error: result.error }, { status: 502 })
  }

  if (result.ok) {
    return NextResponse.json({ ok: true, messageId: result.messageId })
  }

  return NextResponse.json({ error: 'Send failed' }, { status: 502 })
}
