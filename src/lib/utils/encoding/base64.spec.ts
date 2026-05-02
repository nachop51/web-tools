import { describe, expect, it } from "vitest";
import { decodeBase64, encodeBase64 } from "./base64";

describe("encodeBase64", () => {
  it("encodes a simple ASCII string", () => {
    expect(encodeBase64("hello")).toBe("aGVsbG8=");
  });

  it("returns empty string for empty input", () => {
    expect(encodeBase64("")).toBe("");
  });

  it("round-trips an emoji", () => {
    expect(decodeBase64(encodeBase64("🎉"))).toBe("🎉");
  });

  it("round-trips a Unicode string with accents", () => {
    expect(decodeBase64(encodeBase64("Héllo"))).toBe("Héllo");
  });
});

describe("decodeBase64", () => {
  it("decodes a known base64 string", () => {
    expect(decodeBase64("aGVsbG8=")).toBe("hello");
  });

  it("returns empty string for empty input", () => {
    expect(decodeBase64("")).toBe("");
  });

  it("throws on invalid base64 input", () => {
    expect(() => decodeBase64("not valid base64!!!")).toThrow();
  });
});
