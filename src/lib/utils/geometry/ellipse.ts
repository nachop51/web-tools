export interface EllipseResult {
  a: number // semi-major
  b: number // semi-minor
  area: number
  perimeter: number // Ramanujan 2nd approximation
  eccentricity: number
  c: number // focal distance
  focus1: { x: number; y: number }
  focus2: { x: number; y: number }
  latusRectum: number // 2b²/a
  aspectRatio: number // a / b
  swapped: boolean
}

export function ellipse(aIn: number, bIn: number): EllipseResult {
  let a = aIn
  let b = bIn
  let swapped = false
  if (b > a) {
    a = bIn
    b = aIn
    swapped = true
  }
  if (!isFinite(a) || !isFinite(b) || a <= 0 || b <= 0) {
    throw new Error('Both axes must be positive.')
  }

  const area = Math.PI * a * b
  const c = Math.sqrt(Math.abs(a * a - b * b))
  const eccentricity = c / a
  const latusRectum = (2 * b * b) / a
  const aspectRatio = a / b

  // Ramanujan 2nd approximation
  const h = ((a - b) * (a - b)) / ((a + b) * (a + b))
  const perimeter = Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)))

  return {
    a,
    b,
    area,
    perimeter,
    eccentricity,
    c,
    focus1: { x: -c, y: 0 },
    focus2: { x: c, y: 0 },
    latusRectum,
    aspectRatio,
    swapped,
  }
}
