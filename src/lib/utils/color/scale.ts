import { converter, clampGamut, formatHex } from 'culori'
import type { OKLCH } from './convert'

const toOklch = converter('oklch')

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
const L_TARGETS: Record<number, number> = {
  50: 0.97,
  100: 0.932,
  200: 0.882,
  300: 0.809,
  400: 0.707,
  500: 0.623,
  600: 0.546,
  700: 0.45,
  800: 0.36,
  900: 0.26,
  950: 0.16,
}

function nearestStep(l: number): number {
  let best = STEPS[0]
  let bestDist = Infinity
  for (const step of STEPS) {
    const d = Math.abs(l - L_TARGETS[step])
    // Prefer 500 on ties so canonical midtones anchor there.
    if (d < bestDist || (d === bestDist && step === 500)) {
      best = step
      bestDist = d
    }
  }
  return best
}

export type ScaleStop = { step: number; hex: string; oklch: OKLCH }

export function generateScale(hex: string): ScaleStop[] {
  const base = toOklch(hex)!
  const baseL = base.l ?? 0.5
  const baseC = base.c ?? 0
  const baseH = base.h ?? 0

  const anchor = nearestStep(baseL)
  // Normalise the input chroma against the typical sin(L*pi) curve so we can
  // re-project it at every other step and recover baseC at the anchor.
  const baseCurve = Math.max(Math.sin(baseL * Math.PI), 0.05)
  const chromaFactor = baseC / baseCurve

  return STEPS.map((step) => {
    const isAnchor = step === anchor
    const targetL = isAnchor ? baseL : L_TARGETS[step]
    const targetC = isAnchor ? baseC : Math.max(0, chromaFactor * Math.sin(targetL * Math.PI))

    const oklchColor = { mode: 'oklch' as const, l: targetL, c: targetC, h: baseH }
    const clamped = clampGamut('rgb')(oklchColor)
    const hexOut = formatHex(clamped)!.toUpperCase()
    const final = toOklch(clamped)!

    return {
      step,
      hex: hexOut,
      oklch: {
        l: Math.round((final.l ?? 0) * 10000) / 10000,
        c: Math.round((final.c ?? 0) * 10000) / 10000,
        h: Math.round((final.h ?? 0) * 10) / 10,
      },
    }
  })
}
