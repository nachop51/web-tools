import { describe, it, expect } from 'vitest'
import { generateScale } from './scale'

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

describe('generateScale', () => {
  it('returns 11 stops in canonical order', () => {
    const stops = generateScale('#3B82F6')
    expect(stops.map((s) => s.step)).toEqual(STEPS)
  })

  it('anchors mid-lightness inputs at step 500', () => {
    const stops = generateScale('#3B82F6')
    expect(stops.find((s) => s.step === 500)!.hex).toBe('#3B82F6')
  })

  it('anchors light inputs at the matching light step (not 500)', () => {
    // Light tan, L ~= 0.88 → step 200 (L target 0.882)
    const stops = generateScale('#F0D5A0')
    expect(stops.find((s) => s.step === 200)!.hex).toBe('#F0D5A0')
  })

  it('anchors dark inputs at the matching dark step (not 500)', () => {
    // Dark purple, L ~= 0.27 → step 900 (L target 0.26)
    const stops = generateScale('#2A1A4D')
    expect(stops.find((s) => s.step === 900)!.hex).toBe('#2A1A4D')
  })

  it('produces a monotonically decreasing lightness for light inputs', () => {
    const stops = generateScale('#F0D5A0')
    for (let i = 1; i < stops.length; i++) {
      expect(stops[i].oklch.l).toBeLessThanOrEqual(stops[i - 1].oklch.l)
    }
  })

  it('produces a monotonically decreasing lightness for dark inputs', () => {
    const stops = generateScale('#2A1A4D')
    for (let i = 1; i < stops.length; i++) {
      expect(stops[i].oklch.l).toBeLessThanOrEqual(stops[i - 1].oklch.l)
    }
  })

  it('produces a monotonically decreasing lightness for the user-reported case', () => {
    // #DB5E5E used to generate non-monotonic / off-hue stops.
    const stops = generateScale('#DB5E5E')
    for (let i = 1; i < stops.length; i++) {
      expect(stops[i].oklch.l).toBeLessThanOrEqual(stops[i - 1].oklch.l)
    }
    expect(stops.find((s) => s.step === 500)!.hex).toBe('#DB5E5E')
  })

  it('preserves hue across the scale (within gamut clamping tolerance)', () => {
    const stops = generateScale('#3B82F6')
    const baseH = stops.find((s) => s.step === 500)!.oklch.h
    // Endpoints can drift due to gamut clamping when chroma is squeezed near
    // black/white, but mid-range stops should be very close.
    for (const s of stops.filter((x) => x.step >= 200 && x.step <= 800)) {
      expect(Math.abs(s.oklch.h - baseH)).toBeLessThan(15)
    }
  })

  it('handles white (anchors at step 50)', () => {
    const stops = generateScale('#FFFFFF')
    expect(stops.find((s) => s.step === 50)!.hex).toBe('#FFFFFF')
  })

  it('handles black (anchors at step 950)', () => {
    const stops = generateScale('#000000')
    expect(stops.find((s) => s.step === 950)!.hex).toBe('#000000')
  })
})
