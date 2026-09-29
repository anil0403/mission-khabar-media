import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'

import { AdSlot } from '@/components/ad-slot'
import { ArticleCard } from '@/components/article-card'
import { ArticleEngagement } from '@/components/article-engagement'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { JsonLd } from '@/components/json-ld'
import { RichText } from '@/components/rich-text'
import { SectionTitle } from '@/components/section-title'
import { ShareMenu } from '@/components/share-menu'
import { articlePath, asCategory, asMedia, asUser, authorPath, shareImage } from '@/lib/media'
import { adDateTime, bsDate } from '@/lib/nepali-date'
import { getArticle, getArticles, getSite } from '@/lib/queries'
import { absoluteUrl, SITE_NAME, SITE_URL } from '@/lib/site'

// Rendered on first visit, then cached until the CMS changes (see lib/revalidate.ts).
export const generateStaticParams = async () => []

async function load(slug: string) {
  const res = await getArticle(decodeURIComponent(slug))
  if (!res) notFound()
  if ('redirect' in res) permanentRedirect(articlePath(res.redirect))
  return res.article
}

export async function generateMetadata({ params }: PageProps<'/news/[slug]'>): Promise<Metadata> {
  const article = await load((await params).slug)
  const category = asCategory(article.category)
  const author = asUser(article.author)
  const description = article.meta?.description || article.excerpt
  const image = shareImage(article.meta?.image || article.cover)
  return {
    title: article.meta?.title ? { absolute: article.meta.title } : article.title,
    description,
    alternates: { canonical: articlePath(article.slug) },
    openGraph: {
      type: 'article',
      title: article.title,
      description,
      url: articlePath(article.slug),
      images: [{ url: image, width: 1200, height: 630, alt: asMedia(article.cover)?.alt }],
      publishedTime: article.publishedAt ?? undefined,
      modifiedTime: article.updatedAt,
      section: category?.name,
      authors: author ? [absoluteUrl(authorPath(author.id))] : undefined,
      tags: article.tags ?? undefined,
      locale: article.language === 'en' ? 'en_US' : 'ne_NP',
    },
    twitter: { card: 'summary_large_image', title: article.title, description, images: [image] },
  }
}

export default async function ArticlePage({ params }: PageProps<'/news/[slug]'>) {
  const article = await load((await params).slug)
  const category = asCategory(article.category)
  const author = asUser(article.author)
  const authorPhoto = asMedia(author?.photo)
  const cover = asMedia(article.cover)
  const url = absoluteUrl(articlePath(article.slug))
  const [site, related] = await Promise.all([
    getSite(),
    category ? getArticles({ category: category.id, exclude: article.id, limit: 4 }) : null,
  ])
  const published = article.publishedAt ?? article.createdAt
  // Show "Updated" only for real edits, not the save that published it.
  const updated = new Date(article.updatedAt).getTime() - new Date(published).getTime() > 10 * 60_000 ? article.updatedAt : null

  const crumbs = [{ name: 'Home', href: '/' }, ...(category ? [{ name: category.name, href: `/${category.slug}` }] : []), { name: article.title, href: articlePath(article.slug) }]

  return (
    <div className="mx-auto max-w-6xl px-4">
      <div className="grid gap-10 pt-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article lang={article.language ?? 'ne'} className="min-w-0">
          <Breadcrumbs items={crumbs} />
          {category && (
            <Link href={`/${category.slug}`} className="mt-4 inline-block text-sm font-semibold uppercase tracking-wide text-brand-orange hover:underline">
              {category.name}
            </Link>
          )}
          <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">{article.title}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{article.excerpt}</p>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-y py-3">
            <div className="flex items-center gap-3">
              {authorPhoto && <Image src={authorPhoto.url!} alt="" width={44} height={44} className="size-11 rounded-full object-cover" />}
              <div className="text-sm" lang="en">
                {author && (
                  <Link href={authorPath(author.id)} rel="author" className="font-semibold hover:text-primary hover:underline">
                    {author.name}
                  </Link>
                )}
                <p className="text-muted-foreground">
                  <time dateTime={published}>{bsDate(published)} · {adDateTime(published)}</time>
                  {updated && <> · Updated <time dateTime={updated}>{adDateTime(updated)}</time></>}
                </p>
              </div>
            </div>
            <ShareMenu url={url} title={article.title} />
          </div>

          {cover && (
            <figure className="mt-6">
              <Image
                src={cover.url!}
                alt={cover.alt}
                width={cover.width ?? 1200}
                height={cover.height ?? 675}
                priority
                sizes="(min-width: 1024px) 760px, 100vw"
                className="h-auto w-full rounded-lg"
              />
              {cover.credit && <figcaption className="mt-2 text-sm text-muted-foreground">{cover.credit}</figcaption>}
            </figure>
          )}

          <RichText data={article.body} className="prose-news mt-8" />

          {article.tags && article.tags.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-2" aria-label="Tags">
              {article.tags.map((t) => (
                <li key={t}>
                  <Link href={`/search?q=${encodeURIComponent(t)}`} className="inline-block rounded-full bg-muted px-3 py-1 text-sm hover:bg-accent">#{t}</Link>
                </li>
              ))}
            </ul>
          )}

          <AdSlot ad={site.ads?.inArticle} className="mt-8" sizes="(min-width: 1024px) 760px, 100vw" />
          <ArticleEngagement articleId={article.id} url={url} title={article.title} />
        </article>

        <aside className="space-y-8 lg:sticky lg:top-28 lg:self-start">
          <AdSlot ad={site.ads?.sidebar} sizes="300px" />
          {related && related.docs.length > 0 && (
            <section aria-labelledby="related">
              <SectionTitle id="related">Related news</SectionTitle>
              <div className="divide-y">
                {related.docs.map((a) => (
                  <ArticleCard key={a.id} article={a} variant="compact" />
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'NewsArticle',
          '@id': `${url}#article`,
          mainEntityOfPage: url,
          headline: article.title.slice(0, 110),
          description: article.excerpt,
          image: [shareImage(article.cover, 1200, 675), shareImage(article.cover, 1200, 900), shareImage(article.cover, 1200, 1200)],
          datePublished: published,
          dateModified: article.updatedAt,
          inLanguage: article.language ?? 'ne',
          articleSection: category?.name,
          keywords: article.tags?.join(', '),
          author: author ? { '@type': 'Person', name: author.name, url: absoluteUrl(authorPath(author.id)) } : { '@type': 'Organization', name: SITE_NAME },
          publisher: { '@id': `${SITE_URL}/#org` },
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: absoluteUrl(c.href) })),
        }}
      />
    </div>
  )
}
