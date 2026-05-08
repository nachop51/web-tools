import { describe, it, expect } from 'vitest'
import {
  simplifyRatio,
  simplifyRatioFromStrings,
  simplifyMultiRatio,
  simplifyMultiRatioFromStrings,
  solveRatio,
  ratioToPercent,
  splitByRatio,
  solveProportion,
  aspectFromDimensions,
  dimensionsFromAspect,
  scaleRatio,
  decimalDigits,
} from './ratio'

describe('simplifyRatio', () => {
  it('6:4 → 3:2', () => {
    expect(simplifyRatio(6, 4)).toEqual({ a: 3, b: 2 })
  })

  it('decimal 1.5:2 with decimals=1 → 3:4', () => {
    expect(simplifyRatio(1.5, 2, 1)).toEqual({ a: 3, b: 4 })
  })

  it('preserves negative sign', () => {
    expect(simplifyRatio(-6, 4)).toEqual({ a: -3, b: 2 })
  })
})

describe('simplifyRatioFromStrings', () => {
  it('"1.5":"2" → 3:4', () => {
    expect(simplifyRatioFromStrings('1.5', '2')).toEqual({ a: 3, b: 4 })
  })

  it('"0.1":"0.2" → 1:2 (no float drift)', () => {
    expect(simplifyRatioFromStrings('0.1', '0.2')).toEqual({ a: 1, b: 2 })
  })

  it('"0.333":"1" → 333:1000', () => {
    expect(simplifyRatioFromStrings('0.333', '1')).toEqual({ a: 333, b: 1000 })
  })

  it('returns null for invalid', () => {
    expect(simplifyRatioFromStrings('abc', '2')).toBeNull()
    expect(simplifyRatioFromStrings('0', '0')).toBeNull()
  })
})

describe('decimalDigits', () => {
  it('counts decimals', () => {
    expect(decimalDigits('1.5')).toBe(1)
    expect(decimalDigits('0.001')).toBe(3)
    expect(decimalDigits('42')).toBe(0)
    expect(decimalDigits('1e-3')).toBe(3)
    expect(decimalDigits('1.5e-2')).toBe(3)
  })
})

describe('simplifyMultiRatio', () => {
  it('[4,8,12] → [1,2,3]', () => {
    expect(simplifyMultiRatio([4, 8, 12])).toEqual([1, 2, 3])
  })

  it('already simplified [2,3,5] stays', () => {
    expect(simplifyMultiRatio([2, 3, 5])).toEqual([2, 3, 5])
  })
})

describe('simplifyMultiRatioFromStrings', () => {
  it('decimals scale uniformly', () => {
    expect(simplifyMultiRatioFromStrings(['1.5', '3', '4.5'])).toEqual([1, 2, 3])
  })

  it('null on invalid', () => {
    expect(simplifyMultiRatioFromStrings(['1', 'x'])).toBeNull()
  })
})

describe('solveRatio', () => {
  it('2:3 = 4:? → 6', () => {
    expect(solveRatio(2, 3, 4)).toBe(6)
  })
})

describe('ratioToPercent', () => {
  it('1:3 → 25% / 75%', () => {
    expect(ratioToPercent(1, 3)).toEqual({ aPercent: 25, bPercent: 75 })
  })
})

describe('splitByRatio', () => {
  it('1500 in 2:3:5 → 300, 450, 750', () => {
    expect(splitByRatio(1500, [2, 3, 5])).toEqual([300, 450, 750])
  })

  it('null on invalid sum', () => {
    expect(splitByRatio(100, [0, 0])).toBeNull()
    expect(splitByRatio(100, [-1, 2])).toBeNull()
  })
})

describe('solveProportion', () => {
  it('all 4 unknown positions solve', () => {
    // 2:3 = 4:6 — try each cell unknown
    expect(solveProportion([null, 3, 4, 6])).toMatchObject({ kind: 'solved', index: 0, value: 2 })
    expect(solveProportion([2, null, 4, 6])).toMatchObject({ kind: 'solved', index: 1, value: 3 })
    expect(solveProportion([2, 3, null, 6])).toMatchObject({ kind: 'solved', index: 2, value: 4 })
    expect(solveProportion([2, 3, 4, null])).toMatchObject({ kind: 'solved', index: 3, value: 6 })
  })

  it('count=0/1 returns incomplete', () => {
    expect(solveProportion([null, null, null, null]).kind).toBe('incomplete')
    expect(solveProportion([2, null, null, null]).kind).toBe('incomplete')
  })

  it('count=2 same row → simplified', () => {
    expect(solveProportion([6, 4, null, null])).toMatchObject({ kind: 'simplified', row: 'top', a: 6, b: 4 })
    expect(solveProportion([null, null, 6, 4])).toMatchObject({ kind: 'simplified', row: 'bottom' })
  })

  it('count=2 cross-row → incomplete', () => {
    expect(solveProportion([2, null, 4, null]).kind).toBe('incomplete')
    expect(solveProportion([null, 3, null, 6]).kind).toBe('incomplete')
  })

  it('count=4 validates', () => {
    expect(solveProportion([2, 3, 4, 6])).toMatchObject({ kind: 'validated', valid: true })
    expect(solveProportion([2, 3, 4, 7])).toMatchObject({ kind: 'validated', valid: false })
  })

  it('divide-by-zero returns incomplete with hint', () => {
    // solving A: divisor is D
    expect(solveProportion([null, 3, 4, 0]).kind).toBe('incomplete')
    // solving B: divisor is C
    expect(solveProportion([2, null, 0, 6]).kind).toBe('incomplete')
  })
})

describe('aspectFromDimensions', () => {
  it('1920x1080 → 16:9', () => {
    expect(aspectFromDimensions(1920, 1080)).toMatchObject({ a: 16, b: 9, rounded: false })
  })

  it('1366x768 simplifies but flags rounded', () => {
    const r = aspectFromDimensions(1366, 768)
    expect(r).toMatchObject({ a: 683, b: 384 })
    expect(r!.rounded).toBe(false)
  })

  it('null on invalid', () => {
    expect(aspectFromDimensions(0, 100)).toBeNull()
    expect(aspectFromDimensions(-1, 1)).toBeNull()
  })
})

describe('dimensionsFromAspect', () => {
  it('16:9 with W=1920 → H=1080 exact', () => {
    expect(dimensionsFromAspect([16, 9], 1920, 'w')).toEqual({ value: 1080, rounded: false })
  })

  it('16:9 with W=1366 → H=769 rounded', () => {
    const r = dimensionsFromAspect([16, 9], 1366, 'w')
    expect(r).toMatchObject({ rounded: true })
  })
})

describe('scaleRatio', () => {
  it('[2,3] × 2.5 → [5, 7.5]', () => {
    expect(scaleRatio([2, 3], 2.5)).toEqual([5, 7.5])
  })

  it('round-to-int', () => {
    expect(scaleRatio([2, 3], 2.5, true)).toEqual([5, 8])
  })
})
