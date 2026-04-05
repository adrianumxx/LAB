import { NextResponse } from 'next/server'
import { inviteSentConfirmationEmail } from '@/emails/templates/invite-sent-confirmation'
import { createSupabaseAdminClient, isInviteServerConfigured } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { isResendConfigured } from '@/lib/resend/env'
import { sendTransactionalEmail } from '@/lib/resend/send-transactional'

export const runtime = 'nodejs'

type LinkRole = 'owner' | 'tenant'

function appOrigin(request: Request): string {
  const envUrl = process.env['NEXT_PUBLIC_SITE_URL']?.trim().replace(/\/$/, '')
  if (envUrl) return envUrl
  const origin = request.headers.get('origin')
  if (origin) return origin.replace(/\/$/, '')
  const referer = request.headers.get('referer')
  if (referer) {
    try {
      return new URL(referer).origin
    } catch {
      /* ignore */
    }
  }
  return 'http://localhost:3000'
}

export async function POST(request: Request) {
  if (!isInviteServerConfigured()) {
    return NextResponse.json(
      {
        error:
          'Invites are not configured. Add SUPABASE_SERVICE_ROLE_KEY to .env.local (server only).',
      },
      { status: 503 },
    )
  }

  let body: { email?: string; unitId?: string; linkRole?: string }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const unitId = typeof body.unitId === 'string' ? body.unitId.trim() : ''
  const linkRole = body.linkRole as LinkRole

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
  }
  if (!unitId) {
    return NextResponse.json({ error: 'unitId is required' }, { status: 400 })
  }
  if (linkRole !== 'owner' && linkRole !== 'tenant') {
    return NextResponse.json({ error: 'linkRole must be owner or tenant' }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: unit, error: unitError } = await supabase
    .from('units')
    .select('id, workspace_id')
    .eq('id', unitId)
    .maybeSingle()

  if (unitError || !unit) {
    return NextResponse.json({ error: 'Unit not found or inaccessible' }, { status: 403 })
  }

  const { data: workspace, error: wsError } = await supabase
    .from('workspaces')
    .select('created_by')
    .eq('id', unit.workspace_id)
    .maybeSingle()

  if (wsError || !workspace || workspace.created_by !== user.id) {
    return NextResponse.json({ error: 'Only the workspace manager can invite' }, { status: 403 })
  }

  const { data: pendingRow, error: pendingError } = await supabase
    .from('pending_unit_invites')
    .insert({
      email,
      unit_id: unitId,
      link_role: linkRole,
      invited_by: user.id,
    })
    .select('id')
    .single()

  if (pendingError) {
    const msg = pendingError.message
    if (msg.includes('duplicate') || msg.includes('unique')) {
      return NextResponse.json(
        { error: 'An open invite already exists for this email and unit.' },
        { status: 409 },
      )
    }
    if (msg.includes('does not exist') || msg.includes('schema cache')) {
      return NextResponse.json(
        {
          error:
            'Database not ready: run the pending_unit_invites migration in Supabase SQL Editor.',
        },
        { status: 503 },
      )
    }
    return NextResponse.json({ error: pendingError.message }, { status: 400 })
  }

  const origin = appOrigin(request)
  const redirectTo = `${origin}/login`

  try {
    const admin = createSupabaseAdminClient()
    const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: {
        role: linkRole,
      },
    })

    if (inviteError) {
      await supabase.from('pending_unit_invites').delete().eq('id', pendingRow.id)
      const msg = inviteError.message.toLowerCase()
      const alreadyRegistered =
        msg.includes('already been registered') ||
        msg.includes('already registered') ||
        msg.includes('user already exists')
      return NextResponse.json(
        {
          error: alreadyRegistered
            ? 'This email already has an account — email invites only work for new signups.'
            : inviteError.message,
          hint: alreadyRegistered
            ? 'Use “Tenant user UUID” / “Owner user UUID” below to link the existing account to this unit.'
            : 'If signup still fails, check Supabase Auth → email templates and SMTP, or link by UUID instead.',
        },
        { status: 400 },
      )
    }
  } catch (e) {
    await supabase.from('pending_unit_invites').delete().eq('id', pendingRow.id)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Invite failed' },
      { status: 500 },
    )
  }

  if (isResendConfigured() && user.email) {
    const { data: unitMeta } = await supabase
      .from('units')
      .select('name, address_line, city')
      .eq('id', unitId)
      .maybeSingle()
    const unitLabel =
      [unitMeta?.name, unitMeta?.address_line, unitMeta?.city].filter(Boolean).join(' — ') ||
      'Unit'
    const { subject, html } = inviteSentConfirmationEmail({
      inviteeEmail: email,
      linkRole,
      unitLabel,
      loginUrl: redirectTo,
    })
    void sendTransactionalEmail({
      notificationType: 'invite_sent_confirmation',
      to: user.email,
      subject,
      html,
      metadata: { unit_id: unitId, link_role: linkRole },
    })
  }

  return NextResponse.json({
    ok: true,
    message: 'Invitation email sent. When they complete signup, they will be linked to this unit.',
  })
}
