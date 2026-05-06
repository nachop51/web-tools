import { describe, expect, it } from 'vitest'
import {
  absoluteError,
  applyPrecision,
  ceilTo,
  digitDiff,
  direction,
  floorTo,
  formatScientificNote,
  relativeError,
  roundTo,
  toSigFigs,
  truncateTo,
} from './precision'

describe('roundTo', () => {
  it('rounds to 2 decimal places', () => {
    expect(roundTo(3.14159, 2)).toBe(3.14)
  })

  it('rounds to nearest (away from zero for .5)', () => {
    expect(roundTo(1.456, 2)).toBe(1.46)
  })

  it('rounds to 0 places', () => {
    expect(roundTo(2.7, 0)).toBe(3)
  })
})

describe('floorTo', () => {
  it('floors to 2 places', () => {
    expect(floorTo(3.149, 2)).toBe(3.14)
  })

  it('floors negative correctly', () => {
    expect(floorTo(-3.141, 2)).toBe(-3.15)
  })

  it('floors to 0 places', () => {
    expect(floorTo(4.9, 0)).toBe(4)
  })
})

describe('ceilTo', () => {
  it('ceils to 2 places', () => {
    expect(ceilTo(3.141, 2)).toBe(3.15)
  })

  it('ceils negative correctly', () => {
    expect(ceilTo(-3.149, 2)).toBe(-3.14)
  })

  it('ceils to 0 places', () => {
    expect(ceilTo(4.1, 0)).toBe(5)
  })
})

describe('truncateTo', () => {
  it('truncates to 2 places', () => {
    expect(truncateTo(3.999, 2)).toBe(3.99)
  })

  it('truncates negative without rounding away from zero', () => {
    expect(truncateTo(-3.999, 2)).toBe(-3.99)
  })

  it('truncates to 0 places', () => {
    expect(truncateTo(9.99, 0)).toBe(9)
  })
})

describe('toSigFigs', () => {
  it('rounds to 3 sig figs', () => {
    expect(toSigFigs(3.14159, 3)).toBe(3.14)
  })

  it('handles large numbers', () => {
    expect(toSigFigs(123456, 3)).toBe(123000)
  })

  it('handles small numbers', () => {
    expect(toSigFigs(0.001234, 2)).toBe(0.0012)
  })
})

describe('applyPrecision', () => {
  it('dispatches to round', () => {
    expect(applyPrecision(3.14159, 2, 'round')).toBe(3.14)
  })
  it('dispatches to floor', () => {
    expect(applyPrecision(3.149, 2, 'floor')).toBe(3.14)
  })
  it('dispatches to ceil', () => {
    expect(applyPrecision(3.141, 2, 'ceil')).toBe(3.15)
  })
  it('dispatches to trunc', () => {
    expect(applyPrecision(-3.999, 2, 'trunc')).toBe(-3.99)
  })
  it('dispatches to sigfigs with depth=0 → at least 1 sig fig', () => {
    expect(applyPrecision(123456, 0, 'sigfigs')).toBe(100000)
  })
})

describe('absoluteError', () => {
  it('is the absolute difference', () => {
    expect(absoluteError(3.14159, 3.14)).toBeCloseTo(0.00159, 6)
  })
  it('is symmetric', () => {
    expect(absoluteError(-3.14159, -3.14)).toBeCloseTo(0.00159, 6)
  })
  it('is 0 when equal', () => {
    expect(absoluteError(5, 5)).toBe(0)
  })
})

describe('relativeError', () => {
  it('returns the absolute relative diff', () => {
    expect(relativeError(2, 1.9)).toBeCloseTo(0.05, 6)
  })
  it('returns 0 when both inputs are 0', () => {
    expect(relativeError(0, 0)).toBe(0)
  })
  it('returns NaN when original is 0 but rounded is not', () => {
    expect(relativeError(0, 0.1)).toBeNaN()
  })
})

describe('direction', () => {
  it('reports up when rounded exceeds original', () => {
    expect(direction(3.14, 3.15)).toBe('up')
  })
  it('reports down when rounded is below original', () => {
    expect(direction(3.14159, 3.14)).toBe('down')
  })
  it('reports exact when equal', () => {
    expect(direction(3.14, 3.14)).toBe('exact')
  })
})

describe('digitDiff', () => {
  it('splits places-mode at the decimal cut', () => {
    expect(digitDiff('3.14159', 2, 'round')).toEqual({ kept: '3.14', dropped: '159' })
  })

  it('handles depth 0 (cut at the dot)', () => {
    expect(digitDiff('3.14', 0, 'floor')).toEqual({ kept: '3', dropped: '.14' })
  })

  it('handles integer input (nothing to drop)', () => {
    expect(digitDiff('1234', 2, 'round')).toEqual({ kept: '1234', dropped: '' })
  })

  it('handles negative numbers', () => {
    expect(digitDiff('-3.14159', 2, 'trunc')).toEqual({ kept: '-3.14', dropped: '159' })
  })

  it('handles depth larger than fractional part', () => {
    expect(digitDiff('3.14', 6, 'round')).toEqual({ kept: '3.14', dropped: '' })
  })

  it('cuts at sig figs for large integers', () => {
    expect(digitDiff('123456', 3, 'sigfigs')).toEqual({ kept: '123', dropped: '456' })
  })

  it('skips leading zeros for sig figs', () => {
    expect(digitDiff('0.001234', 2, 'sigfigs')).toEqual({ kept: '0.0012', dropped: '34' })
  })

  it('expands scientific notation before splitting', () => {
    expect(digitDiff('1.23e-4', 5, 'round')).toEqual({ kept: '0.00012', dropped: '3' })
  })

  it('returns empty for empty input', () => {
    expect(digitDiff('', 2, 'round')).toEqual({ kept: '', dropped: '' })
  })
})

describe('formatScientificNote', () => {
  it('returns null for plain decimals', () => {
    expect(formatScientificNote('3.14')).toBeNull()
  })

  it('formats positive exponent with superscripts', () => {
    expect(formatScientificNote('6.022e23')).toBe('6.022 × 10²³')
  })

  it('formats negative exponent with superscript minus', () => {
    expect(formatScientificNote('1.23e-4')).toBe('1.23 × 10⁻⁴')
  })

  it('returns null for invalid input', () => {
    expect(formatScientificNote('foo')).toBeNull()
  })
})
