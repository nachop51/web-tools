import { describe, expect, it } from "vitest";
import { hashText } from "./hash";

describe("hashText", () => {
  it("SHA-256 of 'hello'", async () => {
    await expect(hashText("hello", "SHA-256")).resolves.toBe(
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
    );
  });

  it("SHA-1 of empty string", async () => {
    await expect(hashText("", "SHA-1")).resolves.toBe(
      "da39a3ee5e6b4b0d3255bfef95601890afd80709",
    );
  });

  it("SHA-512 produces 128 hex chars", async () => {
    const result = await hashText("hello", "SHA-512");
    expect(result).toHaveLength(128);
  });

  it("SHA-384 produces 96 hex chars", async () => {
    const result = await hashText("hello", "SHA-384");
    expect(result).toHaveLength(96);
  });

  it("SHA-256 of empty string", async () => {
    await expect(hashText("", "SHA-256")).resolves.toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
  });
});
