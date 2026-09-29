import type { Metadata } from 'next'

import { LoginPanel } from './login-panel'

export const metadata: Metadata = { title: 'Sign in' }

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const sp = await searchParams
  // Only allow local return paths (no open redirect).
  const raw = typeof sp.next === 'string' ? sp.next : '/'
  const returnTo = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/'
  return (
    <>
      <h1 className="text-2xl font-bold">Welcome to Mission Khabar</h1>
      <p className="mt-1 text-muted-foreground">Sign in to like, comment and join the conversation.</p>
      <div className="mt-6">
        <LoginPanel returnTo={returnTo} defaultTab={sp.mode === 'signup' ? 'signup' : 'signin'} />
      </div>
    </>
  )
}
