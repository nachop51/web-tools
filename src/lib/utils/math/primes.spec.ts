import { describe, expect, it } from "vitest";
import { isPrime, primeFactors, primeFactorsGrouped, primesUpTo } from "./primes";

describe("isPrime", () => {
  it("isPrime(2) = true", () => {
    expect(isPrime(2)).toBe(true);
  });

  it("isPrime(1) = false", () => {
    expect(isPrime(1)).toBe(false);
  });

  it("isPrime(17) = true", () => {
    expect(isPrime(17)).toBe(true);
  });

  it("isPrime(18) = false", () => {
    expect(isPrime(18)).toBe(false);
  });

  it("isPrime(0) = false", () => {
    expect(isPrime(0)).toBe(false);
  });

  it("isPrime(-7) = false", () => {
    expect(isPrime(-7)).toBe(false);
  });
});

describe("primeFactors", () => {
  it("primeFactors(12) = [2, 2, 3]", () => {
    expect(primeFactors(12)).toEqual([2, 2, 3]);
  });

  it("primeFactors(1) = []", () => {
    expect(primeFactors(1)).toEqual([]);
  });

  it("primeFactors(7) = [7]", () => {
    expect(primeFactors(7)).toEqual([7]);
  });
});

describe("primeFactorsGrouped", () => {
  it("groups factors of 12 correctly", () => {
    expect(primeFactorsGrouped(12)).toEqual([
      { prime: 2, exponent: 2 },
      { prime: 3, exponent: 1 },
    ]);
  });
});

describe("primesUpTo", () => {
  it("primesUpTo(10) = [2, 3, 5, 7]", () => {
    expect(primesUpTo(10)).toEqual([2, 3, 5, 7]);
  });

  it("primesUpTo(1) = []", () => {
    expect(primesUpTo(1)).toEqual([]);
  });

  it("caps at 10000", () => {
    const result = primesUpTo(99999);
    expect(result[result.length - 1]).toBeLessThanOrEqual(10000);
  });
});
