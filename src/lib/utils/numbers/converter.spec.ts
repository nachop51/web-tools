import { describe, expect, it } from "vitest";
import {
  computeOutputNumber,
  NumberMode,
  validateNumberBase,
} from "./converter";

describe("validateNumberBase", () => {
  it("returns true for null/undefined input", () => {
    expect(validateNumberBase(null, 10)).toBe(true);
    expect(validateNumberBase(undefined, 10)).toBe(true);
  });

  it("returns true for empty string", () => {
    expect(validateNumberBase("", 10)).toBe(true);
  });

  it("accepts valid binary digits", () => {
    expect(validateNumberBase("1010", 2)).toBe(true);
  });

  it("rejects invalid binary digits", () => {
    const result = validateNumberBase("102", 2);
    expect(result).toMatch(/Character "2" is not valid/);
  });

  it("strips a leading minus before validating", () => {
    expect(validateNumberBase("-101", 2)).toBe(true);
  });

  it("rejects '.' in INT mode", () => {
    expect(validateNumberBase("1.5", 10, NumberMode.INT)).toMatch(
      /Character "\." is not valid/,
    );
  });

  it("accepts '.' in FLOAT32 / FLOAT64 mode", () => {
    expect(validateNumberBase("1.5", 10, NumberMode.FLOAT32)).toBe(true);
    expect(validateNumberBase("3.14159", 10, NumberMode.FLOAT64)).toBe(true);
  });

  it("accepts uppercase and lowercase hex digits", () => {
    expect(validateNumberBase("FF", 16)).toBe(true);
    expect(validateNumberBase("ff", 16)).toBe(true);
    expect(validateNumberBase("DeAdBeEf", 16)).toBe(true);
  });

  it("rejects out-of-range hex characters", () => {
    expect(validateNumberBase("G", 16)).toMatch(/not valid for base 16/);
  });
});

describe("computeOutputNumber", () => {
  it("converts decimal to binary", () => {
    expect(computeOutputNumber("10", 10, 2)).toBe("1010");
    expect(computeOutputNumber("255", 10, 2)).toBe("11111111");
  });

  it("converts decimal to hex", () => {
    expect(computeOutputNumber("255", 10, 16)).toBe("ff");
  });

  it("converts hex to decimal", () => {
    expect(computeOutputNumber("ff", 16, 10)).toBe("255");
    expect(computeOutputNumber("FF", 16, 10)).toBe("255");
  });

  it("converts binary to octal", () => {
    expect(computeOutputNumber("1010", 2, 8)).toBe("12");
  });

  it("returns empty string for empty input", () => {
    expect(computeOutputNumber("", 10, 2)).toBe("");
    expect(computeOutputNumber(null, 10, 2)).toBe("");
    expect(computeOutputNumber(undefined, 10, 2)).toBe("");
  });

  it("returns empty string for unparseable input", () => {
    expect(computeOutputNumber("zzz", 10, 2)).toBe("");
  });

  it("wraps -1 to unsigned 32-bit max in INT32 mode", () => {
    expect(computeOutputNumber("-1", 10, 2, NumberMode.INT32)).toBe(
      "11111111111111111111111111111111",
    );
    expect(computeOutputNumber("-1", 10, 16, NumberMode.INT32)).toBe("ffffffff");
  });

  it("emits IEEE-754 single-precision bits for FLOAT32 (decimal → binary)", () => {
    expect(computeOutputNumber("1", 10, 2, NumberMode.FLOAT32)).toBe(
      "00111111100000000000000000000000",
    );
  });

  it("emits IEEE-754 double-precision bits for FLOAT64 (decimal → binary)", () => {
    expect(computeOutputNumber("1", 10, 2, NumberMode.FLOAT64)).toBe(
      "0011111111110000000000000000000000000000000000000000000000000000",
    );
  });
});
