const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const PADDING = "=";

export function encodeBase32(input: string): string {
  if (input === "") return "";

  const bytes = new TextEncoder().encode(input);
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      output += ALPHABET[(value >>> bits) & 0x1f];
    }
  }

  if (bits > 0) {
    output += ALPHABET[(value << (5 - bits)) & 0x1f];
  }

  // Pad to multiple of 8
  while (output.length % 8 !== 0) {
    output += PADDING;
  }

  return output;
}

export function decodeBase32(input: string): string {
  if (input === "") return "";

  const clean = input.toUpperCase().replace(/=+$/, "");

  for (const ch of clean) {
    if (!ALPHABET.includes(ch)) {
      throw new Error(`Invalid Base32 character: ${ch}`);
    }
  }

  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (const ch of clean) {
    value = (value << 5) | ALPHABET.indexOf(ch);
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((value >>> bits) & 0xff);
    }
  }

  return new TextDecoder().decode(new Uint8Array(bytes));
}
