import { describe, it, expect } from 'vitest'
import { solveQuadratic } from './quadratic'

describe('solveQuadratic', () => {
  it('x²-5x+6=0 → roots 3 and 2, disc=1', () => {
    const r = solveQuadratic(1, -5, 6)
    expect(r.nature).toBe('two-real')
    expect(r.discriminant).toBe(1)
    const vals = r.roots.map((root) => (root.type === 'real' ? root.value : null))
    expect(vals).toContain(3)
    expect(vals).toContain(2)
  })

  it('x²-2x+1=0 → root 1, disc=0', () => {
    const r = solveQuadratic(1, -2, 1)
    expect(r.nature).toBe('one-real')
    expect(r.discriminant).toBe(0)
    expect(r.roots[0]).toMatchObject({ type: 'real', value: 1 })
  })

  it('x²+1=0 → complex roots, disc=-4', () => {
    const r = solveQuadratic(1, 0, 1)
    expect(r.nature).toBe('complex')
    expect(r.discriminant).toBe(-4)
  })

  it('a=0 throws', () => {
    expect(() => solveQuadratic(0, 1, 1)).toThrow()
  })
})
