import { describe, expect, it } from "vitest";
import { sortLines } from "./sort";

const base = { order: "asc" as const, mode: "alpha" as const, dedupe: false, caseSensitive: false };

describe("sortLines", () => {
  it("sorts alphabetically ascending", () => {
    expect(sortLines("banana\napple\ncherry", base)).toBe("apple\nbanana\ncherry");
  });

  it("sorts alphabetically descending", () => {
    expect(sortLines("apple\nbanana\ncherry", { ...base, order: "desc" })).toBe("cherry\nbanana\napple");
  });

  it("deduplicates lines", () => {
    expect(sortLines("b\na\nb\na", { ...base, dedupe: true })).toBe("a\nb");
  });

  it("sorts numerically", () => {
    expect(sortLines("10\n2\n1\n20", { ...base, mode: "numeric" })).toBe("1\n2\n10\n20");
  });

  it("sorts by length", () => {
    expect(sortLines("hello\nhi\nworld", { ...base, mode: "length" })).toBe("hi\nhello\nworld");
  });

  it("case-insensitive dedupe", () => {
    expect(sortLines("Apple\napple\nBANANA", { ...base, dedupe: true })).toBe("Apple\nBANANA");
  });

  it("case-sensitive sort", () => {
    const result = sortLines("b\nA\na\nB", { ...base, caseSensitive: true });
    // uppercase before lowercase in default locale
    expect(result.split("\n")).toContain("A");
    expect(result.split("\n")).toContain("a");
  });
});
