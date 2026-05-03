import { parse, interpolate, samples, formatHex, clampGamut, converter } from 'culori'
import type { OKLCH } from './convert'

export type MixSpace = 'oklch' | 'hsl' | 'srgb'

const toOklch = converter('oklch')
const toRgb = converter('rgb')
const toHsl = converter('hsl')

export type MixResult = {
  hex: string
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
  oklch: OKLCH
}

function culoriMode(space: MixSpace) {
  return space === 'srgb' ? 'rgb' : space
}

export function mixColors(a: string, b: string, ratio: number, space: MixSpace): MixResult {
  const ca = parse(a)
  const cb = parse(b)
  if (!ca || !cb) throw new Error('Invalid color')

  const t = ratio / 100
  const mixed = interpolate([ca, cb] as never, culoriMode(space))(t)
  const clamped = clampGamut('rgb')(mixed)
  const rgb = toRgb(clamped)!
  const hsl = toHsl(clamped)!
  const oklch = toOklch(clamped)!

  return {
    hex: formatHex(clamped)!.toUpperCase(),
    rgb: {
      r: Math.round((rgb.r ?? 0) * 255),
      g: Math.round((rgb.g ?? 0) * 255),
      b: Math.round((rgb.b ?? 0) * 255),
    },
    hsl: {
      h: Math.round((hsl.h ?? 0) * 10) / 10,
      s: Math.round((hsl.s ?? 0) * 1000) / 10,
      l: Math.round((hsl.l ?? 0) * 1000) / 10,
    },
    oklch: {
      l: Math.round((oklch.l ?? 0) * 10000) / 10000,
      c: Math.round((oklch.c ?? 0) * 10000) / 10000,
      h: Math.round((oklch.h ?? 0) * 10) / 10,
    },
  }
}

export function getGradientStrip(a: string, b: string, space: MixSpace, count = 5): string[] {
  const ca = parse(a)
  const cb = parse(b)
  if (!ca || !cb) return []
  const fn = interpolate([ca, cb] as never, culoriMode(space))
  return samples(count).map((t) => formatHex(clampGamut('rgb')(fn(t)))!.toUpperCase())
}
