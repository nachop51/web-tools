import { describe, it, expect } from 'vitest'
import { calculatePercentage } from './percentage'

describe('calculatePercentage', () => {
  it('of: 25% of 200 = 50', () => {
    expect(calculatePercentage('of', 25, 200)).toBe(50)
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
