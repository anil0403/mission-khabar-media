import { revalidateTag } from 'next/cache'

// Every public query is tagged 'content' (see lib/queries.ts). Any CMS change expires it all:
// simple and always correct. ponytail: per-doc tags if rebuild cost ever matters.
export function revalidateContent() {
  try {
    revalidateTag('content', { expire: 0 })
  } catch {
    // outside a Next request (seed script, CLI) — nothing cached to expire
  }
}

export const revalidateHooks = {
  afterChange: [() => revalidateContent()],
  afterDelete: [() => revalidateContent()],
}
