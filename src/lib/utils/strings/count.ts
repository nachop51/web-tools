export function countChars(s: string): number {
  return s.length;
}

export function countCharsNoSpaces(s: string): number {
  return s.replace(/\s/g, "").length;
}

export function countWords(s: string): number {
  if (!s.trim()) return 0;
  return s.match(/\S+/g)?.length ?? 0;
}

export function countLines(s: string): number {
  if (s === "") return 0;
  return s.split("\n").length;
}

export function countBytes(s: string): number {
  return new TextEncoder().encode(s).byteLength;
}

export function countSentences(s: string): number {
  return (
    s
      .split(/[.!?]+/)
      .filter((part) => part.trim() !== "").length
  );
}

export function countParagraphs(s: string): number {
  return (
    s
      .split(/\n\s*\n/)
      .filter((part) => part.trim() !== "").length
  );
}
