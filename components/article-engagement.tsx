'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { Heart, Loader2, MessageCircle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { addComment, deleteComment, toggleLike } from '@/app/(frontend)/news/[slug]/actions'
import { LoginForm } from '@/components/login-form'
import { MentionTextarea } from '@/components/mention-textarea'
import { ShareMenu } from '@/components/share-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { initials } from '@/components/user-menu'
import { authClient } from '@/lib/auth-client'
import type { CommentView } from '@/lib/community'
import { splitMentions } from '@/lib/mentions'
import { timeAgo } from '@/lib/nepali-date'
import { cn } from '@/lib/utils'

type Data = { likes: number; liked: boolean; comments: CommentView[]; totalComments: number; hasMore: boolean }

export function ArticleEngagement({ articleId, url, title }: { articleId: number; url: string; title: string }) {
  const { data: session } = authClient.useSession()
  const [data, setData] = useState<Data | null>(null)
  const [page, setPage] = useState(1)
  const [loginOpen, setLoginOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  const load = useCallback(
    async (p = 1) => {
      const res = await fetch(`/api/engagement/${articleId}?page=${p}`, { cache: 'no-store' })
      if (!res.ok) return
      const next: Data = await res.json()
      setData((prev) => (p > 1 && prev ? { ...next, comments: [...prev.comments, ...next.comments] } : next))
      setPage(p)
    },
    [articleId],
  )

  // Reload when the reader signs in/out so "liked" and "mine" are right.
  const readerId = session?.user.id
  useEffect(() => {
    let cancelled = false
    fetch(`/api/engagement/${articleId}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Data | null) => {
        if (d && !cancelled) {
          setData(d)
          setPage(1)
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [articleId, readerId])

  const signedIn = Boolean(session)
  const verified = Boolean(session?.user.emailVerified)
  const requireLogin = () => {
    if (!signedIn) setLoginOpen(true)
    else if (!verified) toast.error('Please confirm your email address first (check your inbox).')
    return signedIn && verified
  }

  const like = () => {
    if (!requireLogin() || !data) return
    const optimistic = { ...data, liked: !data.liked, likes: data.likes + (data.liked ? -1 : 1) }
    setData(optimistic)
    startTransition(async () => {
      const res = await toggleLike(articleId)
      if (res.ok) setData((d) => d && { ...d, liked: res.liked, likes: res.likes })
      else {
        setData(data)
        toast.error(res.error)
      }
    })
  }

  const topLevel = data?.comments.filter((c) => !c.parent) ?? []
  const repliesOf = (id: CommentView['id']) => data?.comments.filter((c) => c.parent === id) ?? []

  return (
    <section id="comments" aria-labelledby="comments-title" className="mt-10 scroll-mt-28">
      <div className="flex flex-wrap items-center gap-3 border-y py-3">
        <Button
          variant={data?.liked ? 'default' : 'outline'}
          size="lg"
          className="h-10 gap-2 px-4"
          onClick={like}
          disabled={!data || pending}
          aria-pressed={data?.liked ?? false}
        >
          <Heart className={cn('size-4', data?.liked && 'fill-current')} />
          {data?.liked ? 'Liked' : 'Like'}
          {data ? <span className="tabular-nums">· {data.likes}</span> : null}
        </Button>
        <a href="#comment-box" className="inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium hover:bg-muted">
          <MessageCircle className="size-4" /> Comment{data ? ` · ${data.totalComments}` : ''}
        </a>
        <div className="ml-auto">
          <ShareMenu url={url} title={title} />
        </div>
      </div>

      <h2 id="comments-title" className="mt-8 text-xl font-bold">Comments</h2>

      <div id="comment-box" className="mt-4">
        {signedIn ? (
          <CommentForm articleId={articleId} onPosted={() => load(1)} disabled={!verified} />
        ) : (
          <button
            type="button"
            onClick={() => setLoginOpen(true)}
            className="w-full rounded-lg border border-dashed p-4 text-left text-muted-foreground hover:bg-muted"
          >
            Sign in to write a comment…
          </button>
        )}
        {signedIn && !verified && <p className="mt-2 text-sm text-destructive">Confirm your email address to start commenting (check your inbox).</p>}
      </div>

      <div className="mt-8 space-y-6">
        {!data && [0, 1].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
        {data && topLevel.length === 0 && <p className="text-muted-foreground">No comments yet — be the first.</p>}
        {topLevel.map((c) => (
          <CommentItem key={c.id} comment={c} onChange={() => load(1)}>
            <div className="mt-4 space-y-4 border-l-2 pl-4">
              {repliesOf(c.id).map((r) => (
                <CommentItem key={r.id} comment={r} onChange={() => load(1)} />
              ))}
              {signedIn && verified && <ReplyToggle articleId={articleId} parentId={c.id} onPosted={() => load(1)} />}
            </div>
          </CommentItem>
        ))}
        {data?.hasMore && (
          <Button variant="outline" size="lg" className="h-10 w-full" onClick={() => load(page + 1)}>
            Show more comments
          </Button>
        )}
      </div>

      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Join the conversation</DialogTitle>
            <DialogDescription>Sign in to like and comment. It&apos;s free.</DialogDescription>
          </DialogHeader>
          <LoginForm returnTo={typeof window === 'undefined' ? '/' : window.location.pathname + '#comments'} onSignedIn={() => setLoginOpen(false)} />
        </DialogContent>
      </Dialog>
    </section>
  )
}

function CommentForm({ articleId, parentId, onPosted, disabled, autoFocus }: { articleId: number; parentId?: CommentView['id']; onPosted: () => void; disabled?: boolean; autoFocus?: boolean }) {
  const [body, setBody] = useState('')
  const [pending, startTransition] = useTransition()
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const res = await addComment(articleId, body, parentId)
      if (!res.ok) return void toast.error(res.error)
      setBody('')
      toast.success('Comment posted')
      onPosted()
    })
  }
  return (
    <form onSubmit={submit} className="space-y-2">
      <label htmlFor={`c-${parentId ?? 'new'}`} className="sr-only">{parentId ? 'Write a reply' : 'Write a comment'}</label>
      <MentionTextarea
        id={`c-${parentId ?? 'new'}`}
        value={body}
        onChange={setBody}
        maxLength={1000}
        disabled={disabled || pending}
        autoFocus={autoFocus}
        placeholder={parentId ? 'Write a reply… (type @ to mention someone)' : 'Write a comment… (type @ to mention someone)'}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground tabular-nums">{body.length}/1000</span>
        <Button type="submit" size="lg" className="h-10 px-5" disabled={disabled || pending || !body.trim()}>
          {pending && <Loader2 className="size-4 animate-spin" />} {parentId ? 'Reply' : 'Post comment'}
        </Button>
      </div>
    </form>
  )
}

function ReplyToggle(props: { articleId: number; parentId: CommentView['id']; onPosted: () => void }) {
  const [open, setOpen] = useState(false)
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-sm font-medium text-primary hover:underline">
        Reply
      </button>
    )
  }
  return <CommentForm {...props} autoFocus onPosted={() => (setOpen(false), props.onPosted())} />
}

function CommentItem({ comment: c, onChange, children }: { comment: CommentView; onChange: () => void; children?: React.ReactNode }) {
  const [pending, startTransition] = useTransition()
  const remove = () => {
    if (!confirm('Delete this comment?')) return
    startTransition(async () => {
      const res = await deleteComment(c.id)
      if (!res.ok) return void toast.error(res.error)
      toast.success('Comment deleted')
      onChange()
    })
  }
  return (
    <div className="flex gap-3">
      <Avatar className="size-9 shrink-0">
        {c.readerImage && <AvatarImage src={c.readerImage} alt="" />}
        <AvatarFallback>{initials(c.readerName)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          <span className="font-semibold">{c.readerName}</span>
          {c.readerUsername && <span className="text-muted-foreground"> @{c.readerUsername}</span>}
          <span className="text-muted-foreground"> · <time dateTime={c.createdAt}>{timeAgo(c.createdAt)}</time></span>
        </p>
        <p className="mt-1 whitespace-pre-line break-words">
          {splitMentions(c.body, new Set(c.mentions)).map((s, i) =>
            s.username ? <span key={i} className="font-semibold text-primary">{s.text}</span> : s.text,
          )}
        </p>
        {c.mine && (
          <button type="button" onClick={remove} disabled={pending} className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive">
            <Trash2 className="size-3.5" /> Delete
          </button>
        )}
        {children}
      </div>
    </div>
  )
}
