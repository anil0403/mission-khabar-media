import type { Metadata } from 'next'

import { AdSlot } from '@/components/ad-slot'
import { ArticleCard } from '@/components/article-card'
import { SectionTitle } from '@/components/section-title'
import { VideoStrip } from '@/components/video-strip'
import { getArticles, getCategories, getSite } from '@/lib/queries'
import { SITE_NAME, SITE_NAME_NE } from '@/lib/site'
import { latestVideos } from '@/lib/youtube'

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} | ${SITE_NAME_NE} — Latest Nepali News` },
  alternates: { canonical: '/' },
}

export default async function HomePage() {
  const [site, categories, featured, latest, videos] = await Promise.all([
    getSite(),
    getCategories(),
    getArticles({ featured: true, limit: 5 }),
    getArticles({ limit: 13 }),
    latestVideos(8),
  ])
  // Lead story: newest featured, else newest overall. Everything else de-duplicated against it.
  const lead = featured.docs[0] ?? latest.docs[0]
  const seen = new Set([lead?.id])
  const secondary = [...featured.docs, ...latest.docs].filter((a) => !seen.has(a.id) && seen.add(a.id)).slice(0, 4)
  const secondaryIds = new Set(secondary.map((a) => a.id))
  const rest = latest.docs.filter((a) => a.id !== lead?.id && !secondaryIds.has(a.id)).slice(0, 8)
  const sections = await Promise.all(categories.slice(0, 8).map(async (c) => ({ category: c, docs: (await getArticles({ category: c.id, limit: 4 })).docs })))

  if (!lead) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">{SITE_NAME_NE}</h1>
        <p className="mt-3 text-muted-foreground">News is on its way. Please check back soon.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4">
      <h1 className="sr-only">{SITE_NAME} — latest news from Nepal</h1>
      <AdSlot ad={site.ads?.header} className="mt-4" />

      <section aria-label="Top stories" className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ArticleCard article={lead} variant="hero" priority />
        </div>
        <div className="grid content-start gap-6 sm:grid-cols-2 lg:grid-cols-1 lg:gap-0 lg:divide-y">
          {secondary.map((a) => (
            <ArticleCard key={a.id} article={a} variant="compact" />
          ))}
        </div>
      </section>

      <div className="mt-12 grid gap-10 lg:grid-cols-3">
        <section aria-labelledby="latest" className="lg:col-span-2">
          <SectionTitle id="latest">Latest news</SectionTitle>
          <div className="grid gap-8 sm:grid-cols-2">
            {rest.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
        <aside className="space-y-8">
          <AdSlot ad={site.ads?.sidebar} sizes="(min-width: 1024px) 33vw, 100vw" />
          {videos.length > 0 && (
            <section aria-labelledby="videos-side">
              <SectionTitle id="videos-side" href="/videos">Videos</SectionTitle>
              <VideoStrip videos={videos.slice(0, 3)} vertical />
            </section>
          )}
        </aside>
      </div>

      {sections.filter((s) => s.docs.length).map(({ category, docs }) => (
        <section key={category.id} aria-labelledby={`cat-${category.id}`} className="mt-14">
          <SectionTitle id={`cat-${category.id}`} href={`/${category.slug}`}>{category.name}</SectionTitle>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {docs.map((a) => (
              <ArticleCard key={a.id} article={a} showCategory={false} />
            ))}
          </div>
        </section>
      ))}

      {videos.length > 3 && (
        <section aria-labelledby="videos" className="mt-14">
          <SectionTitle id="videos" href="/videos">Mission Khabar TV</SectionTitle>
          <VideoStrip videos={videos} />
        </section>
      )}
    </div>
  )
}
