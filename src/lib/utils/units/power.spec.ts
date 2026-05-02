import { describe, it, expect } from "vitest";
import { powerUnits } from "./power";
import { convert } from "./converter";

describe("power unit conversions", () => {
  it("1 kW = 1000 W", () => {
    const result = convert(1, powerUnits["kw"].factor, powerUnits["w"].factor);
    expect(result).toBe(1000);
  });

  it("1 MW = 1000 kW", () => {
    const result = convert(1, powerUnits["mw"].factor, powerUnits["kw"].factor);
    expect(result).toBe(1000);
  });

  it("1 GW = 1,000,000 kW", () => {
    const result = convert(1, powerUnits["gw"].factor, powerUnits["kw"].factor);
    expect(result).toBe(1_000_000);
  });

  it("mechanical horsepower to watts", () => {
    const result = convert(1, powerUnits["hp_mech"].factor, powerUnits["w"].factor);
    expect(result).toBeCloseTo(745.69987, 4);
  });

  it("electric horsepower to watts", () => {
    const result = convert(1, powerUnits["hp_elec"].factor, powerUnits["w"].factor);
    expect(result).toBeCloseTo(746, 4);
  });

  it("1000 W = 1 kW", () => {
    const result = convert(1000, powerUnits["w"].factor, powerUnits["kw"].factor);
    expect(result).toBe(1);
  });

  it("BTU/hr to watts", () => {
    const result = convert(1, powerUnits["btu_hr"].factor, powerUnits["w"].factor);
    expect(result).toBeCloseTo(0.29307107, 6);
  });

  it("calories/sec to watts", () => {
    const result = convert(1, powerUnits["cal_s"].factor, powerUnits["w"].factor);
    expect(result).toBeCloseTo(4.184, 4);
  });
});
