import { gcd } from './gcd'

export type FractionOp = 'add' | 'subtract' | 'multiply' | 'divide'

export interface Fraction {
  num: number
  den: number
}

export interface FractionResult extends Fraction {
  decimal: number
  mixed: string
}

function reduce(f: Fraction): Fraction {
  if (f.den === 0) throw new Error('Denominator cannot be zero')
  const g = gcd(Math.abs(f.num), Math.abs(f.den))
  const num = f.num / g
  const den = f.den / g
  return den < 0 ? { num: -num, den: -den } : { num, den }
}

function toResult(f: Fraction): FractionResult {
  const r = reduce(f)
  const decimal = r.num / r.den
  let mixed = ''
  if (Math.abs(r.num) >= r.den && r.den !== 1) {
    const whole = Math.trunc(r.num / r.den)
    const rem = Math.abs(r.num) - Math.abs(whole) * r.den
    mixed = rem > 0 ? `${whole} ${rem}/${r.den}` : `${whole}`
  }
  return { ...r, decimal, mixed }
}

export function fractionOp(a: Fraction, op: FractionOp, b: Fraction): FractionResult {
  let result: Fraction
  switch (op) {
    case 'add':
      result = { num: a.num * b.den + b.num * a.den, den: a.den * b.den }
      break
    case 'subtract':
      result = { num: a.num * b.den - b.num * a.den, den: a.den * b.den }
      break
    case 'multiply':
      result = { num: a.num * b.num, den: a.den * b.den }
      break
    case 'divide':
      result = { num: a.num * b.den, den: a.den * b.num }
      break
  }
  return toResult(result)
}

export function simplify(f: Fraction): FractionResult {
  return toResult(f)
}
