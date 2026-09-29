// Devanagari → Latin, good enough for readable URL slugs (not a scholarly transliteration).
const CONSONANTS: Record<string, string> = {
  क: 'k', ख: 'kh', ग: 'g', घ: 'gh', ङ: 'ng', च: 'ch', छ: 'chh', ज: 'j', झ: 'jh', ञ: 'n',
  ट: 't', ठ: 'th', ड: 'd', ढ: 'dh', ण: 'n', त: 't', थ: 'th', द: 'd', ध: 'dh', न: 'n',
  प: 'p', फ: 'ph', ब: 'b', भ: 'bh', म: 'm', य: 'y', र: 'r', ल: 'l', व: 'w', श: 'sh',
  ष: 'sh', स: 's', ह: 'h',
}
const VOWELS: Record<string, string> = {
  अ: 'a', आ: 'aa', इ: 'i', ई: 'i', उ: 'u', ऊ: 'u', ऋ: 'ri', ए: 'e', ऐ: 'ai', ओ: 'o', औ: 'au',
}
const MATRAS: Record<string, string> = {
  'ा': 'a', 'ि': 'i', 'ी': 'i', 'ु': 'u', 'ू': 'u', 'ृ': 'ri', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
}
const MARKS: Record<string, string> = { 'ं': 'n', 'ँ': 'n', 'ः': 'h' }
const HALANT = '्'

export function transliterate(input: string): string {
  const chars = [...input.replace(/़/g, '')] // drop nukta
  let out = ''
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i]
    const next = chars[i + 1]
    if (c in CONSONANTS) {
      out += CONSONANTS[c]
      if (next === HALANT) i++
      else if (next in MATRAS) {
        out += MATRAS[next]
        i++
      }
      // inherent "a" is dropped at the end of a word (नेपाल → nepal)
      else if (next in CONSONANTS || next in VOWELS || next in MARKS) out += 'a'
    } else if (c in VOWELS) out += VOWELS[c]
    else if (c in MARKS) out += MARKS[c]
    else if (c >= '०' && c <= '९') out += String(c.charCodeAt(0) - 0x0966)
    else out += c
  }
  return out
}

export function slugify(input: string): string {
  return transliterate(input)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '')
}
