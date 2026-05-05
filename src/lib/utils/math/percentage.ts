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
