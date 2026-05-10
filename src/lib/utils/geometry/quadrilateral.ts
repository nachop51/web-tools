export type QuadShape = 'parallelogram' | 'rhombus' | 'trapezoid' | 'kite'

export interface ParallelogramResult {
  shape: 'parallelogram'
  base: number
  height: number
  side: number
  angleDeg: number
  area: number
  perimeter: number
  diagonalShort: number
  diagonalLong: number
}

export interface RhombusResult {
  shape: 'rhombus'
  side: number
  diagonalP: number
  diagonalQ: number
  area: number
  perimeter: number
  angleDeg: number // acute interior angle
}

export interface TrapezoidResult {
  shape: 'trapezoid'
  a: number // top parallel side
  b: number // bottom parallel side
  height: number
  legLeft: number | null
  legRight: number | null
  area: number
  perimeter: number | null
  midsegment: number
}

export interface KiteResult {
  shape: 'kite'
  diagonalP: number
  diagonalQ: number
  area: number
  sideShort: number | null
  sideLong: number | null
  perimeter: number | null
}

export type QuadResult = ParallelogramResult | RhombusResult | TrapezoidResult | KiteResult

export function parallelogram(base: number, height: number, side: number, angleDeg: number): ParallelogramResult {
  const area = base * height
  const perimeter = 2 * (base + side)
  const aRad = (angleDeg * Math.PI) / 180
  // Diagonals via law of cosines on the parallelogram with sides base, side and angle between them.
  // d1² = b² + s² - 2bs cos(θ)  (across angle θ)
  // d2² = b² + s² - 2bs cos(180-θ) = b² + s² + 2bs cos(θ)
  const d1 = Math.sqrt(base * base + side * side - 2 * base * side * Math.cos(aRad))
  const d2 = Math.sqrt(base * base + side * side + 2 * base * side * Math.cos(aRad))
  const diagonalShort = Math.min(d1, d2)
  const diagonalLong = Math.max(d1, d2)
  return {
    shape: 'parallelogram',
    base,
    height,
    side,
    angleDeg,
    area,
    perimeter,
    diagonalShort,
    diagonalLong,
  }
}

export function rhombus(side: number, p: number, q: number): RhombusResult {
  const area = (p * q) / 2
  const perimeter = 4 * side
  // Acute interior angle from diagonals: tan(θ/2) = (q/2) / (p/2) = q/p when q < p
  const longD = Math.max(p, q)
  const shortD = Math.min(p, q)
  const angleDeg = (2 * Math.atan(shortD / longD) * 180) / Math.PI
  return {
    shape: 'rhombus',
    side,
    diagonalP: p,
    diagonalQ: q,
    area,
    perimeter,
    angleDeg,
  }
}

export function trapezoid(
  a: number,
  b: number,
  height: number,
  legLeft?: number,
  legRight?: number
): TrapezoidResult {
  const area = ((a + b) / 2) * height
  const midsegment = (a + b) / 2
  const perimeter = legLeft !== undefined && legRight !== undefined ? a + b + legLeft + legRight : null
  return {
    shape: 'trapezoid',
    a,
    b,
    height,
    legLeft: legLeft ?? null,
    legRight: legRight ?? null,
    area,
    perimeter,
    midsegment,
  }
}

export function kite(p: number, q: number, sideShort?: number, sideLong?: number): KiteResult {
  const area = (p * q) / 2
  const perimeter = sideShort !== undefined && sideLong !== undefined ? 2 * (sideShort + sideLong) : null
  return {
    shape: 'kite',
    diagonalP: p,
    diagonalQ: q,
    area,
    sideShort: sideShort ?? null,
    sideLong: sideLong ?? null,
    perimeter,
  }
}
