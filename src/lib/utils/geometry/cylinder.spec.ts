import { describe, expect, it } from 'vitest'
import { cone, cylinder, frustum } from './cylinder'

describe('cylinder', () => {
  it('r=1, h=1', () => {
    const c = cylinder(1, 1)
    expect(c.volume).toBeCloseTo(Math.PI)
    expect(c.lateralArea).toBeCloseTo(2 * Math.PI)
    expect(c.totalArea).toBeCloseTo(4 * Math.PI)
    expect(c.slantHeight).toBeNull()
  })
})

describe('cone', () => {
  it('r=3, h=4 → slant=5', () => {
    const c = cone(3, 4)
    expect(c.slantHeight).toBeCloseTo(5)
    expect(c.volume).toBeCloseTo((1 / 3) * Math.PI * 9 * 4)
    expect(c.lateralArea).toBeCloseTo(Math.PI * 3 * 5)
  })
})

describe('frustum', () => {
  it('r1=2, r2=1, h=√3 → slant=2', () => {
    const f = frustum(2, 1, Math.sqrt(3))
    expect(f.slantHeight).toBeCloseTo(2)
    // V = (1/3) π h (r1² + r2² + r1·r2) = (1/3) π √3 (4+1+2) = (7/3) π √3
    expect(f.volume).toBeCloseTo((7 / 3) * Math.PI * Math.sqrt(3))
  })

  it('frustum with equal radii equals cylinder', () => {
    const f = frustum(2, 2, 5)
    const c = cylinder(2, 5)
    expect(f.volume).toBeCloseTo(c.volume)
    expect(f.lateralArea).toBeCloseTo(c.lateralArea)
  })

  it('frustum with r2=0 equals cone', () => {
    const f = frustum(3, 0, 4)
    const c = cone(3, 4)
    expect(f.volume).toBeCloseTo(c.volume)
  })
})
