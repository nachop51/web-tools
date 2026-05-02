import { describe, expect, it } from "vitest";
import { decodeBase32, encodeBase32 } from "./base32";

describe("encodeBase32", () => {
  it("encodes empty string", () => {
    expect(encodeBase32("")).toBe("");
  });

  it("encodes 'f' per RFC 4648 test vector", () => {
    expect(encodeBase32("f")).toBe("MY======");
  });

  it("encodes 'fo' per RFC 4648 test vector", () => {
    expect(encodeBase32("fo")).toBe("MZXQ====");
  });

  it("encodes 'foo' per RFC 4648 test vector", () => {
    expect(encodeBase32("foo")).toBe("MZXW6===");
  });

  it("encodes 'foobar' per RFC 4648", () => {
    expect(encodeBase32("foobar")).toBe("MZXW6YTBOI======");
  });
});

describe("decodeBase32", () => {
  it("decodes empty string", () => {
    expect(decodeBase32("")).toBe("");
  });

  it("decodes 'MY======' to 'f'", () => {
    expect(decodeBase32("MY======")).toBe("f");
  });

  it("decodes 'MZXQ====' to 'fo'", () => {
    expect(decodeBase32("MZXQ====")).toBe("fo");
  });

  it("throws on invalid character", () => {
    expect(() => decodeBase32("MZXQ1234")).toThrow();
  });
});

describe("roundtrip", () => {
  it("encodes and decodes back to original", () => {
    const original = "Hello, World!";
    expect(decodeBase32(encodeBase32(original))).toBe(original);
  });

  it("roundtrips unicode text", () => {
    const original = "café";
    expect(decodeBase32(encodeBase32(original))).toBe(original);
  });
});
