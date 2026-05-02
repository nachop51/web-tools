import { describe, expect, it } from "vitest";
import { decodeURL, encodeURL } from "./url";

describe("encodeURL", () => {
  it("encodes spaces with component mode", () => {
    expect(encodeURL("hello world", "component")).toBe("hello%20world");
  });

  it("encodes special chars with component mode", () => {
    expect(encodeURL("a&b=c", "component")).toBe("a%26b%3Dc");
  });

  it("preserves URI structure with full mode", () => {
    expect(encodeURL("https://example.com/foo bar", "full")).toBe(
      "https://example.com/foo%20bar",
    );
  });

  it("preserves :// and / with full mode", () => {
    const result = encodeURL("https://example.com/path?q=1", "full");
    expect(result).toContain("://");
    expect(result).toContain("/path");
  });

  it("returns empty string for empty input", () => {
    expect(encodeURL("", "component")).toBe("");
    expect(encodeURL("", "full")).toBe("");
  });
});

describe("decodeURL", () => {
  it("round-trips component encoded string", () => {
    const original = "hello world & more=stuff";
    expect(decodeURL(encodeURL(original, "component"), "component")).toBe(original);
  });

  it("round-trips full encoded string", () => {
    const original = "https://example.com/foo bar";
    expect(decodeURL(encodeURL(original, "full"), "full")).toBe(original);
  });

  it("throws on malformed %-sequence in component mode", () => {
    expect(() => decodeURL("%zz", "component")).toThrow();
  });

  it("throws on malformed %-sequence in full mode", () => {
    expect(() => decodeURL("%zz", "full")).toThrow();
  });

  it("returns empty string for empty input", () => {
    expect(decodeURL("", "component")).toBe("");
    expect(decodeURL("", "full")).toBe("");
  });
});
