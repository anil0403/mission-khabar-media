import 'server-only'
import { unstable_cache } from 'next/cache'
import { getPayload, type Where } from 'payload'
import config from '@payload-config'

export const payload = () => getPayload({ config })

// All public reads share one tag so any CMS change refreshes them (lib/revalidate.ts).
const cached = <A extends unknown[], R>(key: string, fn: (...args: A) => Promise<R>) =>
  unstable_cache(fn, [key], { tags: ['content'], revalidate: 3600 })

const PUBLISHED: Where = { _status: { equals: 'published' } }
// Keep author emails etc. out of pages: only populate what the site shows.
const populate = { users: { name: true, photo: true, bio: true }, categories: { name: true, slug: true } } as const
const listSelect = {
  title: true, slug: true, excerpt: true, cover: true, category: true, author: true, publishedAt: true, isBreaking: true, language: true,
} as const

export const getSite = cached('site', async () => (await payload()).findGlobal({ slug: 'site', depth: 1 }))

export const getCategories = cached('categories', async () =>
  (await (await payload()).find({ collection: 'categories', sort: 'order', limit: 50, pagination: false })).docs,
)

export const getCategory = cached('category', async (slug: string) =>
  (await (await payload()).find({ collection: 'categories', where: { slug: { equals: slug } }, limit: 1 })).docs[0] ?? null,
)

export const getArticles = cached(
  'articles',
  async (opts: { limit?: number; page?: number; category?: number | string; author?: number | string; exclude?: number | string; breaking?: boolean; featured?: boolean; since?: string }) => {
    const and: Where[] = [PUBLISHED]
    if (opts.category) and.push({ category: { equals: opts.category } })
    if (opts.author) and.push({ author: { equals: opts.author } })
    if (opts.exclude) and.push({ id: { not_equals: opts.exclude } })
    if (opts.breaking) and.push({ isBreaking: { equals: true } })
    if (opts.featured) and.push({ isFeatured: { equals: true } })
    if (opts.since) and.push({ publishedAt: { greater_than: opts.since } })
    return (await payload()).find({
      collection: 'articles',
      where: { and },
      sort: '-publishedAt',
      limit: opts.limit ?? 12,
      page: opts.page ?? 1,
      depth: 1,
      select: listSelect,
      populate,
    })
  },
)

/** Returns the article, or `{ redirect }` when the slug is an old one. */
export const getArticle = cached('article', async (slug: string) => {
  const p = await payload()
  const found = await p.find({ collection: 'articles', where: { and: [PUBLISHED, { slug: { equals: slug } }] }, limit: 1, depth: 1, populate })
  if (found.docs[0]) return { article: found.docs[0] }
  const old = await p.find({ collection: 'articles', where: { and: [PUBLISHED, { 'previousSlugs.slug': { equals: slug } }] }, limit: 1, depth: 0, select: { slug: true } })
  return old.docs[0] ? { redirect: old.docs[0].slug as string } : null
})

export const getPage = cached('page', async (slug: string) =>
  (await (await payload()).find({ collection: 'pages', where: { and: [PUBLISHED, { slug: { equals: slug } }] }, limit: 1 })).docs[0] ?? null,
)

export const getAuthor = cached('author', async (id: string) => {
  try {
    return await (await payload()).findByID({ collection: 'users', id, depth: 1, select: { name: true, photo: true, bio: true } })
  } catch {
    return null
  }
})

export const getAuthors = cached('authors', async () =>
  (await (await payload()).find({ collection: 'users', limit: 200, pagination: false, select: { name: true, updatedAt: true } })).docs,
)

export const getAllPages = cached('pages-all', async () =>
  (await (await payload()).find({ collection: 'pages', where: PUBLISHED, limit: 100, pagination: false, select: { slug: true, updatedAt: true } })).docs,
)

// ponytail: one sitemap up to 5000 articles; switch to generateSitemaps() when the archive grows past that.
export const getSitemapArticles = cached('sitemap-articles', async () =>
  (await (await payload()).find({
    collection: 'articles', where: PUBLISHED, sort: '-publishedAt', limit: 5000, pagination: false,
    select: { slug: true, updatedAt: true, publishedAt: true, title: true, language: true },
  })).docs,
)

// Search is per-query and uncached. ponytail: `like` scan; switch to Postgres full-text search if it gets slow.
export async function searchArticles(q: string, page = 1) {
  return (await payload()).find({
    collection: 'articles',
    where: { and: [PUBLISHED, { or: [{ title: { like: q } }, { excerpt: { like: q } }, { tags: { contains: q } }] }] },
    sort: '-publishedAt',
    limit: 12,
    page,
    depth: 1,
    select: listSelect,
    populate,
  })
}
