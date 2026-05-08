export type PercentageMode = 'of' | 'what' | 'change' | 'increase' | 'decrease' | 'error' | 'reverse'

export interface PercentageModeConfig {
  id: PercentageMode
  label: string
  inputA: string
  inputB: string
  formula: string
}

export const percentageModes: PercentageModeConfig[] = [
  { id: 'of', label: '% of a number', inputA: 'Percentage (%)', inputB: 'Number', formula: '(A ÷ 100) × B' },
  { id: 'what', label: 'What % of X is Y', inputA: 'Whole (X)', inputB: 'Part (Y)', formula: '(B ÷ A) × 100' },
  { id: 'change', label: '% change', inputA: 'Original value', inputB: 'New value', formula: '((B − A) ÷ A) × 100' },
  {
    id: 'increase',
    label: '% increase',
    inputA: 'Original value',
    inputB: 'Increase by (%)',
    formula: 'A × (1 + B ÷ 100)',
  },
  {
    id: 'decrease',
    label: '% decrease',
    inputA: 'Original value',
    inputB: 'Decrease by (%)',
    formula: 'A × (1 − B ÷ 100)',
  },
  {
    id: 'error',
    label: '% error',
    inputA: 'Actual value',
    inputB: 'Theoretical value',
    formula: '|A − B| ÷ |B| × 100',
  },
  {
    id: 'reverse',
    label: 'Reverse %',
    inputA: 'Result value',
    inputB: 'Percentage off (%)',
    formula: 'A ÷ (1 − B ÷ 100)',
  },
]

export function calculatePercentage(mode: PercentageMode, a: number, b: number): number {
  switch (mode) {
    case 'of':
      return (a / 100) * b
    case 'what':
      return (b / a) * 100
    case 'change':
      return ((b - a) / Math.abs(a)) * 100
    case 'increase':
      return a * (1 + b / 100)
    case 'decrease':
      return a * (1 - b / 100)
    case 'error':
      return (Math.abs(a - b) / Math.abs(b)) * 100
    case 'reverse':
      return a / (1 - b / 100)
  }
}

export type SolveTarget = 'a' | 'b' | 'c'

export interface SolveResult {
  a: number
  b: number
  c: number
  target: SolveTarget
}

// Equation: (A / 100) * B = C — A is percentage, B is whole, C is part.
export function solvePercentage(input: {
  a?: number
  b?: number
  c?: number
  target: SolveTarget
}): SolveResult | null {
  const { a, b, c, target } = input
  if (target === 'c') {
    if (a == null || b == null || !isFinite(a) || !isFinite(b)) return null
    const next = (a / 100) * b
    if (!isFinite(next)) return null
    return { a, b, c: next, target }
  }
  if (target === 'a') {
    if (b == null || c == null || !isFinite(b) || !isFinite(c)) return null
    if (b === 0) return null
    const next = (c / b) * 100
    if (!isFinite(next)) return null
    return { a: next, b, c, target }
  }
  // target === 'b'
  if (a == null || c == null || !isFinite(a) || !isFinite(c)) return null
  if (a === 0) return null
  const next = (c / a) * 100
  if (!isFinite(next)) return null
  return { a, b: next, c, target }
}

export interface ChangeResult {
  from: number
  to: number
  delta: number
  pctChange: number
  ppDelta: number
}

export function percentChange(from: number, to: number): ChangeResult | null {
  if (!isFinite(from) || !isFinite(to)) return null
  if (from === 0) return null
  const delta = to - from
  const pctChange = (delta / Math.abs(from)) * 100
  return { from, to, delta, pctChange, ppDelta: delta }
}

export interface AdjustResult {
  value: number
  signedPct: number
  result: number
  delta: number
}

export function percentAdjust(value: number, signedPct: number): AdjustResult {
  const result = value * (1 + signedPct / 100)
  return { value, signedPct, result, delta: result - value }
}
