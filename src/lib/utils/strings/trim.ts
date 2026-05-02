export function trimLeadingTrailing(s: string): string {
  return s.trim();
}

export function collapseSpaces(s: string): string {
  return s
    .split("\n")
    .map((line) => line.replace(/ {2,}/g, " ").trim())
    .join("\n");
}

export function trimLines(s: string): string {
  return s
    .split("\n")
    .map((line) => line.trim())
    .join("\n");
}

export function removeBlankLines(s: string): string {
  return s
    .split("\n")
    .filter((line) => line.trim() !== "")
    .join("\n");
}

export function normalizeLineEndings(s: string, to: "lf" | "crlf" | "cr"): string {
  // First normalize everything to LF
  const normalized = s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (to === "lf") return normalized;
  if (to === "crlf") return normalized.replace(/\n/g, "\r\n");
  if (to === "cr") return normalized.replace(/\n/g, "\r");
  return normalized;
}

export function deduplicateLines(s: string): string {
  const seen = new Set<string>();
  return s
    .split("\n")
    .filter((line) => {
      if (seen.has(line)) return false;
      seen.add(line);
      return true;
    })
    .join("\n");
}

export type TrimOptions = {
  trimEdges?: boolean;
  collapseSpaces?: boolean;
  trimLines?: boolean;
  removeBlank?: boolean;
  lineEndings?: "lf" | "crlf" | "cr" | "none";
  dedupe?: boolean;
};

export function applyTrimOps(s: string, opts: TrimOptions): string {
  let result = s;
  if (opts.trimLines) result = trimLines(result);
  if (opts.collapseSpaces) result = collapseSpaces(result);
  if (opts.removeBlank) result = removeBlankLines(result);
  if (opts.dedupe) result = deduplicateLines(result);
  if (opts.lineEndings && opts.lineEndings !== "none")
    result = normalizeLineEndings(result, opts.lineEndings);
  if (opts.trimEdges) result = trimLeadingTrailing(result);
  return result;
}
