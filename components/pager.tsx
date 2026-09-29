import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Plain links (crawlable) — ?page=N, page 1 has no param.
export function Pager({ page, totalPages, basePath, extra = '' }: { page: number; totalPages: number; basePath: string; extra?: string }) {
  if (totalPages <= 1) return null
  const href = (n: number) => (n === 1 ? `${basePath}${extra ? `?${extra}` : ''}` : `${basePath}?${extra ? `${extra}&` : ''}page=${n}`)
  const cls = 'inline-flex h-11 items-center gap-1 rounded-lg border px-4 text-sm font-medium hover:bg-muted'
  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-3">
      {page > 1 && <Link href={href(page - 1)} rel="prev" className={cls}><ChevronLeft className="size-4" /> Newer</Link>}
      <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
      {page < totalPages && <Link href={href(page + 1)} rel="next" className={cls}>Older <ChevronRight className="size-4" /></Link>}
    </nav>
  )
}
