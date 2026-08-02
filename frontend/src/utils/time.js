const MSK = 'Europe/Moscow'

function toDate(value) {
  if (!value) return null
  if (value instanceof Date) return value
  const raw = String(value)
  // Backend stores UTC; SQLite may omit Z — treat naive as UTC
  if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(raw)) {
    return new Date(raw.includes('T') ? `${raw}Z` : `${raw.replace(' ', 'T')}Z`)
  }
  return new Date(raw)
}

/** Exact Moscow time, e.g. 02.08.2026, 23:15:42 МСК */
export function formatMsk(value) {
  const date = toDate(value)
  if (!date || Number.isNaN(date.getTime())) return '—'

  const formatted = new Intl.DateTimeFormat('ru-RU', {
    timeZone: MSK,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)

  return `${formatted} МСК`
}
