import Image from 'next/image'

import { cn } from '@/lib/utils'
import type { Video } from '@/lib/youtube'

// Thumbnails link to YouTube (no heavy iframes on list pages).
export function VideoStrip({ videos, vertical }: { videos: Video[]; vertical?: boolean }) {
  return (
    <ul className={cn('grid gap-5', vertical ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4')}>
      {videos.map((v) => (
        <li key={v.id}>
          <a href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener" className="group block">
            <span className="relative block aspect-video overflow-hidden rounded-lg bg-muted">
              <Image src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" fill unoptimized sizes="(min-width: 1024px) 25vw, 100vw" className="object-cover" />
              <span aria-hidden className="absolute inset-0 m-auto flex size-12 items-center justify-center rounded-full bg-brand-red/90 text-white shadow-lg">▶</span>
            </span>
            <span className="mt-2 line-clamp-2 block font-semibold leading-snug group-hover:text-primary">{v.title}</span>
          </a>
        </li>
      ))}
    </ul>
  )
}
