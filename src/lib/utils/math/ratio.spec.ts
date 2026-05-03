import { describe, it, expect } from 'vitest'
import { simplifyRatio, solveRatio, ratioToPercent } from './ratio'

describe('simplifyRatio', () => {
  it('6:4 → 3:2', () => {
    expect(simplifyRatio(6, 4)).toEqual({ a: 3, b: 2 })
  })
})

describe('solveRatio', () => {
  it('2:3 = 4:? → 6', () => {
    expect(solveRatio(2, 3, 4)).toBe(6)
  })
})

describe('ratioToPercent', () => {
  it('1:3 → 25% / 75%', () => {
    expect(ratioToPercent(1, 3)).toEqual({ aPercent: 25, bPercent: 75 })
  })
})
