export type DurationParts = {
  years: number
  days: number
  hours: number
  minutes: number
  seconds: number
  totalSeconds: number
}

const SECONDS_PER_MINUTE = 60
const SECONDS_PER_HOUR = 3600
const SECONDS_PER_DAY = 86400
const SECONDS_PER_YEAR = 31536000

function secondsToParts(total: number): DurationParts {
  let rem = Math.floor(Math.abs(total))
  const years = Math.floor(rem / SECONDS_PER_YEAR)
  rem -= years * SECONDS_PER_YEAR
  const days = Math.floor(rem / SECONDS_PER_DAY)
  rem -= days * SECONDS_PER_DAY
  const hours = Math.floor(rem / SECONDS_PER_HOUR)
  rem -= hours * SECONDS_PER_HOUR
  const minutes = Math.floor(rem / SECONDS_PER_MINUTE)
  rem -= minutes * SECONDS_PER_MINUTE
  return { years, days, hours, minutes, seconds: rem, totalSeconds: Math.floor(Math.abs(total)) }
}

export function parseDuration(input: string): DurationParts {
  const trimmed = input.trim()
  if (!trimmed) throw new Error('Empty input')

  // HH:MM:SS or H:MM:SS
  const colonMatch = trimmed.match(/^(\d+):(\d{1,2}):(\d{1,2})$/)
  if (colonMatch) {
    const h = parseInt(colonMatch[1], 10)
    const m = parseInt(colonMatch[2], 10)
    const s = parseInt(colonMatch[3], 10)
    if (m >= 60 || s >= 60) throw new Error('Invalid time format: minutes/seconds must be < 60')
    return secondsToParts(h * SECONDS_PER_HOUR + m * SECONDS_PER_MINUTE + s)
  }

  // Plain number (raw seconds)
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    const n = parseFloat(trimmed)
    if (n < 0) throw new Error('Duration must be non-negative')
    return secondsToParts(n)
  }

  // Tagged format: "1y 2d 3h 4m 5s"
  const tagPattern = /(\d+(?:\.\d+)?)\s*(years?|yrs?|y|days?|d|hours?|hrs?|h|minutes?|mins?|m|seconds?|secs?|s)/gi
  let total = 0
  let matched = false
  let remaining = trimmed

  for (const match of trimmed.matchAll(tagPattern)) {
    matched = true
    const value = parseFloat(match[1])
    const unit = match[2].toLowerCase()
    if (/^(y|yr|yrs|year|years)$/.test(unit)) total += value * SECONDS_PER_YEAR
    else if (/^(d|day|days)$/.test(unit)) total += value * SECONDS_PER_DAY
    else if (/^(h|hr|hrs|hour|hours)$/.test(unit)) total += value * SECONDS_PER_HOUR
    else if (/^(m|min|mins|minute|minutes)$/.test(unit)) total += value * SECONDS_PER_MINUTE
    else if (/^(s|sec|secs|second|seconds)$/.test(unit)) total += value
  }

  if (!matched) throw new Error('Invalid duration format')

  return secondsToParts(total)
}

export function formatDuration(parts: DurationParts): string {
  const pieces: string[] = []

  if (parts.years > 0) pieces.push(`${parts.years} ${parts.years === 1 ? 'year' : 'years'}`)
  if (parts.days > 0) pieces.push(`${parts.days} ${parts.days === 1 ? 'day' : 'days'}`)
  if (parts.hours > 0) pieces.push(`${parts.hours} ${parts.hours === 1 ? 'hour' : 'hours'}`)
  if (parts.minutes > 0) pieces.push(`${parts.minutes} ${parts.minutes === 1 ? 'minute' : 'minutes'}`)
  if (parts.seconds > 0) pieces.push(`${parts.seconds} ${parts.seconds === 1 ? 'second' : 'seconds'}`)

  if (pieces.length === 0) return '0 seconds'
  return pieces.join(' ')
}
