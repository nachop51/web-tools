import { describe, expect, it } from 'vitest'
import { randomBatch, randomFloat, randomInt } from './random'

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
