export type PrecisionMode = 'round' | 'floor' | 'ceil' | 'trunc' | 'sigfigs'

export type Direction = 'up' | 'down' | 'exact'

export function roundTo(n: number, places: number): number {
  return Number(n.toFixed(places))
}

export function floorTo(n: number, places: number): number {
  const factor = 10 ** places
  return Math.floor(n * factor) / factor
}

export function ceilTo(n: number, places: number): number {
  const factor = 10 ** places
  return Math.ceil(n * factor) / factor
}

export function truncateTo(n: number, places: number): number {
  const factor = 10 ** places
  return Math.trunc(n * factor) / factor
}

export function toSigFigs(n: number, sig: number): number {
  return parseFloat(n.toPrecision(sig))
}

export function applyPrecision(n: number, depth: number, mode: PrecisionMode): number {
  switch (mode) {
    case 'round':
      return roundTo(n, depth)
    case 'floor':
      return floorTo(n, depth)
    case 'ceil':
      return ceilTo(n, depth)
    case 'trunc':
      return truncateTo(n, depth)
    case 'sigfigs':
      return toSigFigs(n, Math.max(1, depth))
  }
}

export function absoluteError(original: number, rounded: number): number {
  return Math.abs(original - rounded)
}

export function relativeError(original: number, rounded: number): number {
  if (original === 0) return rounded === 0 ? 0 : NaN
  return Math.abs((rounded - original) / original)
}

export function direction(original: number, rounded: number): Direction {
  if (rounded === original) return 'exact'
  return rounded > original ? 'up' : 'down'
}

// Render a number without ever falling back to JS's `1.23e-7` form, since the
// digit-diff visualization needs a plain decimal string the user can recognize.
function toPlainString(n: number): string {
  const s = n.toString()
  if (!/e/i.test(s)) return s
  const m = s.match(/^(-?)(\d+)(?:\.(\d+))?[eE]([+-]?\d+)$/)
  if (!m) return s
  const sign = m[1]
  const intPart = m[2]
  const fracPart = m[3] ?? ''
  const exp = parseInt(m[4], 10)
  const digits = intPart + fracPart
  const pointPos = intPart.length + exp
  if (pointPos <= 0) {
    return sign + '0.' + '0'.repeat(-pointPos) + digits
  }
  if (pointPos >= digits.length) {
    return sign + digits + '0'.repeat(pointPos - digits.length)
  }
  return sign + digits.slice(0, pointPos) + '.' + digits.slice(pointPos)
}

function normalizeOriginal(s: string): string {
  if (!s) return ''
  const trimmed = s.trim()
  if (!trimmed) return ''
  if (/[eE]/.test(trimmed)) {
    const n = parseFloat(trimmed)
    if (!isFinite(n)) return ''
    return toPlainString(n)
  }
  return trimmed
}

export function digitDiff(
  originalText: string,
  depth: number,
  mode: PrecisionMode
): { kept: string; dropped: string } {
  const text = normalizeOriginal(originalText)
  if (!text) return { kept: '', dropped: '' }

  if (mode === 'sigfigs') {
    const sig = Math.max(1, depth)
    let seen = 0
    let started = false
    for (let i = 0; i < text.length; i++) {
      const ch = text[i]
      if (ch === '-' || ch === '.') continue
      if (!started) {
        if (ch === '0') continue
        started = true
      }
      seen++
      if (seen === sig) {
        return { kept: text.slice(0, i + 1), dropped: text.slice(i + 1) }
      }
    }
    return { kept: text, dropped: '' }
  }

  const dotIdx = text.indexOf('.')
  if (dotIdx === -1) return { kept: text, dropped: '' }
  const cut = Math.min(text.length, depth === 0 ? dotIdx : dotIdx + depth + 1)
  return { kept: text.slice(0, cut), dropped: text.slice(cut) }
}

const SUPER_DIGITS: Record<string, string> = {
  '-': '⁻',
  '+': '⁺',
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
}

function superscript(n: number): string {
  return n
    .toString()
    .split('')
    .map((c) => SUPER_DIGITS[c] ?? c)
    .join('')
}

export function formatScientificNote(s: string): string | null {
  const trimmed = s.trim()
  if (!trimmed || !/[eE]/.test(trimmed)) return null
  const n = parseFloat(trimmed)
  if (!isFinite(n)) return null
  const exp = n.toExponential()
  const [coef, e] = exp.split('e')
  return `${coef} × 10${superscript(parseInt(e, 10))}`
}
