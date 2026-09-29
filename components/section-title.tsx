import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export function SectionTitle({ id, href, children }: { id: string; href?: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center justify-between border-b-2 border-brand-navy">
      <h2 id={id} className="-mb-0.5 border-b-2 border-brand-red pb-2 text-xl font-bold">{children}</h2>
      {href && (
        <Link href={href} className="flex items-center gap-0.5 text-sm font-medium text-primary hover:underline">
          More <ChevronRight className="size-4" />
        </Link>
      )}
    </div>
  )
}
