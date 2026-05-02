export type FindReplaceOpts = {
  useRegex: boolean;
  caseSensitive: boolean;
  wholeWord: boolean;
};

export function findReplace(
  text: string,
  find: string,
  replace: string,
  opts: FindReplaceOpts,
): { result: string; count: number } {
  if (!find) return { result: text, count: 0 };

  let pattern: string;
  if (opts.useRegex) {
    pattern = find;
  } else {
    pattern = find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  if (opts.wholeWord) {
    pattern = `\\b${pattern}\\b`;
  }

  const flags = opts.caseSensitive ? "g" : "gi";

  let regex: RegExp;
  try {
    regex = new RegExp(pattern, flags);
  } catch {
    return { result: text, count: 0 };
  }

  let count = 0;
  const result = text.replace(regex, (...args) => {
    count++;
    // args: [match, ...captureGroups, offset, string]
    const groups = args.slice(1, -2) as string[];
    return replace.replace(/\$(\d+)/g, (_, n) => groups[Number(n) - 1] ?? "");
  });

  return { result, count };
}
