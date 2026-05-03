import { parse, wcagLuminance, wcagContrast } from 'culori'
import type { RGB } from './convert'

export type WcagLevel = 'AAA' | 'AA' | 'Fail'

export function relativeLuminance({ r, g, b }: RGB): number {
  return wcagLuminance(parse(`rgb(${r}, ${g}, ${b})`))!
}

export function contrastRatio(fg: RGB, bg: RGB): number {
  return wcagContrast(
    { mode: 'rgb', r: fg.r / 255, g: fg.g / 255, b: fg.b / 255 },
    { mode: 'rgb', r: bg.r / 255, g: bg.g / 255, b: bg.b / 255 }
  )
}

export function wcagLevel(ratio: number, textSize: 'normal' | 'large'): WcagLevel {
  if (textSize === 'large') {
    if (ratio >= 4.5) return 'AAA'
    if (ratio >= 3) return 'AA'
    return 'Fail'
  }
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  return 'Fail'
}
