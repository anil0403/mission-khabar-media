import Image from 'next/image'
import Link from 'next/link'
import { Search } from 'lucide-react'

import { bsDate } from '@/lib/nepali-date'
import { SITE_NAME, SITE_NAME_NE } from '@/lib/site'
import type { Category } from '@/payload-types'
import { MobileNav } from './mobile-nav'
import { UserMenu } from './user-menu'

export function SiteHeader({ categories, tagline }: { categories: Pick<Category, 'id' | 'name' | 'slug'>[]; tagline?: string | null }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <MobileNav categories={categories} />
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${SITE_NAME} — home`}>
          <Image src="/logo.webp" alt="" width={44} height={44} priority unoptimized className="size-11 rounded-full" />
          <span className="leading-tight">
            <span className="block text-lg font-bold text-brand-navy">{SITE_NAME_NE}</span>
            <span className="hidden text-xs text-muted-foreground sm:block">{tagline}</span>
          </span>
        </Link>
        <p className="ml-auto hidden text-sm text-muted-foreground md:block">{bsDate(new Date())}</p>
        <div className="ml-auto flex items-center gap-1 md:ml-4">
          <Link href="/search" aria-label="Search" className="inline-flex size-11 items-center justify-center rounded-lg hover:bg-muted">
            <Search className="size-5" />
          </Link>
          <UserMenu />
        </div>
      </div>
      <nav aria-label="Categories" className="hidden border-t bg-brand-navy md:block">
        <ul className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 text-[15px] font-medium text-white">
          <li><Link href="/" className="block px-3 py-2.5 hover:bg-white/10">Home</Link></li>
          {categories.map((c) => (
            <li key={c.id}>
              <Link href={`/${c.slug}`} className="block whitespace-nowrap px-3 py-2.5 hover:bg-white/10">{c.name}</Link>
            </li>
          ))}
          <li><Link href="/videos" className="block px-3 py-2.5 hover:bg-white/10">Videos</Link></li>
        </ul>
      </nav>
    </header>
  )
}
