import { describe, it, expect } from "vitest";
import { relativeLuminance, contrastRatio, wcagLevel } from "./contrast";

describe("relativeLuminance", () => {
  it("black has luminance 0", () => {
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBe(0);
  });
  it("white has luminance 1", () => {
    expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 4);
  });
  it("red has expected luminance", () => {
    expect(relativeLuminance({ r: 255, g: 0, b: 0 })).toBeCloseTo(0.2126, 3);
  });
});

describe("contrastRatio", () => {
  it("black on white is 21:1", () => {
    const ratio = contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 });
    expect(ratio).toBeCloseTo(21, 0);
  });
  it("same color has ratio 1", () => {
    const ratio = contrastRatio({ r: 128, g: 128, b: 128 }, { r: 128, g: 128, b: 128 });
    expect(ratio).toBeCloseTo(1, 4);
  });
  it("is symmetric", () => {
    const r1 = contrastRatio({ r: 255, g: 0, b: 0 }, { r: 0, g: 0, b: 255 });
    const r2 = contrastRatio({ r: 0, g: 0, b: 255 }, { r: 255, g: 0, b: 0 });
    expect(r1).toBeCloseTo(r2, 10);
  });
});

describe("wcagLevel", () => {
  it("21:1 => AAA normal", () => {
    expect(wcagLevel(21, "normal")).toBe("AAA");
  });
  it("4.5:1 => AA normal", () => {
    expect(wcagLevel(4.5, "normal")).toBe("AA");
  });
  it("3:1 => Fail normal", () => {
    expect(wcagLevel(3, "normal")).toBe("Fail");
  });
  it("4.5:1 => AAA large", () => {
    expect(wcagLevel(4.5, "large")).toBe("AAA");
  });
  it("3:1 => AA large", () => {
    expect(wcagLevel(3, "large")).toBe("AA");
  });
  it("2:1 => Fail large", () => {
    expect(wcagLevel(2, "large")).toBe("Fail");
  });
});
