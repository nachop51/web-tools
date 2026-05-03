import { describe, expect, it } from 'vitest'
import { dataUnits } from '~/lib/utils/units/data'
import { lengthUnits } from '~/lib/utils/units/length'
import { massUnits } from '~/lib/utils/units/mass'
import { tempUnitDefs } from '~/lib/utils/units/temperature'
import { timeUnits } from '~/lib/utils/units/time'
import { volumeUnits } from '~/lib/utils/units/volume'
import { speedUnits } from '~/lib/utils/units/speed'
import { areaUnits } from '~/lib/utils/units/area'
import { angleUnits } from '~/lib/utils/units/angle'
import { pressureUnits } from '~/lib/utils/units/pressure'
import { energyUnits } from '~/lib/utils/units/energy'
import { powerUnits } from '~/lib/utils/units/power'
import { findUnitByAlias, unitAliasIndex, type UnitCategory } from './unit-aliases'

const allKeyedUnits: { category: UnitCategory; record: Record<string, unknown> }[] = [
  { category: 'data', record: dataUnits },
  { category: 'length', record: lengthUnits },
  { category: 'mass', record: massUnits },
  { category: 'temperature', record: tempUnitDefs },
  { category: 'time', record: timeUnits },
  { category: 'volume', record: volumeUnits },
  { category: 'speed', record: speedUnits },
  { category: 'area', record: areaUnits },
  { category: 'angle', record: angleUnits },
  { category: 'pressure', record: pressureUnits },
  { category: 'energy', record: energyUnits },
  { category: 'power-unit', record: powerUnits },
]

describe('unitAliasIndex coverage', () => {
  for (const { category, record } of allKeyedUnits) {
    for (const key of Object.keys(record)) {
      it(`${category}.${key} has at least one alias`, () => {
        const entry = unitAliasIndex.find((e) => e.category === category && e.unitKey === key)
        expect(entry, `missing entry for ${category}.${key}`).toBeDefined()
        expect(entry!.aliases.length).toBeGreaterThan(0)
      })
    }
  }
})

describe('findUnitByAlias', () => {
  it('resolves short symbols', () => {
    expect(findUnitByAlias('MB').map((e) => e.unitKey)).toContain('MB')
    expect(findUnitByAlias('kg').map((e) => e.unitKey)).toContain('kg')
    expect(findUnitByAlias('ft').map((e) => e.unitKey)).toContain('ft')
  })

  it('resolves long names', () => {
    expect(findUnitByAlias('megabyte').map((e) => e.unitKey)).toContain('MB')
    expect(findUnitByAlias('megabytes').map((e) => e.unitKey)).toContain('MB')
    expect(findUnitByAlias('celsius').map((e) => e.unitKey)).toContain('c')
    expect(findUnitByAlias('pounds').map((e) => e.unitKey)).toContain('lb')
  })

  it('is case-insensitive', () => {
    expect(findUnitByAlias('mb').map((e) => e.unitKey)).toContain('MB')
    expect(findUnitByAlias('KG').map((e) => e.unitKey)).toContain('kg')
    expect(findUnitByAlias('Celsius').map((e) => e.unitKey)).toContain('c')
  })

  it('returns empty for unknown aliases', () => {
    expect(findUnitByAlias('dollars')).toEqual([])
    expect(findUnitByAlias('')).toEqual([])
  })

  it("'gal' resolves to us_gal preferentially (US default)", () => {
    const gal = findUnitByAlias('gal')
    expect(gal.length).toBeGreaterThan(0)
    expect(gal[0].unitKey).toBe('us_gal')
  })

  it("'imperial gallon' resolves to imp_gal", () => {
    const imp = findUnitByAlias('imperial gallon')
    expect(imp.map((e) => e.unitKey)).toContain('imp_gal')
  })

  it('preserves canonical case for unitKey (URL-safe)', () => {
    const mb = findUnitByAlias('megabyte').find((e) => e.unitKey === 'MB')
    expect(mb!.unitKey).toBe('MB')
    const kib = findUnitByAlias('kibibyte').find((e) => e.unitKey === 'KiB')
    expect(kib!.unitKey).toBe('KiB')
  })
})
