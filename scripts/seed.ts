// npm run seed — creates starter categories and pages if they don't exist yet. Safe to re-run.
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })

const categories = [
  ['समाचार / News', 'news'],
  ['राजनीति / Politics', 'politics'],
  ['समाज / Society', 'society'],
  ['अर्थ / Economy', 'economy'],
  ['खेलकुद / Sports', 'sports'],
  ['मनोरञ्जन / Entertainment', 'entertainment'],
  ['प्रदेश / Province', 'province'],
  ['अन्तर्वार्ता / Interview', 'interview'],
  ['विचार / Opinion', 'opinion'],
] as const

for (const [i, [name, slug]] of categories.entries()) {
  const exists = await payload.count({ collection: 'categories', where: { slug: { equals: slug } } })
  if (!exists.totalDocs) await payload.create({ collection: 'categories', data: { name, slug, order: (i + 1) * 10 } })
}

const paragraph = (text: string) => ({
  type: 'paragraph', version: 1, format: '' as const, indent: 0, direction: 'ltr' as const, textFormat: 0,
  children: [{ type: 'text', version: 1, text, format: 0, detail: 0, mode: 'normal', style: '' }],
})
const body = (...lines: string[]) => ({
  root: { type: 'root', version: 1, format: '' as const, indent: 0, direction: 'ltr' as const, children: lines.map(paragraph) },
})

const pages = [
  ['About us', 'about', body('Mission Khabar Media (मिसन खबर मिडिया) is a Nepali news and entertainment media run by Mission Khabar Pvt. Ltd.', 'सत्य तथ्य निष्पक्ष समाचार र मनोरञ्जन — true, factual and fair news and entertainment.', 'Edit this page in Admin → Pages.')],
  ['Advertise with us', 'advertise', body('Reach readers across Nepal on our website, Facebook page and YouTube channel.', 'Contact us for rates and ad placements. Edit this page in Admin → Pages.')],
  ['Privacy policy', 'privacy', body('We collect only what we need to run this website: your name, email and username if you create an account, and your comments and likes.', 'We never sell your data. You can delete your account and all your comments and likes at any time from the My account page.', 'We use Google Analytics to understand which news is read. Edit this page in Admin → Pages.')],
  ['Contact', 'contact', body('Have a news tip, feedback or an advertising enquiry? Send us a message using the form, or reach us by phone or email.')],
] as const

for (const [title, slug, content] of pages) {
  const exists = await payload.count({ collection: 'pages', where: { slug: { equals: slug } } })
  if (!exists.totalDocs) await payload.create({ collection: 'pages', data: { title, slug, body: content, _status: 'published' } })
}

payload.logger.info('Seed done: categories and pages are ready. Create your admin account at /admin.')
process.exit(0)
