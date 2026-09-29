'use client'

import { useActionState } from 'react'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { sendContact, type ContactState } from './actions'

export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContact, {})
  if (state.ok) return <p role="status" className="self-start rounded-lg bg-accent p-5 text-accent-foreground">Thank you! Your message has been sent. We&apos;ll get back to you soon.</p>
  return (
    <form action={action} className="space-y-4 rounded-xl border p-5">
      {state.error && <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>}
      <div className="space-y-1.5">
        <Label htmlFor="name">Your name</Label>
        <Input id="name" name="name" required maxLength={100} autoComplete="name" className="h-11 text-base" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" className="h-11 text-base" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" required maxLength={5000} className="min-h-36 text-base" />
      </div>
      <div aria-hidden className="absolute -left-[9999px]">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <Button type="submit" size="lg" className="h-11 w-full text-base" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />} Send message
      </Button>
    </form>
  )
}
