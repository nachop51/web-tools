export function reverseChars(s: string): string {
  return [...s].reverse().join("");
}

export function reverseWords(s: string): string {
  return s.split(/\s+/).reverse().join(" ");
}

export function reverseLines(s: string): string {
  return s.split("\n").reverse().join("\n");
}
