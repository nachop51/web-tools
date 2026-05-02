import { describe, it, expect } from "vitest";
import { factorial, permutation, combination } from "./factorial";

describe("factorial", () => {
  it("0! = 1", () => {
    expect(factorial(0)).toBe(1);
  });

  it("5! = 120", () => {
    expect(factorial(5)).toBe(120);
  });

  it("throws for n > 170", () => {
    expect(() => factorial(171)).toThrow();
  });
});

describe("permutation", () => {
  it("P(5,2) = 20", () => {
    expect(permutation(5, 2)).toBe(20);
  });
});

describe("combination", () => {
  it("C(5,2) = 10", () => {
    expect(combination(5, 2)).toBe(10);
  });
});
