import { describe, it, expect } from 'vitest'
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb, rgbToHsv, hsvToRgb, rgbToOklch, oklchToRgb } from './convert'

describe('hexToRgb', () => {
  it('parses #RRGGBB', () => {
    expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 })
  })
  it('parses without #', () => {
    expect(hexToRgb('00FF00')).toEqual({ r: 0, g: 255, b: 0 })
  })
  it('parses black', () => {
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 })
  })
  it('parses white', () => {
    expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 })
  })
})

describe('rgbToHex', () => {
  it('converts red', () => {
    expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe('#FF0000')
  })
  it('converts white', () => {
    expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe('#FFFFFF')
  })
  it('converts blue', () => {
    expect(rgbToHex({ r: 59, g: 130, b: 246 })).toBe('#3B82F6')
  })
})

describe('rgbToHsl / hslToRgb roundtrip', () => {
  it('red -> HSL', () => {
    const hsl = rgbToHsl({ r: 255, g: 0, b: 0 })
    expect(hsl.h).toBe(0)
    expect(hsl.s).toBe(100)
    expect(hsl.l).toBe(50)
  })
  it('white -> HSL (achromatic)', () => {
    const hsl = rgbToHsl({ r: 255, g: 255, b: 255 })
    expect(hsl.s).toBe(0)
    expect(hsl.l).toBe(100)
  })
  it('HSL roundtrip', () => {
    const original = { r: 59, g: 130, b: 246 }
    const hsl = rgbToHsl(original)
    const back = hslToRgb(hsl)
    expect(back.r).toBeCloseTo(original.r, -1)
    expect(back.g).toBeCloseTo(original.g, -1)
    expect(back.b).toBeCloseTo(original.b, -1)
  })
})

describe('rgbToHsv / hsvToRgb roundtrip', () => {
  it('red -> HSV', () => {
    const hsv = rgbToHsv({ r: 255, g: 0, b: 0 })
    expect(hsv.h).toBe(0)
    expect(hsv.s).toBe(100)
    expect(hsv.v).toBe(100)
  })
  it('HSV roundtrip', () => {
    const original = { r: 100, g: 200, b: 150 }
    const hsv = rgbToHsv(original)
    const back = hsvToRgb(hsv)
    expect(back.r).toBeCloseTo(original.r, -1)
    expect(back.g).toBeCloseTo(original.g, -1)
    expect(back.b).toBeCloseTo(original.b, -1)
  })
  it('black -> HSV', () => {
    const hsv = rgbToHsv({ r: 0, g: 0, b: 0 })
    expect(hsv.s).toBe(0)
    expect(hsv.v).toBe(0)
  })
})

describe('rgbToOklch / oklchToRgb roundtrip', () => {
  it('black -> OKLCH l~0', () => {
    const oklch = rgbToOklch({ r: 0, g: 0, b: 0 })
    expect(oklch.l).toBeCloseTo(0, 2)
    expect(oklch.c).toBeCloseTo(0, 2)
  })
  it('white -> OKLCH l~1', () => {
    const oklch = rgbToOklch({ r: 255, g: 255, b: 255 })
    expect(oklch.l).toBeCloseTo(1, 2)
    expect(oklch.c).toBeCloseTo(0, 2)
  })
  it('OKLCH roundtrip for blue', () => {
    const original = { r: 59, g: 130, b: 246 }
    const oklch = rgbToOklch(original)
    const back = oklchToRgb(oklch)
    expect(back.r).toBeCloseTo(original.r, -1)
    expect(back.g).toBeCloseTo(original.g, -1)
    expect(back.b).toBeCloseTo(original.b, -1)
  })
})
