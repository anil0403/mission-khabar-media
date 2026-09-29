// @username tokens. Must not be preceded by a word char, "@" or "." so emails (a@b.com) don't match.
// Usernames follow Better Auth's rule: letters, digits, "_" and "." (no trailing dot).
const MENTION = /(?<![\w@.])@([a-z0-9_](?:[a-z0-9_.]*[a-z0-9_])?)/gi

export function parseMentions(text: string): string[] {
  return [...new Set([...text.matchAll(MENTION)].map((m) => m[1].toLowerCase()))]
}

export type Segment = { text: string; username?: string }

/** Split text into plain and @mention segments, highlighting only usernames in `known`. */
export function splitMentions(text: string, known: Set<string>): Segment[] {
  const out: Segment[] = []
  let last = 0
  for (const m of text.matchAll(MENTION)) {
    const username = m[1].toLowerCase()
    if (!known.has(username)) continue
    if (m.index > last) out.push({ text: text.slice(last, m.index) })
    out.push({ text: m[0], username })
    last = m.index + m[0].length
  }
  if (last < text.length) out.push({ text: text.slice(last) })
  return out
}
