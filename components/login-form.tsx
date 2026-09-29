'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { authClient } from '@/lib/auth-client'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.96 10.96 0 0 0 12 1 11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  )
}

const errorText = (e: { message?: string; code?: string } | null) => e?.message || 'Something went wrong. Please try again.'

/** Sign in / sign up with email, or continue with Google. `returnTo` is where the reader lands afterwards. */
export function LoginForm({ returnTo = '/', onSignedIn, defaultTab = 'signin' }: { returnTo?: string; onSignedIn?: () => void; defaultTab?: 'signin' | 'signup' }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const google = async () => {
    setBusy(true)
    const { error } = await authClient.signIn.social({ provider: 'google', callbackURL: returnTo })
    if (error) {
      setError(errorText(error))
      setBusy(false)
    }
  }

  const signIn = async (form: FormData) => {
    setBusy(true)
    setError(null)
    const { error } = await authClient.signIn.email({ email: String(form.get('email')), password: String(form.get('password')), callbackURL: returnTo })
    setBusy(false)
    if (error) setError(error.status === 403 ? 'Please confirm your email first — we sent you a link.' : errorText(error))
    else onSignedIn?.()
  }

  const signUp = async (form: FormData) => {
    setBusy(true)
    setError(null)
    const { error } = await authClient.signUp.email({
      name: String(form.get('name')).trim(),
      email: String(form.get('email')).trim(),
      password: String(form.get('password')),
      username: String(form.get('username')).trim().toLowerCase(),
      callbackURL: returnTo,
    })
    setBusy(false)
    if (error) setError(errorText(error))
    else setNotice('Almost done! We sent a confirmation link to your email. Open it to activate your account.')
  }

  if (notice) return <p role="status" className="rounded-lg bg-accent p-4 text-accent-foreground">{notice}</p>

  return (
    <div className="space-y-5">
      <Button type="button" variant="outline" size="lg" className="h-11 w-full gap-2 text-base" onClick={google} disabled={busy}>
        <GoogleIcon /> Continue with Google
      </Button>
      <div className="flex items-center gap-3 text-xs uppercase text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or use email <span className="h-px flex-1 bg-border" />
      </div>
      {error && <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
      <Tabs defaultValue={defaultTab} onValueChange={() => setError(null)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign in</TabsTrigger>
          <TabsTrigger value="signup">Create account</TabsTrigger>
        </TabsList>
        <TabsContent value="signin">
          <form action={signIn} className="mt-4 space-y-4">
            <Field label="Email" name="email" type="email" autoComplete="email" />
            <Field label="Password" name="password" type="password" autoComplete="current-password" />
            <Submit busy={busy}>Sign in</Submit>
            <Link href="/forgot-password" className="block text-center text-sm text-primary hover:underline">Forgot password?</Link>
          </form>
        </TabsContent>
        <TabsContent value="signup">
          <form action={signUp} className="mt-4 space-y-4">
            <Field label="Full name" name="name" autoComplete="name" maxLength={60} />
            <Field
              label="Username"
              name="username"
              autoComplete="username"
              pattern="[A-Za-z0-9_.]{3,30}"
              title="3–30 letters, numbers, _ or ."
              hint="Others can @mention you with this. Letters, numbers, _ and . only."
            />
            <Field label="Email" name="email" type="email" autoComplete="email" />
            <Field label="Password" name="password" type="password" autoComplete="new-password" minLength={8} hint="At least 8 characters." />
            <Submit busy={busy}>Create account</Submit>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Field({ label, name, hint, ...props }: { label: string; name: string; hint?: string } & React.ComponentProps<'input'>) {
  const id = `f-${name}`
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={name} required className="h-11 text-base" aria-describedby={hint ? `${id}-hint` : undefined} {...props} />
      {hint && <p id={`${id}-hint`} className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function Submit({ busy, children }: { busy: boolean; children: React.ReactNode }) {
  return (
    <Button type="submit" size="lg" className="h-11 w-full text-base" disabled={busy}>
      {busy && <Loader2 className="size-4 animate-spin" />} {children}
    </Button>
  )
}
