import { currentReader, searchReaders } from '@/lib/community'

// @mention lookup — signed-in readers only, max 5 results.
export async function GET(req: Request) {
  if (!(await currentReader())) return Response.json([], { status: 401 })
  const q = new URL(req.url).searchParams.get('q') ?? ''
  return Response.json(await searchReaders(q), { headers: { 'Cache-Control': 'private, no-store' } })
}
