import { describe, expect, it } from 'vitest'
import { ceilTo, floorTo, roundTo, toSigFigs, truncateTo } from './precision'

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
