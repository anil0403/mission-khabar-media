import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import { ArticleCard } from '@/components/article-card'
import { JsonLd } from '@/components/json-ld'
import { Pager } from '@/components/pager'
import { asMedia, authorPath } from '@/lib/media'
import { getArticles, getAuthor } from '@/lib/queries'
import { absoluteUrl, SITE_URL } from '@/lib/site'

async function load(id: string) {
  if (!/^\d+$/.test(id)) notFound()
  const author = await getAuthor(id)
  if (!author) notFound()
  return author
}

const pageNum = (v: string | string[] | undefined) => Math.max(1, Math.floor(Number(v)) || 1)

export async function generateMetadata({ params, searchParams }: PageProps<'/author/[id]'>): Promise<Metadata> {
  const { id } = await params
  const author = await load(id)
  const n = pageNum((await searchParams).page)
  return {
    title: n > 1 ? `${author.name} — Page ${n}` : author.name,
    description: author.bio || `News by ${author.name} on Mission Khabar Media.`,
    alternates: { canonical: n > 1 ? `${authorPath(id)}?page=${n}` : authorPath(id) },
    openGraph: { type: 'profile', title: author.name },
  }
}

export default async function AuthorPage({ params, searchParams }: PageProps<'/author/[id]'>) {
  const { id } = await params
  const author = await load(id)
  const page = pageNum((await searchParams).page)
  const res = await getArticles({ author: id, page, limit: 12 })
  const photo = asMedia(author.photo)

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8">
      <header className="flex items-center gap-5 border-b pb-6">
        {photo && <Image src={photo.url!} alt="" width={96} height={96} className="size-24 rounded-full object-cover" />}
        <div>
          <p className="text-sm text-muted-foreground">Author</p>
          <h1 className="text-3xl font-bold">{author.name}</h1>
          {author.bio && <p className="mt-2 max-w-2xl text-muted-foreground">{author.bio}</p>}
        </div>
      </header>
      {!res.docs.length && <p className="py-16 text-center text-muted-foreground">No published news yet.</p>}
      <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {res.docs.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>
      <Pager page={page} totalPages={res.totalPages} basePath={authorPath(id)} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ProfilePage',
          mainEntity: {
            '@type': 'Person',
            name: author.name,
            url: absoluteUrl(authorPath(id)),
            description: author.bio ?? undefined,
            image: photo?.url ? (photo.url.startsWith('http') ? photo.url : absoluteUrl(photo.url)) : undefined,
            worksFor: { '@id': `${SITE_URL}/#org` },
          },
        }}
      />
    </div>
  )
}
