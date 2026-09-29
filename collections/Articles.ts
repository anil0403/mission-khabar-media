import { APIError, type CollectionConfig } from 'payload'
import { BlocksFeature, lexicalEditor } from '@payloadcms/richtext-lexical'

import { isEditor, isReporter, isStaff, publishedOrStaff } from '@/lib/access'
import { revalidateHooks } from '@/lib/revalidate'
import { slugField } from './fields'

export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'author', '_status', 'publishedAt'],
    group: 'Content',
  },
  defaultSort: '-publishedAt',
  versions: { drafts: true, maxPerDoc: 20 },
  access: {
    read: publishedOrStaff,
    create: isStaff,
    // Reporters may only edit their own articles.
    update: ({ req }) => (isReporter(req) ? { author: { equals: req.user?.id } } : isStaff({ req })),
    delete: isEditor,
  },
  hooks: {
    beforeChange: [
      ({ req, data, originalDoc }) => {
        if (data._status === 'published') {
          if (isReporter(req)) throw new APIError('Reporters can save drafts only. Ask an editor to publish.', 403, null, true)
          data.publishedAt ||= new Date().toISOString()
        }
        data.author ||= req.user?.id
        // Keep old URLs working: remember the previous slug of a published article.
        if (originalDoc?._status === 'published' && originalDoc.slug && data.slug && data.slug !== originalDoc.slug) {
          const prev: { slug: string }[] = originalDoc.previousSlugs ?? []
          data.previousSlugs = [...prev.filter((p) => p.slug !== data.slug), { slug: originalDoc.slug }]
        }
        return data
      },
    ],
    // Remove the article's likes and comments (FKs would otherwise just be nulled).
    beforeDelete: [
      async ({ req, id }) => {
        await req.payload.delete({ collection: 'likes', where: { article: { equals: id } }, req })
        await req.payload.delete({ collection: 'comments', where: { article: { equals: id } }, req })
      },
    ],
    ...revalidateHooks,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      maxLength: 300,
      admin: { description: 'One or two sentences. Shown on the home page and on Google/Facebook.' },
    },
    { name: 'cover', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'body',
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          BlocksFeature({
            blocks: [
              {
                slug: 'youtube',
                labels: { singular: 'YouTube video', plural: 'YouTube videos' },
                fields: [{ name: 'url', type: 'text', required: true, admin: { description: 'Paste the YouTube link' } }],
              },
              {
                slug: 'facebook',
                labels: { singular: 'Facebook post/video', plural: 'Facebook posts' },
                fields: [{ name: 'url', type: 'text', required: true, admin: { description: 'Paste the Facebook post or video link' } }],
              },
            ],
          }),
        ],
      }),
    },
    slugField('title'),
    { name: 'previousSlugs', type: 'array', admin: { hidden: true }, fields: [{ name: 'slug', type: 'text', index: true }] },
    { name: 'category', type: 'relationship', relationTo: 'categories', required: true, index: true, admin: { position: 'sidebar' } },
    { name: 'author', type: 'relationship', relationTo: 'users', index: true, admin: { position: 'sidebar' } },
    { name: 'publishedAt', type: 'date', index: true, admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } } },
    {
      name: 'language',
      type: 'select',
      defaultValue: 'ne',
      options: [
        { label: 'Nepali', value: 'ne' },
        { label: 'English', value: 'en' },
      ],
      admin: { position: 'sidebar', description: 'Main language of the article.' },
    },
    { name: 'isBreaking', type: 'checkbox', label: 'Breaking news', admin: { position: 'sidebar' } },
    { name: 'isFeatured', type: 'checkbox', label: 'Featured on home page', admin: { position: 'sidebar' } },
    { name: 'tags', type: 'text', hasMany: true, admin: { position: 'sidebar' } },
  ],
}
