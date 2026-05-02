import { describe, expect, it } from "vitest";
import { convert } from "./converter";
import { dataUnits } from "./data";

describe("data size conversions", () => {
  it("converts 1 KB to 1000 B", () => {
    const result = convert(1, dataUnits.KB.factor, dataUnits.B.factor);
    expect(result).toBe(1000);
  });

  it("converts 1 KiB to 1024 B", () => {
    const result = convert(1, dataUnits.KiB.factor, dataUnits.B.factor);
    expect(result).toBe(1024);
  });

  it("converts 1 GB to 1e9 B", () => {
    const result = convert(1, dataUnits.GB.factor, dataUnits.B.factor);
    expect(result).toBe(1_000_000_000);
  });

  it("round-trips 1 MB → B → MB = 1", () => {
    const bytes = convert(1, dataUnits.MB.factor, dataUnits.B.factor);
    const backToMB = convert(bytes, dataUnits.B.factor, dataUnits.MB.factor);
    expect(backToMB).toBeCloseTo(1, 10);
  });

  it("round-trips 1 GiB → B → GiB = 1", () => {
    const bytes = convert(1, dataUnits.GiB.factor, dataUnits.B.factor);
    const backToGiB = convert(bytes, dataUnits.B.factor, dataUnits.GiB.factor);
    expect(backToGiB).toBeCloseTo(1, 10);
  });

  it("converts 0 input to 0", () => {
    const result = convert(0, dataUnits.TB.factor, dataUnits.B.factor);
    expect(result).toBe(0);
  });
});
