import { describe, it, expect } from "vitest";
import { fractionOp, simplify } from "./fractions";

describe("fractionOp", () => {
  it("add: 1/2 + 1/3 = 5/6", () => {
    const r = fractionOp({ num: 1, den: 2 }, "add", { num: 1, den: 3 });
    expect(r.num).toBe(5);
    expect(r.den).toBe(6);
  });

  it("subtract: 3/4 - 1/4 = 1/2", () => {
    const r = fractionOp({ num: 3, den: 4 }, "subtract", { num: 1, den: 4 });
    expect(r.num).toBe(1);
    expect(r.den).toBe(2);
  });

  it("multiply: 2/3 × 3/4 = 1/2", () => {
    const r = fractionOp({ num: 2, den: 3 }, "multiply", { num: 3, den: 4 });
    expect(r.num).toBe(1);
    expect(r.den).toBe(2);
  });

  it("divide: 1/2 ÷ 1/4 = 2/1", () => {
    const r = fractionOp({ num: 1, den: 2 }, "divide", { num: 1, den: 4 });
    expect(r.num).toBe(2);
    expect(r.den).toBe(1);
    expect(r.decimal).toBe(2);
  });
});

describe("simplify", () => {
  it("4/8 = 1/2", () => {
    const r = simplify({ num: 4, den: 8 });
    expect(r.num).toBe(1);
    expect(r.den).toBe(2);
  });
});
