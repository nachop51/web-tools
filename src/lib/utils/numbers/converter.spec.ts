import { describe, expect, it } from 'vitest'
import {
  bitsToFloat,
  convertToBase,
  detectPrefix,
  fitsInWidth,
  floatToBits,
  formatInBase,
  groupDigits,
  parseInBase,
  stripBaseSpecificPrefix,
  toSignedAtWidth,
  toUnsignedAtWidth,
} from './converter'

describe('parseInBase', () => {
  it('parses decimal integers', () => {
    expect(parseInBase('255', 10)).toEqual({ ok: true, value: 255n })
    expect(parseInBase('0', 10)).toEqual({ ok: true, value: 0n })
  })

  it('parses negatives', () => {
    expect(parseInBase('-101', 2)).toEqual({ ok: true, value: -5n })
    expect(parseInBase('+42', 10)).toEqual({ ok: true, value: 42n })
  })

  it('accepts upper- and lowercase hex', () => {
    expect(parseInBase('FF', 16)).toEqual({ ok: true, value: 255n })
    expect(parseInBase('ff', 16)).toEqual({ ok: true, value: 255n })
    expect(parseInBase('DeAdBeEf', 16)).toEqual({ ok: true, value: 0xdeadbeefn })
  })

  it('strips whitespace, underscores, commas as separators', () => {
    expect(parseInBase('1 000_000', 10)).toEqual({ ok: true, value: 1_000_000n })
    expect(parseInBase('1111 0000', 2)).toEqual({ ok: true, value: 0xf0n })
    expect(parseInBase('1,234,567', 10)).toEqual({ ok: true, value: 1234567n })
  })

  it('rejects empty input', () => {
    expect(parseInBase('', 10)).toMatchObject({ ok: false })
    expect(parseInBase('   ', 10)).toMatchObject({ ok: false })
  })

  it('rejects out-of-range characters with a friendly error', () => {
    const r = parseInBase('102', 2)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toMatch(/"2" is not valid for base 2/)
  })

  it('handles values past 2^53 without precision loss', () => {
    expect(parseInBase('ffffffffffffffff', 16)).toEqual({
      ok: true,
      value: 0xffffffffffffffffn,
    })
    expect(parseInBase('99999999999999999999', 10)).toEqual({
      ok: true,
      value: 99999999999999999999n,
    })
  })

  it('rejects bases outside 2–36', () => {
    expect(parseInBase('1', 1)).toMatchObject({ ok: false })
    expect(parseInBase('1', 37)).toMatchObject({ ok: false })
  })
})

describe('formatInBase', () => {
  it('formats integers in any base 2–36', () => {
    expect(formatInBase(255n, 2)).toBe('11111111')
    expect(formatInBase(255n, 16)).toBe('ff')
    expect(formatInBase(255n, 16, { uppercase: true })).toBe('FF')
    expect(formatInBase(35n, 36)).toBe('z')
  })

  it('preserves the sign for negatives in auto mode', () => {
    expect(formatInBase(-5n, 2)).toBe('-101')
    expect(formatInBase(-255n, 16)).toBe('-ff')
  })

  it('handles 0', () => {
    expect(formatInBase(0n, 2)).toBe('0')
    expect(formatInBase(0n, 16)).toBe('0')
  })
})

describe('detectPrefix', () => {
  it('detects 0x / 0b / 0o prefixes', () => {
    expect(detectPrefix('0xff')).toEqual({ base: 16, body: 'ff' })
    expect(detectPrefix('0b1010')).toEqual({ base: 2, body: '1010' })
    expect(detectPrefix('0o755')).toEqual({ base: 8, body: '755' })
  })

  it('preserves sign across the prefix', () => {
    expect(detectPrefix('-0xff')).toEqual({ base: 16, body: '-ff' })
  })

  it('returns null for un-prefixed input', () => {
    expect(detectPrefix('123')).toBeNull()
    expect(detectPrefix('abc')).toBeNull()
  })
})

describe('stripBaseSpecificPrefix', () => {
  it('strips a matching prefix only', () => {
    expect(stripBaseSpecificPrefix('0xff', 16)).toBe('ff')
    expect(stripBaseSpecificPrefix('0b1010', 2)).toBe('1010')
    expect(stripBaseSpecificPrefix('0o755', 8)).toBe('755')
  })

  it('leaves a mismatched prefix in place (parser will reject)', () => {
    expect(stripBaseSpecificPrefix('0xff', 10)).toBe('0xff')
  })
})

describe("two's complement at width", () => {
  it('toUnsignedAtWidth wraps negatives', () => {
    expect(toUnsignedAtWidth(-1n, 8)).toBe(255n)
    expect(toUnsignedAtWidth(-1n, 16)).toBe(65535n)
    expect(toUnsignedAtWidth(-1n, 32)).toBe(0xffffffffn)
    expect(toUnsignedAtWidth(-1n, 64)).toBe(0xffffffffffffffffn)
    expect(toUnsignedAtWidth(-128n, 8)).toBe(128n)
  })

  it('toUnsignedAtWidth masks oversized positives', () => {
    expect(toUnsignedAtWidth(256n, 8)).toBe(0n)
    expect(toUnsignedAtWidth(257n, 8)).toBe(1n)
  })

  it('toSignedAtWidth round-trips with toUnsignedAtWidth', () => {
    for (const v of [-128n, -1n, 0n, 1n, 127n]) {
      expect(toSignedAtWidth(toUnsignedAtWidth(v, 8), 8)).toBe(v)
    }
  })
})

