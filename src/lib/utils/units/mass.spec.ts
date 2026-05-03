import { describe, expect, it } from 'vitest'
import { convert } from './converter'
import { massUnits } from './mass'

describe('mass conversions', () => {
  it('converts 1 kg to 1000 g', () => {
    const result = convert(1, massUnits.kg.factor, massUnits.g.factor)
    expect(result).toBe(1000)
  })

  it('converts 1 lb to approximately 453.59 g', () => {
    const result = convert(1, massUnits.lb.factor, massUnits.g.factor)
    expect(result).toBeCloseTo(453.59237, 4)
  })

  it('converts 1 metric ton to 1_000_000 g', () => {
    const result = convert(1, massUnits.t.factor, massUnits.g.factor)
    expect(result).toBe(1_000_000)
  })

  it('converts 0 input to 0', () => {
    const result = convert(0, massUnits.kg.factor, massUnits.g.factor)
    expect(result).toBe(0)
  })

  it('round-trips 1 kg → g → kg = 1', () => {
    const grams = convert(1, massUnits.kg.factor, massUnits.g.factor)
    const backToKg = convert(grams, massUnits.g.factor, massUnits.kg.factor)
    expect(backToKg).toBeCloseTo(1, 10)
  })
})
