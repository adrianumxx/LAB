import { NextResponse } from 'next/server'
import { weeklyManagerDigestEmail } from '@/emails/templates/weekly-manager-digest'
import { createSupabaseAdminClient, isServiceRoleConfigured } from '@/lib/supabase/admin'
import { absoluteAppOrigin } from '@/lib/request-origin'
import { isResendConfigured } from '@/lib/resend/env'
import { sendTransactionalEmail } from '@/lib/resend/send-transactional'

export const runtime = 'nodejs'

function verifyCronSecret(request: Request): boolean {
  const secret = process.env['CRON_SECRET']?.trim()
  if (!secret) {
    return false
  }
  const auth = request.headers.get('authorization')
  if (auth === `Bearer ${secret}`) {
    return true
  }
  const url = new URL(request.url)
  return url.searchParams.get('secret') === secret
}

/**
 * Reminder schedulato: digest “open maintenance” per manager (una mail per manager).
 * Chiamare da Netlify Scheduled Function, Supabase cron, o cron esterno con `Authorization: Bearer CRON_SECRET`.
 */
export async function GET(request: Request) {
  return runReminders(request)
}

export async function POST(request: Request) {
  return runReminders(request)
}

async function runReminders(request: Request) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isServiceRoleConfigured()) {
    return NextResponse.json({ error: 'Service role not configured' }, { status: 503 })
  }

  if (!isResendConfigured()) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'Resend not configured' })
  }

  const admin = createSupabaseAdminClient()

  const { data: rows, error } = await admin
    .from('maintenance_requests')
    .select('id, unit_id, status')
    .eq('status', 'open')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const openList = rows ?? []
  if (openList.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: 'No open maintenance' })
  }

  const unitIds = [...new Set(openList.map((r) => r.unit_id))]

  const { data: units, error: unitsError } = await admin
    .from('units')
    .select('id, workspace_id')
    .in('id', unitIds)

  if (unitsError || !units?.length) {
    return NextResponse.json({ error: unitsError?.message ?? 'Units lookup failed' }, { status: 500 })
  }

  const workspaceIds = [...new Set(units.map((u) => u.workspace_id))]

  const { data: workspaces, error: wsError } = await admin
    .from('workspaces')
    .select('id, created_by')
    .in('id', workspaceIds)

  if (wsError || !workspaces?.length) {
    return NextResponse.json({ error: wsError?.message ?? 'Workspaces lookup failed' }, { status: 500 })
  }

  const wsById = new Map(workspaces.map((w) => [w.id, w.created_by]))
  const managerByUnit = new Map<string, string>()
  for (const u of units) {
    const mgr = wsById.get(u.workspace_id)
    if (mgr) {
      managerByUnit.set(u.id, mgr)
    }
  }

  const countByManager = new Map<string, number>()
  for (const r of openList) {
    const mgr = managerByUnit.get(r.unit_id)
    if (!mgr) continue
    countByManager.set(mgr, (countByManager.get(mgr) ?? 0) + 1)
  }

  const managerIds = [...countByManager.keys()]
  if (managerIds.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 })
  }

  const { data: profiles, error: profError } = await admin
    .from('profiles')
    .select('id, email')
    .in('id', managerIds)

  if (profError) {
    return NextResponse.json({ error: profError.message }, { status: 500 })
  }

  const emailById = new Map(
    (profiles ?? [])
      .filter((p) => typeof p.email === 'string' && p.email.includes('@'))
      .map((p) => [p.id, p.email.trim()] as const),
  )

  const origin = absoluteAppOrigin(request)
  let sent = 0
  const errors: string[] = []

  for (const [managerId, count] of countByManager) {
    const to = emailById.get(managerId)
    if (!to) {
      continue
    }
    const { subject, html } = weeklyManagerDigestEmail({
      openMaintenanceCount: count,
      dashboardUrl: origin,
    })
    const result = await sendTransactionalEmail({
      notificationType: 'weekly_manager_digest',
      to,
      subject,
      html,
      metadata: { manager_id: managerId, open_maintenance_count: count },
    })
    if (result.ok) {
      sent += 1
    } else if ('error' in result) {
      errors.push(`${to}: ${result.error}`)
    }
  }

  return NextResponse.json({
    ok: true,
    sent,
    managers: countByManager.size,
    errors: errors.length ? errors : undefined,
  })
}
