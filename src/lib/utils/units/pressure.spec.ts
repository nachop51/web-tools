import { describe, it, expect } from "vitest";
import { convert } from "./converter";
import { pressureUnits } from "./pressure";

describe("pressure conversions", () => {
  it("1 kPa = 1000 Pa", () => {
    expect(convert(1, pressureUnits.kpa.factor, pressureUnits.pa.factor)).toBeCloseTo(1000, 5);
  });
  it("1 atm ≈ 101325 Pa", () => {
    expect(convert(1, pressureUnits.atm.factor, pressureUnits.pa.factor)).toBeCloseTo(101325, 0);
  });
  it("1 bar = 100 kPa", () => {
    expect(convert(1, pressureUnits.bar.factor, pressureUnits.kpa.factor)).toBeCloseTo(100, 5);
  });
  it("1 PSI ≈ 6894.757 Pa", () => {
    expect(convert(1, pressureUnits.psi.factor, pressureUnits.pa.factor)).toBeCloseTo(6894.757, 2);
  });
  it("1 inHg ≈ 3386.389 Pa", () => {
    expect(convert(1, pressureUnits.inhg.factor, pressureUnits.pa.factor)).toBeCloseTo(3386.389, 2);
  });
  it("1 mmHg ≈ 133.322 Pa", () => {
    expect(convert(1, pressureUnits.mmhg.factor, pressureUnits.pa.factor)).toBeCloseTo(133.322, 2);
  });
});
