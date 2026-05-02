import { describe, expect, it } from "vitest";
import { describeCron, nextRuns, parseCron } from "./cron";

describe("parseCron", () => {
  it("parses wildcard expression", () => {
    const fields = parseCron("* * * * *");
    expect(fields.minutes).toHaveLength(60);
    expect(fields.hours).toHaveLength(24);
    expect(fields.dom).toHaveLength(31);
    expect(fields.month).toHaveLength(12);
    expect(fields.dow).toHaveLength(7);
  });

  it("parses specific values", () => {
    const fields = parseCron("0 12 1 6 1");
    expect(fields.minutes).toEqual([0]);
    expect(fields.hours).toEqual([12]);
    expect(fields.dom).toEqual([1]);
    expect(fields.month).toEqual([6]);
    expect(fields.dow).toEqual([1]);
  });

  it("parses step expression", () => {
    const fields = parseCron("*/15 * * * *");
    expect(fields.minutes).toEqual([0, 15, 30, 45]);
  });

  it("parses range", () => {
    const fields = parseCron("0 9-17 * * *");
    expect(fields.hours).toEqual([9, 10, 11, 12, 13, 14, 15, 16, 17]);
  });

  it("parses comma-separated list", () => {
    const fields = parseCron("0 8,12,18 * * *");
    expect(fields.hours).toEqual([8, 12, 18]);
  });

  it("throws on wrong field count", () => {
    expect(() => parseCron("* * * *")).toThrow();
    expect(() => parseCron("* * * * * *")).toThrow();
  });
});

describe("nextRuns", () => {
  it("returns correct count", () => {
    const fields = parseCron("* * * * *");
    const runs = nextRuns(fields, new Date("2024-01-01T00:00:00Z"), 10);
    expect(runs).toHaveLength(10);
  });

  it("first run is in the future", () => {
    const from = new Date("2024-06-15T12:30:00Z");
    const fields = parseCron("* * * * *");
    const runs = nextRuns(fields, from, 1);
    expect(runs[0].getTime()).toBeGreaterThan(from.getTime());
  });

  it("hourly cron runs every hour", () => {
    const fields = parseCron("0 * * * *");
    const from = new Date("2024-01-01T00:00:00Z");
    const runs = nextRuns(fields, from, 3);
    expect(runs[0].getMinutes()).toBe(0);
    expect(runs[1].getMinutes()).toBe(0);
    expect(runs[2].getMinutes()).toBe(0);
    const diffMs = runs[1].getTime() - runs[0].getTime();
    expect(diffMs).toBe(60 * 60 * 1000);
  });
});

describe("describeCron", () => {
  it("describes hourly at minute 0", () => {
    const fields = parseCron("0 * * * *");
    expect(describeCron(fields)).toContain("every hour");
  });

  it("describes every minute", () => {
    const fields = parseCron("* * * * *");
    expect(describeCron(fields)).toContain("every minute");
  });

  it("describes specific time", () => {
    const fields = parseCron("30 9 * * *");
    const desc = describeCron(fields);
    expect(desc).toContain("09:30");
  });
});
