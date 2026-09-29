import type { CollectionConfig } from 'payload'

import { isAdmin, isEditor, publishedOrStaff } from '@/lib/access'
import { revalidateHooks } from '@/lib/revalidate'
import { slugField } from './fields'

// About, Advertise, Privacy… served at /<slug>. The "contact" page's text shows above the contact form.
export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug', '_status'], group: 'Content' },
  versions: { drafts: true },
  access: { read: publishedOrStaff, create: isEditor, update: isEditor, delete: isAdmin },
  hooks: revalidateHooks,
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField('title'),
    { name: 'body', type: 'richText', required: true },
  ],
}
