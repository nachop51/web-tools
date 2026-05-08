import { describe, it, expect } from 'vitest'
import { calculatePercentage, solvePercentage, percentChange, percentAdjust } from './percentage'

describe('calculatePercentage', () => {
  it('of: 25% of 200 = 50', () => {
    expect(calculatePercentage('of', 25, 200)).toBe(50)
  })

  it('what: 50 is 25% of 200', () => {
    expect(calculatePercentage('what', 200, 50)).toBe(25)
  })

  it('change: change from 80 to 100 = 25%', () => {
    expect(calculatePercentage('change', 80, 100)).toBe(25)
  })

  it('increase: 100 increased by 10% = 110', () => {
    expect(calculatePercentage('increase', 100, 10)).toBeCloseTo(110, 10)
  })

  it('decrease: 100 decreased by 10% = 90', () => {
    expect(calculatePercentage('decrease', 100, 10)).toBe(90)
  })

  it('error: actual=9.5 theoretical=10 → 5%', () => {
    expect(calculatePercentage('error', 9.5, 10)).toBe(5)
  })
})

describe('solvePercentage', () => {
  it('target=c: 25% of 200 = 50', () => {
    expect(solvePercentage({ a: 25, b: 200, target: 'c' })).toEqual({ a: 25, b: 200, c: 50, target: 'c' })
  })

  it('target=a: 50 is what % of 200 → 25%', () => {
    expect(solvePercentage({ b: 200, c: 50, target: 'a' })).toEqual({ a: 25, b: 200, c: 50, target: 'a' })
  })

  it('target=b: 50 is 25% of what → 200', () => {
    expect(solvePercentage({ a: 25, c: 50, target: 'b' })).toEqual({ a: 25, b: 200, c: 50, target: 'b' })
  })

  it('allows negative percentages', () => {
    expect(solvePercentage({ a: -20, b: 100, target: 'c' })).toEqual({ a: -20, b: 100, c: -20, target: 'c' })
  })

  it('returns null when solving for a with b=0', () => {
    expect(solvePercentage({ b: 0, c: 50, target: 'a' })).toBeNull()
  })

  it('returns null when solving for b with a=0', () => {
    expect(solvePercentage({ a: 0, c: 50, target: 'b' })).toBeNull()
  })

  it('returns null when required input is missing', () => {
    expect(solvePercentage({ a: 25, target: 'c' })).toBeNull()
  })
})

describe('percentChange', () => {
  it('80 → 100 = +25%', () => {
    expect(percentChange(80, 100)).toEqual({ from: 80, to: 100, delta: 20, pctChange: 25, ppDelta: 20 })
  })

  it('100 → 80 = −20%', () => {
    expect(percentChange(100, 80)).toEqual({ from: 100, to: 80, delta: -20, pctChange: -20, ppDelta: -20 })
  })

  it('returns null when from = 0', () => {
    expect(percentChange(0, 5)).toBeNull()
  })

  it('identical values = 0%', () => {
    expect(percentChange(50, 50)).toEqual({ from: 50, to: 50, delta: 0, pctChange: 0, ppDelta: 0 })
  })

  it('handles negative from (uses abs in denominator)', () => {
    expect(percentChange(-100, -80)).toEqual({ from: -100, to: -80, delta: 20, pctChange: 20, ppDelta: 20 })
  })
})

describe('percentAdjust', () => {
  it('100, +10% → 110', () => {
    const r = percentAdjust(100, 10)
    expect(r.result).toBeCloseTo(110, 10)
    expect(r.delta).toBeCloseTo(10, 10)
  })

  it('100, −10% → 90', () => {
    const r = percentAdjust(100, -10)
    expect(r.result).toBeCloseTo(90, 10)
    expect(r.delta).toBeCloseTo(-10, 10)
  })

  it('100, 0% → 100, delta 0', () => {
    expect(percentAdjust(100, 0)).toEqual({ value: 100, signedPct: 0, result: 100, delta: 0 })
  })
})
