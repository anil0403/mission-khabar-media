import type { Category, Media, User } from '@/payload-types'

import { cloudinaryTransform } from './cloudinary-loader'
import { absoluteUrl } from './site'

type Rel<T> = T | number | string | null | undefined

export const asMedia = (m: Rel<Media>) => (m && typeof m === 'object' && m.url ? m : null)
export const asCategory = (c: Rel<Category>) => (c && typeof c === 'object' ? c : null)
export const asUser = (u: Rel<User>) => (u && typeof u === 'object' ? u : null)

/** Absolute URL of a social-share image in the given crop (defaults to 1200×630). */
export function shareImage(m: Rel<Media>, w = 1200, h = 630) {
  const media = asMedia(m)
  if (!media?.url) return absoluteUrl('/og-default.jpg')
  if (media.url.startsWith('http')) return cloudinaryTransform(media.url, `c_fill,g_auto,w_${w},h_${h},f_jpg,q_auto`)
  return absoluteUrl(media.url)
}

export const articlePath = (slug?: string | null) => `/news/${slug ?? ''}`
export const categoryPath = (slug?: string | null) => `/${slug ?? ''}`
export const authorPath = (id: number | string) => `/author/${id}`
