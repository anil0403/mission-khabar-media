'use client'

import { useEffect, useRef, useState } from 'react'

import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

type Reader = { username: string; name: string; image: string | null }

// Textarea that suggests readers after typing "@". Arrow keys + Enter/Tab to pick, Esc to close.
export function MentionTextarea({ value, onChange, className, ...props }: { value: string; onChange: (v: string) => void } & Omit<React.ComponentProps<'textarea'>, 'value' | 'onChange'>) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const [query, setQuery] = useState<string | null>(null)
  const [results, setResults] = useState<Reader[]>([])
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (query === null || query.length < 1) return
    const ctrl = new AbortController()
    const t = setTimeout(async () => {
      const res = await fetch(`/api/readers/search?q=${encodeURIComponent(query)}`, { signal: ctrl.signal }).catch(() => null)
      if (res?.ok) {
        setResults(await res.json())
        setActive(0)
      }
    }, 200)
    return () => {
      clearTimeout(t)
      ctrl.abort()
    }
  }, [query])

  const detect = (text: string, caret: number) => {
    const m = text.slice(0, caret).match(/(?:^|[^\w@.])@([a-z0-9_.]{0,30})$/i)
    setQuery(m ? m[1] : null)
    if (!m || !m[1]) setResults([])
  }

  const pick = (r: Reader) => {
    const el = ref.current
    if (!el) return
    const caret = el.selectionStart
    const before = value.slice(0, caret).replace(/@([a-z0-9_.]*)$/i, `@${r.username} `)
    const next = before + value.slice(caret)
    onChange(next)
    setQuery(null)
    setResults([])
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(before.length, before.length)
    })
  }

  const open = query !== null && results.length > 0

  return (
    <div className="relative">
      <Textarea
        ref={ref}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          detect(e.target.value, e.target.selectionStart)
        }}
        onKeyDown={(e) => {
          if (!open) return
          const moves: Record<string, () => void> = {
            ArrowDown: () => setActive((a) => (a + 1) % results.length),
            ArrowUp: () => setActive((a) => (a - 1 + results.length) % results.length),
            Enter: () => pick(results[active]),
            Tab: () => pick(results[active]),
            Escape: () => setQuery(null),
          }
          if (moves[e.key]) {
            e.preventDefault()
            moves[e.key]()
          }
        }}
        role="combobox"
        aria-expanded={open}
        aria-controls="mention-list"
        aria-autocomplete="list"
        className={cn('min-h-24 text-base', className)}
        {...props}
      />
      {open && (
        <ul id="mention-list" role="listbox" className="absolute left-0 z-20 mt-1 w-64 overflow-hidden rounded-lg border bg-popover shadow-lg">
          {results.map((r, i) => (
            <li
              key={r.username}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault() // keep focus in the textarea
                pick(r)
              }}
              className={cn('flex cursor-pointer items-center gap-2 px-3 py-2 text-sm', i === active && 'bg-accent')}
            >
              <span className="font-semibold">@{r.username}</span>
              <span className="truncate text-muted-foreground">{r.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
