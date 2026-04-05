import { ImageResponse } from 'next/og'

/** Open Graph / Twitter card (1200×630). Brand gradient matches primary scale. */
export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const

export function createBrandOgImage(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 55%, #1E40AF 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: 72,
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: 'white',
            lineHeight: 1.08,
            letterSpacing: '-0.02em',
          }}
        >
          Tenant Management Platform
        </div>
        <div
          style={{
            fontSize: 26,
            color: 'rgba(255,255,255,0.92)',
            marginTop: 20,
            maxWidth: 880,
            lineHeight: 1.35,
          }}
        >
          Unit-first tenancy operations for managers, owners, and tenants.
        </div>
      </div>
    ),
    { ...OG_IMAGE_SIZE },
  )
}
