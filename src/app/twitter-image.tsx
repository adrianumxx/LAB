import { createBrandOgImage, OG_IMAGE_SIZE } from '@/lib/og-brand-image'

export const runtime = 'edge'

export const alt = 'Tenant Management Platform — unit-first tenancy operations'

export const size = OG_IMAGE_SIZE

export const contentType = 'image/png'

export default function TwitterImage() {
  return createBrandOgImage()
}
