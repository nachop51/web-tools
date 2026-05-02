import { describe, it, expect } from "vitest";
import { encodeBase58, decodeBase58 } from "./base58";

describe("encodeBase58", () => {
  it("encodes empty string to empty string", () => {
    expect(encodeBase58("")).toBe("");
  });

  it("encodes 'Hello' to known base58", () => {
    // "Hello" UTF-8 bytes: 72, 101, 108, 108, 111
    expect(encodeBase58("Hello")).toBe("9Ajdvzr");
  });

  it("encodes single ASCII character", () => {
    const encoded = encodeBase58("A");
    expect(encoded).toBeTruthy();
    expect(decodeBase58(encoded)).toBe("A");
  });

  it("round-trips ASCII text", () => {
    const text = "The quick brown fox";
    expect(decodeBase58(encodeBase58(text))).toBe(text);
  });

  it("round-trips text with spaces and special chars", () => {
    const text = "Hello, World! 123";
    expect(decodeBase58(encodeBase58(text))).toBe(text);
  });
});

describe("decodeBase58", () => {
  it("decodes empty string to empty string", () => {
    expect(decodeBase58("")).toBe("");
  });

  it("throws on invalid character", () => {
    expect(() => decodeBase58("Hello0")).toThrow("Invalid Base58 character");
  });

  it("throws on character 'O' which is not in Bitcoin alphabet", () => {
    expect(() => decodeBase58("O")).toThrow("Invalid Base58 character");
  });

  it("decodes back to original text", () => {
    expect(decodeBase58("9Ajdvzr")).toBe("Hello");
  });
});
