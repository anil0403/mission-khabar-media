import { getEngagement } from '@/lib/community'

export async function GET(req: Request, { params }: RouteContext<'/api/engagement/[articleId]'>) {
  const { articleId } = await params
  if (!/^\d+$/.test(articleId)) return Response.json({ error: 'Bad id' }, { status: 400 })
  const page = Math.max(1, Number(new URL(req.url).searchParams.get('page')) || 1)
  return Response.json(await getEngagement(articleId, page), { headers: { 'Cache-Control': 'private, no-store' } })
}
