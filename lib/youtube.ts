export function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/)
  return m ? m[1] : null
}

export type Video = { id: string; title: string; published: string }

const decode = (s: string) =>
  s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')

/** Latest uploads from the channel's public RSS feed (no API key). Empty list if unset or unreachable. */
export async function latestVideos(limit = 8): Promise<Video[]> {
  const channel = process.env.YOUTUBE_CHANNEL_ID
  if (!channel) return []
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channel}`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const xml = await res.text()
    return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].slice(0, limit).map(([, e]) => ({
      id: e.match(/<yt:videoId>([^<]+)/)?.[1] ?? '',
      title: decode(e.match(/<title>([^<]*)/)?.[1] ?? ''),
      published: e.match(/<published>([^<]+)/)?.[1] ?? '',
    })).filter((v) => v.id)
  } catch {
    return []
  }
}
