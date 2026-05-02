import { describe, expect, it } from "vitest";
import { convert } from "./converter";
import { timeUnits } from "./time";

describe("time conversions", () => {
  it("converts 1 h to 60 min", () => {
    const result = convert(1, timeUnits.h.factor, timeUnits.min.factor);
    expect(result).toBe(60);
  });

  it("converts 1 day to 86400 s", () => {
    const result = convert(1, timeUnits.day.factor, timeUnits.s.factor);
    expect(result).toBe(86400);
  });

  it("converts 1 year to 365.25 days", () => {
    const result = convert(1, timeUnits.year.factor, timeUnits.day.factor);
    expect(result).toBeCloseTo(365.25, 5);
  });

  it("converts 0 input to 0", () => {
    const result = convert(0, timeUnits.h.factor, timeUnits.s.factor);
    expect(result).toBe(0);
  });

  it("converts negative values", () => {
    const result = convert(-1, timeUnits.min.factor, timeUnits.s.factor);
    expect(result).toBe(-60);
  });

  it("round-trips 1 h → s → h = 1", () => {
    const seconds = convert(1, timeUnits.h.factor, timeUnits.s.factor);
    const backToH = convert(seconds, timeUnits.s.factor, timeUnits.h.factor);
    expect(backToH).toBeCloseTo(1, 10);
  });
});
