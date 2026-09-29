export const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

export const xmlResponse = (body: string, type = 'application/xml') =>
  new Response(body, { headers: { 'Content-Type': `${type}; charset=utf-8`, 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600' } })

/** Hour-rounded "now minus 48h" so the cached query key only changes hourly. */
export const twoDaysAgo = () => new Date(Math.floor(Date.now() / 3_600_000) * 3_600_000 - 48 * 3_600_000).toISOString()
