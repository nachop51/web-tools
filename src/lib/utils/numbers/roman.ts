const TO_ROMAN_MAP: [number, string][] = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
]

export const OVERLINE = '̅'

export type RomanMode = 'standard' | 'extended'

export const ROMAN_MAX = {
  standard: 3999,
  extended: 3_999_999,
} as const

function toRomanStandard(n: number): string {
  let result = ''
  let remaining = n
  for (const [value, numeral] of TO_ROMAN_MAP) {
    while (remaining >= value) {
      result += numeral
      remaining -= value
    }
  }
  return result
}

function toAllVinculum(n: number): string {
  const thousands = Math.floor(n / 1000)
  const units = n % 1000
  if (thousands === 0) return toRomanStandard(units)
  const overlined = toRomanStandard(thousands)
    .split('')
    .map((c) => c + OVERLINE)
    .join('')
  return overlined + toRomanStandard(units)
}

export function toRoman(n: number, mode: RomanMode = 'standard'): string {
  if (!Number.isInteger(n) || n < 1 || n > ROMAN_MAX[mode]) return ''
  if (n <= 3999) return toRomanStandard(n)
  return toAllVinculum(n)
}

const VALUES: Record<string, number> = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
}

function normalizeUnderscores(s: string): string {
  return s.replace(/_([IVXLCDMivxlcdm])/g, `$1${OVERLINE}`)
}

export function fromRoman(s: string): number {
  const input = normalizeUnderscores(s.trim()).toUpperCase()
  if (!input) return NaN

  type Token = { value: number }
  const tokens: Token[] = []
  let i = 0
  while (i < input.length) {
    const ch = input[i]
    const base = VALUES[ch]
    if (base === undefined) return NaN
    let multiplier = 1
    let j = i + 1
    while (j < input.length && input[j] === OVERLINE) {
      multiplier *= 1000
      j++
    }
    tokens.push({ value: base * multiplier })
    i = j
  }

  let result = 0
  for (let k = 0; k < tokens.length; k++) {
    const cur = tokens[k].value
    const next = tokens[k + 1]?.value
    if (next !== undefined && next > cur) {
      result += next - cur
      k++
    } else {
      result += cur
    }
  }

  if (!Number.isFinite(result) || result < 1 || result > ROMAN_MAX.extended) return NaN
  const canonical = toRoman(result, 'extended')
  const vinculumForm = toAllVinculum(result)
  if (input !== canonical && input !== vinculumForm) return NaN
  return result
}

export function isLikelyRoman(s: string): boolean {
  const trimmed = normalizeUnderscores(s.trim())
  return trimmed.length > 0 && /^[IVXLCDMivxlcdm̅]+$/.test(trimmed)
}
