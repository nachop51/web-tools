import { describe, expect, it } from "vitest";
import { roundDecimal, roundSigFigs } from "./rounding";

describe("roundDecimal", () => {
  it("half-up: 2.5 rounds to 3", () => {
    expect(roundDecimal(2.5, 0, "half-up")).toBe(3);
  });

  it("half-down: 2.5 rounds to 2", () => {
    expect(roundDecimal(2.5, 0, "half-down")).toBe(2);
  });

  it("half-even: 2.5 rounds to 2 (nearest even)", () => {
    expect(roundDecimal(2.5, 0, "half-even")).toBe(2);
  });

  it("half-even: 3.5 rounds to 4 (nearest even)", () => {
    expect(roundDecimal(3.5, 0, "half-even")).toBe(4);
  });

  it("ceil: 2.1 rounds to 3", () => {
    expect(roundDecimal(2.1, 0, "ceil")).toBe(3);
  });

  it("floor: 2.9 rounds to 2", () => {
    expect(roundDecimal(2.9, 0, "floor")).toBe(2);
  });

  it("truncate: -2.9 truncates to -2", () => {
    expect(roundDecimal(-2.9, 0, "truncate")).toBe(-2);
  });

  it("rounds to decimal places: 3.14159 to 2 places", () => {
    expect(roundDecimal(3.14159, 2, "half-up")).toBe(3.14);
  });
});

describe("roundSigFigs", () => {
  it("roundSigFigs(12345, 3) = 12300", () => {
    expect(roundSigFigs(12345, 3)).toBe(12300);
  });

  it("roundSigFigs(0, 3) = 0", () => {
    expect(roundSigFigs(0, 3)).toBe(0);
  });

  it("roundSigFigs(0.00456, 2) = 0.0046", () => {
    expect(roundSigFigs(0.00456, 2)).toBe(0.0046);
  });
});
