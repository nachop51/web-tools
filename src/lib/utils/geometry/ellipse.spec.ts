import { describe, expect, it } from 'vitest'
import { ellipse } from './ellipse'

describe('ellipse', () => {
  it('circle a=b=1 → area=π, perimeter=2π', () => {
    const e = ellipse(1, 1)
    expect(e.area).toBeCloseTo(Math.PI)
    expect(e.perimeter).toBeCloseTo(2 * Math.PI)
    expect(e.eccentricity).toBeCloseTo(0)
    expect(e.c).toBeCloseTo(0)
  })

  it('a=2, b=1 standard', () => {
    const e = ellipse(2, 1)
    expect(e.area).toBeCloseTo(2 * Math.PI)
    expect(e.c).toBeCloseTo(Math.sqrt(3))
    expect(e.eccentricity).toBeCloseTo(Math.sqrt(3) / 2)
    expect(e.latusRectum).toBe(1) // 2(1)/2
    expect(e.aspectRatio).toBe(2)
  })

  it('swaps when b > a', () => {
    const e = ellipse(1, 3)
    expect(e.swapped).toBe(true)
    expect(e.a).toBe(3)
    expect(e.b).toBe(1)
  })

  it('foci at (±c, 0)', () => {
    const e = ellipse(5, 3)
    expect(e.focus1.x).toBeCloseTo(-4)
    expect(e.focus2.x).toBeCloseTo(4)
  })

  it('throws for non-positive a', () => {
    expect(() => ellipse(0, 1)).toThrow()
    expect(() => ellipse(-1, 1)).toThrow()
  })

  it('Ramanujan perimeter close to circle reference', () => {
    // Reference: 2π·a for circle
    const e = ellipse(7, 7)
    expect(e.perimeter).toBeCloseTo(2 * Math.PI * 7)
  })
})
