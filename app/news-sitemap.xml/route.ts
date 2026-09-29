import { articlePath } from '@/lib/media'
import { getArticles } from '@/lib/queries'
import { absoluteUrl, SITE_NAME } from '@/lib/site'
import { esc, twoDaysAgo, xmlResponse } from '@/lib/xml'

export const revalidate = 600

// Google News sitemap: articles from the last 48 hours (max 1000).
export async function GET() {
  const { docs } = await getArticles({ since: twoDaysAgo(), limit: 1000 })
  const urls = docs
    .map(
      (a) => `  <url>
    <loc>${esc(absoluteUrl(articlePath(a.slug)))}</loc>
    <news:news>
      <news:publication><news:name>${esc(SITE_NAME)}</news:name><news:language>${a.language === 'en' ? 'en' : 'ne'}</news:language></news:publication>
      <news:publication_date>${a.publishedAt}</news:publication_date>
      <news:title>${esc(a.title)}</news:title>
    </news:news>
  </url>`,
    )
    .join('\n')
  return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`)
}
