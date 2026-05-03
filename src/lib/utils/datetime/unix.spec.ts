import { describe, expect, it } from 'vitest'
import { isoToUnix, unixToInfo } from './unix'

describe('unixToInfo', () => {
  it('epoch → 1970-01-01T00:00:00.000Z', () => {
    const info = unixToInfo(0)
    expect(info.iso).toBe('1970-01-01T00:00:00.000Z')
    expect(info.unixMs).toBe(0)
  })

  it('known timestamp → correct ISO', () => {
    const info = unixToInfo(1705314600)
    expect(info.iso).toBe('2024-01-15T10:30:00.000Z')
  })

  it('includes weekday string', () => {
    const info = unixToInfo(0)
    expect(typeof info.weekday).toBe('string')
    expect(info.weekday.length).toBeGreaterThan(0)
  })

  it('unixMs is seconds * 1000', () => {
    const info = unixToInfo(1000)
    expect(info.unixMs).toBe(1000000)
  })
})

describe('isoToUnix', () => {
  it('round-trips epoch', () => {
    expect(isoToUnix('1970-01-01T00:00:00.000Z')).toBe(0)
  })

  it('round-trips a known timestamp', () => {
    expect(isoToUnix('2024-01-15T10:30:00.000Z')).toBe(1705314600)
  })

  it('round-trips via unixToInfo', () => {
    const seconds = 1700000000
    const info = unixToInfo(seconds)
    expect(isoToUnix(info.iso)).toBe(seconds)
  })

  it('throws on empty string', () => {
    expect(() => isoToUnix('')).toThrow('Empty input')
  })

  it('throws on invalid ISO string', () => {
    expect(() => isoToUnix('not-a-date')).toThrow('Invalid date string')
  })

  it('throws on garbage input', () => {
    expect(() => isoToUnix('not-a-real-date-xyz')).toThrow()
  })
})
