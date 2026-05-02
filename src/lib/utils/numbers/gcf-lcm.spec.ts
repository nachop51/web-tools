import { describe, it, expect } from "vitest";
import { gcd, lcm, gcdMany, lcmMany, gcdSteps } from "./gcf-lcm";

describe("gcd", () => {
  it("gcd(12, 8) = 4", () => {
    expect(gcd(12, 8)).toBe(4);
  });
  it("gcd(100, 75) = 25", () => {
    expect(gcd(100, 75)).toBe(25);
  });
  it("gcd(7, 5) = 1 (coprime)", () => {
    expect(gcd(7, 5)).toBe(1);
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

describe("gcdMany / lcmMany", () => {
  it("gcdMany([12, 8, 4]) = 4", () => {
    expect(gcdMany([12, 8, 4])).toBe(4);
  });
  it("lcmMany([2, 3, 4]) = 12", () => {
    expect(lcmMany([2, 3, 4])).toBe(12);
  });
  it("empty array returns 0", () => {
    expect(gcdMany([])).toBe(0);
    expect(lcmMany([])).toBe(0);
  });
});

describe("gcdSteps", () => {
  it("gcdSteps(12, 8) produces correct Euclidean steps", () => {
    const steps = gcdSteps(12, 8);
    expect(steps[0]).toEqual({ a: 12, b: 8, remainder: 4 });
    expect(steps[1]).toEqual({ a: 8, b: 4, remainder: 0 });
  });
  it("last step has remainder 0", () => {
    const steps = gcdSteps(100, 75);
    expect(steps[steps.length - 1].remainder).toBe(0);
  });
  it("coprime numbers end with remainder 0 in final step", () => {
    const steps = gcdSteps(7, 5);
    expect(steps[steps.length - 1].remainder).toBe(0);
  });
});
