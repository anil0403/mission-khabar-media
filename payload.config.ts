import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { resendAdapter } from '@payloadcms/email-resend'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import sharp from 'sharp'

import { Articles } from './collections/Articles'
import { Categories } from './collections/Categories'
import { Comments, Likes } from './collections/Community'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Site } from './collections/Site'
import { Users } from './collections/Users'
import { cloudinaryAdapter } from './lib/cloudinary-adapter'
import { SITE_NAME, SITE_URL } from './lib/site'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const env = process.env

export default buildConfig({
  serverURL: SITE_URL,
  admin: {
    user: Users.slug,
    meta: { titleSuffix: ` — ${SITE_NAME}` },
    importMap: { baseDir: dirname },
  },
  collections: [Articles, Categories, Pages, Media, Comments, Likes, Users],
  globals: [Site],
  editor: lexicalEditor(),
  secret: env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    // Migrations need a direct (non-pooled) Neon connection; the app uses the pooled one.
    // Neon's direct host is the pooled host without "-pooler", so DATABASE_URL_DIRECT is optional.
    pool: {
      connectionString: env.PAYLOAD_MIGRATE
        ? env.DATABASE_URL_DIRECT || env.DATABASE_URL?.replace('-pooler.', '.')
        : env.DATABASE_URL,
    },
    migrationDir: path.resolve(dirname, 'migrations'),
    push: false, // schema changes only via `npm run migrate:create` + `npm run migrate`, locally too
  }),
  // No Resend key (local dev) → Payload prints emails to the console.
  email: env.RESEND_API_KEY
    ? resendAdapter({
        apiKey: env.RESEND_API_KEY,
        defaultFromAddress: env.EMAIL_FROM || 'onboarding@resend.dev',
        defaultFromName: env.EMAIL_FROM_NAME || SITE_NAME,
      })
    : undefined,
  sharp,
  plugins: [
    // No Cloudinary keys (local dev) → uploads are stored on disk in /media.
    cloudStoragePlugin({
      enabled: Boolean(env.CLOUDINARY_CLOUD_NAME),
      alwaysInsertFields: true, // same DB schema with or without Cloudinary
      collections: { media: { adapter: cloudinaryAdapter, disablePayloadAccessControl: true } },
    }),
    seoPlugin({
      collections: ['articles', 'categories', 'pages'],
      uploadsCollection: 'media',
      tabbedUI: false,
      generateTitle: ({ doc }) => `${doc?.title ?? doc?.name ?? ''} | ${SITE_NAME}`,
      generateDescription: ({ doc }) => doc?.excerpt ?? doc?.description ?? '',
      generateImage: ({ doc }) => doc?.cover,
      generateURL: ({ doc, collectionSlug }) =>
        `${SITE_URL}${collectionSlug === 'articles' ? '/news' : ''}/${doc?.slug ?? ''}`,
    }),
  ],
})
