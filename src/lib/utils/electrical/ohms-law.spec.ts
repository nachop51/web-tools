import { describe, it, expect } from "vitest";
import {
  solveVoltage,
  solveCurrent,
  solveResistance,
  solveOhms,
} from "./ohms-law";

describe("solveVoltage", () => {
  it("V = I * R", () => {
    expect(solveVoltage(2, 10)).toBe(20);
  });
  it("handles fractional values", () => {
    expect(solveVoltage(0.5, 100)).toBe(50);
  });
  it("zero current gives zero voltage", () => {
    expect(solveVoltage(0, 10)).toBe(0);
  });
});

describe("solveCurrent", () => {
  it("I = V / R", () => {
    expect(solveCurrent(12, 4)).toBe(3);
  });
  it("handles fractional result", () => {
    expect(solveCurrent(5, 2)).toBe(2.5);
  });
  it("large resistance gives small current", () => {
    expect(solveCurrent(1, 1000)).toBe(0.001);
  });
});

describe("solveResistance", () => {
  it("R = V / I", () => {
    expect(solveResistance(12, 3)).toBe(4);
  });
  it("handles fractional result", () => {
    expect(solveResistance(5, 2)).toBe(2.5);
  });
  it("1V / 0.001A = 1000 Ohm", () => {
    expect(solveResistance(1, 0.001)).toBe(1000);
  });
});

describe("solveOhms", () => {
  it("solve=v: computes voltage and power", () => {
    const r = solveOhms("v", 2, 10);
    expect(r.voltage).toBe(20);
    expect(r.current).toBe(2);
    expect(r.resistance).toBe(10);
    expect(r.power).toBe(40);
  });

  it("solve=i: computes current and power", () => {
    const r = solveOhms("i", 12, 4);
    expect(r.current).toBe(3);
    expect(r.voltage).toBe(12);
    expect(r.resistance).toBe(4);
    expect(r.power).toBe(36);
  });

  it("solve=r: computes resistance and power", () => {
    const r = solveOhms("r", 12, 3);
    expect(r.resistance).toBe(4);
    expect(r.voltage).toBe(12);
    expect(r.current).toBe(3);
    expect(r.power).toBe(36);
  });

  it("solve=v with 0.5A and 100 Ohm = 50V, 25W", () => {
    const r = solveOhms("v", 0.5, 100);
    expect(r.voltage).toBe(50);
    expect(r.power).toBe(25);
  });
});
