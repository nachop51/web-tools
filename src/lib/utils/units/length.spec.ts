import { describe, expect, it } from "vitest";
import { convert } from "./converter";
import { lengthUnits } from "./length";

describe("length conversions", () => {
  it("converts 1 km to 1000 m", () => {
    const result = convert(1, lengthUnits.km.factor, lengthUnits.m.factor);
    expect(result).toBe(1000);
  });

  it("converts 1 mi to approximately 1609.344 m", () => {
    const result = convert(1, lengthUnits.mi.factor, lengthUnits.m.factor);
    expect(result).toBeCloseTo(1609.344, 3);
  });

  it("converts 1 ft to 12 in", () => {
    const result = convert(1, lengthUnits.ft.factor, lengthUnits.in.factor);
    expect(result).toBeCloseTo(12, 5);
  });

  it("round-trips 1 km → m → km = 1", () => {
    const meters = convert(1, lengthUnits.km.factor, lengthUnits.m.factor);
    const backToKm = convert(meters, lengthUnits.m.factor, lengthUnits.km.factor);
    expect(backToKm).toBeCloseTo(1, 10);
  });

  it("converts 0 input to 0 in all units", () => {
    const result = convert(0, lengthUnits.km.factor, lengthUnits.m.factor);
    expect(result).toBe(0);
  });

  it("returns NaN for NaN input", () => {
    const result = convert(NaN, lengthUnits.km.factor, lengthUnits.m.factor);
    expect(result).toBeNaN();
  });
});
