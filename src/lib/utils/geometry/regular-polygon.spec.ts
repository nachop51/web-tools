import { describe, expect, it } from 'vitest'
import { polygonName, regularPolygon } from './regular-polygon'

describe('regularPolygon', () => {
  it('square from side', () => {
    const p = regularPolygon(4, 'side', 2)
    expect(p.name).toBe('Square')
    expect(p.perimeter).toBe(8)
    expect(p.area).toBeCloseTo(4)
    expect(p.interiorAngle).toBe(90)
    expect(p.centralAngle).toBe(90)
    expect(p.interiorAngleSum).toBe(360)
    expect(p.circumradius).toBeCloseTo(Math.SQRT2)
  })

  it('hexagon from circumradius', () => {
    const p = regularPolygon(6, 'circumradius', 1)
    expect(p.side).toBeCloseTo(1)
    expect(p.area).toBeCloseTo((3 * Math.sqrt(3)) / 2)
    expect(p.interiorAngle).toBe(120)
  })

  it('triangle from side', () => {
    const p = regularPolygon(3, 'side', 1)
    expect(p.name).toBe('Triangle')
    expect(p.area).toBeCloseTo(Math.sqrt(3) / 4)
    expect(p.interiorAngle).toBeCloseTo(60)
  })

  it('apothem round-trip', () => {
    const a = regularPolygon(8, 'side', 5)
    const b = regularPolygon(8, 'apothem', a.apothem)
    expect(b.side).toBeCloseTo(5)
  })

  it('throws for n<3', () => {
    expect(() => regularPolygon(2, 'side', 1)).toThrow()
  })

  it('throws for negative value', () => {
    expect(() => regularPolygon(5, 'side', -1)).toThrow()
  })

  it('polygonName for unknown', () => {
    expect(polygonName(20)).toBe('20-gon')
  })
})
