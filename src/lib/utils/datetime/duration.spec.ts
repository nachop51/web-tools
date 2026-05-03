import { describe, expect, it } from 'vitest'
import { formatDuration, parseDuration } from './duration'

describe('parseDuration: tagged format', () => {
  it('"1h 30m" → totalSeconds 5400', () => {
    const r = parseDuration('1h 30m')
    expect(r.totalSeconds).toBe(5400)
    expect(r.hours).toBe(1)
    expect(r.minutes).toBe(30)
  })

  it('"1y 2d 3h 4m 5s" parses all fields', () => {
    const r = parseDuration('1y 2d 3h 4m 5s')
    expect(r.years).toBe(1)
    expect(r.days).toBe(2)
    expect(r.hours).toBe(3)
    expect(r.minutes).toBe(4)
    expect(r.seconds).toBe(5)
  })

  it('case-insensitive units', () => {
    expect(parseDuration('2H 15M').totalSeconds).toBe(2 * 3600 + 15 * 60)
  })

  it('long unit names', () => {
    expect(parseDuration('1 hour 30 minutes').totalSeconds).toBe(5400)
  })
})

describe('parseDuration: HH:MM:SS', () => {
  it('"1:30:00" → 5400', () => {
    expect(parseDuration('1:30:00').totalSeconds).toBe(5400)
  })

  it('"0:01:00" → 60', () => {
    expect(parseDuration('0:01:00').totalSeconds).toBe(60)
  })

  it('throws when minutes >= 60', () => {
    expect(() => parseDuration('1:60:00')).toThrow()
  })
})

describe('parseDuration: raw seconds', () => {
  it('"3600" → 1 hour', () => {
    const r = parseDuration('3600')
    expect(r.totalSeconds).toBe(3600)
    expect(r.hours).toBe(1)
    expect(r.minutes).toBe(0)
  })

  it('"0" → all zeros', () => {
    const r = parseDuration('0')
    expect(r.years).toBe(0)
    expect(r.days).toBe(0)
    expect(r.hours).toBe(0)
    expect(r.minutes).toBe(0)
    expect(r.seconds).toBe(0)
    expect(r.totalSeconds).toBe(0)
  })
})

describe('parseDuration: errors', () => {
  it('throws on empty string', () => {
    expect(() => parseDuration('')).toThrow('Empty input')
  })

  it('throws on invalid input', () => {
    expect(() => parseDuration('abc xyz')).toThrow()
  })

  it('throws on negative raw seconds', () => {
    expect(() => parseDuration('-100')).toThrow()
  })
})

describe('formatDuration', () => {
  it('formats all fields correctly with plurals', () => {
    const parts = parseDuration('2y 3d 4h 5m 6s')
    expect(formatDuration(parts)).toBe('2 years 3 days 4 hours 5 minutes 6 seconds')
  })

  it('uses singular for value of 1', () => {
    expect(formatDuration(parseDuration('1h 1m 1s'))).toBe('1 hour 1 minute 1 second')
  })

  it('omits zero fields', () => {
    expect(formatDuration(parseDuration('2h'))).toBe('2 hours')
  })

  it('round-trip: 1h30m', () => {
    const parts = parseDuration('1h 30m')
    expect(formatDuration(parts)).toBe('1 hour 30 minutes')
  })

  it('"0" → "0 seconds"', () => {
    expect(formatDuration(parseDuration('0'))).toBe('0 seconds')
  })
})