describe('fitsInWidth', () => {
  it('accepts signed and unsigned ranges', () => {
    expect(fitsInWidth(-128n, 8)).toBe(true)
    expect(fitsInWidth(255n, 8)).toBe(true)
    expect(fitsInWidth(0n, 8)).toBe(true)
  })

  it('rejects values outside both ranges', () => {
    expect(fitsInWidth(-129n, 8)).toBe(false)
    expect(fitsInWidth(256n, 8)).toBe(false)
  })
})

describe('convertToBase', () => {
  it('mirrors decimal regardless of bit width', () => {
    expect(convertToBase(-1n, 10, { bitWidth: 8 })).toBe('-1')
    expect(convertToBase(255n, 10, { bitWidth: 8 })).toBe('255')
  })

  it('shows two\'s complement at fixed width for non-decimal bases', () => {
    expect(convertToBase(-1n, 2, { bitWidth: 8 })).toBe('11111111')
    expect(convertToBase(-1n, 16, { bitWidth: 32 })).toBe('ffffffff')
    expect(convertToBase(-1n, 16, { bitWidth: 32, uppercase: true })).toBe('FFFFFFFF')
  })

  it('pads to width / log2(base) digits when bitWidth is fixed', () => {
    expect(convertToBase(1n, 2, { bitWidth: 8 })).toBe('00000001')
    expect(convertToBase(1n, 16, { bitWidth: 32 })).toBe('00000001')
    // Octal at 8 bits: ceil(8 / log2(8)) = 3 digits.
    expect(convertToBase(0n, 8, { bitWidth: 8 })).toBe('000')
  })

  it('keeps minus prefix in auto mode', () => {
    expect(convertToBase(-5n, 2)).toBe('-101')
    expect(convertToBase(-255n, 16)).toBe('-ff')
  })
})

describe('groupDigits', () => {
  it('groups from the right', () => {
    expect(groupDigits('11111111', 4)).toBe('1111 1111')
    expect(groupDigits('111111111', 4)).toBe('1 1111 1111')
    expect(groupDigits('deadbeef', 4)).toBe('dead beef')
    expect(groupDigits('1234567', 3)).toBe('1 234 567')
  })

  it('passes through short strings unchanged', () => {
    expect(groupDigits('1', 4)).toBe('1')
    expect(groupDigits('1010', 4)).toBe('1010')
  })

  it('preserves a leading minus', () => {
    expect(groupDigits('-11111111', 4)).toBe('-1111 1111')
  })

  it('handles empty input', () => {
    expect(groupDigits('', 4)).toBe('')
  })
})

describe('floatToBits', () => {
  it('encodes 1.0 in single precision', () => {
    const r = floatToBits(1, 32)
    expect(r.bits).toBe('00111111100000000000000000000000')
    expect(r.sign).toBe('0')
    expect(r.exponent).toBe('01111111')
    expect(r.mantissa).toBe('00000000000000000000000')
    expect(r.hex).toBe('3f800000')
    expect(r.classification).toBe('normal')
    expect(r.stored).toBe(1)
  })

  it('encodes 1.0 in double precision', () => {
    const r = floatToBits(1, 64)
    expect(r.bits).toBe(
      '0011111111110000000000000000000000000000000000000000000000000000'
    )
    expect(r.hex).toBe('3ff0000000000000')
    expect(r.classification).toBe('normal')
  })

  it('classifies special values', () => {
    expect(floatToBits(0, 32).classification).toBe('zero')
    expect(floatToBits(NaN, 32).classification).toBe('nan')
    expect(floatToBits(Infinity, 32).classification).toBe('infinity')
    expect(floatToBits(-Infinity, 64).classification).toBe('infinity')
  })

  it('marks subnormals correctly', () => {
    // Smallest positive subnormal in double precision.
    expect(floatToBits(5e-324, 64).classification).toBe('subnormal')
  })

  it('reflects float32 precision loss in `stored`', () => {
    // 0.1 is not representable exactly; the float32 form is rougher than f64.
    const r = floatToBits(0.1, 32)
    expect(r.stored).not.toBe(0.1)
  })
})

describe('bitsToFloat', () => {
  it('round-trips through floatToBits', () => {
    for (const v of [1, -1, 0.5, 3.14159, 1e10, -2.5e-3]) {
      const fb = floatToBits(v, 64)
      expect(bitsToFloat(fb.bits, 64)).toBe(v)
    }
  })

  it('tolerates spacing in the bit string', () => {
    const fb = floatToBits(1, 32)
    const spaced = fb.bits.replace(/(.{4})/g, '$1 ').trim()
    expect(bitsToFloat(spaced, 32)).toBe(1)
  })

  it('returns null for wrong-length input', () => {
    expect(bitsToFloat('1010', 32)).toBeNull()
    expect(bitsToFloat('', 64)).toBeNull()
  })
})
