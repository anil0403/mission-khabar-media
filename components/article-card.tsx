import Image from 'next/image'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import { articlePath, asCategory, asMedia } from '@/lib/media'
import { adDateTime } from '@/lib/nepali-date'
import type { Article } from '@/payload-types'

export type CardArticle = Pick<Article, 'id' | 'title' | 'slug' | 'excerpt' | 'cover' | 'category' | 'publishedAt' | 'language'>

type Variant = 'hero' | 'default' | 'compact'

export function ArticleCard({ article, variant = 'default', priority, showCategory = true }: { article: CardArticle; variant?: Variant; priority?: boolean; showCategory?: boolean }) {
  const cover = asMedia(article.cover)
  const category = asCategory(article.category)
  const href = articlePath(article.slug)

  if (variant === 'compact') {
    return (
      <article lang={article.language ?? undefined} className="group flex gap-3 py-3">
        {cover && (
          <Link href={href} className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-md bg-muted" tabIndex={-1} aria-hidden>
            <Image src={cover.url!} alt="" fill sizes="112px" className="object-cover" />
          </Link>
        )}
        <div className="min-w-0">
          <h3 className="line-clamp-3 font-semibold leading-snug group-hover:text-primary">
            <Link href={href}>{article.title}</Link>
          </h3>
          {article.publishedAt && <time dateTime={article.publishedAt} className="mt-1 block text-xs text-muted-foreground">{adDateTime(article.publishedAt)}</time>}
        </div>
      </article>
    )
  }

  const hero = variant === 'hero'
  return (
    <article lang={article.language ?? undefined} className="group flex flex-col">
      {cover && (
        <Link href={href} className="relative block aspect-[16/9] overflow-hidden rounded-lg bg-muted" tabIndex={-1} aria-hidden>
          <Image
            src={cover.url!}
            alt=""
            fill
            priority={priority}
            sizes={hero ? '(min-width: 1024px) 66vw, 100vw' : '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none"
          />
        </Link>
      )}
      <div className="mt-3">
        {showCategory && category && (
          <Link href={`/${category.slug}`} className="text-xs font-semibold uppercase tracking-wide text-brand-orange hover:underline">
            {category.name}
          </Link>
        )}
        <h3 className={cn('mt-1 font-bold leading-snug group-hover:text-primary', hero ? 'text-2xl sm:text-3xl' : 'text-lg')}>
          <Link href={href}>{article.title}</Link>
        </h3>
        {(hero || variant === 'default') && article.excerpt && (
          <p className={cn('mt-2 text-muted-foreground', hero ? 'line-clamp-3 text-base' : 'line-clamp-2 text-sm')}>{article.excerpt}</p>
        )}
        {article.publishedAt && <time dateTime={article.publishedAt} className="mt-2 block text-xs text-muted-foreground">{adDateTime(article.publishedAt)}</time>}
      </div>
    </article>
  )
}
