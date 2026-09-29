import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export function Breadcrumbs({ items }: { items: { name: string; href: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {items.map((c, i) => (
          <li key={c.href} className="flex min-w-0 items-center gap-1">
            {i > 0 && <ChevronRight className="size-3.5 shrink-0" aria-hidden />}
            {i < items.length - 1 ? (
              <Link href={c.href} className="hover:text-primary hover:underline">{c.name}</Link>
            ) : (
              <span aria-current="page" className="line-clamp-1">{c.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
