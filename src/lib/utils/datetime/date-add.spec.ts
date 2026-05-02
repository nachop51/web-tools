import { describe, expect, it } from "vitest";
import { addToDate } from "./date-add";

describe("addToDate", () => {
  it("adds 7 days to 2024-01-01 = 2024-01-08", () => {
    const r = addToDate("2024-01-01", 7, "days");
    expect(r.resultIso).toBe("2024-01-08");
  });

  it("adds 1 week = 7 days", () => {
    const r = addToDate("2024-01-01", 1, "weeks");
    expect(r.resultIso).toBe("2024-01-08");
  });

  it("adds 1 month to 2024-01-15 = 2024-02-15", () => {
    const r = addToDate("2024-01-15", 1, "months");
    expect(r.resultIso).toBe("2024-02-15");
  });

  it("adds 1 year", () => {
    const r = addToDate("2024-01-01", 1, "years");
    expect(r.resultIso).toBe("2025-01-01");
  });

  it("subtracts 1 year with negative amount", () => {
    const r = addToDate("2024-01-01", -1, "years");
    expect(r.resultIso).toBe("2023-01-01");
  });

  it("returns weekday name", () => {
    // 2024-01-08 is a Monday
    const r = addToDate("2024-01-01", 7, "days");
    expect(r.weekday).toBe("Monday");
  });

  it("throws on invalid date", () => {
    expect(() => addToDate("not-a-date", 1, "days")).toThrow("Invalid date");
  });
});
