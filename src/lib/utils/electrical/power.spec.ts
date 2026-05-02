import { describe, it, expect } from "vitest";
import { powerFromIV, powerFromVR, powerFromIR, calcPower } from "./power";

describe("powerFromIV", () => {
  it("P = I * V", () => {
    expect(powerFromIV(2, 12)).toBe(24);
  });
  it("handles fractional values", () => {
    expect(powerFromIV(0.5, 220)).toBe(110);
  });
  it("zero current gives zero power", () => {
    expect(powerFromIV(0, 100)).toBe(0);
  });
});

describe("powerFromVR", () => {
  it("P = V² / R", () => {
    expect(powerFromVR(12, 4)).toBe(36);
  });
  it("100V across 50 Ohm = 200W", () => {
    expect(powerFromVR(100, 50)).toBe(200);
  });
  it("handles large resistance", () => {
    expect(powerFromVR(10, 1000)).toBe(0.1);
  });
});

describe("powerFromIR", () => {
  it("P = I² * R", () => {
    expect(powerFromIR(3, 4)).toBe(36);
  });
  it("handles fractional current", () => {
    expect(powerFromIR(0.5, 8)).toBe(2);
  });
  it("zero current gives zero power", () => {
    expect(powerFromIR(0, 100)).toBe(0);
  });
});

describe("calcPower", () => {
  it("iv mode: 2A, 12V = 24W", () => {
    const r = calcPower("iv", 2, 12);
    expect(r.watts).toBe(24);
    expect(r.kilowatts).toBeCloseTo(0.024, 6);
  });

  it("vr mode: 12V, 4 Ohm = 36W", () => {
    const r = calcPower("vr", 12, 4);
    expect(r.watts).toBe(36);
    expect(r.kilowatts).toBeCloseTo(0.036, 6);
  });

  it("ir mode: 3A, 4 Ohm = 36W", () => {
    const r = calcPower("ir", 3, 4);
    expect(r.watts).toBe(36);
    expect(r.kilowatts).toBeCloseTo(0.036, 6);
  });

  it("converts to horsepower correctly (745.69987 W = 1 hp)", () => {
    const r = calcPower("iv", 1, 745.69987);
    expect(r.horsepower).toBeCloseTo(1, 5);
  });

  it("1000W = 1kW", () => {
    const r = calcPower("iv", 10, 100);
    expect(r.watts).toBe(1000);
    expect(r.kilowatts).toBe(1);
  });
});
