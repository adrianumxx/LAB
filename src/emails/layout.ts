import { escapeHtml } from '@/emails/escape-html'

const BRAND = {
  primary: '#059669',
  ink: '#14181f',
  muted: '#4b5568',
  bg: '#fafaf8',
  card: '#fffcf7',
  border: '#e2dfd6',
}

type EmailLayoutOptions = {
  title: string
  preheader?: string
  innerHtml: string
}

/**
 * Layout HTML email compatibile client; stile brand allineato a globals (emerald / carta).
 */
export function emailLayout(opts: EmailLayoutOptions): string {
  const pre = opts.preheader
    ? `<span style="display:none!important;visibility:hidden;mso-hide:all;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(opts.preheader)}</span>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bg};font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  ${pre}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${BRAND.bg};padding:24px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background-color:${BRAND.card};border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:20px 24px;border-bottom:1px solid ${BRAND.border};">
              <p style="margin:0;font-size:18px;font-weight:700;color:${BRAND.primary};letter-spacing:-0.02em;">Tenant OS</p>
              <p style="margin:6px 0 0;font-size:14px;color:${BRAND.muted};">${escapeHtml(opts.title)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;color:${BRAND.ink};font-size:15px;line-height:1.55;">
              ${opts.innerHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px;border-top:1px solid ${BRAND.border};font-size:12px;color:${BRAND.muted};">
              Sent by your property workspace. If you did not expect this message, you can ignore it.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
