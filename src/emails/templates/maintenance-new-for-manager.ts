import { emailLayout } from '@/emails/layout'
import { escapeHtml } from '@/emails/escape-html'

export function maintenanceNewForManagerEmail(opts: {
  unitLabel: string
  requestTitle: string
  requestDescription: string | null
  managerDashboardUrl: string
}): { subject: string; html: string } {
  const desc = opts.requestDescription?.trim()
    ? `<p style="margin:12px 0 0;"><strong>Details</strong><br/>${escapeHtml(opts.requestDescription).replace(/\n/g, '<br/>')}</p>`
    : ''

  const inner = `
    <p style="margin:0;">A tenant submitted a new maintenance request.</p>
    <p style="margin:12px 0 0;"><strong>Unit</strong><br/>${escapeHtml(opts.unitLabel)}</p>
    <p style="margin:12px 0 0;"><strong>Title</strong><br/>${escapeHtml(opts.requestTitle)}</p>
    ${desc}
    <p style="margin:24px 0 0;">
      <a href="${escapeHtml(opts.managerDashboardUrl)}/manager/maintenance" style="display:inline-block;padding:12px 20px;background-color:#059669;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;font-size:14px;">Open maintenance</a>
    </p>
  `

  return {
    subject: `New maintenance: ${opts.requestTitle}`,
    html: emailLayout({
      title: 'New maintenance request',
      preheader: `${opts.unitLabel} — ${opts.requestTitle}`,
      innerHtml: inner,
    }),
  }
}
