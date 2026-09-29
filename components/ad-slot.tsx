import Image from 'next/image'

import { asMedia } from '@/lib/media'
import type { Site } from '@/payload-types'

type Slot = NonNullable<Site['ads']>['header']

// Renders nothing until an admin uploads an ad in Site settings → Ads.
export function AdSlot({ ad, className, sizes = '100vw' }: { ad?: Slot; className?: string; sizes?: string }) {
  const image = asMedia(ad?.image)
  if (!image) return null
  const img = <Image src={image.url!} alt={image.alt || 'Advertisement'} width={image.width ?? 1200} height={image.height ?? 200} sizes={sizes} className="h-auto w-full rounded-md" />
  return (
    <aside aria-label="Advertisement" className={className}>
      <p className="mb-1 text-center text-[11px] uppercase tracking-wider text-muted-foreground">Advertisement</p>
      {ad?.link ? <a href={ad.link} target="_blank" rel="sponsored noopener">{img}</a> : img}
    </aside>
  )
}
