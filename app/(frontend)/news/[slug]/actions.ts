'use server'

import * as community from '@/lib/community'

export async function toggleLike(articleId: number | string) {
  return community.toggleLike(articleId)
}

export async function addComment(articleId: number | string, body: string, parentId?: number | string | null) {
  return community.addComment(articleId, String(body ?? ''), parentId)
}

export async function deleteComment(id: number | string) {
  return community.deleteComment(id)
}
