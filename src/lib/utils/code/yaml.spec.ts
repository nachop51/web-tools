import { describe, it, expect } from "vitest";
import { jsonToYaml, yamlToJson } from "./yaml";

describe("jsonToYaml", () => {
  it("converts simple object", () => {
    const r = jsonToYaml('{"key":"value"}');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.output).toContain("key: value");
  });

  it("converts nested object", () => {
    const r = jsonToYaml('{"a":{"b":1}}');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.output).toContain("a:");
      expect(r.output).toContain("b: 1");
    }
  });

  it("returns error for invalid JSON", () => {
    const r = jsonToYaml("{invalid}");
    expect(r.ok).toBe(false);
  });

  it("converts arrays", () => {
    const r = jsonToYaml('[1,2,3]');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.output).toContain("- 1");
  });
});

describe("yamlToJson", () => {
  it("converts simple YAML", () => {
    const r = yamlToJson("key: value", 2);
    expect(r.ok).toBe(true);
    if (r.ok) {
      const parsed = JSON.parse(r.output);
      expect(parsed.key).toBe("value");
    }
  });

  it("respects indent parameter", () => {
    const r = yamlToJson("a: 1\nb: 2", 4);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.output).toMatch(/^{\n    /);
  });

  it("returns error for invalid YAML", () => {
    const r = yamlToJson("key: [unclosed", 2);
    expect(r.ok).toBe(false);
  });

  it("round-trips through json→yaml→json", () => {
    const original = { name: "test", count: 42 };
    const yamlResult = jsonToYaml(JSON.stringify(original));
    expect(yamlResult.ok).toBe(true);
    if (!yamlResult.ok) return;
    const jsonResult = yamlToJson(yamlResult.output, 2);
    expect(jsonResult.ok).toBe(true);
    if (!jsonResult.ok) return;
    expect(JSON.parse(jsonResult.output)).toEqual(original);
  });
});
