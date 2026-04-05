/**
 * Link contatti commerciali (Enterprise). Opzionale: NEXT_PUBLIC_SALES_EMAIL in env.
 */

export function getEnterpriseContactHref(): string {
  const email = process.env['NEXT_PUBLIC_SALES_EMAIL']?.trim()
  if (email && email.includes('@')) {
    const subject = encodeURIComponent('TMP — Enterprise / istituzionale')
    return `mailto:${email}?subject=${subject}`
  }
  return '/role-entry'
}

export function getEnterpriseContactLabel(): string {
  return process.env['NEXT_PUBLIC_SALES_EMAIL']?.trim() ? 'Scrivici via email' : 'Vai all’accesso (contatti)'
}
