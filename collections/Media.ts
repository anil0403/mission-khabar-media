import type { CollectionConfig } from 'payload'

import { anyone, isEditor, isStaff } from '@/lib/access'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Content' },
  access: { read: anyone, create: isStaff, update: isStaff, delete: isEditor },
  upload: { mimeTypes: ['image/*'] },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: { description: 'Describe the image in a few words (for Google and blind readers).' },
    },
    { name: 'credit', type: 'text', admin: { description: 'Photo credit, e.g. "Photo: Ram Thapa"' } },
  ],
}
