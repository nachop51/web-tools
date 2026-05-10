import { describe, expect, it } from 'vitest'
import { unitCirclePoints, findPoint } from './unit-circle'

describe('unitCirclePoints', () => {
  it('has 16 points', () => {
    expect(unitCirclePoints.length).toBe(16)
  })
  it('starts at 0°', () => {
    expect(unitCirclePoints[0].deg).toBe(0)
  })
  it('cos(0) = 1', () => {
    expect(unitCirclePoints[0].cos).toBe(1)
    expect(unitCirclePoints[0].sin).toBe(0)
  })
  it('sin(90°) = 1, cos(90°) = 0', () => {
    const p = findPoint(90)!
    expect(p.sin).toBe(1)
    expect(p.cos).toBe(0)
  })
  it('quadrant 2 for 120°', () => {
    expect(findPoint(120)?.quadrant).toBe(2)
  })
  it('quadrant 0 (axis) for 180°', () => {
    expect(findPoint(180)?.quadrant).toBe(0)
  })
  it('45° has √2/2 exact', () => {
    const p = findPoint(45)!
    expect(p.cosExact).toBe('√2/2')
    expect(p.sinExact).toBe('√2/2')
  })
})
