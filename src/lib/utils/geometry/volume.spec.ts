import { describe, it, expect } from 'vitest'
import { convert } from '../units/converter'
import { volumeUnits } from './volume'

describe('volume conversions', () => {
  it('converts 1 L to 1000 mL', () => {
    expect(convert(1, volumeUnits.l.factor, volumeUnits.ml.factor)).toBeCloseTo(1000, 4)
  })

  it('converts 1 US gallon to liters', () => {
    expect(convert(1, volumeUnits.us_gal.factor, volumeUnits.l.factor)).toBeCloseTo(3.78541, 4)
  })

  it('converts 1 L to US gallons', () => {
    expect(convert(1, volumeUnits.l.factor, volumeUnits.us_gal.factor)).toBeCloseTo(0.26417, 4)
  })

  it('converts 1 cubic meter to liters', () => {
    expect(convert(1, volumeUnits.m3.factor, volumeUnits.l.factor)).toBeCloseTo(1000, 4)
  })

  it('converts 1 imperial gallon to liters', () => {
    expect(convert(1, volumeUnits.imp_gal.factor, volumeUnits.l.factor)).toBeCloseTo(4.54609, 4)
  })

  it('zero is zero', () => {
    expect(convert(0, volumeUnits.l.factor, volumeUnits.us_gal.factor)).toBe(0)
  })
})
