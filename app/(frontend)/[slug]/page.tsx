import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ArticleCard } from '@/components/article-card'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { JsonLd } from '@/components/json-ld'
import { Pager } from '@/components/pager'
import { RichText } from '@/components/rich-text'
import { shareImage } from '@/lib/media'
import { getArticles, getCategory, getPage } from '@/lib/queries'
import { absoluteUrl } from '@/lib/site'

// One URL space for categories (/politics) and CMS pages (/about). Categories win on a clash.
async function resolve(slug: string) {
  const category = await getCategory(slug)
  if (category) return { category }
  const page = await getPage(slug)
  if (page) return { page }
  notFound()
}

const pageNum = (v: string | string[] | undefined) => Math.max(1, Math.floor(Number(v)) || 1)

export async function generateMetadata({ params, searchParams }: PageProps<'/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const r = await resolve(slug)
  const n = pageNum((await searchParams).page)
  const doc = r.category ?? r.page!
  const name = r.category?.name ?? r.page!.title
  const title = doc.meta?.title ? { absolute: doc.meta.title } : n > 1 ? `${name} — Page ${n}` : name
  const description = doc.meta?.description || r.category?.description || `${name} — Mission Khabar Media`
  const path = n > 1 ? `/${slug}?page=${n}` : `/${slug}`
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: name, description, url: path, images: [shareImage(doc.meta?.image)] },
  }
}

export default async function SlugPage({ params, searchParams }: PageProps<'/[slug]'>) {
  const { slug } = await params
  const r = await resolve(slug)

  if (r.page) {
    return (
      <article className="mx-auto max-w-3xl px-4 pt-6">
        <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: r.page.title, href: `/${slug}` }]} />
        <h1 className="mt-4 text-3xl font-bold">{r.page.title}</h1>
        <RichText data={r.page.body} className="prose-news mt-6" />
      </article>
    )
  }

  const category = r.category!
  const page = pageNum((await searchParams).page)
  const res = await getArticles({ category: category.id, page, limit: 12 })
  if (page > 1 && !res.docs.length) notFound()
  const [lead, ...rest] = res.docs

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: category.name, href: `/${slug}` }]} />
      <header className="mt-4 border-b-2 border-brand-navy pb-3">
        <h1 className="text-3xl font-bold">{category.name}</h1>
        {category.description && <p className="mt-2 text-muted-foreground">{category.description}</p>}
      </header>

      {!lead && <p className="py-16 text-center text-muted-foreground">No news in this section yet.</p>}
      {lead && page === 1 && (
        <div className="mt-8">
          <ArticleCard article={lead} variant="hero" priority showCategory={false} />
        </div>
      )}
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {(page === 1 ? rest : res.docs).map((a) => (
          <ArticleCard key={a.id} article={a} showCategory={false} />
        ))}
      </div>
      <Pager page={page} totalPages={res.totalPages} basePath={`/${slug}`} />

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
            { '@type': 'ListItem', position: 2, name: category.name, item: absoluteUrl(`/${slug}`) },
          ],
        }}
      />
    </div>
  )
}
