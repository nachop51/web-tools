// Pure logic for the base converter. No DOM / Solid imports.
//
// Integer conversions go through BigInt so they survive past 2^53. Two's
// complement representation is computed against an explicit bit width.
// IEEE-754 helpers expose sign / exponent / mantissa so the UI can render
// the bits as colored chunks.

const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz'

export type BitWidth = 'auto' | 8 | 16 | 32 | 64
export const FIXED_BIT_WIDTHS: readonly Exclude<BitWidth, 'auto'>[] = [8, 16, 32, 64]

export type ParseOk = { ok: true; value: bigint }
export type ParseErr = { ok: false; error: string }
export type ParseResult = ParseOk | ParseErr

const PREFIX_BASES: Record<string, 2 | 8 | 16> = {
  '0b': 2,
  '0B': 2,
  '0o': 8,
  '0O': 8,
  '0x': 16,
  '0X': 16,
}

export function detectPrefix(input: string): { base: 2 | 8 | 16; body: string } | null {
  const trimmed = input.trim()
  const sign = trimmed.startsWith('-') ? '-' : trimmed.startsWith('+') ? '+' : ''
  const rest = sign ? trimmed.slice(1) : trimmed
  const head = rest.slice(0, 2)
  const base = PREFIX_BASES[head]
  if (!base) return null
  return { base, body: sign + rest.slice(2) }
}

// Strip an optional prefix that matches the requested base. Used so users can
// paste "0xff" into the hex field without it being rejected.
export function stripBaseSpecificPrefix(input: string, base: number): string {
  const trimmed = input.trim()
  const sign = trimmed.startsWith('-') ? '-' : trimmed.startsWith('+') ? '+' : ''
  const rest = sign ? trimmed.slice(1) : trimmed
  const head = rest.slice(0, 2)
  const prefixBase = PREFIX_BASES[head]
  if (prefixBase === base) return sign + rest.slice(2)
  return trimmed
}

// Parse a string in a given base into a BigInt. Whitespace, underscores, and
// commas are treated as separators. Returns a structured error otherwise.
export function parseInBase(input: string, base: number): ParseResult {
  if (base < 2 || base > 36 || !Number.isInteger(base)) {
    return { ok: false, error: `Base must be an integer 2–36 (got ${base})` }
  }
  const cleaned = input.replace(/[\s_,]/g, '')
  if (!cleaned) return { ok: false, error: 'Empty input' }

  let s = cleaned.toLowerCase()
  let negative = false
  if (s.startsWith('-')) {
    negative = true
    s = s.slice(1)
  } else if (s.startsWith('+')) {
    s = s.slice(1)
  }
  if (!s) return { ok: false, error: 'Empty input' }

  const validChars = DIGITS.slice(0, base)
  let value = 0n
  const baseBig = BigInt(base)
  for (const ch of s) {
    const idx = validChars.indexOf(ch)
    if (idx === -1) {
      const max = validChars[validChars.length - 1].toUpperCase()
      const range = base <= 10 ? `0–${max}` : `0–9, A–${max}`
      return { ok: false, error: `"${ch}" is not valid for base ${base} (${range})` }
    }
    value = value * baseBig + BigInt(idx)
  }
  return { ok: true, value: negative ? -value : value }
}

export function formatInBase(
  value: bigint,
  base: number,
  opts: { uppercase?: boolean } = {}
): string {
  if (base < 2 || base > 36 || !Number.isInteger(base)) {
    throw new RangeError(`base out of range: ${base}`)
  }
  if (value === 0n) return '0'
  const sign = value < 0n ? '-' : ''
  let n = value < 0n ? -value : value
  const baseBig = BigInt(base)
  let out = ''
  while (n > 0n) {
    const r = Number(n % baseBig)
    out = DIGITS[r] + out
    n /= baseBig
  }
  return sign + (opts.uppercase ? out.toUpperCase() : out)
}

// Two's-complement unsigned interpretation at a fixed bit width.
// e.g. toUnsignedAtWidth(-1n, 8) → 255n; toUnsignedAtWidth(255n, 8) → 255n.
export function toUnsignedAtWidth(value: bigint, bits: 8 | 16 | 32 | 64): bigint {
  const span = 1n << BigInt(bits)
  const mask = span - 1n
  return ((value % span) + span) & mask
}

// Signed interpretation given an unsigned bit pattern at a fixed bit width.
export function toSignedAtWidth(unsigned: bigint, bits: 8 | 16 | 32 | 64): bigint {
  const span = 1n << BigInt(bits)
  const half = 1n << BigInt(bits - 1)
  const u = ((unsigned % span) + span) & (span - 1n)
  return u >= half ? u - span : u
}

export function widthRange(bits: 8 | 16 | 32 | 64): { signedMin: bigint; signedMax: bigint; unsignedMax: bigint } {
  const half = 1n << BigInt(bits - 1)
  return {
    signedMin: -half,
    signedMax: half - 1n,
    unsignedMax: (1n << BigInt(bits)) - 1n,
  }
}

