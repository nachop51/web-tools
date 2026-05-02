import { describe, expect, it } from "vitest";
import { generateUuid } from "./uuid";

const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("generateUuid", () => {
  it("returns a valid UUID v4", () => {
    expect(generateUuid()).toMatch(UUID_V4_RE);
  });

  it("produces different values on successive calls", () => {
    expect(generateUuid()).not.toBe(generateUuid());
  });
});
