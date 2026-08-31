import type { MetadataRoute } from 'next'

const BASE = 'https://www.clubf1.com.au'

// Fixed, not `new Date()` — lastModified should mean "the content changed",
// not "we deployed".
const LAST_MODIFIED = new Date('2026-08-31')

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, lastModified: LAST_MODIFIED, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/local`, lastModified: LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/community`, lastModified: LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.8 },
  ]
}
