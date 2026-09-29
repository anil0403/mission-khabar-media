import Link from 'next/link'

import { articlePath } from '@/lib/media'

export function BreakingTicker({ items }: { items: { id: number | string; title: string; slug?: string | null }[] }) {
  if (!items.length) return null
  return (
    <div className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-stretch px-4">
        <span className="flex shrink-0 items-center bg-brand-red px-3 py-2 text-sm font-bold uppercase tracking-wide text-white">Breaking</span>
        <ul className="flex min-w-0 flex-1 items-center gap-6 overflow-x-auto px-3 py-2 text-sm font-medium [scrollbar-width:none]">
          {items.map((a) => (
            <li key={a.id} className="shrink-0">
              <Link href={articlePath(a.slug)} className="hover:text-primary hover:underline">{a.title}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
