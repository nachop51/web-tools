import { describe, expect, it } from "vitest";
import {
  generateValue,
  generateRows,
  parseSchema,
  serializeSchema,
  toCsv,
  toJson,
  toSql,
  type FieldDef,
} from "./fake-data";

describe("generateValue", () => {
  it("generates a uuid string", () => {
    const v = generateValue({ name: "id", type: "uuid" });
    expect(typeof v).toBe("string");
    expect((v as string).length).toBe(36);
  });

  it("generates a boolean", () => {
    expect(typeof generateValue({ name: "x", type: "boolean" })).toBe("boolean");
  });

  it("generates integer in range", () => {
    for (let i = 0; i < 20; i++) {
      const v = generateValue({ name: "x", type: "integer", min: 5, max: 10 }) as number;
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThanOrEqual(10);
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  it("generates float in range", () => {
    for (let i = 0; i < 20; i++) {
      const v = generateValue({ name: "x", type: "float", min: 0, max: 1 }) as number;
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it("generates email with @", () => {
    const v = generateValue({ name: "x", type: "email" }) as string;
    expect(v).toMatch(/@/);
  });

  it("generates url starting with https://", () => {
    const v = generateValue({ name: "x", type: "url" }) as string;
    expect(v.startsWith("https://")).toBe(true);
  });

  it("generates valid hex color", () => {
    const v = generateValue({ name: "x", type: "color" }) as string;
    expect(v).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("generates ipv4 with 4 octets", () => {
    const v = generateValue({ name: "x", type: "ipv4" }) as string;
    expect(v.split(".").length).toBe(4);
  });

  it("picks from enum values", () => {
    const vals = ["admin", "user", "guest"];
    for (let i = 0; i < 20; i++) {
      const v = generateValue({ name: "x", type: "enum", values: vals });
      expect(vals).toContain(v);
    }
  });

  it("generates phone starting with +1", () => {
    const v = generateValue({ name: "x", type: "phone" }) as string;
    expect(v.startsWith("+1-")).toBe(true);
  });

  it("generates date string in YYYY-MM-DD format", () => {
    const v = generateValue({ name: "x", type: "date", format: "YYYY-MM-DD" }) as string;
    expect(v).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("generateRows", () => {
  it("returns correct count", () => {
    const fields: FieldDef[] = [{ name: "id", type: "uuid" }];
    expect(generateRows(fields, 7).length).toBe(7);
  });

  it("each row contains all field names", () => {
    const fields: FieldDef[] = [
      { name: "id", type: "uuid" },
      { name: "age", type: "integer" },
    ];
    for (const row of generateRows(fields, 3)) {
      expect(Object.keys(row)).toContain("id");
      expect(Object.keys(row)).toContain("age");
    }
  });
});

describe("toJson", () => {
  it("produces valid JSON array", () => {
    const rows = generateRows([{ name: "id", type: "uuid" }], 2);
    const result = JSON.parse(toJson(rows));
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
  });
});

describe("toCsv", () => {
  it("produces header + data rows", () => {
    const fields: FieldDef[] = [{ name: "id", type: "string" }];
    const rows = [{ id: "hello" }];
    const lines = toCsv(rows, fields).split("\n");
    expect(lines[0]).toBe("id");
    expect(lines[1]).toBe("hello");
  });

  it("escapes values containing commas", () => {
    const fields: FieldDef[] = [{ name: "name", type: "string" }];
    const rows = [{ name: "Smith, John" }];
    expect(toCsv(rows, fields)).toContain('"Smith, John"');
  });

  it("escapes values containing quotes", () => {
    const fields: FieldDef[] = [{ name: "q", type: "string" }];
    const rows = [{ q: 'say "hi"' }];
    expect(toCsv(rows, fields)).toContain('"say ""hi"""');
  });
});

describe("toSql", () => {
  it("produces INSERT statements", () => {
    const fields: FieldDef[] = [{ name: "id", type: "string" }];
    const rows = [{ id: "abc" }];
    const sql = toSql(rows, "users", fields);
    expect(sql).toContain("INSERT INTO");
    expect(sql).toContain('"users"');
    expect(sql).toContain("'abc'");
  });

  it("uses TRUE/FALSE for booleans", () => {
    const fields: FieldDef[] = [{ name: "active", type: "boolean" }];
    const rows = [{ active: true }, { active: false }];
    const sql = toSql(rows, "t", fields);
    expect(sql).toContain("TRUE");
    expect(sql).toContain("FALSE");
  });

  it("uses NULL for missing values", () => {
    const fields: FieldDef[] = [{ name: "x", type: "string" }];
    const rows = [{ x: null }];
    const sql = toSql(rows, "t", fields);
    expect(sql).toContain("NULL");
  });
});

describe("parseSchema / serializeSchema", () => {
  it("round-trips a schema", () => {
    const fields: FieldDef[] = [
      { name: "id", type: "uuid" },
      { name: "age", type: "integer", min: 18, max: 99 },
      { name: "role", type: "enum", values: ["admin", "user"] },
    ];
    expect(parseSchema(serializeSchema(fields))).toEqual(fields);
  });

  it("throws for invalid JSON", () => {
    expect(() => parseSchema("not json")).toThrow();
  });

  it("throws when schema is not an array", () => {
    expect(() => parseSchema('{"name":"id"}')).toThrow("Schema must be an array");
  });

  it("throws when field has no name", () => {
    expect(() => parseSchema('[{"type":"uuid"}]')).toThrow();
  });

  it("throws when field has no type", () => {
    expect(() => parseSchema('[{"name":"id"}]')).toThrow();
  });
});
