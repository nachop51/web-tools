// Pure logic for the float inspector. Supports IEEE-754 float64 / float32 /
// float16 (binary16), and Google Brain's bfloat16. All encoders / decoders
// run in pure JS, no DOM, no Solid imports.

export type FloatFormat = 'float16' | 'bfloat16' | 'float32' | 'float64'

export const FLOAT_FORMATS: readonly FloatFormat[] = ['float16', 'bfloat16', 'float32', 'float64']

export type Layout = {
  exp: number
  mant: number
  total: number
  bias: number
  expMax: number
}

const LAYOUTS: Record<FloatFormat, Layout> = {
  float16: { exp: 5, mant: 10, total: 16, bias: 15, expMax: 31 },
  bfloat16: { exp: 8, mant: 7, total: 16, bias: 127, expMax: 255 },
  float32: { exp: 8, mant: 23, total: 32, bias: 127, expMax: 255 },
  float64: { exp: 11, mant: 52, total: 64, bias: 1023, expMax: 2047 },
}

export function getLayout(format: FloatFormat): Layout {
  return LAYOUTS[format]
}

export type Classification = 'zero' | 'subnormal' | 'normal' | 'infinity' | 'nan'

export type FloatBits = {
  bits: string
  sign: '0' | '1'
  exponent: string
  mantissa: string
  hex: string
  stored: number
  classification: Classification
  format: FloatFormat
}

// ─── encode / decode ──────────────────────────────────────────────────────

export function encodeFloat(value: number, format: FloatFormat): FloatBits {
  const bits = encodeBits(value, format)
  return decompose(bits, format)
}

export function decodeBits(bits: string, format: FloatFormat): number | null {
  const cleaned = bits.replace(/[^01]/g, '')
  const layout = LAYOUTS[format]
  if (cleaned.length !== layout.total) return null
  return bitsToNumber(cleaned, format)
}

function encodeBits(value: number, format: FloatFormat): string {
  if (format === 'float64') {
    const buf = new ArrayBuffer(8)
    new DataView(buf).setFloat64(0, value, false)
    return bufferToBits(buf)
  }
  if (format === 'float32') {
    const buf = new ArrayBuffer(4)
    new DataView(buf).setFloat32(0, value, false)
    return bufferToBits(buf)
  }
  if (format === 'bfloat16') {
    const u16 = float64ToBfloat16(value)
    return u16.toString(2).padStart(16, '0')
  }
  // float16
  const u16 = float64ToFloat16(value)
  return u16.toString(2).padStart(16, '0')
}

function bitsToNumber(bits: string, format: FloatFormat): number {
  if (format === 'float64') {
    const buf = bitsToBuffer(bits)
    return new DataView(buf).getFloat64(0, false)
  }
  if (format === 'float32') {
    const buf = bitsToBuffer(bits)
    return new DataView(buf).getFloat32(0, false)
  }
  if (format === 'bfloat16') {
    const u32 = parseInt(bits, 2) << 16
    const buf = new ArrayBuffer(4)
    new DataView(buf).setUint32(0, u32 >>> 0, false)
    return new DataView(buf).getFloat32(0, false)
  }
  // float16
  return float16ToFloat64(parseInt(bits, 2))
}

function bufferToBits(buf: ArrayBuffer): string {
  const view = new DataView(buf)
  let s = ''
  for (let i = 0; i < buf.byteLength; i++) s += view.getUint8(i).toString(2).padStart(8, '0')
  return s
}

function bitsToBuffer(bits: string): ArrayBuffer {
  const bytes = bits.length / 8
  const buf = new ArrayBuffer(bytes)
  const view = new DataView(buf)
  for (let i = 0; i < bytes; i++) view.setUint8(i, parseInt(bits.slice(i * 8, i * 8 + 8), 2))
  return buf
}

function decompose(bits: string, format: FloatFormat): FloatBits {
  const layout = LAYOUTS[format]
  const sign = bits.charAt(0) as '0' | '1'
  const exponent = bits.slice(1, 1 + layout.exp)
  const mantissa = bits.slice(1 + layout.exp)
  const hex = bigintFromBits(bits).toString(16).padStart(layout.total / 4, '0')
  const stored = bitsToNumber(bits, format)
  const expAllOnes = !exponent.includes('0')
  const expAllZero = !exponent.includes('1')
  const mantAllZero = !mantissa.includes('1')
  let classification: Classification
  if (expAllOnes && mantAllZero) classification = 'infinity'
  else if (expAllOnes) classification = 'nan'
  else if (expAllZero && mantAllZero) classification = 'zero'
  else if (expAllZero) classification = 'subnormal'
  else classification = 'normal'
  return { bits, sign, exponent, mantissa, hex, stored, classification, format }
}

