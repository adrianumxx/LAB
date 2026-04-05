import { emailLayout } from '@/emails/layout'
import { escapeHtml } from '@/emails/escape-html'

/**
 * Template pronto per benvenuto post-scelta ruolo (invio da collegare a evento auth in futuro).
 */
export function welcomeRoleEmail(opts: {
  roleLabel: string
  dashboardUrl: string
}): { subject: string; html: string } {
  const inner = `
    <p style="margin:0;">Your account is set up as <strong>${escapeHtml(opts.roleLabel)}</strong>.</p>
    <p style="margin:16px 0 0;">Open your dashboard to continue onboarding and daily work.</p>
    <p style="margin:24px 0 0;">
      <a href="${escapeHtml(opts.dashboardUrl)}" style="display:inline-block;padding:12px 20px;background-color:#059669;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;font-size:14px;">Open dashboard</a>
    </p>
  `

  return {
    subject: `Welcome — ${opts.roleLabel}`,
    html: emailLayout({
      title: 'Welcome',
      preheader: `You are signed in as ${opts.roleLabel}`,
      innerHtml: inner,
    }),
  }
}
