import type { MetadataRoute } from 'next'
import { getSiteOrigin } from '@/lib/site-config'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteOrigin()
  const now = new Date()
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    {
      url: `${base}/role-entry`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    { url: `${base}/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/signup`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/manager`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/owner`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/tenant`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    {
      url: `${base}/onboarding/manager`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${base}/onboarding/owner`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${base}/onboarding/tenant`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]
}
