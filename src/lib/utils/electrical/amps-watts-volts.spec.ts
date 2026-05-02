import { describe, it, expect } from "vitest";
import {
  ampsToWatts,
  wattsToAmps,
  voltsFromWattsAmps,
  voltsFromAmpsResistance,
  solveAWV,
} from "./amps-watts-volts";

describe("ampsToWatts", () => {
  it("P = I * V", () => {
    expect(ampsToWatts(2, 110)).toBe(220);
  });
  it("handles fractional amps", () => {
    expect(ampsToWatts(0.5, 240)).toBe(120);
  });
  it("zero amps = zero watts", () => {
    expect(ampsToWatts(0, 120)).toBe(0);
  });
});

describe("wattsToAmps", () => {
  it("I = P / V", () => {
    expect(wattsToAmps(1200, 120)).toBe(10);
  });
  it("handles small result", () => {
    expect(wattsToAmps(100, 1000)).toBe(0.1);
  });
  it("100W at 220V", () => {
    expect(wattsToAmps(100, 220)).toBeCloseTo(0.4545, 3);
  });
});

describe("voltsFromWattsAmps", () => {
  it("V = P / I", () => {
    expect(voltsFromWattsAmps(1200, 10)).toBe(120);
  });
  it("handles fractional result", () => {
    expect(voltsFromWattsAmps(100, 0.5)).toBe(200);
  });
  it("60W at 0.5A = 120V", () => {
    expect(voltsFromWattsAmps(60, 0.5)).toBe(120);
  });
});

describe("voltsFromAmpsResistance", () => {
  it("V = I * R", () => {
    expect(voltsFromAmpsResistance(3, 40)).toBe(120);
  });
  it("handles small values", () => {
    expect(voltsFromAmpsResistance(0.01, 100)).toBe(1);
  });
});

describe("solveAWV", () => {
  it("solve=amps: 1200W / 120V = 10A", () => {
    const r = solveAWV("amps", 1200, 120);
    expect(r.value).toBe(10);
    expect(r.unit).toBe("A");
    expect(r.formula).toBe("I = P ÷ V");
  });

  it("solve=watts: 2A * 110V = 220W", () => {
    const r = solveAWV("watts", 2, 110);
    expect(r.value).toBe(220);
    expect(r.unit).toBe("W");
    expect(r.formula).toBe("P = I × V");
  });

  it("solve=volts: 1200W / 10A = 120V", () => {
    const r = solveAWV("volts", 1200, 10);
    expect(r.value).toBe(120);
    expect(r.unit).toBe("V");
    expect(r.formula).toBe("V = P ÷ I");
  });

  it("solve=amps handles fractional", () => {
    const r = solveAWV("amps", 100, 220);
    expect(r.value).toBeCloseTo(0.4545, 3);
  });
});
