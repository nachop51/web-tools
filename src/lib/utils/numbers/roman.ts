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

export function toRoman(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > 3999) return ''
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

export function fromRoman(s: string): number {
  const input = s.trim().toUpperCase()
  if (!input) return NaN

  const VALUES: Record<string, number> = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  }

  let result = 0
  for (let i = 0; i < input.length; i++) {
    const current = VALUES[input[i]]
    if (current === undefined) return NaN
    const next = VALUES[input[i + 1]]
    if (next !== undefined && next > current) {
      result += next - current
      i++
    } else {
      result += current
    }
  }

  // Validate by round-tripping; catches invalid sequences like "IIII" or "VV"
  if (toRoman(result) !== input) return NaN
  return result
}

export function isLikelyRoman(s: string): boolean {
  const trimmed = s.trim()
  return trimmed.length > 0 && /^[IVXLCDMivxlcdm]+$/.test(trimmed)
}
