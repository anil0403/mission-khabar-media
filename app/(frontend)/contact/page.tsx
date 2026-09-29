import type { Metadata } from 'next'

import { RichText } from '@/components/rich-text'
import { getPage, getSite } from '@/lib/queries'
import { ContactForm } from './contact-form'

export const metadata: Metadata = {
  title: 'Contact us',
  description: 'Contact Mission Khabar Media — news tips, advertising and feedback.',
  alternates: { canonical: '/contact' },
}

export default async function ContactPage() {
  const [site, page] = await Promise.all([getSite(), getPage('contact')])
  const c = site.contact
  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 pt-8 md:grid-cols-2">
      <div>
        <h1 className="text-3xl font-bold">Contact us</h1>
        {page ? <RichText data={page.body} className="prose-news mt-4" /> : <p className="mt-4 text-muted-foreground">Have a news tip, feedback or an advertising enquiry? Send us a message.</p>}
        <dl className="mt-6 space-y-3">
          {c?.address && (<div><dt className="text-sm text-muted-foreground">Address</dt><dd>{c.address}</dd></div>)}
          {c?.phone && (<div><dt className="text-sm text-muted-foreground">Phone</dt><dd><a href={`tel:${c.phone}`} className="text-primary hover:underline">{c.phone}</a></dd></div>)}
          {c?.email && (<div><dt className="text-sm text-muted-foreground">Email</dt><dd><a href={`mailto:${c.email}`} className="text-primary hover:underline">{c.email}</a></dd></div>)}
        </dl>
      </div>
      <ContactForm />
    </div>
  )
}
