export type RegexMatch = { fullMatch: string; groups: string[]; index: number };
export type RegexResult = { matches: RegexMatch[]; error: string | null };

export function testRegex(pattern: string, flags: string, input: string): RegexResult {
  if (!pattern) return { matches: [], error: null };
  try {
    const re = new RegExp(pattern, flags);
    const matches: RegexMatch[] = [];
    for (const m of input.matchAll(re)) {
      matches.push({
        fullMatch: m[0],
        groups: m.slice(1).map((g) => (g === undefined ? "" : g)),
        index: m.index ?? 0,
      });
    }
    return { matches, error: null };
  } catch (e) {
    return {
      matches: [],
      error: e instanceof SyntaxError ? e.message : "Unknown error",
    };
  }
}
