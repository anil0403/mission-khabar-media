export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
export const SITE_NAME = 'Mission Khabar Media'
export const SITE_NAME_NE = 'मिसन खबर मिडिया'
export const SITE_DESCRIPTION =
  'Mission Khabar Media (मिसन खबर मिडिया) — सत्य तथ्य निष्पक्ष समाचार र मनोरञ्जन. Latest news from Nepal: politics, society, sports and entertainment.'

// NEXT_PUBLIC_INDEXABLE wins when set (e.g. "false" on Vercel until the real domain is live);
// otherwise only Vercel production is indexable.
const flag = process.env.NEXT_PUBLIC_INDEXABLE
export const INDEXABLE = flag ? flag === 'true' : process.env.VERCEL_ENV === 'production'

export const absoluteUrl = (path: string) => `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
