import Image from 'next/image'
import Link from 'next/link'

import { SITE_NAME, SITE_NAME_NE } from '@/lib/site'
import type { Category, Site } from '@/payload-types'

export function SiteFooter({ site, categories }: { site: Site; categories: Pick<Category, 'id' | 'name' | 'slug'>[] }) {
  const social = Object.entries(site.social ?? {}).filter(([k, v]) => k !== 'id' && typeof v === 'string' && v) as [string, string][]
  const label: Record<string, string> = { facebook: 'Facebook', youtube: 'YouTube', tiktok: 'TikTok', instagram: 'Instagram', x: 'X (Twitter)' }
  const year = new Date().getFullYear()

  return (
    <footer className="mt-16 bg-brand-navy text-white/85">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <Image src="/logo.webp" alt="" width={56} height={56} unoptimized className="size-14 rounded-full bg-white" />
            <div>
              <p className="text-lg font-bold text-white">{SITE_NAME_NE}</p>
              <p className="text-sm">{SITE_NAME}</p>
            </div>
          </div>
          {site.tagline && <p className="mt-4 text-sm">{site.tagline}</p>}
          {site.registration?.pressCouncil && <p className="mt-3 text-sm">Press Council Nepal Reg. No.: {site.registration.pressCouncil}</p>}
          {site.registration?.company && <p className="text-sm">Company Reg. No.: {site.registration.company}</p>}
        </div>

        <div>
          <h2 className="font-semibold text-white">Sections</h2>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {categories.map((c) => (
              <li key={c.id}><Link href={`/${c.slug}`} className="hover:text-white hover:underline">{c.name}</Link></li>
            ))}
            <li><Link href="/videos" className="hover:text-white hover:underline">Videos</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-white">Our team</h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {(site.team ?? []).map((t) => (
              <li key={t.id ?? t.name}><span className="text-white/60">{t.role}:</span> {t.name}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-white">Contact</h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {site.contact?.address && <li>{site.contact.address}</li>}
            {site.contact?.phone && <li><a href={`tel:${site.contact.phone}`} className="hover:text-white hover:underline">{site.contact.phone}</a></li>}
            {site.contact?.email && <li><a href={`mailto:${site.contact.email}`} className="hover:text-white hover:underline">{site.contact.email}</a></li>}
          </ul>
          {social.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2 text-sm">
              {social.map(([k, url]) => (
                <li key={k}>
                  <a href={url} target="_blank" rel="noopener me" className="inline-block rounded-md bg-white/10 px-3 py-1.5 hover:bg-white/20">{label[k] ?? k}</a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm">
          <p>© {year} Mission Khabar Pvt. Ltd. All rights reserved.</p>
          <ul className="flex flex-wrap gap-4">
            <li><Link href="/about" className="hover:text-white hover:underline">About</Link></li>
            <li><Link href="/contact" className="hover:text-white hover:underline">Contact</Link></li>
            <li><Link href="/advertise" className="hover:text-white hover:underline">Advertise</Link></li>
            <li><Link href="/privacy" className="hover:text-white hover:underline">Privacy</Link></li>
            <li><a href="/feed.xml" className="hover:text-white hover:underline">RSS</a></li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
