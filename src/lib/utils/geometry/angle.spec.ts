import { describe, it, expect } from 'vitest'
import { convert } from '../units/converter'
import { angleUnits } from './angle'

describe('angle conversions', () => {
  it('180 deg = π radians', () => {
    expect(convert(180, angleUnits.deg.factor, angleUnits.rad.factor)).toBeCloseTo(Math.PI, 5)
  })
  it('1 turn = 360 degrees', () => {
    expect(convert(1, angleUnits.turn.factor, angleUnits.deg.factor)).toBeCloseTo(360, 5)
  })
  it('90 deg = 100 grad', () => {
    expect(convert(90, angleUnits.deg.factor, angleUnits.grad.factor)).toBeCloseTo(100, 5)
  })
  it('1 deg = 60 arcminutes', () => {
    expect(convert(1, angleUnits.deg.factor, angleUnits.arcmin.factor)).toBeCloseTo(60, 5)
  })
  it('1 deg = 3600 arcseconds', () => {
    expect(convert(1, angleUnits.deg.factor, angleUnits.arcsec.factor)).toBeCloseTo(3600, 5)
  })
})
