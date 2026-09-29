'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const submit = async (form: FormData) => {
    setBusy(true)
    // Same message whether or not the email exists (don't reveal accounts).
    await authClient.requestPasswordReset({ email: String(form.get('email')), redirectTo: '/reset-password' })
    setBusy(false)
    setSent(true)
  }
  return (
    <>
      <h1 className="text-2xl font-bold">Forgot your password?</h1>
      {sent ? (
        <p role="status" className="mt-6 rounded-lg bg-accent p-4 text-accent-foreground">If an account exists for that email, we sent a link to reset your password. Check your inbox.</p>
      ) : (
        <form action={submit} className="mt-6 space-y-4">
          <p className="text-muted-foreground">Enter your email and we&apos;ll send you a reset link.</p>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" className="h-11 text-base" />
          </div>
          <Button type="submit" size="lg" className="h-11 w-full text-base" disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" />} Send reset link
          </Button>
        </form>
      )}
    </>
  )
}
