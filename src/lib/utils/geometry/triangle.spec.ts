import { describe, expect, it } from "vitest";
import { solveRightTriangle, triangleFromSSS } from "./triangle";

describe("solveRightTriangle", () => {
  it("find c from a=3, b=4 → c=5", () => {
    const r = solveRightTriangle("c", 3, 4);
    expect(r.c).toBeCloseTo(5);
    expect(r.a).toBe(3);
    expect(r.b).toBe(4);
    expect(r.area).toBeCloseTo(6);
    expect(r.perimeter).toBeCloseTo(12);
  });

  it("find a from b=4, c=5 → a=3", () => {
    const r = solveRightTriangle("a", 4, 5);
    expect(r.a).toBeCloseTo(3);
    expect(r.c).toBe(5);
  });

  it("find b from a=3, c=5 → b=4", () => {
    const r = solveRightTriangle("b", 3, 5);
    expect(r.b).toBeCloseTo(4);
  });

  it("angles sum to 90 for right triangle", () => {
    const r = solveRightTriangle("c", 3, 4);
    expect(r.angleA + r.angleB).toBeCloseTo(90);
  });

  it("throws if hypotenuse shorter than leg", () => {
    expect(() => solveRightTriangle("a", 10, 5)).toThrow();
  });
});

describe("triangleFromSSS", () => {
  it("3-4-5 right triangle → area=6, all angles valid", () => {
    const r = triangleFromSSS(3, 4, 5);
    expect(r.valid).toBe(true);
    expect(r.area).toBeCloseTo(6);
    expect(r.angleA + r.angleB + r.angleC).toBeCloseTo(180);
    expect(r.angleC).toBeCloseTo(90);
  });

  it("equilateral triangle 5-5-5 → all angles 60°", () => {
    const r = triangleFromSSS(5, 5, 5);
    expect(r.valid).toBe(true);
    expect(r.angleA).toBeCloseTo(60);
    expect(r.angleB).toBeCloseTo(60);
    expect(r.angleC).toBeCloseTo(60);
  });

  it("invalid triangle 1-2-10 → valid=false", () => {
    const r = triangleFromSSS(1, 2, 10);
    expect(r.valid).toBe(false);
    expect(isNaN(r.area)).toBe(true);
  });
});
