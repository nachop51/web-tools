import { gcd, gcdMultiple } from './gcd'

// Count decimal digits from a raw input string. parseFloat is lossy
// (e.g. 1e-3 → "0.001" via String(), but 1e-21 → "1e-21"). We read
// the user's literal so we get exact precision.
export function decimalDigits(s: string): number {
  const t = s.trim()
  if (!t) return 0
  const m = /^-?(\d+)?(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/.exec(t)
  if (!m) return 0
  const frac = m[2]?.length ?? 0
  const exp = m[3] ? parseInt(m[3], 10) : 0
  return Math.max(0, frac - exp)
}

// Scale a list to integers using the max decimal precision across inputs.
// IMPORTANT: scaling MUST happen before gcd() because gcd.ts internally
// rounds its inputs — moving the scale step later re-introduces the
// silent-truncation bug this function exists to fix.
function scaleToInts(values: number[], decimals: number): number[] {
  const f = Math.pow(10, decimals)
  return values.map((v) => Math.round(v * f))
}

export function simplifyRatio(a: number, b: number, decimals = 0): { a: number; b: number } {
  if (!isFinite(a) || !isFinite(b)) return { a, b }
  const sa = Math.sign(a) || 1
  const sb = Math.sign(b) || 1
  const [ai, bi] = scaleToInts([Math.abs(a), Math.abs(b)], decimals)
  const g = gcd(ai, bi)
  if (g === 0) return { a, b }
  return { a: (sa * ai) / g, b: (sb * bi) / g }
}

export function simplifyRatioFromStrings(a: string, b: string): { a: number; b: number } | null {
  const na = parseFloat(a)
  const nb = parseFloat(b)
  if (!isFinite(na) || !isFinite(nb)) return null
  if (na === 0 && nb === 0) return null
  const d = Math.max(decimalDigits(a), decimalDigits(b))
  return simplifyRatio(na, nb, d)
}

export function simplifyMultiRatio(parts: number[], decimals = 0): number[] {
  if (parts.length === 0) return []
  const signs = parts.map((p) => Math.sign(p) || 1)
  const ints = scaleToInts(
    parts.map((p) => Math.abs(p)),
    decimals
  )
  const g = gcdMultiple(ints)
  if (g === 0) return parts.slice()
  return ints.map((v, i) => (signs[i] * v) / g)
}

export function simplifyMultiRatioFromStrings(parts: string[]): number[] | null {
  const nums = parts.map((p) => parseFloat(p))
  if (nums.some((n) => !isFinite(n))) return null
  if (nums.every((n) => n === 0)) return null
  const d = Math.max(...parts.map(decimalDigits), 0)
  return simplifyMultiRatio(nums, d)
}

export function solveRatio(a: number, b: number, c: number): number {
  // a:b = c:? → ? = b*c/a
  return (b * c) / a
}

export function ratioToPercent(a: number, b: number): { aPercent: number; bPercent: number } {
  const total = a + b
  return { aPercent: (a / total) * 100, bPercent: (b / total) * 100 }
}

export function splitByRatio(total: number, parts: number[]): number[] | null {
  if (!isFinite(total)) return null
  if (parts.some((p) => !isFinite(p) || p < 0)) return null
  const sum = parts.reduce((s, p) => s + p, 0)
  if (sum <= 0) return null
  return parts.map((p) => (total * p) / sum)
}

export type Cells = [number | null, number | null, number | null, number | null]
export type ProportionResult =
  | { kind: 'solved'; index: 0 | 1 | 2 | 3; value: number; cells: [number, number, number, number] }
  | { kind: 'simplified'; row: 'top' | 'bottom'; a: number; b: number }
  | { kind: 'validated'; valid: boolean; a: number; b: number; aDecimals?: number; bDecimals?: number }
  | { kind: 'incomplete'; filled: number; hint: string }

const PROPORTION_TOL = 1e-9

// Cells indexed [A, B, C, D] in the equation A:B = C:D.
// Solving formulas:
//   A unknown: A = B*C/D
//   B unknown: B = A*D/C
//   C unknown: C = A*D/B
//   D unknown: D = B*C/A
export function solveProportion(cells: Cells): ProportionResult {
  const filled = cells.map((c) => c !== null && isFinite(c)) as [boolean, boolean, boolean, boolean]
  const count = filled.filter(Boolean).length

  if (count <= 1) {
    return { kind: 'incomplete', filled: count, hint: 'Enter at least 2 numbers' }
  }

  if (count === 2) {
    const [A, B, C, D] = cells
    if (filled[0] && filled[1]) return { kind: 'simplified', row: 'top', a: A!, b: B! }
    if (filled[2] && filled[3]) return { kind: 'simplified', row: 'bottom', a: C!, b: D! }
    return { kind: 'incomplete', filled: 2, hint: 'Fill one more cell to solve' }
  }

  if (count === 3) {
    const emptyIdx = filled.findIndex((f) => !f) as 0 | 1 | 2 | 3
    const [A, B, C, D] = cells
    let value: number
    switch (emptyIdx) {
      case 0:
        if (D === 0) return { kind: 'incomplete', filled: 3, hint: 'D cannot be zero' }
        value = (B! * C!) / D!
        break
      case 1:
        if (C === 0) return { kind: 'incomplete', filled: 3, hint: 'C cannot be zero' }
        value = (A! * D!) / C!
        break
      case 2:
        if (B === 0) return { kind: 'incomplete', filled: 3, hint: 'B cannot be zero' }
        value = (A! * D!) / B!
        break
      case 3:
        if (A === 0) return { kind: 'incomplete', filled: 3, hint: 'A cannot be zero' }
        value = (B! * C!) / A!
        break
    }
    if (!isFinite(value)) return { kind: 'incomplete', filled: 3, hint: 'No solution' }
    const solvedCells: [number, number, number, number] = [
      emptyIdx === 0 ? value : A!,
      emptyIdx === 1 ? value : B!,
      emptyIdx === 2 ? value : C!,
      emptyIdx === 3 ? value : D!,
    ]
    return { kind: 'solved', index: emptyIdx, value, cells: solvedCells }
  }

  // count === 4: validate
  const [A, B, C, D] = cells as [number, number, number, number]
  const left = A * D
  const right = B * C
  const scale = Math.max(Math.abs(left), Math.abs(right), 1)
  const valid = Math.abs(left - right) / scale < PROPORTION_TOL
  return { kind: 'validated', valid, a: A, b: B }
}

export function aspectFromDimensions(
  w: number,
  h: number,
  decimals = 0
): { a: number; b: number; decimal: number; rounded: boolean } | null {
  if (!isFinite(w) || !isFinite(h) || w <= 0 || h <= 0) return null
  const decimal = w / h
  const { a, b } = simplifyRatio(w, h, decimals)
  // If simplifying produced very large coprime ints, the original W:H wasn't
  // a clean ratio at the given precision — flag for "≈" display.
  const reconstructedRatio = a / b
  const rounded = Math.abs(reconstructedRatio - decimal) / decimal > 1e-12
  return { a, b, decimal, rounded }
}

export function dimensionsFromAspect(
  aspect: [number, number],
  known: number,
  axis: 'w' | 'h'
): { value: number; rounded: boolean } | null {
  const [aw, ah] = aspect
  if (!isFinite(known) || aw <= 0 || ah <= 0) return null
  const exact = axis === 'w' ? (known * ah) / aw : (known * aw) / ah
  const rounded = Math.round(exact)
  return { value: rounded, rounded: Math.abs(exact - rounded) > 1e-9 }
}

export function scaleRatio(parts: number[], factor: number, roundToInt = false): number[] {
  if (!isFinite(factor)) return parts.slice()
  const scaled = parts.map((p) => p * factor)
  return roundToInt ? scaled.map(Math.round) : scaled
}