function bigintFromBits(bits: string): bigint {
  return bits ? BigInt('0b' + bits) : 0n
}

// ─── float16 manual codec (round-trip via float32) ────────────────────────

function float64ToFloat16(value: number): number {
  if (Number.isNaN(value)) return 0x7e00
  if (value === Infinity) return 0x7c00
  if (value === -Infinity) return 0xfc00
  if (value === 0) return Object.is(value, -0) ? 0x8000 : 0x0000
  // Encode through float32 first to leverage native rounding for the upper bits.
  const buf = new ArrayBuffer(4)
  new DataView(buf).setFloat32(0, value, false)
  const u32 = new DataView(buf).getUint32(0, false)
  return float32BitsToFloat16(u32)
}

function float32BitsToFloat16(u32: number): number {
  const sign = (u32 >>> 16) & 0x8000
  const exp32 = (u32 >>> 23) & 0xff
  const mant32 = u32 & 0x7fffff

  if (exp32 === 0xff) {
    if (mant32 === 0) return sign | 0x7c00
    return sign | 0x7c00 | 0x0200 | (mant32 >>> 13 || 1)
  }

  let e16 = exp32 - 127 + 15

  if (e16 >= 0x1f) return sign | 0x7c00
  if (e16 <= 0) {
    const shift = 14 - e16
    if (shift > 24) return sign
    const fullMant = mant32 | 0x800000
    let m = fullMant >>> shift
    const half = 1 << (shift - 1)
    const remainder = fullMant & ((1 << shift) - 1)
    if (remainder > half || (remainder === half && (m & 1))) m++
    if (m >= 0x400) return sign | 0x0400
    return sign | (m & 0x3ff)
  }
  let m = mant32 >>> 13
  const remainder = mant32 & 0x1fff
  if (remainder > 0x1000 || (remainder === 0x1000 && (m & 1))) {
    m++
    if (m >= 0x400) {
      m = 0
      e16++
      if (e16 >= 0x1f) return sign | 0x7c00
    }
  }
  return sign | (e16 << 10) | m
}

function float16ToFloat64(u16: number): number {
  const sign = u16 & 0x8000 ? -1 : 1
  const exp = (u16 >>> 10) & 0x1f
  const mant = u16 & 0x3ff
  if (exp === 0x1f) return mant === 0 ? sign * Infinity : NaN
  if (exp === 0) {
    if (mant === 0) return sign === -1 ? -0 : 0
    return sign * mant * Math.pow(2, -24)
  }
  return sign * (0x400 + mant) * Math.pow(2, exp - 25)
}

// ─── bfloat16 (truncate float32 with round-to-nearest-even) ────────────────

function float64ToBfloat16(value: number): number {
  if (Number.isNaN(value)) return 0x7fc0
  if (value === Infinity) return 0x7f80
  if (value === -Infinity) return 0xff80
  const buf = new ArrayBuffer(4)
  new DataView(buf).setFloat32(0, value, false)
  const u32 = new DataView(buf).getUint32(0, false)
  const exp32 = (u32 >>> 23) & 0xff
  const mant32 = u32 & 0x7fffff
  if (exp32 === 0xff && mant32 !== 0) return ((u32 >>> 16) & 0x8000) | 0x7fc0
  const lower = u32 & 0xffff
  const upper = (u32 >>> 16) & 0xffff
  const round = lower > 0x8000 || (lower === 0x8000 && (upper & 1)) ? 1 : 0
  return (upper + round) & 0xffff
}

// ─── nextUp / nextDown / ULP ───────────────────────────────────────────────

