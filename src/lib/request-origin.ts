/** Canonical site origin for Stripe redirects and invite emails. */
export function absoluteAppOrigin(request: Request): string {
  const envUrl = process.env['NEXT_PUBLIC_SITE_URL']?.trim().replace(/\/$/, '')
  if (envUrl) return envUrl
  const origin = request.headers.get('origin')
  if (origin) return origin.replace(/\/$/, '')
  const referer = request.headers.get('referer')
  if (referer) {
    try {
      return new URL(referer).origin.replace(/\/$/, '')
    } catch {
      /* ignore */
    }
  }
  return 'http://localhost:3000'
}
