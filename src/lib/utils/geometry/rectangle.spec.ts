import { describe, expect, it } from 'vitest'
import { rectangle } from './rectangle'

describe('rectangle', () => {
  it('3×4 → area=12, perimeter=14, diagonal=5', () => {
    const r = rectangle(4, 3)
    expect(r.area).toBe(12)
    expect(r.perimeter).toBe(14)
    expect(r.diagonal).toBeCloseTo(5)
    expect(r.isSquare).toBe(false)
  })

  it('4×4 is a square', () => {
    const r = rectangle(4, 4)
    expect(r.isSquare).toBe(true)
    expect(r.area).toBe(16)
    expect(r.perimeter).toBe(16)
    expect(r.diagonal).toBeCloseTo(4 * Math.SQRT2)
  })
})
