import { describe, expect, it } from "vitest";
import { convert } from "./converter";
import { speedUnits } from "./speed";

describe("speed conversions", () => {
  it("converts 1 km/h to correct m/s", () => {
    const result = convert(1, speedUnits["km/h"].factor, speedUnits["m/s"].factor);
    expect(result).toBeCloseTo(0.277778, 5);
  });

  it("converts 1 mph to correct m/s", () => {
    const result = convert(1, speedUnits["mph"].factor, speedUnits["m/s"].factor);
    expect(result).toBeCloseTo(0.44704, 5);
  });

  it("converts 1 mach to 343 m/s", () => {
    const result = convert(1, speedUnits["mach"].factor, speedUnits["m/s"].factor);
    expect(result).toBe(343);
  });

  it("converts 0 input to 0", () => {
    const result = convert(0, speedUnits["km/h"].factor, speedUnits["m/s"].factor);
    expect(result).toBe(0);
  });

  it("round-trips 1 km/h → m/s → km/h = 1", () => {
    const ms = convert(1, speedUnits["km/h"].factor, speedUnits["m/s"].factor);
    const backToKmh = convert(ms, speedUnits["m/s"].factor, speedUnits["km/h"].factor);
    expect(backToKmh).toBeCloseTo(1, 5);
  });
});
