import { describe, it, expect } from 'vitest'
import {
  gcd,
  lcm,
  gcdMany,
  lcmMany,
  gcdSteps,
  extendedGcd,
  divisorsOf,
  pairwiseGcd,
  isPairwiseCoprime,
  reductionChain,
  gcdBig,
  lcmBig,
  gcdManyBig,
  lcmManyBig,
  extendedGcdBig,
  gcdStepsBig,
} from './gcf-lcm'

describe('gcd', () => {
  it('gcd(12, 8) = 4', () => {
    expect(gcd(12, 8)).toBe(4)
  })
  it('gcd(100, 75) = 25', () => {
    expect(gcd(100, 75)).toBe(25)
  })
  it('gcd(7, 5) = 1 (coprime)', () => {
    expect(gcd(7, 5)).toBe(1)
  })
  it('gcd(0, 5) = 5', () => {
    expect(gcd(0, 5)).toBe(5)
  })
  it('works with negatives', () => {
    expect(gcd(-12, 8)).toBe(4)
  })
})

describe('lcm', () => {
  it('lcm(4, 6) = 12', () => {
    expect(lcm(4, 6)).toBe(12)
  })
  it('lcm(3, 5) = 15', () => {
    expect(lcm(3, 5)).toBe(15)
  })
  it('lcm(0, 5) = 0', () => {
    expect(lcm(0, 5)).toBe(0)
  })
})

describe('gcdMany / lcmMany', () => {
  it('gcdMany([12, 8, 4]) = 4', () => {
    expect(gcdMany([12, 8, 4])).toBe(4)
  })
  it('lcmMany([2, 3, 4]) = 12', () => {
    expect(lcmMany([2, 3, 4])).toBe(12)
  })
  it('empty array returns 0', () => {
    expect(gcdMany([])).toBe(0)
    expect(lcmMany([])).toBe(0)
  })
})

describe('gcdSteps', () => {
  it('gcdSteps(12, 8) produces correct Euclidean steps', () => {
    const steps = gcdSteps(12, 8)
    expect(steps[0]).toEqual({ a: 12, b: 8, remainder: 4 })
    expect(steps[1]).toEqual({ a: 8, b: 4, remainder: 0 })
  })
  it('last step has remainder 0', () => {
    const steps = gcdSteps(100, 75)
    expect(steps[steps.length - 1].remainder).toBe(0)
  })
  it('coprime numbers end with remainder 0 in final step', () => {
    const steps = gcdSteps(7, 5)
    expect(steps[steps.length - 1].remainder).toBe(0)
  })
})

describe('extendedGcd', () => {
  it('satisfies a*x + b*y = g for (15, 28)', () => {
    const { g, x, y } = extendedGcd(15, 28)
    expect(g).toBe(1)
    expect(15 * x + 28 * y).toBe(1)
  })
  it('satisfies identity for (12, 18)', () => {
    const { g, x, y } = extendedGcd(12, 18)
    expect(g).toBe(6)
    expect(12 * x + 18 * y).toBe(6)
  })
  it('satisfies identity for (240, 46)', () => {
    const { g, x, y } = extendedGcd(240, 46)
    expect(g).toBe(2)
    expect(240 * x + 46 * y).toBe(2)
  })
  it('handles a divides b', () => {
    const { g, x, y } = extendedGcd(7, 21)
    expect(g).toBe(7)
    expect(7 * x + 21 * y).toBe(7)
  })
  it('preserves sign of inputs in identity', () => {
    const { g, x, y } = extendedGcd(-12, 18)
    expect(g).toBe(6)
    expect(-12 * x + 18 * y).toBe(6)
  })
})

describe('divisorsOf', () => {
  it('divisorsOf(12) = [1,2,3,4,6,12]', () => {
    expect(divisorsOf(12)).toEqual([1, 2, 3, 4, 6, 12])
  })
  it('divisorsOf(1) = [1]', () => {
    expect(divisorsOf(1)).toEqual([1])
  })
  it('divisorsOf(prime) = [1, p]', () => {
    expect(divisorsOf(13)).toEqual([1, 13])
  })
  it('divisorsOf(36) is sorted ascending', () => {
    expect(divisorsOf(36)).toEqual([1, 2, 3, 4, 6, 9, 12, 18, 36])
  })
  it('divisorsOf(0) = []', () => {
    expect(divisorsOf(0)).toEqual([])
  })
})

describe('pairwiseGcd', () => {
  it('builds a 3x3 matrix with diagonal = |n|', () => {
    const m = pairwiseGcd([12, 18, 24])
    expect(m[0][0]).toBe(12)
    expect(m[1][1]).toBe(18)
    expect(m[2][2]).toBe(24)
  })
  it('off-diagonal cells are pairwise gcd', () => {
    const m = pairwiseGcd([12, 18, 24])
    expect(m[0][1]).toBe(6)
    expect(m[0][2]).toBe(12)
    expect(m[1][2]).toBe(6)
  })
})

describe('isPairwiseCoprime', () => {
  it('true for primes [7,11,13,17]', () => {
    expect(isPairwiseCoprime([7, 11, 13, 17])).toBe(true)
  })
  it('false for [6, 10, 15] (set-coprime but not pairwise)', () => {
    expect(isPairwiseCoprime([6, 10, 15])).toBe(false)
  })
  it('false for fewer than 2 elements', () => {
    expect(isPairwiseCoprime([5])).toBe(false)
    expect(isPairwiseCoprime([])).toBe(false)
  })
})

describe('reductionChain', () => {
  it('produces n-1 reductions for n inputs', () => {
    const chain = reductionChain([12, 18, 24])
    expect(chain.length).toBe(2)
    expect(chain[0].result).toBe(6)
    expect(chain[1].result).toBe(6)
  })
  it('empty for fewer than 2 inputs', () => {
    expect(reductionChain([5])).toEqual([])
  })
})

describe('BigInt variants', () => {
  it('gcdBig agrees with gcd on small numbers', () => {
    expect(gcdBig(12n, 18n)).toBe(6n)
    expect(gcdBig(100n, 75n)).toBe(25n)
  })
  it('lcmBig agrees with lcm', () => {
    expect(lcmBig(4n, 6n)).toBe(12n)
  })
  it('gcdManyBig / lcmManyBig', () => {
    expect(gcdManyBig([12n, 18n, 24n])).toBe(6n)
    expect(lcmManyBig([2n, 3n, 4n])).toBe(12n)
  })
  it('gcdBig handles huge numbers (>2^53)', () => {
    const a = 12345678901234567890n
    const b = 98765432109876543210n
    expect(gcdBig(a, b)).toBe(900000000090n)
  })
  it('extendedGcdBig satisfies identity for huge numbers', () => {
    const a = 12345678901234567890n
    const b = 98765432109876543210n
    const { g, x, y } = extendedGcdBig(a, b)
    expect(a * x + b * y).toBe(g)
  })
  it('gcdStepsBig last step has remainder 0', () => {
    const steps = gcdStepsBig(100n, 75n)
    expect(steps[steps.length - 1].remainder).toBe(0n)
  })
})
