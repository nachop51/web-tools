import { gcd } from "./gcd";

export function simplifyRatio(a: number, b: number): { a: number; b: number } {
  const g = gcd(Math.round(Math.abs(a)), Math.round(Math.abs(b)));
  if (g === 0) return { a, b };
  return { a: a / g, b: b / g };
}

export function solveRatio(a: number, b: number, c: number): number {
  // a:b = c:? → ? = b*c/a
  return (b * c) / a;
}

export function ratioToPercent(a: number, b: number): { aPercent: number; bPercent: number } {
  const total = a + b;
  return { aPercent: (a / total) * 100, bPercent: (b / total) * 100 };
}
