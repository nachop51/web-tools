import { describe, it, expect } from 'vitest'
import { buildAsciiTable } from './ascii'

describe('buildAsciiTable', () => {
  const table = buildAsciiTable()

  it('has 256 entries', () => {
    expect(table).toHaveLength(256)
  })

  it('NUL entry is correct', () => {
    const nul = table[0]
    expect(nul.dec).toBe(0)
    expect(nul.hex).toBe('00')
    expect(nul.oct).toBe('000')
    expect(nul.bin).toBe('00000000')
    expect(nul.char).toBe('NUL')
    expect(nul.description).toBe('Null')
  })

  it('Space entry is correct', () => {
    const space = table[32]
    expect(space.dec).toBe(32)
    expect(space.description).toBe('Space')
  })

  it("printable char 'A' is correct", () => {
    const a = table[65]
    expect(a.dec).toBe(65)
    expect(a.char).toBe('A')
    expect(a.hex).toBe('41')
    expect(a.oct).toBe('101')
    expect(a.bin).toBe('01000001')
  })

  it('named HTML entity for ampersand', () => {
    expect(table[38].htmlEntity).toBe('&amp;')
  })

  it('named HTML entity for less-than', () => {
    expect(table[60].htmlEntity).toBe('&lt;')
  })

  it('DEL entry', () => {
    expect(table[127].char).toBe('DEL')
    expect(table[127].description).toBe('Delete')
  })

  it('C1 control NEL (133)', () => {
    const nel = table[133]
    expect(nel.char).toBe('NEL')
    expect(nel.description).toBe('Next Line')
  })

  it('non-breaking space (160)', () => {
    const nbsp = table[160]
    expect(nbsp.dec).toBe(160)
    expect(nbsp.htmlEntity).toBe('&nbsp;')
    expect(nbsp.description).toBe('Non-breaking Space')
  })

  it('copyright sign (169)', () => {
    const copy = table[169]
    expect(copy.htmlEntity).toBe('&copy;')
    expect(copy.char).toBe('©')
  })

  it('Latin small letter y with diaeresis (255)', () => {
    const yuml = table[255]
    expect(yuml.dec).toBe(255)
    expect(yuml.htmlEntity).toBe('&yuml;')
    expect(yuml.char).toBe('ÿ')
    expect(yuml.hex).toBe('FF')
    expect(yuml.bin).toBe('11111111')
  })
})
