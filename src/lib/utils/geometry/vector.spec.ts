import { describe, expect, it } from 'vitest'
import { vector2D, vector3D } from './vector'

describe('vector2D', () => {
  it('basic', () => {
    const r = vector2D([1, 0], [0, 1])
    expect(r.magA).toBe(1)
    expect(r.magB).toBe(1)
    expect(r.dot).toBe(0)
    expect(r.angleDeg).toBeCloseTo(90)
    expect(r.cross).toBe(1)
  })

  it('parallel angle 0', () => {
    const r = vector2D([2, 0], [3, 0])
    expect(r.angleDeg).toBeCloseTo(0)
  })

  it('antiparallel angle 180', () => {
    const r = vector2D([1, 0], [-1, 0])
    expect(r.angleDeg).toBeCloseTo(180)
  })

  it('projection of (3,0) onto (1,0)', () => {
    const r = vector2D([3, 0], [1, 0])
    expect(r.projection).toEqual([3, 0])
  })

  it('zero magnitude no angle', () => {
    const r = vector2D([0, 0], [1, 1])
    expect(isNaN(r.angleDeg)).toBe(true)
    expect(r.unitA).toBeNull()
  })
})

describe('vector3D', () => {
  it('cross of i × j = k', () => {
    const r = vector3D([1, 0, 0], [0, 1, 0])
    expect(r.cross).toEqual([0, 0, 1])
    expect(r.angleDeg).toBeCloseTo(90)
  })

  it('magnitude (3,4,0) = 5', () => {
    const r = vector3D([3, 4, 0], [1, 0, 0])
    expect(r.magA).toBe(5)
  })

  it('sum and diff', () => {
    const r = vector3D([1, 2, 3], [4, 5, 6])
    expect(r.sum).toEqual([5, 7, 9])
    expect(r.diff).toEqual([-3, -3, -3])
  })
})
