import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-6xl font-bold text-brand-navy">404</p>
      <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-muted-foreground">The news you are looking for may have been moved or removed.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/" className="inline-flex h-11 items-center rounded-lg bg-primary px-5 font-medium text-primary-foreground hover:bg-primary/90">Go to home page</Link>
        <Link href="/search" className="inline-flex h-11 items-center rounded-lg border px-5 font-medium hover:bg-muted">Search news</Link>
      </div>
    </div>
  )
}
