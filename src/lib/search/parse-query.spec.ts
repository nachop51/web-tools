import { describe, expect, it } from 'vitest'
import { parseQuery } from './parse-query'

describe('parseQuery', () => {
  it("'mb to gb' resolves to data MB→GB", () => {
    const r = parseQuery('mb to gb')
    expect(r.kind).toBe('unit')
    if (r.kind !== 'unit') return
    expect(r.entry.category).toBe('data')
    expect(r.entry.unitKey).toBe('MB')
    expect(r.toEntry?.unitKey).toBe('GB')
  })

  it("'megabyte to gigabyte' resolves to data MB→GB", () => {
    const r = parseQuery('megabyte to gigabyte')
    expect(r.kind).toBe('unit')
    if (r.kind !== 'unit') return
    expect(r.entry.unitKey).toBe('MB')
    expect(r.toEntry?.unitKey).toBe('GB')
  })

  it("'kg to lb' resolves to mass kg→lb", () => {
    const r = parseQuery('kg to lb')
    expect(r.kind).toBe('unit')
    if (r.kind !== 'unit') return
    expect(r.entry.category).toBe('mass')
    expect(r.entry.unitKey).toBe('kg')
    expect(r.toEntry?.unitKey).toBe('lb')
  })

  it("'c to f' resolves to temperature c→f", () => {
    const r = parseQuery('c to f')
    expect(r.kind).toBe('unit')
    if (r.kind !== 'unit') return
    expect(r.entry.category).toBe('temperature')
    expect(r.entry.unitKey).toBe('c')
    expect(r.toEntry?.unitKey).toBe('f')
  })

  it("'celsius to fahrenheit' resolves", () => {
    const r = parseQuery('celsius to fahrenheit')
    expect(r.kind).toBe('unit')
    if (r.kind !== 'unit') return
    expect(r.entry.unitKey).toBe('c')
    expect(r.toEntry?.unitKey).toBe('f')
  })

  it("'meter to mile' resolves to length m→mi", () => {
    const r = parseQuery('meter to mile')
    expect(r.kind).toBe('unit')
    if (r.kind !== 'unit') return
    expect(r.entry.category).toBe('length')
    expect(r.entry.unitKey).toBe('m')
    expect(r.toEntry?.unitKey).toBe('mi')
  })

  it("'min to h' resolves to time min→h", () => {
    const r = parseQuery('min to h')
    expect(r.kind).toBe('unit')
    if (r.kind !== 'unit') return
    expect(r.entry.category).toBe('time')
    expect(r.entry.unitKey).toBe('min')
    expect(r.toEntry?.unitKey).toBe('h')
  })

  it("'5 mb to gb' strips numeric prefix and stores value", () => {
    const r = parseQuery('5 mb to gb')
    expect(r.kind).toBe('unit')
    if (r.kind !== 'unit') return
    expect(r.entry.unitKey).toBe('MB')
    expect(r.toEntry?.unitKey).toBe('GB')
    expect(r.value).toBe('5')
  })

  it("'100 c to f' captures value 100", () => {
    const r = parseQuery('100 c to f')
    expect(r.kind).toBe('unit')
    if (r.kind !== 'unit') return
    expect(r.entry.unitKey).toBe('c')
    expect(r.value).toBe('100')
  })

  it("'1.5 kg to lb' captures decimal value", () => {
    const r = parseQuery('1.5 kg to lb')
    expect(r.kind).toBe('unit')
    if (r.kind !== 'unit') return
    expect(r.entry.unitKey).toBe('kg')
    expect(r.value).toBe('1.5')
  })

  it("supports '->' and '→' separators", () => {
    expect(parseQuery('mb -> gb').kind).toBe('unit')
    expect(parseQuery('mb → gb').kind).toBe('unit')
  })

  it("supports 'in' separator", () => {
    const r = parseQuery('feet in meters')
    expect(r.kind).toBe('unit')
    if (r.kind !== 'unit') return
    expect(r.entry.unitKey).toBe('ft')
    expect(r.toEntry?.unitKey).toBe('m')
  })

  it("'feet to dollars' falls through to fuzzy (no shared category)", () => {
    expect(parseQuery('feet to dollars').kind).toBe('fuzzy')
  })

  it("'json' falls through to fuzzy (no separator)", () => {
    expect(parseQuery('json').kind).toBe('fuzzy')
  })

  it("'mb' alone falls through to fuzzy", () => {
    expect(parseQuery('mb').kind).toBe('fuzzy')
  })

  it('empty input falls through to fuzzy', () => {
    expect(parseQuery('').kind).toBe('fuzzy')
    expect(parseQuery('   ').kind).toBe('fuzzy')
  })

  it('is case insensitive', () => {
    expect(parseQuery('MB TO GB').kind).toBe('unit')
    expect(parseQuery('Mb To Gb').kind).toBe('unit')
  })

  it("'10mb to gb' (no space) does NOT split, fuzzy fallback", () => {
    expect(parseQuery('10mb to gb').kind).toBe('fuzzy')
  })
})
