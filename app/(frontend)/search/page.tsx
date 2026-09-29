import type { Metadata } from 'next'
import { Search } from 'lucide-react'

import { ArticleCard } from '@/components/article-card'
import { Pager } from '@/components/pager'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { searchArticles } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Search',
  robots: { index: false, follow: true },
  alternates: { canonical: '/search' },
}

export default async function SearchPage({ searchParams }: PageProps<'/search'>) {
  const sp = await searchParams
  const q = (typeof sp.q === 'string' ? sp.q : '').trim().slice(0, 100)
  const page = Math.max(1, Math.floor(Number(sp.page)) || 1)
  const res = q ? await searchArticles(q, page) : null

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8">
      <h1 className="text-3xl font-bold">Search</h1>
      <form action="/search" role="search" className="mt-5 flex max-w-2xl gap-2">
        <label htmlFor="q" className="sr-only">Search news</label>
        <Input id="q" name="q" type="search" defaultValue={q} placeholder="Search news… (Nepali or English)" className="h-12 text-base" autoFocus={!q} />
        <Button type="submit" size="lg" className="h-12 gap-2 px-5">
          <Search className="size-4" /> Search
        </Button>
      </form>
      {res && (
        <>
          <p className="mt-6 text-muted-foreground" role="status">
            {res.totalDocs ? `${res.totalDocs} result${res.totalDocs === 1 ? '' : 's'} for “${q}”` : `No news found for “${q}”. Try a different word.`}
          </p>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {res.docs.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
          <Pager page={page} totalPages={res.totalPages} basePath="/search" extra={`q=${encodeURIComponent(q)}`} />
        </>
      )}
    </div>
  )
}
