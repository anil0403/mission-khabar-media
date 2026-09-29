import { articlePath, asCategory } from '@/lib/media'
import { getArticles } from '@/lib/queries'
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from '@/lib/site'
import { esc, xmlResponse } from '@/lib/xml'

export const revalidate = 600

export async function GET() {
  const { docs } = await getArticles({ limit: 30 })
  const items = docs
    .map((a) => {
      const url = absoluteUrl(articlePath(a.slug))
      const cat = asCategory(a.category)
      return `    <item>
      <title>${esc(a.title)}</title>
      <link>${esc(url)}</link>
      <guid isPermaLink="true">${esc(url)}</guid>
      <description>${esc(a.excerpt ?? '')}</description>
      ${cat ? `<category>${esc(cat.name)}</category>` : ''}
      <pubDate>${new Date(a.publishedAt ?? Date.now()).toUTCString()}</pubDate>
    </item>`
    })
    .join('\n')
  return xmlResponse(
    `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE_NAME)}</title>
    <link>${esc(absoluteUrl('/'))}</link>
    <description>${esc(SITE_DESCRIPTION)}</description>
    <language>ne</language>
    <atom:link href="${esc(absoluteUrl('/feed.xml'))}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`,
    'application/rss+xml',
  )
}
