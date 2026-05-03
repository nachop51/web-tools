import { describe, expect, it } from 'vitest'
import { circleFrom } from './circle'

describe('circleFrom', () => {
  it('radius=1 → area≈π, circumference≈2π', () => {
    const c = circleFrom('radius', 1)
    expect(c.radius).toBe(1)
    expect(c.diameter).toBe(2)
    expect(c.area).toBeCloseTo(Math.PI)
    expect(c.circumference).toBeCloseTo(2 * Math.PI)
  })

  it('diameter=2 gives same result as radius=1', () => {
    const a = circleFrom('radius', 1)
    const b = circleFrom('diameter', 2)
    expect(b.radius).toBeCloseTo(a.radius)
    expect(b.area).toBeCloseTo(a.area)
    expect(b.circumference).toBeCloseTo(a.circumference)
  })

  it('circumference round-trip', () => {
    const c = circleFrom('radius', 5)
    const c2 = circleFrom('circumference', c.circumference)
    expect(c2.radius).toBeCloseTo(5)
  })

  it('area round-trip', () => {
    const c = circleFrom('radius', 7)
    const c2 = circleFrom('area', c.area)
    expect(c2.radius).toBeCloseTo(7)
  })
})
