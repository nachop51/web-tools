import { describe, expect, it } from "vitest";
import { gcd, gcdMultiple, lcm, lcmMultiple } from "./gcd";

describe("gcd", () => {
  it("gcd(12, 8) = 4", () => {
    expect(gcd(12, 8)).toBe(4);
  });

  it("gcd(17, 5) = 1 (coprime)", () => {
    expect(gcd(17, 5)).toBe(1);
  });

  it("gcd(0, 5) = 5", () => {
    expect(gcd(0, 5)).toBe(5);
  });

  it("works with negatives", () => {
    expect(gcd(-12, 8)).toBe(4);
  });
});

describe("lcm", () => {
  it("lcm(4, 6) = 12", () => {
    expect(lcm(4, 6)).toBe(12);
  });

  it("lcm(3, 5) = 15", () => {
    expect(lcm(3, 5)).toBe(15);
  });

  it("lcm(0, 5) = 0", () => {
    expect(lcm(0, 5)).toBe(0);
  });
});

describe("gcdMultiple", () => {
  it("gcdMultiple([12, 8, 4]) = 4", () => {
    expect(gcdMultiple([12, 8, 4])).toBe(4);
  });

  it("empty array returns 0", () => {
    expect(gcdMultiple([])).toBe(0);
  });
});

describe("lcmMultiple", () => {
  it("lcmMultiple([2, 3, 4]) = 12", () => {
    expect(lcmMultiple([2, 3, 4])).toBe(12);
  });

  it("empty array returns 0", () => {
    expect(lcmMultiple([])).toBe(0);
  });
});
