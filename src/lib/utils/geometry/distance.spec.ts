import { describe, expect, it } from 'vitest'
import { distance2D, distance3D } from './distance'

describe('distance2D', () => {
  it('3-4-5', () => {
    const r = distance2D({ x: 0, y: 0 }, { x: 3, y: 4 })
    expect(r.distance).toBe(5)
    expect(r.manhattan).toBe(7)
    expect(r.midpoint).toEqual({ x: 1.5, y: 2 })
    expect(r.dx).toBe(3)
    expect(r.dy).toBe(4)
  })
  it('same point', () => {
    const r = distance2D({ x: 1, y: 1 }, { x: 1, y: 1 })
    expect(r.distance).toBe(0)
    expect(r.manhattan).toBe(0)
  })
  it('negative coords', () => {
    const r = distance2D({ x: -1, y: -1 }, { x: 1, y: 1 })
    expect(r.distance).toBeCloseTo(Math.sqrt(8))
    expect(r.midpoint).toEqual({ x: 0, y: 0 })
  })
})

describe('distance3D', () => {
  it('1-2-2 → distance=3', () => {
    const r = distance3D({ x: 0, y: 0, z: 0 }, { x: 1, y: 2, z: 2 })
    expect(r.distance).toBeCloseTo(3)
    expect(r.manhattan).toBe(5)
    expect(r.midpoint).toEqual({ x: 0.5, y: 1, z: 1 })
  })
})
