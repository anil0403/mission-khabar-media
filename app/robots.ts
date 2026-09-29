import type { MetadataRoute } from 'next'

import { absoluteUrl, INDEXABLE } from '@/lib/site'

// Preview deploys and local builds are never indexed.
export default function robots(): MetadataRoute.Robots {
  if (!INDEXABLE) return { rules: { userAgent: '*', disallow: '/' } }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/search', '/account', '/login'] },
    sitemap: [absoluteUrl('/sitemap.xml'), absoluteUrl('/news-sitemap.xml')],
  }
}
