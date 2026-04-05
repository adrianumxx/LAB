/**
 * Canonical site origin for metadata, sitemap, and robots (server-side).
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://yourdomain.com).
 */
export function getSiteOrigin(): string {
  const raw = process.env['NEXT_PUBLIC_SITE_URL']?.trim()
  if (raw) {
    try {
      return new URL(raw).origin
    } catch {
      /* fall through */
    }
  }
  return 'http://localhost:3000'
}

export function getMetadataBase(): URL {
  try {
    return new URL(getSiteOrigin())
  } catch {
    return new URL('http://localhost:3000')
  }
}

export const SITE_DESCRIPTION =
  'Unit-first tenancy operations for property managers, owners, and tenants.'
