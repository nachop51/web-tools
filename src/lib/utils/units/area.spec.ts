import { describe, it, expect } from "vitest";
import { convert } from "./converter";
import { areaUnits } from "./area";

describe("area convert", () => {
  it("1 m² to cm²", () => {
    expect(convert(1, areaUnits.m2.factor, areaUnits.cm2.factor)).toBeCloseTo(10000, 4);
  });

  it("1 km² to m²", () => {
    expect(convert(1, areaUnits.km2.factor, areaUnits.m2.factor)).toBeCloseTo(1_000_000, 0);
  });

  it("1 acre to m²", () => {
    expect(convert(1, areaUnits.acre.factor, areaUnits.m2.factor)).toBeCloseTo(4046.856, 1);
  });

  it("1 ft² to m²", () => {
    expect(convert(1, areaUnits.ft2.factor, areaUnits.m2.factor)).toBeCloseTo(0.092903, 4);
  });

  it("1 ha to m²", () => {
    expect(convert(1, areaUnits.ha.factor, areaUnits.m2.factor)).toBeCloseTo(10000, 0);
  });

  it("zero is zero", () => {
    expect(convert(0, areaUnits.m2.factor, areaUnits.km2.factor)).toBe(0);
  });
});
