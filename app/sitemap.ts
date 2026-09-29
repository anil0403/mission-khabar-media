import type { MetadataRoute } from 'next'

import { articlePath, authorPath } from '@/lib/media'
import { getAllPages, getAuthors, getCategories, getSitemapArticles } from '@/lib/queries'
import { absoluteUrl } from '@/lib/site'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, categories, authors, pages] = await Promise.all([getSitemapArticles(), getCategories(), getAuthors(), getAllPages()])
  return [
    { url: absoluteUrl('/'), changeFrequency: 'hourly', priority: 1 },
    ...categories.map((c) => ({ url: absoluteUrl(`/${c.slug}`), lastModified: c.updatedAt, changeFrequency: 'hourly' as const, priority: 0.8 })),
    ...articles.map((a) => ({ url: absoluteUrl(articlePath(a.slug)), lastModified: a.updatedAt, priority: 0.7 })),
    ...authors.map((u) => ({ url: absoluteUrl(authorPath(u.id)), lastModified: u.updatedAt, priority: 0.3 })),
    ...pages.map((p) => ({ url: absoluteUrl(`/${p.slug}`), lastModified: p.updatedAt, priority: 0.3 })),
    { url: absoluteUrl('/videos'), changeFrequency: 'daily', priority: 0.5 },
    { url: absoluteUrl('/contact'), priority: 0.3 },
  ]
}
