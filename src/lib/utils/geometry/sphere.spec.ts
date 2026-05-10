import { describe, expect, it } from 'vitest'
import { sphereFrom } from './sphere'

describe('sphereFrom', () => {
  it('radius=1', () => {
    const s = sphereFrom('radius', 1)
    expect(s.radius).toBe(1)
    expect(s.diameter).toBe(2)
    expect(s.surfaceArea).toBeCloseTo(4 * Math.PI)
    expect(s.volume).toBeCloseTo((4 / 3) * Math.PI)
  })

  it('diameter=2 same as radius=1', () => {
    const a = sphereFrom('radius', 1)
    const b = sphereFrom('diameter', 2)
    expect(b.volume).toBeCloseTo(a.volume)
  })

  it('volume round-trip', () => {
    const a = sphereFrom('radius', 5)
    const b = sphereFrom('volume', a.volume)
    expect(b.radius).toBeCloseTo(5)
  })

  it('surfaceArea round-trip', () => {
    const a = sphereFrom('radius', 3)
    const b = sphereFrom('surfaceArea', a.surfaceArea)
    expect(b.radius).toBeCloseTo(3)
  })

  it('zero radius', () => {
    const s = sphereFrom('radius', 0)
    expect(s.surfaceArea).toBe(0)
    expect(s.volume).toBe(0)
  })
})
