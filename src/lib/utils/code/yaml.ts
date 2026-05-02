import * as yaml from "js-yaml";

export type ConversionResult = { ok: true; output: string } | { ok: false; error: string };

export function jsonToYaml(json: string): ConversionResult {
  try {
    const parsed = JSON.parse(json);
    const output = yaml.dump(parsed, { indent: 2 });
    return { ok: true, output };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid JSON" };
  }
}

export function yamlToJson(yamlStr: string, indent: number): ConversionResult {
  try {
    const parsed = yaml.load(yamlStr);
    const output = JSON.stringify(parsed, null, indent);
    return { ok: true, output };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid YAML" };
  }
}
