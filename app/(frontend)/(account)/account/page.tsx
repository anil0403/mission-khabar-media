'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { authClient } from '@/lib/auth-client'

export default function AccountPage() {
  const { data, isPending, refetch } = authClient.useSession()
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  if (isPending) return <Skeleton className="h-64 w-full" />
  if (!data) {
    return (
      <p>
        You are signed out. <Link href="/login?next=/account" className="font-semibold text-primary underline">Sign in</Link>
      </p>
    )
  }
  const user = data.user as typeof data.user & { username?: string | null }

  const save = async (form: FormData) => {
    setBusy(true)
    const { error } = await authClient.updateUser({
      name: String(form.get('name')).trim(),
      username: String(form.get('username')).trim().toLowerCase(),
    })
    setBusy(false)
    if (error) toast.error(error.message || 'Could not save.')
    else {
      toast.success('Saved')
      refetch()
    }
  }

  const remove = async () => {
    if (!confirm('Delete your account permanently? Your likes and comments will be removed. This cannot be undone.')) return
    const { error } = await authClient.deleteUser({ callbackURL: '/' })
    if (error) return toast.error(error.message || 'Could not delete account. Sign in again and retry.')
    toast.success('Account deleted')
    router.push('/')
  }

  return (
    <>
      <h1 className="text-2xl font-bold">My account</h1>
      <p className="mt-1 text-muted-foreground">{user.email}</p>
      <form action={save} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" defaultValue={user.name} required maxLength={60} className="h-11 text-base" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="username">Username</Label>
          <Input id="username" name="username" defaultValue={user.username ?? ''} required pattern="[A-Za-z0-9_.]{3,30}" className="h-11 text-base" aria-describedby="username-hint" />
          <p id="username-hint" className="text-xs text-muted-foreground">Others mention you as @{user.username ?? 'username'}.</p>
        </div>
        <Button type="submit" size="lg" className="h-11 w-full text-base" disabled={busy}>
          {busy && <Loader2 className="size-4 animate-spin" />} Save changes
        </Button>
      </form>
      <Button
        variant="outline"
        size="lg"
        className="mt-3 h-11 w-full text-base"
        onClick={async () => {
          await authClient.signOut()
          router.push('/')
        }}
      >
        Sign out
      </Button>
      <Separator className="my-8" />
      <h2 className="font-semibold">Delete account</h2>
      <p className="mt-1 text-sm text-muted-foreground">Permanently removes your account, likes and comments.</p>
      <Button variant="destructive" size="lg" className="mt-3 h-11 w-full" onClick={remove}>
        Delete my account
      </Button>
    </>
  )
}
