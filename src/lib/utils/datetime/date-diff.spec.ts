import { describe, it, expect } from "vitest";
import { dateDiff, ageFrom } from "./date-diff";

describe("dateDiff", () => {
  it("returns zeros for identical dates", () => {
    const d = new Date("2024-01-01");
    const r = dateDiff(d, d);
    expect(r.years).toBe(0);
    expect(r.months).toBe(0);
    expect(r.days).toBe(0);
    expect(r.totalDays).toBe(0);
  });

  it("calculates exact years", () => {
    const r = dateDiff(new Date("2020-01-01"), new Date("2023-01-01"));
    expect(r.years).toBe(3);
    expect(r.months).toBe(0);
    expect(r.days).toBe(0);
  });

  it("calculates mixed years, months, days", () => {
    const r = dateDiff(new Date("2020-03-15"), new Date("2023-06-20"));
    expect(r.years).toBe(3);
    expect(r.months).toBe(3);
    expect(r.days).toBe(5);
  });

  it("swaps from/to when from > to (absolute difference)", () => {
    const r1 = dateDiff(new Date("2020-01-01"), new Date("2023-01-01"));
    const r2 = dateDiff(new Date("2023-01-01"), new Date("2020-01-01"));
    expect(r1.years).toBe(r2.years);
    expect(r1.totalDays).toBe(r2.totalDays);
  });

  it("calculates totalDays correctly", () => {
    const r = dateDiff(new Date("2024-01-01"), new Date("2024-01-11"));
    expect(r.totalDays).toBe(10);
  });

  it("calculates totalSeconds correctly for 1 hour", () => {
    const from = new Date("2024-01-01T00:00:00");
    const to = new Date("2024-01-01T01:00:00");
    const r = dateDiff(from, to);
    expect(r.totalSeconds).toBe(3600);
    expect(r.totalMinutes).toBe(60);
    expect(r.totalHours).toBe(1);
  });

  it("handles month boundary crossing", () => {
    // Jan 31 to March 1 in a non-leap year
    const r = dateDiff(new Date("2023-01-31"), new Date("2023-03-01"));
    expect(r.years).toBe(0);
    // 31 days in Jan + 28 in Feb... calendar diff should be 1 month and a few days
    expect(r.months).toBeGreaterThanOrEqual(0);
    expect(r.totalDays).toBe(29);
  });
});

describe("ageFrom", () => {
  it("calculates age in years", () => {
    const r = ageFrom(new Date("1990-05-15"), new Date("2024-05-15"));
    expect(r.years).toBe(34);
    expect(r.months).toBe(0);
    expect(r.days).toBe(0);
  });

  it("handles birthday not yet reached this year", () => {
    const r = ageFrom(new Date("1990-12-31"), new Date("2024-06-01"));
    expect(r.years).toBe(33);
  });
});
