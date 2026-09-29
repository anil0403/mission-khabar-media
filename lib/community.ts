import 'server-only'
import { headers } from 'next/headers'
import type { Where } from 'payload'

import { auth, db } from './auth'
import { parseMentions } from './mentions'
import { payload } from './queries'
import { absoluteUrl, SITE_NAME } from './site'

export type CommentView = {
  id: number | string
  body: string
  parent: number | string | null
  readerName: string
  readerUsername: string | null
  readerImage: string | null
  mentions: string[]
  createdAt: string
  mine: boolean
}

const PAGE_SIZE = 20

export async function currentReader() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user ?? null
}

async function publishedArticle(id: number | string) {
  const res = await (await payload()).find({
    collection: 'articles',
    where: { and: [{ id: { equals: id } }, { _status: { equals: 'published' } }] },
    limit: 1,
    depth: 0,
    select: { title: true, slug: true },
  })
  return res.docs[0] ?? null
}

export async function getEngagement(articleId: number | string, page = 1) {
  const p = await payload()
  const reader = await currentReader()
  const visible: { and: Where[] } = { and: [{ article: { equals: articleId } }, { status: { equals: 'visible' } }] }
  const [likes, liked, top] = await Promise.all([
    p.count({ collection: 'likes', where: { article: { equals: articleId } } }),
    reader
      ? p.count({ collection: 'likes', where: { and: [{ article: { equals: articleId } }, { readerId: { equals: reader.id } }] } })
      : null,
    p.find({ collection: 'comments', where: { and: [...visible.and, { parent: { exists: false } }] }, sort: '-createdAt', limit: PAGE_SIZE, page, depth: 0 }),
  ])
  const replies = top.docs.length
    ? await p.find({
        collection: 'comments',
        where: { and: [...visible.and, { parent: { in: top.docs.map((d) => d.id) } }] },
        sort: 'createdAt',
        limit: 500,
        depth: 0,
      })
    : { docs: [] }
  const view = (c: (typeof top.docs)[number]): CommentView => ({
    id: c.id,
    body: c.body,
    parent: (c.parent as number | string | null) ?? null,
    readerName: c.readerName,
    readerUsername: c.readerUsername ?? null,
    readerImage: c.readerImage ?? null,
    mentions: (c.mentions as string[] | null) ?? [],
    createdAt: c.createdAt,
    mine: reader?.id === c.readerId,
  })
  return {
    likes: likes.totalDocs,
    liked: Boolean(liked?.totalDocs),
    comments: [...top.docs, ...replies.docs].map(view),
    totalComments: top.totalDocs,
    hasMore: top.hasNextPage,
    reader: reader ? { id: reader.id, name: reader.name, emailVerified: reader.emailVerified } : null,
  }
}

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string }

async function requireReader(): Promise<Result<{ reader: NonNullable<Awaited<ReturnType<typeof currentReader>>> }>> {
  const reader = await currentReader()
  if (!reader) return { ok: false, error: 'Please sign in first.' }
  if (!reader.emailVerified) return { ok: false, error: 'Please confirm your email address first (check your inbox).' }
  return { ok: true, reader }
}

export async function toggleLike(articleId: number | string): Promise<Result<{ liked: boolean; likes: number }>> {
  const r = await requireReader()
  if (!r.ok) return r
  if (!(await publishedArticle(articleId))) return { ok: false, error: 'Article not found.' }
  const p = await payload()
  const mine: Where = { and: [{ article: { equals: articleId } }, { readerId: { equals: r.reader.id } }] }
  const deleted = await p.delete({ collection: 'likes', where: mine })
  let liked = false
  if (!deleted.docs.length) {
    try {
      await p.create({ collection: 'likes', data: { article: Number(articleId), readerId: r.reader.id } })
    } catch {
      // unique index hit by a double click — the like already exists
    }
    liked = true
  }
  const likes = await p.count({ collection: 'likes', where: { article: { equals: articleId } } })
  return { ok: true, liked, likes: likes.totalDocs }
}

export async function addComment(articleId: number | string, rawBody: string, parentId?: number | string | null): Promise<Result> {
  const r = await requireReader()
  if (!r.ok) return r
  const body = rawBody.trim()
  if (!body) return { ok: false, error: 'Comment is empty.' }
  if (body.length > 1000) return { ok: false, error: 'Comment is too long (max 1000 characters).' }
  const article = await publishedArticle(articleId)
  if (!article) return { ok: false, error: 'Article not found.' }
  const p = await payload()

  // ponytail: DB-backed rate limit, one comment per 15s per reader.
  const recent = await p.count({
    collection: 'comments',
    where: { and: [{ readerId: { equals: r.reader.id } }, { createdAt: { greater_than: new Date(Date.now() - 15_000).toISOString() } }] },
  })
  if (recent.totalDocs) return { ok: false, error: 'Please wait a few seconds before commenting again.' }

  // Replies are one level deep: replying to a reply attaches to its top-level comment.
  let parent: number | null = null
  if (parentId) {
    const pc = await p.findByID({ collection: 'comments', id: parentId, depth: 0 }).catch(() => null)
    if (!pc || String(pc.article) !== String(articleId)) return { ok: false, error: 'Comment not found.' }
    parent = Number(pc.parent ?? pc.id)
  }

  const me = r.reader as typeof r.reader & { username?: string | null }
  const wanted = parseMentions(body).filter((u) => u !== me.username)
  const { rows: mentioned } = wanted.length
    ? await db.query<{ email: string; name: string; username: string }>(
        'select email, name, username from reader where username = any($1) and "emailVerified" = true',
        [wanted],
      )
    : { rows: [] }

  await p.create({
    collection: 'comments',
    data: {
      article: Number(articleId),
      parent,
      body,
      readerId: me.id,
      readerName: me.name,
      readerUsername: me.username ?? null,
      readerImage: me.image ?? null,
      mentions: mentioned.map((m) => m.username),
      status: 'visible',
    },
  })

  const link = absoluteUrl(`/news/${article.slug}#comments`)
  await Promise.allSettled(
    mentioned.map((m) =>
      p.sendEmail({
        to: m.email,
        subject: `${me.name} mentioned you on ${SITE_NAME}`,
        text: `Hi ${m.name},\n\n${me.name} mentioned you in a comment on "${article.title}":\n\n"${body.slice(0, 300)}"\n\nRead it here: ${link}`,
      }),
    ),
  )
  return { ok: true }
}

export async function deleteComment(id: number | string): Promise<Result> {
  const reader = await currentReader()
  if (!reader) return { ok: false, error: 'Please sign in first.' }
  const p = await payload()
  const own = await p.count({ collection: 'comments', where: { and: [{ id: { equals: id } }, { readerId: { equals: reader.id } }] } })
  if (!own.totalDocs) return { ok: false, error: 'Comment not found.' }
  // Replies first: deleting the parent first would null their `parent` (FK on delete set null).
  await p.delete({ collection: 'comments', where: { parent: { equals: id } } })
  await p.delete({ collection: 'comments', id })
  return { ok: true }
}

export async function searchReaders(q: string) {
  const term = q.replace(/[%_\\]/g, '').slice(0, 30)
  if (!term) return []
  const { rows } = await db.query<{ username: string; name: string; image: string | null }>(
    `select username, name, image from reader
     where username is not null and (username ilike $1 || '%' or name ilike '%' || $1 || '%')
     order by username limit 5`,
    [term],
  )
  return rows
}
