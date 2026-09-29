import NepaliDateModule from 'nepali-date-converter'

// CJS package: bundlers unwrap the default export, plain Node (scripts/check.ts) doesn't.
const NepaliDate = ((NepaliDateModule as unknown as { default?: typeof NepaliDateModule }).default ?? NepaliDateModule)

const TZ = 'Asia/Kathmandu'

// The converter reads the Date's *local* calendar day; servers run in UTC, so rebuild the day as seen in Nepal.
function nepalDay(iso: string | Date) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(new Date(iso))
    .split('-')
    .map(Number)
  return new Date(parts[0], parts[1] - 1, parts[2])
}

/** "१४ आश्विन २०८३" */
export function bsDate(iso: string | Date) {
  return new NepaliDate(nepalDay(iso)).format('DD MMMM YYYY', 'np')
}

/** "2083-06-14" (BS, for checks) */
export function bsIso(iso: string | Date) {
  return new NepaliDate(nepalDay(iso)).format('YYYY-MM-DD')
}

/** "Sep 30, 2026, 11:45 AM" in Nepal time */
export function adDateTime(iso: string | Date) {
  return new Intl.DateTimeFormat('en-US', { timeZone: TZ, dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
}

/** "3 hours ago" style for recent items, else the AD date */
export function timeAgo(iso: string | Date, now = Date.now()) {
  const s = Math.round((now - new Date(iso).getTime()) / 1000)
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  if (s < 60) return 'just now'
  if (s < 3600) return rtf.format(-Math.floor(s / 60), 'minute')
  if (s < 86400) return rtf.format(-Math.floor(s / 3600), 'hour')
  if (s < 7 * 86400) return rtf.format(-Math.floor(s / 86400), 'day')
  return new Intl.DateTimeFormat('en-US', { timeZone: TZ, dateStyle: 'medium' }).format(new Date(iso))
}
