import { describe, expect, it } from 'vitest'
import { fromRoman, isLikelyRoman, OVERLINE, toRoman } from './roman'

const ov = (s: string) =>
  s
    .split('')
    .map((c) => c + OVERLINE)
    .join('')

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

  it('returns empty string for 4000 in standard mode', () => {
    expect(toRoman(4000)).toBe('')
  })

  it('returns empty string for negative numbers', () => {
    expect(toRoman(-1)).toBe('')
  })

  it('returns empty string for non-integers', () => {
    expect(toRoman(3.5)).toBe('')
  })
})

describe('toRoman extended (vinculum)', () => {
  it('converts values <=3999 the same as standard', () => {
    expect(toRoman(2024, 'extended')).toBe('MMXXIV')
    expect(toRoman(3999, 'extended')).toBe('MMMCMXCIX')
  })

  it('converts 4000 with overlined IV', () => {
    expect(toRoman(4000, 'extended')).toBe(ov('IV'))
  })

  it('converts 5000 to V with overline', () => {
    expect(toRoman(5000, 'extended')).toBe(ov('V'))
  })

  it('converts 10000 to X with overline', () => {
    expect(toRoman(10000, 'extended')).toBe(ov('X'))
  })

  it('appends standard units after vinculum part', () => {
    expect(toRoman(5024, 'extended')).toBe(ov('V') + 'XXIV')
  })

  it('converts 1000000 to M with overline', () => {
    expect(toRoman(1_000_000, 'extended')).toBe(ov('M'))
  })

  it('converts 3999999 to fully overlined MMMCMXCIX + CMXCIX', () => {
    expect(toRoman(3_999_999, 'extended')).toBe(ov('MMMCMXCIX') + 'CMXCIX')
  })

  it('returns empty string for 4000000 in extended mode', () => {
    expect(toRoman(4_000_000, 'extended')).toBe('')
  })
})

describe('fromRoman', () => {
  it('round-trips toRoman output back to the original number', () => {
    for (const n of [1, 4, 9, 14, 40, 90, 399, 1994, 2024, 3999]) {
      expect(fromRoman(toRoman(n))).toBe(n)
    }
  })

  it('round-trips extended Roman numerals', () => {
    for (const n of [4000, 5000, 5024, 10000, 50000, 100000, 999999, 1_000_000, 3_999_999]) {
      expect(fromRoman(toRoman(n, 'extended'))).toBe(n)
    }
  })

  it('converts MMXXIV to 2024', () => {
    expect(fromRoman('MMXXIV')).toBe(2024)
  })

  it('parses overlined V as 5000', () => {
    expect(fromRoman(ov('V'))).toBe(5000)
  })

  it('parses overlined M as 1000000', () => {
    expect(fromRoman(ov('M'))).toBe(1_000_000)
  })

  it('accepts underscore syntax for vinculum', () => {
    expect(fromRoman('_I')).toBe(1000)
    expect(fromRoman('_V')).toBe(5000)
    expect(fromRoman('_X')).toBe(10_000)
    expect(fromRoman('_M')).toBe(1_000_000)
    expect(fromRoman('_I_V')).toBe(4000)
    expect(fromRoman('_VXXIV')).toBe(5024)
  })

  it('accepts all-vinculum form for values <= 3999', () => {
    expect(fromRoman('_I_I')).toBe(2000)
    expect(fromRoman('_I_I_ICMXCIX')).toBe(3999)
  })

  it('underscore syntax is case-insensitive', () => {
    expect(fromRoman('_v')).toBe(5000)
    expect(fromRoman('_m_m')).toBe(2_000_000)
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

  it('accepts vinculum (overlined) characters', () => {
    expect(isLikelyRoman(ov('V'))).toBe(true)
    expect(isLikelyRoman(ov('IV') + 'XXIV')).toBe(true)
  })

  it('accepts underscore vinculum syntax', () => {
    expect(isLikelyRoman('_V')).toBe(true)
    expect(isLikelyRoman('_VXXIV')).toBe(true)
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
