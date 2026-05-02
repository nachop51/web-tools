export type JsonResult =
  | { ok: true; formatted: string; minified: string; size: { formatted: number; minified: number } }
  | { ok: false; error: string; line?: number; column?: number };

function parseErrorPosition(message: string): { line?: number; column?: number } {
  const m = message.match(/line (\d+) column (\d+)/i);
  if (m) return { line: parseInt(m[1], 10), column: parseInt(m[2], 10) };
  const pos = message.match(/position (\d+)/i);
  if (pos) return {};
  return {};
}

export function processJson(input: string, indent: number): JsonResult {
  if (input.trim() === "") return { ok: false, error: "Empty input" };
  try {
    const parsed = JSON.parse(input);
    const formatted = JSON.stringify(parsed, null, indent);
    const minified = JSON.stringify(parsed);
    return {
      ok: true,
      formatted,
      minified,
      size: { formatted: formatted.length, minified: minified.length },
    };
  } catch (e) {
    const message = e instanceof SyntaxError ? e.message : "Invalid JSON";
    return { ok: false, error: message, ...parseErrorPosition(message) };
  }
}
