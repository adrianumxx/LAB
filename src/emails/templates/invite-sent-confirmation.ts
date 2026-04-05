import { emailLayout } from '@/emails/layout'
import { escapeHtml } from '@/emails/escape-html'

export function inviteSentConfirmationEmail(opts: {
  inviteeEmail: string
  linkRole: string
  unitLabel: string
  loginUrl: string
}): { subject: string; html: string } {
  const inner = `
    <p style="margin:0;">You invited <strong>${escapeHtml(opts.inviteeEmail)}</strong> as <strong>${escapeHtml(opts.linkRole)}</strong> on unit <strong>${escapeHtml(opts.unitLabel)}</strong>.</p>
    <p style="margin:16px 0 0;">They will receive a separate message from authentication to complete signup. You can share this login link if they need it:</p>
    <p style="margin:16px 0 0;">
      <a href="${escapeHtml(opts.loginUrl)}" style="display:inline-block;padding:12px 20px;background-color:#059669;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;font-size:14px;">Open login</a>
    </p>
  `

  return {
    subject: `Invitation sent — ${opts.unitLabel}`,
    html: emailLayout({
      title: 'Invitation sent',
      preheader: `Invited ${opts.inviteeEmail} to ${opts.unitLabel}`,
      innerHtml: inner,
    }),
  }
}
