import { describe, it, expect } from 'vitest'
import { convert } from './converter'
import { energyUnits } from './energy'

describe('energy conversions', () => {
  it('1 kJ = 1000 J', () => {
    expect(convert(1, energyUnits.kj.factor, energyUnits.j.factor)).toBeCloseTo(1000, 5)
  })
  it('1 kcal = 4184 J', () => {
    expect(convert(1, energyUnits.kcal.factor, energyUnits.j.factor)).toBeCloseTo(4184, 5)
  })
  it('1 kWh = 3600 kJ', () => {
    expect(convert(1, energyUnits.kwh.factor, energyUnits.kj.factor)).toBeCloseTo(3600, 5)
  })
  it('1 BTU ≈ 1055 J', () => {
    expect(convert(1, energyUnits.btu.factor, energyUnits.j.factor)).toBeCloseTo(1055.056, 2)
  })
  it('1 cal = 4.184 J', () => {
    expect(convert(1, energyUnits.cal.factor, energyUnits.j.factor)).toBeCloseTo(4.184, 5)
  })
})
