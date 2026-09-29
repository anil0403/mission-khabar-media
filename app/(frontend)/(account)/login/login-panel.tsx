'use client'

import { useRouter } from 'next/navigation'

import { LoginForm } from '@/components/login-form'

export function LoginPanel({ returnTo, defaultTab }: { returnTo: string; defaultTab: 'signin' | 'signup' }) {
  const router = useRouter()
  return <LoginForm returnTo={returnTo} defaultTab={defaultTab} onSignedIn={() => router.push(returnTo)} />
}
