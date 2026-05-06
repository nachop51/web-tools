import { describe, expect, it } from 'vitest'
import {
  encodeFloat,
  decodeBits,
  nextUp,
  nextDown,
  ulpDistance,
  ulpGap,
  exactDecimal,
  parseHexInput,
  parseBinInput,
  getSpecialValues,
  parseDecimalInput,
  formatStoredFloat,
  type FloatFormat,
} from './float-inspector'

describe('encodeFloat / decodeBits round-trip', () => {
  const samples: { value: number; formats: FloatFormat[] }[] = [
    { value: 0, formats: ['float16', 'bfloat16', 'float32', 'float64'] },
    { value: 1, formats: ['float16', 'bfloat16', 'float32', 'float64'] },
    { value: -1, formats: ['float16', 'bfloat16', 'float32', 'float64'] },
    { value: 2, formats: ['float16', 'bfloat16', 'float32', 'float64'] },
    { value: 0.5, formats: ['float16', 'bfloat16', 'float32', 'float64'] },
    { value: Infinity, formats: ['float16', 'bfloat16', 'float32', 'float64'] },
    { value: -Infinity, formats: ['float16', 'bfloat16', 'float32', 'float64'] },
  ]
  for (const { value, formats } of samples) {
    for (const f of formats) {
      it(`${f} round-trips ${value}`, () => {
        const fb = encodeFloat(value, f)
        expect(decodeBits(fb.bits, f)).toBe(value)
      })
    }
  }

  it('float64 preserves 0.1', () => {
    const fb = encodeFloat(0.1, 'float64')
    expect(decodeBits(fb.bits, 'float64')).toBe(0.1)
  })
})

describe('classification', () => {
  it('zero / nan / infinity / subnormal / normal', () => {
    expect(encodeFloat(0, 'float64').classification).toBe('zero')
    expect(encodeFloat(NaN, 'float64').classification).toBe('nan')
    expect(encodeFloat(Infinity, 'float64').classification).toBe('infinity')
    expect(encodeFloat(5e-324, 'float64').classification).toBe('subnormal')
    expect(encodeFloat(1, 'float64').classification).toBe('normal')
  })
})

describe('float16 specifics', () => {
  it('encodes 1.0 as 0x3c00', () => {
    const fb = encodeFloat(1, 'float16')
    expect(fb.hex).toBe('3c00')
  })
  it('encodes max finite as 0x7bff (65504)', () => {
    const fb = encodeFloat(65504, 'float16')
    expect(fb.hex).toBe('7bff')
    expect(fb.classification).toBe('normal')
  })
  it('overflows to +Infinity above max', () => {
    const fb = encodeFloat(70000, 'float16')
    expect(fb.classification).toBe('infinity')
    expect(fb.sign).toBe('0')
  })
  it('encodes smallest positive subnormal (2^-24)', () => {
    const fb = encodeFloat(Math.pow(2, -24), 'float16')
    expect(fb.classification).toBe('subnormal')
    expect(fb.bits).toBe('0'.repeat(15) + '1')
    expect(fb.hex).toBe('0001')
  })
  it('underflows below min subnormal', () => {
    const fb = encodeFloat(Math.pow(2, -30), 'float16')
    // Should round to 0
    expect(fb.classification).toBe('zero')
  })
})

describe('bfloat16 specifics', () => {
  it('encodes 1.0 as 0x3f80', () => {
    const fb = encodeFloat(1, 'bfloat16')
    expect(fb.hex).toBe('3f80')
  })
  it('preserves float32 exponent range (no overflow at large values)', () => {
    const fb = encodeFloat(1e30, 'bfloat16')
    expect(fb.classification).toBe('normal')
  })
  it('rounds canonical NaN', () => {
    const fb = encodeFloat(NaN, 'bfloat16')
    expect(fb.classification).toBe('nan')
  })
})

describe('nextUp / nextDown', () => {
  it('nextUp(+0) = smallest positive subnormal', () => {
    const z = encodeFloat(0, 'float64').bits
    const u = nextUp(z, 'float64')
    expect(decodeBits(u, 'float64')).toBe(Number.MIN_VALUE)
  })
  it('nextDown(+0) = smallest negative subnormal', () => {
    const z = encodeFloat(0, 'float64').bits
    const d = nextDown(z, 'float64')
    expect(decodeBits(d, 'float64')).toBe(-Number.MIN_VALUE)
  })
  it('nextUp(1) > 1', () => {
    const one = encodeFloat(1, 'float64').bits
    const u = nextUp(one, 'float64')
    const v = decodeBits(u, 'float64')!
    expect(v).toBeGreaterThan(1)
    expect(v - 1).toBe(Number.EPSILON)
  })
  it('nextUp(MAX_VALUE) = +Infinity', () => {
    const m = encodeFloat(Number.MAX_VALUE, 'float64').bits
    const u = nextUp(m, 'float64')
    expect(decodeBits(u, 'float64')).toBe(Infinity)
  })
  it('nextUp(+Infinity) stays +Infinity', () => {
    const inf = encodeFloat(Infinity, 'float64').bits
    expect(nextUp(inf, 'float64')).toBe(inf)
  })
  it('nextUp(NaN) stays NaN', () => {
    const nan = encodeFloat(NaN, 'float64').bits
    expect(nextUp(nan, 'float64')).toBe(nan)
  })
})

