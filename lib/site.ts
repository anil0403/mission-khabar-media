export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
export const SITE_NAME = 'Mission Khabar Media'
export const SITE_NAME_NE = 'मिसन खबर मिडिया'
export const SITE_DESCRIPTION =
  'Mission Khabar Media (मिसन खबर मिडिया) — सत्य तथ्य निष्पक्ष समाचार र मनोरञ्जन. Latest news from Nepal: politics, society, sports and entertainment.'

// Production only when Vercel says so, or when the VPS sets NEXT_PUBLIC_INDEXABLE=true.
export const INDEXABLE = process.env.VERCEL_ENV
  ? process.env.VERCEL_ENV === 'production'
  : process.env.NEXT_PUBLIC_INDEXABLE === 'true'

export const absoluteUrl = (path: string) => `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
