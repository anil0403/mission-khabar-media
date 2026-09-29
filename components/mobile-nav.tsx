'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import type { Category } from '@/payload-types'

export function MobileNav({ categories }: { categories: Pick<Category, 'id' | 'name' | 'slug'>[] }) {
  const [open, setOpen] = useState(false)
  const links = [{ href: '/', label: 'Home' }, ...categories.map((c) => ({ href: `/${c.slug}`, label: c.name })), { href: '/videos', label: 'Videos' }, { href: '/search', label: 'Search' }]
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon-lg" className="size-11 md:hidden" aria-label="Open menu" />}>
        <Menu className="size-6" />
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav aria-label="Categories">
          <ul className="px-2 pb-6">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={() => setOpen(false)} className="block rounded-md px-3 py-3 text-base font-medium hover:bg-muted">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