describe('ulpDistance', () => {
  it('between adjacent floats is 1', () => {
    const a = encodeFloat(1, 'float64').bits
    const b = nextUp(a, 'float64')
    expect(ulpDistance(a, b, 'float64')).toBe(1n)
  })
  it('is signed', () => {
    const a = encodeFloat(1, 'float64').bits
    const b = nextUp(a, 'float64')
    expect(ulpDistance(b, a, 'float64')).toBe(-1n)
  })
  it('crosses zero correctly', () => {
    const pos = encodeFloat(Number.MIN_VALUE, 'float64').bits
    const neg = encodeFloat(-Number.MIN_VALUE, 'float64').bits
    expect(ulpDistance(neg, pos, 'float64')).toBe(2n)
  })
})

describe('exactDecimal', () => {
  it('1.0 → "1"', () => {
    expect(exactDecimal(encodeFloat(1, 'float64').bits, 'float64')).toBe('1')
  })
  it('-0 → "-0"', () => {
    expect(exactDecimal(encodeFloat(-0, 'float64').bits, 'float64')).toBe('-0')
  })
  it('Infinity → "Infinity"', () => {
    expect(exactDecimal(encodeFloat(Infinity, 'float64').bits, 'float64')).toBe('Infinity')
  })
  it('NaN → "NaN"', () => {
    expect(exactDecimal(encodeFloat(NaN, 'float64').bits, 'float64')).toBe('NaN')
  })
  it('0.1 expands to 55 decimal places', () => {
    const s = exactDecimal(encodeFloat(0.1, 'float64').bits, 'float64')
    expect(s).toBe('0.1000000000000000055511151231257827021181583404541015625')
  })
  it('0.5 → "0.5" (terminates)', () => {
    expect(exactDecimal(encodeFloat(0.5, 'float64').bits, 'float64')).toBe('0.5')
  })
})

describe('ulpGap', () => {
  it('gap above 1.0 in float64 = 2^-52', () => {
    const bits = encodeFloat(1, 'float64').bits
    const gap = ulpGap(bits, 'float64')
    expect(Number(gap)).toBeCloseTo(Math.pow(2, -52))
  })
  it('returns null for NaN', () => {
    expect(ulpGap(encodeFloat(NaN, 'float64').bits, 'float64')).toBeNull()
  })
  it('returns null for +Infinity', () => {
    expect(ulpGap(encodeFloat(Infinity, 'float64').bits, 'float64')).toBeNull()
  })
})

describe('parseHexInput', () => {
  it('parses 0x40490fdb as float32 π-ish', () => {
    const r = parseHexInput('0x40490fdb', 'float32')
    if (!r.ok) throw new Error(r.error)
    expect(decodeBits(r.bits, 'float32')).toBeCloseTo(Math.PI, 6)
  })
  it('pads short hex', () => {
    const r = parseHexInput('1', 'float16')
    if (!r.ok) throw new Error(r.error)
    expect(r.bits).toBe('0000000000000001')
  })
  it('rejects non-hex', () => {
    const r = parseHexInput('xyz', 'float32')
    expect(r.ok).toBe(false)
  })
  it('rejects too-long input', () => {
    const r = parseHexInput('ffffffffff', 'float32')
    expect(r.ok).toBe(false)
  })
})

describe('parseBinInput', () => {
  it('pads short binary', () => {
    const r = parseBinInput('1', 'float16')
    if (!r.ok) throw new Error(r.error)
    expect(r.bits).toBe('0'.repeat(15) + '1')
  })
  it('rejects non-01', () => {
    expect(parseBinInput('012', 'float16').ok).toBe(false)
  })
})

describe('getSpecialValues', () => {
  it('lists +0 / -0 / max / min / Inf / NaN', () => {
    const sv = getSpecialValues('float32').map((s) => s.label)
    expect(sv).toContain('+0')
    expect(sv).toContain('−0')
    expect(sv).toContain('max')
    expect(sv).toContain('+∞')
    expect(sv).toContain('NaN')
  })
  it('only float64 includes MAX_SAFE_INTEGER', () => {
    expect(getSpecialValues('float64').some((s) => s.label === 'MSI')).toBe(true)
    expect(getSpecialValues('float32').some((s) => s.label === 'MSI')).toBe(false)
  })
})

describe('parseDecimalInput', () => {
  it('parses Infinity tokens', () => {
    expect(parseDecimalInput('Infinity')).toBe(Infinity)
    expect(parseDecimalInput('-Infinity')).toBe(-Infinity)
    expect(parseDecimalInput('NaN')).toBeNaN()
  })
  it('rejects garbage', () => {
    expect(parseDecimalInput('abc')).toBeNull()
  })
})

describe('formatStoredFloat', () => {
  it('preserves -0', () => {
    expect(formatStoredFloat(-0, 'float64')).toBe('-0')
  })
  it('shortens float32 to 9 sig digits', () => {
    expect(formatStoredFloat(0.10000000149011612, 'float32')).toBe('0.1')
  })
})
