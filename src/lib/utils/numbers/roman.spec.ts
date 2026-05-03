import { describe, expect, it } from 'vitest'
import { fromRoman, isLikelyRoman, toRoman } from './roman'

describe('toRoman', () => {
  it('converts 1 to I', () => {
    expect(toRoman(1)).toBe('I')
  })

  it('converts 4 to IV', () => {
    expect(toRoman(4)).toBe('IV')
  })

  it('converts 9 to IX', () => {
    expect(toRoman(9)).toBe('IX')
  })

  it('converts 14 to XIV', () => {
    expect(toRoman(14)).toBe('XIV')
  })

  it('converts 40 to XL', () => {
    expect(toRoman(40)).toBe('XL')
  })

  it('converts 90 to XC', () => {
    expect(toRoman(90)).toBe('XC')
  })

  it('converts 399 to CCCXCIX', () => {
    expect(toRoman(399)).toBe('CCCXCIX')
  })

  it('converts 1994 to MCMXCIV', () => {
    expect(toRoman(1994)).toBe('MCMXCIV')
  })

  it('converts 2024 to MMXXIV', () => {
    expect(toRoman(2024)).toBe('MMXXIV')
  })

  it('converts 3999 to MMMCMXCIX', () => {
    expect(toRoman(3999)).toBe('MMMCMXCIX')
  })

  it('returns empty string for 0', () => {
    expect(toRoman(0)).toBe('')
  })

  it('returns empty string for 4000', () => {
    expect(toRoman(4000)).toBe('')
  })

  it('returns empty string for negative numbers', () => {
    expect(toRoman(-1)).toBe('')
  })

  it('returns empty string for non-integers', () => {
    expect(toRoman(3.5)).toBe('')
  })
})

describe('fromRoman', () => {
  it('round-trips toRoman output back to the original number', () => {
    for (const n of [1, 4, 9, 14, 40, 90, 399, 1994, 2024, 3999]) {
      expect(fromRoman(toRoman(n))).toBe(n)
    }
  })

  it('converts MMXXIV to 2024', () => {
    expect(fromRoman('MMXXIV')).toBe(2024)
  })

  it('is case-insensitive', () => {
    expect(fromRoman('mmxxiv')).toBe(2024)
    expect(fromRoman('xiv')).toBe(14)
  })

  it('returns NaN for empty string', () => {
    expect(fromRoman('')).toBeNaN()
  })

  it('returns NaN for invalid characters', () => {
    expect(fromRoman('ABC')).toBeNaN()
    expect(fromRoman('123')).toBeNaN()
  })

  it('returns NaN for invalid Roman sequences (IIII, VV)', () => {
    expect(fromRoman('IIII')).toBeNaN()
    expect(fromRoman('VV')).toBeNaN()
  })
})

describe('isLikelyRoman', () => {
  it('returns true for valid Roman numeral strings', () => {
    expect(isLikelyRoman('XIV')).toBe(true)
    expect(isLikelyRoman('mmxxiv')).toBe(true)
    expect(isLikelyRoman('MMMCMXCIX')).toBe(true)
  })

  it('returns false for plain numbers', () => {
    expect(isLikelyRoman('42')).toBe(false)
    expect(isLikelyRoman('2024')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isLikelyRoman('')).toBe(false)
    expect(isLikelyRoman('   ')).toBe(false)
  })

  it('returns false for mixed alphanumeric strings', () => {
    expect(isLikelyRoman('XIV2')).toBe(false)
    expect(isLikelyRoman('hello')).toBe(false)
  })
})
