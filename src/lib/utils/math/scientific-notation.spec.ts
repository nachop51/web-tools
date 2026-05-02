import { describe, it, expect } from "vitest";
import { toScientific, fromScientific } from "./scientific-notation";

describe("toScientific", () => {
  it("1000 → exponent 3", () => {
    expect(toScientific(1000).exponent).toBe(3);
  });

  it("1000 → coefficient 1", () => {
    expect(toScientific(1000).coefficient).toBe(1);
  });
});

describe("fromScientific", () => {
  it("1.5 × 10³ = 1500", () => {
    expect(fromScientific(1.5, 3)).toBe(1500);
  });

  it("6.022 × 10²³ ≈ 6.022e23", () => {
    expect(fromScientific(6.022, 23) / 6.022e23).toBeCloseTo(1, 10);
  });
});
