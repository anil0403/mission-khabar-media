'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'

function ResetForm() {
  const token = useSearchParams().get('token')
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle')
  const [error, setError] = useState<string | null>(null)

  if (!token) return <p className="mt-6 text-destructive">This reset link is invalid or has expired. <Link href="/forgot-password" className="underline">Request a new one</Link>.</p>
  if (state === 'done') return <p role="status" className="mt-6 rounded-lg bg-accent p-4 text-accent-foreground">Password changed. <Link href="/login" className="font-semibold underline">Sign in</Link> with your new password.</p>

  const submit = async (form: FormData) => {
    const password = String(form.get('password'))
    if (password !== form.get('confirm')) return setError('Passwords do not match.')
    setState('busy')
    const { error } = await authClient.resetPassword({ newPassword: password, token })
    if (error) {
      setError(error.message || 'This reset link is invalid or has expired.')
      setState('idle')
    } else setState('done')
  }
  return (
    <form action={submit} className="mt-6 space-y-4">
      {error && <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
      <div className="space-y-1.5">
        <Label htmlFor="password">New password</Label>
        <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" className="h-11 text-base" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm">Confirm new password</Label>
        <Input id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" className="h-11 text-base" />
      </div>
      <Button type="submit" size="lg" className="h-11 w-full text-base" disabled={state === 'busy'}>
        {state === 'busy' && <Loader2 className="size-4 animate-spin" />} Change password
      </Button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">Choose a new password</h1>
      <Suspense>
        <ResetForm />
      </Suspense>
    </>
  )
}