// Returns true iff the value fits as either a signed or unsigned integer at
// the given width. Used to surface an "overflow" warning in the UI.
export function fitsInWidth(value: bigint, bits: 8 | 16 | 32 | 64): boolean {
  const { signedMin, unsignedMax } = widthRange(bits)
  return value >= signedMin && value <= unsignedMax
}

export type ConvertOpts = {
  bitWidth?: BitWidth
  uppercase?: boolean
  /**
   * Width to pad to in fixed-bit-width mode. If the formatted (unsigned) bit
   * pattern is shorter than this, it gets zero-padded on the left. Pass
   * `false` to disable padding.
   * Defaults to true (pad to bitWidth / log2(base) digits).
   */
  pad?: boolean
}

// High-level: format `value` in `base`, honoring bit width + case + padding.
//   - bitWidth='auto', positive: just the digits.
//   - bitWidth='auto', negative: prepended '-'.
//   - bitWidth=N, base 10: signed decimal (preserves sign).
//   - bitWidth=N, base != 10: unsigned two's-complement, padded to width.
export function convertToBase(value: bigint, base: number, opts: ConvertOpts = {}): string {
  const { bitWidth = 'auto', uppercase = false, pad = true } = opts

  if (bitWidth === 'auto') {
    return formatInBase(value, base, { uppercase })
  }
  if (base === 10) {
    return formatInBase(value, 10)
  }
  const unsigned = toUnsignedAtWidth(value, bitWidth)
  const raw = formatInBase(unsigned, base, { uppercase })
  if (!pad) return raw
  // Pad to ceil(bits / log2(base)) digits.
  const digitsPerWidth = Math.ceil(bitWidth / Math.log2(base))
  return raw.padStart(digitsPerWidth, '0')
}

// Group digits from the right with single spaces. Preserves a leading '-'.
// e.g. groupDigits('11111111', 4) -> '1111 1111'
export function groupDigits(s: string, size: number): string {
  if (!s || size <= 0) return s
  const sign = s.startsWith('-') ? '-' : ''
  const body = sign ? s.slice(1) : s
  if (body.length <= size) return s
  const groups: string[] = []
  for (let i = body.length; i > 0; i -= size) {
    groups.unshift(body.slice(Math.max(0, i - size), i))
  }
  return sign + groups.join(' ')
}

// ---------- IEEE-754 ----------

export type FloatPrecision = 32 | 64

export type FloatBits = {
  bits: string
  sign: '0' | '1'
  exponent: string
  mantissa: string
  hex: string
  /** The value as actually stored (round-tripped through the binary form). */
  stored: number
  classification: 'zero' | 'subnormal' | 'normal' | 'infinity' | 'nan'
}

export function floatToBits(value: number, precision: FloatPrecision): FloatBits {
  const bytes = precision / 8
  const buffer = new ArrayBuffer(bytes)
  const view = new DataView(buffer)
  if (precision === 32) view.setFloat32(0, value, false)
  else view.setFloat64(0, value, false)

  let bits = ''
  let hex = ''
  for (let i = 0; i < bytes; i++) {
    const b = view.getUint8(i)
    bits += b.toString(2).padStart(8, '0')
    hex += b.toString(16).padStart(2, '0')
  }

  const expBits = precision === 32 ? 8 : 11
  const sign = bits.charAt(0) as '0' | '1'
  const exponent = bits.slice(1, 1 + expBits)
  const mantissa = bits.slice(1 + expBits)

  const stored = precision === 32 ? view.getFloat32(0, false) : view.getFloat64(0, false)

  let classification: FloatBits['classification']
  const expAllOnes = !exponent.includes('0')
  const expAllZero = !exponent.includes('1')
  const mantAllZero = !mantissa.includes('1')
  if (expAllOnes && mantAllZero) classification = 'infinity'
  else if (expAllOnes) classification = 'nan'
  else if (expAllZero && mantAllZero) classification = 'zero'
  else if (expAllZero) classification = 'subnormal'
  else classification = 'normal'

  return { bits, sign, exponent, mantissa, hex, stored, classification }
}

export function bitsToFloat(bits: string, precision: FloatPrecision): number | null {
  const cleaned = bits.replace(/[^01]/g, '')
  if (cleaned.length !== precision) return null
  const bytes = precision / 8
  const buffer = new ArrayBuffer(bytes)
  const view = new DataView(buffer)
  for (let i = 0; i < bytes; i++) {
    const byte = parseInt(cleaned.slice(i * 8, i * 8 + 8), 2)
    view.setUint8(i, byte)
  }
  return precision === 32 ? view.getFloat32(0, false) : view.getFloat64(0, false)
}

// Format a stored float for display. Uses the shortest round-trippable form
// for FLOAT64 (Number.prototype.toString), and a precision-aware form for
// FLOAT32 (where the underlying binary has fewer significant bits).
export function formatStoredFloat(value: number, precision: FloatPrecision): string {
  if (Number.isNaN(value)) return 'NaN'
  if (value === Infinity) return 'Infinity'
  if (value === -Infinity) return '-Infinity'
  if (precision === 64) return value.toString()
  // ~9 significant digits is enough to uniquely identify any float32.
  return Number(value.toPrecision(9)).toString()
}
