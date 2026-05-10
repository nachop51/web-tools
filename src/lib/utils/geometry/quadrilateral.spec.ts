import { describe, expect, it } from 'vitest'
import { kite, parallelogram, rhombus, trapezoid } from './quadrilateral'

describe('parallelogram', () => {
  it('square as special case', () => {
    const p = parallelogram(2, 2, 2, 90)
    expect(p.area).toBe(4)
    expect(p.perimeter).toBe(8)
    expect(p.diagonalShort).toBeCloseTo(Math.sqrt(8))
    expect(p.diagonalLong).toBeCloseTo(Math.sqrt(8))
  })
  it('non-rectangular', () => {
    const p = parallelogram(4, 2, 3, 60)
    expect(p.area).toBe(8)
    expect(p.perimeter).toBe(14)
    // shorter diagonal across 60°
    expect(p.diagonalShort).toBeCloseTo(Math.sqrt(16 + 9 - 24 * Math.cos(Math.PI / 3)))
    expect(p.diagonalLong).toBeCloseTo(Math.sqrt(16 + 9 + 24 * Math.cos(Math.PI / 3)))
  })
})

describe('rhombus', () => {
  it('diagonals 6 & 8 → area 24, side 5', () => {
    const r = rhombus(5, 6, 8)
    expect(r.area).toBe(24)
    expect(r.perimeter).toBe(20)
  })
  it('square (equal diagonals) → 90°', () => {
    const r = rhombus(Math.SQRT2, 2, 2)
    expect(r.angleDeg).toBeCloseTo(90)
  })
})

describe('trapezoid', () => {
  it('a=2, b=4, h=3 → area 9', () => {
    const t = trapezoid(2, 4, 3)
    expect(t.area).toBe(9)
    expect(t.midsegment).toBe(3)
    expect(t.perimeter).toBeNull()
  })
  it('with legs', () => {
    const t = trapezoid(2, 4, 3, 4, 5)
    expect(t.perimeter).toBe(15)
  })
})

describe('kite', () => {
  it('diagonals only', () => {
    const k = kite(6, 8)
    expect(k.area).toBe(24)
    expect(k.perimeter).toBeNull()
  })
  it('with sides', () => {
    const k = kite(6, 8, 5, 7)
    expect(k.perimeter).toBe(24)
  })
})
