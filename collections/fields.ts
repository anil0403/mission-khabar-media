import type { CollectionSlug, TextField } from 'payload'

import { slugify } from '@/lib/slug'

/** Latin URL slug, auto-filled from `from` (Devanagari is transliterated). Editable, unique, auto-deduped. */
export const slugField = (from: string): TextField => ({
  name: 'slug',
  type: 'text',
  unique: true,
  index: true,
  admin: { position: 'sidebar', description: 'Web address. Leave empty to auto-generate.' },
  hooks: {
    beforeValidate: [
      async ({ value, data, req, collection, originalDoc }) => {
        const source = (value as string) || (data?.[from] as string)
        if (!source) return value // partial update that doesn't touch slug/title
        let slug = slugify(source) || `post-${Date.now().toString(36)}`
        if (!collection) return slug
        const taken = await req.payload.count({
          collection: collection.slug as CollectionSlug,
          where: { slug: { equals: slug }, ...(originalDoc?.id ? { id: { not_equals: originalDoc.id } } : {}) },
          req,
        })
        if (taken.totalDocs) slug = `${slug}-${Date.now().toString(36).slice(-4)}`
        return slug
      },
    ],
  },
})
