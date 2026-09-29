import type { Metadata } from 'next'

import { VideoStrip } from '@/components/video-strip'
import { getSite } from '@/lib/queries'
import { latestVideos } from '@/lib/youtube'

export const metadata: Metadata = {
  title: 'Videos',
  description: 'Latest videos from Mission Khabar Media on YouTube.',
  alternates: { canonical: '/videos' },
}

export default async function VideosPage() {
  const [videos, site] = await Promise.all([latestVideos(15), getSite()])
  const channel = site.social?.youtube || 'https://www.youtube.com/@MissionKhabarMedia'
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-brand-navy pb-3">
        <h1 className="text-3xl font-bold">Videos</h1>
        <a href={`${channel}?sub_confirmation=1`} target="_blank" rel="noopener" className="inline-flex h-10 items-center rounded-lg bg-brand-red px-4 text-sm font-semibold text-white hover:bg-brand-red/90">
          Subscribe on YouTube
        </a>
      </div>
      {videos.length ? (
        <div className="mt-8"><VideoStrip videos={videos} /></div>
      ) : (
        <p className="py-16 text-center text-muted-foreground">
          Watch our latest videos on <a href={channel} className="text-primary underline" target="_blank" rel="noopener">YouTube</a>.
        </p>
      )}
    </div>
  )
}
