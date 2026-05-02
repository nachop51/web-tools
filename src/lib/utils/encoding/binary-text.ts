export type BinaryMode = "binary" | "hex" | "decimal";

export function textToBinary(s: string): string {
  if (s === "") return "";
  const bytes = new TextEncoder().encode(s);
  return Array.from(bytes)
    .map((b) => b.toString(2).padStart(8, "0"))
    .join(" ");
}

export function binaryToText(s: string): string {
  if (s.trim() === "") return "";
  const tokens = s.trim().split(/\s+/);
  const bytes = new Uint8Array(tokens.map((t) => parseInt(t, 2)));
  return new TextDecoder().decode(bytes);
}

export function textToHex(s: string): string {
  if (s === "") return "";
  const bytes = new TextEncoder().encode(s);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(" ");
}

export function hexToText(s: string): string {
  if (s.trim() === "") return "";
  const tokens = s.trim().split(/\s+/);
  const bytes = new Uint8Array(tokens.map((t) => parseInt(t, 16)));
  return new TextDecoder().decode(bytes);
}

export function textToDecimal(s: string): string {
  if (s === "") return "";
  const bytes = new TextEncoder().encode(s);
  return Array.from(bytes).join(" ");
}

export function decimalToText(s: string): string {
  if (s.trim() === "") return "";
  const tokens = s.trim().split(/\s+/);
  const bytes = new Uint8Array(tokens.map((t) => parseInt(t, 10)));
  return new TextDecoder().decode(bytes);
}
