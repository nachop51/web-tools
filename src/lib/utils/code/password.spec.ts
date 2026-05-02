import { describe, it, expect } from "vitest";
import { generatePassword, calcEntropy, strengthLabel } from "./password";

describe("generatePassword", () => {
  it("generates password of correct length", () => {
    const p = generatePassword({ length: 16, upper: true, lower: true, digits: true, symbols: false });
    expect(p).toHaveLength(16);
  });

  it("returns empty when no charset selected", () => {
    const p = generatePassword({ length: 10, upper: false, lower: false, digits: false, symbols: false });
    expect(p).toBe("");
  });

  it("only contains digits when only digits selected", () => {
    const p = generatePassword({ length: 20, upper: false, lower: false, digits: true, symbols: false });
    expect(p).toMatch(/^\d+$/);
  });

  it("only contains uppercase when only upper selected", () => {
    const p = generatePassword({ length: 20, upper: true, lower: false, digits: false, symbols: false });
    expect(p).toMatch(/^[A-Z]+$/);
  });
});

describe("calcEntropy", () => {
  it("calculates entropy correctly", () => {
    expect(calcEntropy(26, 1)).toBeCloseTo(Math.log2(26), 5);
  });

  it("scales with length", () => {
    expect(calcEntropy(26, 10)).toBeCloseTo(10 * Math.log2(26), 5);
  });

  it("charset size 2 gives 1 bit per char", () => {
    expect(calcEntropy(2, 8)).toBeCloseTo(8, 5);
  });
});

describe("strengthLabel", () => {
  it("weak below 28", () => {
    expect(strengthLabel(10)).toBe("Weak");
    expect(strengthLabel(27)).toBe("Weak");
  });

  it("fair 28-59", () => {
    expect(strengthLabel(28)).toBe("Fair");
    expect(strengthLabel(59)).toBe("Fair");
  });

  it("strong 60-99", () => {
    expect(strengthLabel(60)).toBe("Strong");
    expect(strengthLabel(99)).toBe("Strong");
  });

  it("very strong at 100+", () => {
    expect(strengthLabel(100)).toBe("Very strong");
    expect(strengthLabel(200)).toBe("Very strong");
  });
});