export function nextUp(bits: string, format: FloatFormat): string {
  const layout = LAYOUTS[format]
  if (bits.length !== layout.total) throw new Error('bits length mismatch')
  // NaN stays NaN.
  if (isNaNBits(bits, format)) return bits
  // +Infinity stays +Infinity.
  const isPosInf = bits.charAt(0) === '0' && allOnes(bits.slice(1, 1 + layout.exp)) && allZero(bits.slice(1 + layout.exp))
  if (isPosInf) return bits
  const total = layout.total
  if (bits.charAt(0) === '0') {
    const u = bigintFromBits(bits) + 1n
    return u.toString(2).padStart(total, '0')
  }
  // Negative
  const u = bigintFromBits(bits)
  if (u === 1n << BigInt(total - 1)) {
    // -0 → smallest positive subnormal
    return '0'.repeat(total - 1) + '1'
  }
  return (u - 1n).toString(2).padStart(total, '0')
}

export function nextDown(bits: string, format: FloatFormat): string {
  const layout = LAYOUTS[format]
  if (bits.length !== layout.total) throw new Error('bits length mismatch')
  if (isNaNBits(bits, format)) return bits
  // -Infinity stays.
  const isNegInf = bits.charAt(0) === '1' && allOnes(bits.slice(1, 1 + layout.exp)) && allZero(bits.slice(1 + layout.exp))
  if (isNegInf) return bits
  const total = layout.total
  if (bits.charAt(0) === '1') {
    const u = bigintFromBits(bits) + 1n
    return u.toString(2).padStart(total, '0')
  }
  const u = bigintFromBits(bits)
  if (u === 0n) {
    // +0 → smallest negative subnormal (sign 1, mantissa 0...01)
    return '1' + '0'.repeat(total - 2) + '1'
  }
  return (u - 1n).toString(2).padStart(total, '0')
}

function isNaNBits(bits: string, format: FloatFormat): boolean {
  const layout = LAYOUTS[format]
  const exp = bits.slice(1, 1 + layout.exp)
  const mant = bits.slice(1 + layout.exp)
  return allOnes(exp) && !allZero(mant)
}

function allOnes(s: string): boolean {
  return s.length > 0 && !s.includes('0')
}

function allZero(s: string): boolean {
  return s.length === 0 || !s.includes('1')
}

// Signed ULP distance from `a` to `b` (in number of representable steps,
// counting +0 and -0 as the same float). Returns null if either is NaN.
export function ulpDistance(a: string, b: string, format: FloatFormat): bigint | null {
  if (isNaNBits(a, format) || isNaNBits(b, format)) return null
  return signedMagnitudeOrder(b, format) - signedMagnitudeOrder(a, format)
}

function signedMagnitudeOrder(bits: string, format: FloatFormat): bigint {
  const layout = LAYOUTS[format]
  const sign = bits.charAt(0)
  const mag = bigintFromBits(bits.slice(1))
  // Map to a single monotonic ordering: positive magnitude as-is, negative as -magnitude.
  return sign === '0' ? mag : -mag
}

// ─── exact decimal expansion ──────────────────────────────────────────────

export function exactDecimal(bits: string, format: FloatFormat): string {
  const layout = LAYOUTS[format]
  const sign = bits.charAt(0)
  const expBits = bits.slice(1, 1 + layout.exp)
  const mantBits = bits.slice(1 + layout.exp)
  const exp = parseInt(expBits, 2)
  const mantInt = bigintFromBits(mantBits)
  if (exp === layout.expMax) {
    if (mantInt === 0n) return sign === '1' ? '-Infinity' : 'Infinity'
    return 'NaN'
  }
  if (exp === 0 && mantInt === 0n) return sign === '1' ? '-0' : '0'
  let m: bigint
  let e: number
  if (exp === 0) {
    m = mantInt
    e = 1 - layout.bias - layout.mant
  } else {
    m = (1n << BigInt(layout.mant)) | mantInt
    e = exp - layout.bias - layout.mant
  }
  const absStr = bigintTimesPowerOfTwoToDecimal(m, e)
  return (sign === '1' ? '-' : '') + absStr
}

function bigintTimesPowerOfTwoToDecimal(m: bigint, e: number): string {
  if (e >= 0) return (m << BigInt(e)).toString()
  const k = -e
  // m / 2^k = m * 5^k / 10^k
  const num = m * 5n ** BigInt(k)
  const numStr = num.toString()
  if (numStr.length <= k) {
    let s = '0.' + numStr.padStart(k, '0')
    s = trimTrailingZeros(s)
    return s
  }
  let s = numStr.slice(0, numStr.length - k) + '.' + numStr.slice(numStr.length - k)
  s = trimTrailingZeros(s)
  return s
}

function trimTrailingZeros(s: string): string {
  if (!s.includes('.')) return s
  return s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '')
}

