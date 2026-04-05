import { emailLayout } from '@/emails/layout'
import { escapeHtml } from '@/emails/escape-html'

export function weeklyManagerDigestEmail(opts: {
  openMaintenanceCount: number
  dashboardUrl: string
}): { subject: string; html: string } {
  const inner = `
    <p style="margin:0;">Here is your scheduled summary.</p>
    <p style="margin:16px 0 0;"><strong>Open maintenance requests</strong><br/><span style="font-size:28px;font-weight:700;color:#059669;">${opts.openMaintenanceCount}</span></p>
    <p style="margin:24px 0 0;">
      <a href="${escapeHtml(opts.dashboardUrl)}/manager/maintenance" style="display:inline-block;padding:12px 20px;background-color:#059669;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;font-size:14px;">Review maintenance</a>
    </p>
  `

  return {
    subject: `Weekly summary — ${opts.openMaintenanceCount} open maintenance`,
    html: emailLayout({
      title: 'Weekly summary',
      preheader: `${opts.openMaintenanceCount} open maintenance request(s)`,
      innerHtml: inner,
    }),
  }
}
