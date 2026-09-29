'use server'

import { payload } from '@/lib/queries'

export type ContactState = { ok?: boolean; error?: string }

export async function sendContact(_: ContactState, form: FormData): Promise<ContactState> {
  // Honeypot: real people never fill the hidden "website" field.
  if (form.get('website')) return { ok: true }
  const name = String(form.get('name') ?? '').trim().slice(0, 100)
  const email = String(form.get('email') ?? '').trim().slice(0, 200)
  const message = String(form.get('message') ?? '').trim().slice(0, 5000)
  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Please fill in your name, a valid email and a message.' }

  const to = process.env.CONTACT_TO_EMAIL
  if (!to) return { error: 'Contact form is not set up yet. Please email us directly.' }
  try {
    await (await payload()).sendEmail({ to, replyTo: email, subject: `Website message from ${name}`, text: `From: ${name} <${email}>\n\n${message}` })
    return { ok: true }
  } catch {
    return { error: 'Could not send your message. Please try again later.' }
  }
}