// ─── ULP gap ──────────────────────────────────────────────────────────────

// Gap to the next representable float (exact decimal).
// Returns null for NaN or +Infinity.
export function ulpGap(bits: string, format: FloatFormat): string | null {
  if (isNaNBits(bits, format)) return null
  const layout = LAYOUTS[format]
  const isPosInf = bits.charAt(0) === '0' && allOnes(bits.slice(1, 1 + layout.exp)) && allZero(bits.slice(1 + layout.exp))
  if (isPosInf) return null
  // The ULP at this float is just 2^(unbiased exp + 1 - mantBits) for normal, or
  // 2^(1 - bias - mantBits) for subnormal. But we also need to handle the boundary
  // at the smallest normal magnitude: there, nextUp on max subnormal gives the
  // smallest normal, and the gap equals one subnormal ULP.
  // Easiest: compute exactDecimal of next - current using BigInt rationals.
  const next = nextUp(bits, format)
  return absDiffExact(bits, next, format)
}

function absDiffExact(a: string, b: string, format: FloatFormat): string {
  const ra = bitsToRational(a, format)
  const rb = bitsToRational(b, format)
  // diff = |b - a| given same format
  // ra and rb are { mantissa: bigint, exp: number } where value = mantissa * 2^exp (sign included in mantissa)
  // Align exponents
  let { num: aNum, exp: aExp } = ra
  let { num: bNum, exp: bExp } = rb
  let exp = Math.min(aExp, bExp)
  if (aExp > exp) aNum = aNum << BigInt(aExp - exp)
  if (bExp > exp) bNum = bNum << BigInt(bExp - exp)
  let diff = bNum - aNum
  if (diff < 0n) diff = -diff
  return bigintTimesPowerOfTwoToDecimal(diff, exp)
}

function bitsToRational(bits: string, format: FloatFormat): { num: bigint; exp: number } {
  const layout = LAYOUTS[format]
  const sign = bits.charAt(0)
  const expBits = bits.slice(1, 1 + layout.exp)
  const mantBits = bits.slice(1 + layout.exp)
  const exp = parseInt(expBits, 2)
  const mantInt = bigintFromBits(mantBits)
  if (exp === 0 && mantInt === 0n) return { num: 0n, exp: 0 }
  let m: bigint
  let e: number
  if (exp === 0) {
    m = mantInt
    e = 1 - layout.bias - layout.mant
  } else {
    m = (1n << BigInt(layout.mant)) | mantInt
    e = exp - layout.bias - layout.mant
  }
  if (sign === '1') m = -m
  return { num: m, exp: e }
}

// ─── machine epsilon ──────────────────────────────────────────────────────

// 2^-mantissaBits, the relative precision.
export function machineEpsilon(format: FloatFormat): number {
  const layout = LAYOUTS[format]
  return Math.pow(2, -layout.mant)
}

// ─── hex / binary parsing ─────────────────────────────────────────────────

export type HexParseResult = { ok: true; bits: string } | { ok: false; error: string }

export function parseHexInput(input: string, format: FloatFormat): HexParseResult {
  const layout = LAYOUTS[format]
  const trimmed = input.trim().replace(/^0x/i, '').replace(/[\s_]/g, '')
  if (!trimmed) return { ok: false, error: 'Empty input' }
  if (!/^[0-9a-fA-F]+$/.test(trimmed)) return { ok: false, error: 'Hex digits only (0-9, a-f)' }
  const expectedHex = layout.total / 4
  if (trimmed.length > expectedHex) {
    return { ok: false, error: `Too many digits: ${format} is ${expectedHex} hex digits` }
  }
  const padded = trimmed.padStart(expectedHex, '0')
  const bits = BigInt('0x' + padded).toString(2).padStart(layout.total, '0')
  return { ok: true, bits }
}

export function parseBinInput(input: string, format: FloatFormat): HexParseResult {
  const layout = LAYOUTS[format]
  const trimmed = input.trim().replace(/^0b/i, '').replace(/[\s_]/g, '')
  if (!trimmed) return { ok: false, error: 'Empty input' }
  if (!/^[01]+$/.test(trimmed)) return { ok: false, error: 'Binary digits only (0, 1)' }
  if (trimmed.length > layout.total) {
    return { ok: false, error: `Too many bits: ${format} is ${layout.total} bits` }
  }
  return { ok: true, bits: trimmed.padStart(layout.total, '0') }
}

