import { describe, expect, it } from "vitest";
import { findReplace } from "./find-replace";

const base = { useRegex: false, caseSensitive: true, wholeWord: false };

describe("findReplace", () => {
  it("replaces all occurrences", () => {
    const { result, count } = findReplace("foo foo foo", "foo", "bar", base);
    expect(result).toBe("bar bar bar");
    expect(count).toBe(3);
  });

  it("returns count 0 when find is empty", () => {
    const { result, count } = findReplace("hello", "", "x", base);
    expect(result).toBe("hello");
    expect(count).toBe(0);
  });

  it("case-insensitive replace", () => {
    const { result, count } = findReplace("Hello HELLO hello", "hello", "hi", { ...base, caseSensitive: false });
    expect(result).toBe("hi hi hi");
    expect(count).toBe(3);
  });

  it("whole-word matching", () => {
    const { result, count } = findReplace("cat concatenate cat", "cat", "dog", { ...base, wholeWord: true });
    expect(result).toBe("dog concatenate dog");
    expect(count).toBe(2);
  });

  it("regex mode", () => {
    const { result, count } = findReplace("2024-01-15", "\\d{4}", "YYYY", { ...base, useRegex: true });
    expect(result).toBe("YYYY-01-15");
    expect(count).toBe(1);
  });

  it("escapes special chars in non-regex mode", () => {
    const { result, count } = findReplace("a.b.c", ".", "-", base);
    expect(result).toBe("a-b-c");
    expect(count).toBe(2);
  });
});
