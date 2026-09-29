import type { CollectionConfig } from 'payload'

import { isEditor, nobody } from '@/lib/access'

// Written only by server actions (local API bypasses access). Editors moderate comments in /admin.
export const Comments: CollectionConfig = {
  slug: 'comments',
  admin: {
    useAsTitle: 'body',
    defaultColumns: ['body', 'readerName', 'article', 'status', 'createdAt'],
    group: 'Community',
    description: 'Reader comments. Set status to "Hidden" to remove one from the site.',
  },
  access: { read: isEditor, create: nobody, update: isEditor, delete: isEditor },
  fields: [
    { name: 'body', type: 'textarea', required: true, maxLength: 1000 },
    { name: 'article', type: 'relationship', relationTo: 'articles', required: true, index: true },
    { name: 'parent', type: 'relationship', relationTo: 'comments', index: true },
    { name: 'readerId', type: 'text', required: true, index: true },
    { name: 'readerName', type: 'text', required: true },
    { name: 'readerUsername', type: 'text' },
    { name: 'readerImage', type: 'text' },
    { name: 'mentions', type: 'text', hasMany: true, admin: { description: 'Usernames mentioned' } },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'visible',
      index: true,
      options: [
        { label: 'Visible', value: 'visible' },
        { label: 'Hidden', value: 'hidden' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
}

export const Likes: CollectionConfig = {
  slug: 'likes',
  admin: { hidden: true },
  access: { read: isEditor, create: nobody, update: nobody, delete: nobody },
  indexes: [{ fields: ['article', 'readerId'], unique: true }],
  fields: [
    { name: 'article', type: 'relationship', relationTo: 'articles', required: true, index: true },
    { name: 'readerId', type: 'text', required: true },
  ],
}
