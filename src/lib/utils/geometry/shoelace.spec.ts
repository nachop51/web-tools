import { describe, expect, it } from 'vitest'
import { parseVertices, shoelace } from './shoelace'

describe('shoelace', () => {
  it('unit square CCW', () => {
    const r = shoelace([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
    ])!
    expect(r.area).toBe(1)
    expect(r.signedArea).toBe(1)
    expect(r.orientation).toBe('ccw')
    expect(r.perimeter).toBe(4)
    expect(r.centroid).toEqual({ x: 0.5, y: 0.5 })
  })

  it('unit square CW negative signed area', () => {
    const r = shoelace([
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: 0 },
    ])!
    expect(r.area).toBe(1)
    expect(r.signedArea).toBe(-1)
    expect(r.orientation).toBe('cw')
  })

  it('triangle 3-4-5', () => {
    const r = shoelace([
      { x: 0, y: 0 },
      { x: 3, y: 0 },
      { x: 0, y: 4 },
    ])!
    expect(r.area).toBe(6)
    expect(r.perimeter).toBeCloseTo(12)
  })

  it('< 3 vertices returns null', () => {
    expect(shoelace([{ x: 0, y: 0 }])).toBeNull()
    expect(shoelace([{ x: 0, y: 0 }, { x: 1, y: 1 }])).toBeNull()
  })

  it('bbox', () => {
    const r = shoelace([
      { x: -1, y: -2 },
      { x: 3, y: -2 },
      { x: 3, y: 5 },
      { x: -1, y: 5 },
    ])!
    expect(r.bbox).toEqual({ minX: -1, maxX: 3, minY: -2, maxY: 5, width: 4, height: 7 })
  })
})

describe('parseVertices', () => {
  it('comma-separated', () => {
    const { vertices } = parseVertices('1, 2\n3, 4')
    expect(vertices).toEqual([{ x: 1, y: 2 }, { x: 3, y: 4 }])
  })
  it('space-separated', () => {
    const { vertices } = parseVertices('1 2\n3 4')
    expect(vertices).toEqual([{ x: 1, y: 2 }, { x: 3, y: 4 }])
  })
  it('parens & extra whitespace', () => {
    const { vertices } = parseVertices('  (1, 2)  \n  (-3, 4) ')
    expect(vertices).toEqual([{ x: 1, y: 2 }, { x: -3, y: 4 }])
  })
  it('reports bad lines', () => {
    const { vertices, bad } = parseVertices('1,2\nbad\n3,4')
    expect(vertices.length).toBe(2)
    expect(bad).toEqual([2])
  })
  it('skips empty lines', () => {
    const { vertices, bad } = parseVertices('\n\n1 2\n')
    expect(vertices.length).toBe(1)
    expect(bad.length).toBe(0)
  })
})
