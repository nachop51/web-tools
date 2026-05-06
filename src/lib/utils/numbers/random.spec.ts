import { describe, expect, it } from 'vitest'
import { randomBatch, randomFloat, randomInt, randomGaussian, rollDice, computeStats, generateBatch } from './random'

describe('randomInt', () => {
  it('returns value within [min, max]', () => {
    for (let i = 0; i < 100; i++) {
      const v = randomInt(1, 10)
      expect(v).toBeGreaterThanOrEqual(1)
      expect(v).toBeLessThanOrEqual(10)
    }
  })

  it('returns integer', () => {
    for (let i = 0; i < 20; i++) {
      expect(Number.isInteger(randomInt(0, 1000))).toBe(true)
    }
  })

  it('works with negative range', () => {
    for (let i = 0; i < 20; i++) {
      const v = randomInt(-10, -1)
      expect(v).toBeGreaterThanOrEqual(-10)
      expect(v).toBeLessThanOrEqual(-1)
    }
  })
})

describe('randomFloat', () => {
  it('respects decimal places', () => {
    for (let i = 0; i < 20; i++) {
      const v = randomFloat(0, 1, 3)
      const str = String(v)
      const decimals = str.includes('.') ? str.split('.')[1].length : 0
      expect(decimals).toBeLessThanOrEqual(3)
    }
  })

  it('returns value within range', () => {
    for (let i = 0; i < 50; i++) {
      const v = randomFloat(5.0, 10.0, 2)
      expect(v).toBeGreaterThanOrEqual(5.0)
      expect(v).toBeLessThanOrEqual(10.0)
    }
  })

  it('handles 0 decimals as effectively an integer', () => {
    for (let i = 0; i < 20; i++) {
      const v = randomFloat(1, 100, 0)
      expect(Number.isInteger(v)).toBe(true)
    }
  })
})

describe('randomBatch', () => {
  it('returns correct count', () => {
    expect(randomBatch(1, 10, 5, 'int', 0)).toHaveLength(5)
    expect(randomBatch(1, 10, 1, 'int', 0)).toHaveLength(1)
    expect(randomBatch(0, 1, 20, 'float', 2)).toHaveLength(20)
  })

  it('int mode returns integers', () => {
    const batch = randomBatch(1, 100, 10, 'int', 0)
    batch.forEach((v) => expect(Number.isInteger(v)).toBe(true))
  })

  it('float mode respects decimals', () => {
    const batch = randomBatch(0, 1, 10, 'float', 4)
    batch.forEach((v) => {
      const dec = String(v).split('.')[1]?.length ?? 0
      expect(dec).toBeLessThanOrEqual(4)
    })
  })
})

describe('randomGaussian', () => {
  it('returns finite number', () => {
    for (let i = 0; i < 50; i++) {
      expect(isFinite(randomGaussian(0, 1, 4))).toBe(true)
    }
  })

  it('respects decimal places', () => {
    for (let i = 0; i < 30; i++) {
      const v = randomGaussian(100, 15, 2)
      const dec = String(v).split('.')[1]?.length ?? 0
      expect(dec).toBeLessThanOrEqual(2)
    }
  })

  it('clusters near mean over many samples', () => {
    const samples = Array.from({ length: 10_000 }, () => randomGaussian(50, 5, 4))
    const avg = samples.reduce((a, b) => a + b, 0) / samples.length
    expect(avg).toBeGreaterThan(49.5)
    expect(avg).toBeLessThan(50.5)
  })

  it('handles decimals=0', () => {
    for (let i = 0; i < 20; i++) {
      expect(Number.isInteger(randomGaussian(0, 1, 0))).toBe(true)
    }
  })
})

describe('rollDice', () => {
  it('returns correct count', () => {
    expect(rollDice(6, 3)).toHaveLength(3)
    expect(rollDice(20, 1)).toHaveLength(1)
  })

  it('all results within [1, sides]', () => {
    for (const sides of [4, 6, 8, 10, 12, 20, 100] as const) {
      for (let i = 0; i < 100; i++) {
        const rolls = rollDice(sides, 4)
        rolls.forEach((r) => {
          expect(r).toBeGreaterThanOrEqual(1)
          expect(r).toBeLessThanOrEqual(sides)
          expect(Number.isInteger(r)).toBe(true)
        })
      }
    }
  })

  it('handles ndice=1', () => {
    for (let i = 0; i < 50; i++) {
      const [r] = rollDice(6, 1)
      expect(r).toBeGreaterThanOrEqual(1)
      expect(r).toBeLessThanOrEqual(6)
    }
  })
})

describe('computeStats', () => {
  it('computes correctly for known dataset', () => {
    const s = computeStats([2, 4, 4, 4, 5, 5, 7, 9])
    expect(s.count).toBe(8)
    expect(s.sum).toBe(40)
    expect(s.min).toBe(2)
    expect(s.max).toBe(9)
    expect(s.mean).toBeCloseTo(5, 5)
    expect(s.median).toBe(4.5)
    expect(s.stdDev).toBeCloseTo(2, 1)
  })

  it('single element: stdDev=0, median=value', () => {
    const s = computeStats([42])
    expect(s.count).toBe(1)
    expect(s.sum).toBe(42)
    expect(s.mean).toBe(42)
    expect(s.median).toBe(42)
    expect(s.stdDev).toBe(0)
  })

  it('two elements', () => {
    const s = computeStats([3, 7])
    expect(s.mean).toBe(5)
    expect(s.median).toBe(5)
    expect(s.min).toBe(3)
    expect(s.max).toBe(7)
  })

  it('handles negatives', () => {
    const s = computeStats([-5, -3, -1, 1, 3, 5])
    expect(s.mean).toBe(0)
    expect(s.sum).toBe(0)
    expect(s.min).toBe(-5)
    expect(s.max).toBe(5)
  })

  it('handles floats', () => {
    const s = computeStats([1.5, 2.5, 3.5])
    expect(s.mean).toBeCloseTo(2.5)
    expect(s.median).toBeCloseTo(2.5)
  })
})

describe('generateBatch', () => {
  it('int mode returns integers', () => {
    const result = generateBatch({ mode: 'int', min: 1, max: 100, count: 10, decimals: 0, unique: false, mean: 0, std: 1 })
    result.forEach((v) => expect(Number.isInteger(v)).toBe(true))
  })

  it('float mode respects decimals', () => {
    const result = generateBatch({ mode: 'float', min: 0, max: 1, count: 10, decimals: 3, unique: false, mean: 0, std: 1 })
    result.forEach((v) => {
      const dec = String(v).split('.')[1]?.length ?? 0
      expect(dec).toBeLessThanOrEqual(3)
    })
  })

  it('gaussian mode returns floats', () => {
    const result = generateBatch({ mode: 'gaussian', min: 0, max: 1, count: 10, decimals: 2, unique: false, mean: 0, std: 1 })
    expect(result).toHaveLength(10)
    result.forEach((v) => expect(isFinite(v)).toBe(true))
  })

  it('unique int mode returns no duplicates', () => {
    const result = generateBatch({ mode: 'int', min: 1, max: 10, count: 10, decimals: 0, unique: true, mean: 0, std: 1 })
    expect(new Set(result).size).toBe(result.length)
    expect(result.length).toBe(10)
  })

  it('unique int clamps count to range size', () => {
    const result = generateBatch({ mode: 'int', min: 1, max: 5, count: 20, decimals: 0, unique: true, mean: 0, std: 1 })
    expect(result.length).toBe(5)
    expect(new Set(result).size).toBe(5)
  })
})
