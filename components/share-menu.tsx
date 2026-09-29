'use client'

import { useSyncExternalStore } from 'react'
import { Link2, Share2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const networks = (url: string, title: string) => {
  const u = encodeURIComponent(url)
  const t = encodeURIComponent(title)
  return [
    { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { name: 'WhatsApp', href: `https://wa.me/?text=${t}%20${u}` },
    { name: 'Viber', href: `viber://forward?text=${t}%20${u}` },
    { name: 'X (Twitter)', href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
    { name: 'Telegram', href: `https://t.me/share/url?url=${u}&text=${t}` },
    { name: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { name: 'Email', href: `mailto:?subject=${t}&body=${u}` },
  ]
}

export function ShareMenu({ url, title }: { url: string; title: string }) {
  const copy = async () => {
    await navigator.clipboard.writeText(url)
    toast.success('Link copied')
  }
  // Phones: the system share sheet covers Messenger, Viber, WhatsApp, etc.
  const native = useSyncExternalStore(
    () => () => {},
    () => typeof navigator.share === 'function' && matchMedia('(pointer: coarse)').matches,
    () => false,
  )
  if (native) {
    return (
      <Button variant="outline" size="lg" className="h-10 gap-2 px-4" onClick={() => navigator.share({ title, url }).catch(() => {})}>
        <Share2 className="size-4" /> Share
      </Button>
    )
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="lg" className="h-10 gap-2 px-4" />}>
        <Share2 className="size-4" /> Share
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {networks(url, title).map((n) => (
          <DropdownMenuItem key={n.name} render={<a href={n.href} target="_blank" rel="noopener" />}>
            {n.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copy}>
          <Link2 /> Copy link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
