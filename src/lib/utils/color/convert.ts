import { parse, formatHex, converter, clampGamut } from 'culori'

const toRgb = converter('rgb')
const toHsl = converter('hsl')
const toHsv = converter('hsv')
const toOklch = converter('oklch')

export type RGB = { r: number; g: number; b: number }
export type HSL = { h: number; s: number; l: number }
export type HSV = { h: number; s: number; v: number }
export type OKLCH = { l: number; c: number; h: number }
export type CMYK = { c: number; m: number; y: number; k: number }

export function hexToRgb(hex: string): RGB {
  const c = toRgb(parse(hex))!
  return {
    r: Math.round((c.r ?? 0) * 255),
    g: Math.round((c.g ?? 0) * 255),
    b: Math.round((c.b ?? 0) * 255),
  }
}

export function rgbToHex({ r, g, b }: RGB): string {
  return formatHex({ mode: 'rgb', r: r / 255, g: g / 255, b: b / 255 })!.toUpperCase()
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const c = toHsl({ mode: 'rgb', r: r / 255, g: g / 255, b: b / 255 })!
  return {
    h: Math.round((c.h ?? 0) * 10) / 10,
    s: Math.round((c.s ?? 0) * 1000) / 10,
    l: Math.round((c.l ?? 0) * 1000) / 10,
  }
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const c = toRgb({ mode: 'hsl', h, s: s / 100, l: l / 100 })!
  return {
    r: Math.round((c.r ?? 0) * 255),
    g: Math.round((c.g ?? 0) * 255),
    b: Math.round((c.b ?? 0) * 255),
  }
}

export function rgbToHsv({ r, g, b }: RGB): HSV {
  const c = toHsv({ mode: 'rgb', r: r / 255, g: g / 255, b: b / 255 })!
  return {
    h: Math.round((c.h ?? 0) * 10) / 10,
    s: Math.round((c.s ?? 0) * 1000) / 10,
    v: Math.round((c.v ?? 0) * 1000) / 10,
  }
}

export function hsvToRgb({ h, s, v }: HSV): RGB {
  const c = toRgb({ mode: 'hsv', h, s: s / 100, v: v / 100 })!
  return {
    r: Math.round((c.r ?? 0) * 255),
    g: Math.round((c.g ?? 0) * 255),
    b: Math.round((c.b ?? 0) * 255),
  }
}

export function rgbToOklch({ r, g, b }: RGB): OKLCH {
  const c = toOklch({ mode: 'rgb', r: r / 255, g: g / 255, b: b / 255 })!
  return {
    l: Math.round((c.l ?? 0) * 10000) / 10000,
    c: Math.round((c.c ?? 0) * 10000) / 10000,
    h: Math.round((c.h ?? 0) * 10) / 10,
  }
}

export function oklchToRgb({ l, c, h }: OKLCH): RGB {
  const rgb = toRgb(clampGamut('rgb')({ mode: 'oklch', l, c, h }))!
  return {
    r: Math.round((rgb.r ?? 0) * 255),
    g: Math.round((rgb.g ?? 0) * 255),
    b: Math.round((rgb.b ?? 0) * 255),
  }
}

// Naive (device-independent) RGB <-> CMYK. Approximation only; real print
// output requires an ICC profile so a roundtrip won't be exact for a printer.
export function rgbToCmyk({ r, g, b }: RGB): CMYK {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const k = 1 - Math.max(rn, gn, bn)
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 }
  const c = (1 - rn - k) / (1 - k)
  const m = (1 - gn - k) / (1 - k)
  const y = (1 - bn - k) / (1 - k)
  return {
    c: Math.round(c * 1000) / 10,
    m: Math.round(m * 1000) / 10,
    y: Math.round(y * 1000) / 10,
    k: Math.round(k * 1000) / 10,
  }
}

export function cmykToRgb({ c, m, y, k }: CMYK): RGB {
  const cn = c / 100
  const mn = m / 100
  const yn = y / 100
  const kn = k / 100
  return {
    r: Math.round(255 * (1 - cn) * (1 - kn)),
    g: Math.round(255 * (1 - mn) * (1 - kn)),
    b: Math.round(255 * (1 - yn) * (1 - kn)),
  }
}
