import type { Metadata } from 'next'

// Account pages are for people, not search engines.
export const metadata: Metadata = { robots: { index: false, follow: false } }

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-md px-4 py-10">{children}</div>
}
