import { describe, expect, it } from 'vitest'
import { lineFromPointSlope, lineFromTwoPoints } from './slope'

describe('lineFromTwoPoints', () => {
  it('y = 2x + 1 from (0,1) and (1,3)', () => {
    const r = lineFromTwoPoints(0, 1, 1, 3)
    expect(r.slope).toBe(2)
    expect(r.yIntercept).toBe(1)
    expect(r.vertical).toBe(false)
    expect(r.horizontal).toBe(false)
  })

  it('horizontal y = 5', () => {
    const r = lineFromTwoPoints(-2, 5, 7, 5)
    expect(r.slope).toBe(0)
    expect(r.yIntercept).toBe(5)
    expect(r.horizontal).toBe(true)
    expect(r.inclinationDeg).toBe(0)
  })

  it('vertical line x = 3', () => {
    const r = lineFromTwoPoints(3, 0, 3, 5)
    expect(r.vertical).toBe(true)
    expect(r.slope).toBe(Infinity)
    expect(r.xIntercept).toBe(3)
    expect(r.inclinationDeg).toBe(90)
    expect(isNaN(r.yIntercept)).toBe(true)
  })

  it('inclination 45° for slope 1', () => {
    const r = lineFromTwoPoints(0, 0, 1, 1)
    expect(r.inclinationDeg).toBeCloseTo(45)
  })
})

describe('lineFromPointSlope', () => {
  it('point (1,2), m=3', () => {
    const r = lineFromPointSlope(1, 2, 3)
    expect(r.slope).toBe(3)
    expect(r.yIntercept).toBe(-1)
  })

  it('horizontal m=0', () => {
    const r = lineFromPointSlope(2, 7, 0)
    expect(r.horizontal).toBe(true)
    expect(r.yIntercept).toBe(7)
  })

  it('x intercept', () => {
    const r = lineFromPointSlope(0, 4, 2)
    // y = 2x + 4 → x intercept = -2
    expect(r.xIntercept).toBeCloseTo(-2)
  })
})
