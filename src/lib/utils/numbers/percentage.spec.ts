import { describe, it, expect } from 'vitest'
import { percentOf, whatPercent, percentChange, percentError } from './percentage'

describe('percentOf', () => {
  it('50% of 200 = 100', () => {
    expect(percentOf(50, 200)).toBe(100)
  })
  it('25% of 80 = 20', () => {
    expect(percentOf(25, 80)).toBe(20)
  })
  it('0% of anything = 0', () => {
    expect(percentOf(0, 9999)).toBe(0)
  })
  it('100% of 42 = 42', () => {
    expect(percentOf(100, 42)).toBe(42)
  })
})

describe('whatPercent', () => {
  it('50 is 50% of 100', () => {
    expect(whatPercent(50, 100)).toBe(50)
  })
  it('1 is 25% of 4', () => {
    expect(whatPercent(1, 4)).toBe(25)
  })
  it('Infinity when whole=0', () => {
    expect(whatPercent(5, 0)).toBe(Infinity)
  })
})

describe('percentChange', () => {
  it('100 to 150 = +50%', () => {
    expect(percentChange(100, 150)).toBe(50)
  })
  it('200 to 100 = -50%', () => {
    expect(percentChange(200, 100)).toBe(-50)
  })
  it('no change = 0%', () => {
    expect(percentChange(42, 42)).toBe(0)
  })
})

describe('percentError', () => {
  it('measured=10 actual=8 => 25%', () => {
    expect(percentError(10, 8)).toBeCloseTo(25, 5)
  })
  it('perfect measurement = 0%', () => {
    expect(percentError(5, 5)).toBe(0)
  })
  it('symmetrical for over/under', () => {
    expect(percentError(6, 8)).toBeCloseTo(percentError(10, 8), 5)
  })
})
