export type PasswordOpts = {
  length: number;
  upper: boolean;
  lower: boolean;
  digits: boolean;
  symbols: boolean;
};

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{}|;:,.<>?";

export function generatePassword(opts: PasswordOpts): string {
  let charset = "";
  if (opts.upper) charset += UPPER;
  if (opts.lower) charset += LOWER;
  if (opts.digits) charset += DIGITS;
  if (opts.symbols) charset += SYMBOLS;
  if (!charset) return "";

  const len = opts.length;
  const rand = crypto.getRandomValues(new Uint32Array(len));
  let result = "";
  for (let i = 0; i < len; i++) {
    result += charset[rand[i] % charset.length];
  }
  return result;
}

export function calcEntropy(charsetSize: number, length: number): number {
  return length * Math.log2(charsetSize);
}

export function strengthLabel(entropy: number): "Weak" | "Fair" | "Strong" | "Very strong" {
  if (entropy < 28) return "Weak";
  if (entropy < 60) return "Fair";
  if (entropy < 100) return "Strong";
  return "Very strong";
}