// ─── special-values catalog (per format) ──────────────────────────────────

export type SpecialValue = { label: string; bits: string; note?: string }

export function getSpecialValues(format: FloatFormat): SpecialValue[] {
  const layout = LAYOUTS[format]
  const total = layout.total
  const out: SpecialValue[] = []
  const z = (s: string) => s.padStart(total, '0')
  // +0 / -0
  out.push({ label: '+0', bits: z('0'), note: 'positive zero' })
  out.push({ label: '−0', bits: '1' + z('').padStart(total - 1, '0'), note: 'signed zero' })
  // smallest positive subnormal
  out.push({ label: 'smallest sub', bits: '0'.repeat(total - 1) + '1', note: 'min positive subnormal' })
  // largest subnormal
  out.push({ label: 'max sub', bits: '0'.repeat(layout.exp + 1) + '1'.repeat(layout.mant), note: 'largest subnormal' })
  // smallest normal: exp = 1, mant = 0
  out.push({
    label: 'min normal',
    bits: '0' + '0'.repeat(layout.exp - 1) + '1' + '0'.repeat(layout.mant),
    note: 'smallest positive normal',
  })
  // ε (machine epsilon, the gap above 1.0): exp = bias - mantissa, mant = 0
  const epsExp = (layout.bias - layout.mant).toString(2).padStart(layout.exp, '0')
  out.push({
    label: 'ε',
    bits: '0' + epsExp + '0'.repeat(layout.mant),
    note: 'machine epsilon (gap above 1)',
  })
  // 1.0
  const oneExp = layout.bias.toString(2).padStart(layout.exp, '0')
  out.push({ label: '1', bits: '0' + oneExp + '0'.repeat(layout.mant), note: 'one' })
  // largest finite (max): exp = expMax-1, mant = all 1s
  const maxExp = (layout.expMax - 1).toString(2).padStart(layout.exp, '0')
  out.push({
    label: 'max',
    bits: '0' + maxExp + '1'.repeat(layout.mant),
    note: 'largest finite normal',
  })
  // ±Infinity
  out.push({ label: '+∞', bits: '0' + '1'.repeat(layout.exp) + '0'.repeat(layout.mant), note: 'positive infinity' })
  out.push({ label: '−∞', bits: '1' + '1'.repeat(layout.exp) + '0'.repeat(layout.mant), note: 'negative infinity' })
  // qNaN: exp all 1, mantissa MSB set
  out.push({
    label: 'NaN',
    bits: '0' + '1'.repeat(layout.exp) + '1' + '0'.repeat(layout.mant - 1),
    note: 'quiet NaN',
  })
  if (format === 'float64') {
    // MAX_SAFE_INTEGER = 2^53 - 1
    const v = encodeFloat(Number.MAX_SAFE_INTEGER, format)
    out.push({ label: 'MSI', bits: v.bits, note: 'MAX_SAFE_INTEGER (2⁵³−1)' })
  }
  return out
}

// ─── parsing decimal text input ───────────────────────────────────────────

export function parseDecimalInput(text: string): number | null {
  const t = text.trim()
  if (!t) return null
  if (t === 'inf' || t === '+inf' || t === 'Infinity') return Infinity
  if (t === '-inf' || t === '-Infinity') return -Infinity
  if (t === 'nan' || t === 'NaN') return NaN
  const n = Number(t)
  if (Number.isNaN(n) && t.toLowerCase() !== 'nan') return null
  return n
}

// ─── pretty-format a stored value back to a short, round-trippable decimal ──

export function formatStoredFloat(value: number, format: FloatFormat): string {
  if (Number.isNaN(value)) return 'NaN'
  if (value === Infinity) return 'Infinity'
  if (value === -Infinity) return '-Infinity'
  if (Object.is(value, -0)) return '-0'
  if (format === 'float64') return value.toString()
  // Shortest round-trip: pick the smallest precision whose number re-encodes
  // to the exact same bit pattern.
  const targetBits = encodeFloat(value, format).bits
  const maxP = format === 'float32' ? 9 : format === 'float16' ? 5 : 4
  for (let p = 1; p <= maxP; p++) {
    const candidate = Number(value.toPrecision(p))
    if (encodeFloat(candidate, format).bits === targetBits) return candidate.toString()
  }
  return Number(value.toPrecision(maxP)).toString()
}
