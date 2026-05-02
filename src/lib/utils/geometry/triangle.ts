export interface RightTriangleResult {
  a: number;
  b: number;
  c: number;         // hypotenuse
  angleA: number;    // degrees, opposite to side a
  angleB: number;    // degrees, opposite to side b
  area: number;
  perimeter: number;
}

export type RightTriangleSolveFor = "c" | "a" | "b";

export function solveRightTriangle(
  solveFor: RightTriangleSolveFor,
  val1: number,
  val2: number,
): RightTriangleResult {
  let a: number, b: number, c: number;
  switch (solveFor) {
    case "c":
      a = val1; b = val2; c = Math.sqrt(a * a + b * b);
      break;
    case "a":
      b = val1; c = val2;
      if (c < b) throw new Error("Hypotenuse must be longer than leg");
      a = Math.sqrt(c * c - b * b);
      break;
    case "b":
      a = val1; c = val2;
      if (c < a) throw new Error("Hypotenuse must be longer than leg");
      b = Math.sqrt(c * c - a * a);
      break;
  }
  const angleA = Math.atan2(a, b) * (180 / Math.PI);
  const angleB = 90 - angleA;
  return { a, b, c, angleA, angleB, area: 0.5 * a * b, perimeter: a + b + c };
}

// General triangle from 3 sides (SSS) using law of cosines
export interface TriangleResult {
  a: number;
  b: number;
  c: number;
  angleA: number;
  angleB: number;
  angleC: number;
  area: number;
  perimeter: number;
  valid: boolean;
}

export function triangleFromSSS(a: number, b: number, c: number): TriangleResult {
  const valid = a + b > c && b + c > a && a + c > b;
  if (!valid) {
    return { a, b, c, angleA: NaN, angleB: NaN, angleC: NaN, area: NaN, perimeter: NaN, valid: false };
  }
  const angleA = Math.acos((b * b + c * c - a * a) / (2 * b * c)) * 180 / Math.PI;
  const angleB = Math.acos((a * a + c * c - b * b) / (2 * a * c)) * 180 / Math.PI;
  const angleC = 180 - angleA - angleB;
  const s = (a + b + c) / 2;
  const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
  return { a, b, c, angleA, angleB, angleC, area, perimeter: a + b + c, valid: true };
}
