import type { CollectionConfig } from 'payload'

import { anyone, isAdmin, isEditor } from '@/lib/access'
import { revalidateHooks } from '@/lib/revalidate'
import { slugField } from './fields'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'slug', 'order'], group: 'Content' },
  defaultSort: 'order',
  access: { read: anyone, create: isEditor, update: isEditor, delete: isAdmin },
  hooks: revalidateHooks,
  fields: [
    { name: 'name', type: 'text', required: true, admin: { description: 'e.g. "राजनीति / Politics"' } },
    slugField('name'),
    { name: 'order', type: 'number', defaultValue: 10, admin: { position: 'sidebar', description: 'Lower shows first in the menu.' } },
    { name: 'description', type: 'textarea' },
  ],
}
