import { describe, expect, it } from 'vitest'
import { categories, tools } from '~/lib/tools/registry'
import { indexedEntries, searchEntries } from './search-index'

describe('indexedEntries', () => {
  it('includes every tool plus every category landing page', () => {
    expect(indexedEntries.length).toBe(tools.length + categories.length)
    const toolEntries = indexedEntries.filter((e) => e.kind === 'tool')
    const categoryEntries = indexedEntries.filter((e) => e.kind === 'category')
    expect(toolEntries.length).toBe(tools.length)
    expect(categoryEntries.length).toBe(categories.length)
  })

  it('injects unit aliases into unit-converter tools', () => {
    const data = indexedEntries.find((e) => e.kind === 'tool' && e.href === '/units/data')
    expect(data).toBeDefined()
    expect(data!.aliases).toContain('megabyte')
    expect(data!.aliases).toContain('gb')
    const mass = indexedEntries.find((e) => e.kind === 'tool' && e.href === '/units/mass')
    expect(mass!.aliases).toContain('pound')
    expect(mass!.aliases).toContain('kg')
  })

  it('does not inject aliases into non-unit tools', () => {
    const json = indexedEntries.find((e) => e.href === '/code/json')
    expect(json!.aliases).toEqual([])
  })
})

describe('searchEntries', () => {
  it("'json' returns the json formatter as top hit", () => {
    const r = searchEntries('json')
    expect(r[0]?.slug).toBe('json')
    expect(r[0]?.kind).toBe('tool')
  })

  it("'base' returns base-converter highly", () => {
    const r = searchEntries('base')
    const top3 = r.slice(0, 3).map((e) => e.slug)
    expect(top3).toContain('base-converter')
  })

  it("'uuid' returns uuid as top hit", () => {
    const r = searchEntries('uuid')
    expect(r[0]?.slug).toBe('uuid')
  })

  it("'regex' returns regex as top hit", () => {
    const r = searchEntries('regex')
    expect(r[0]?.slug).toBe('regex')
  })

  it("'megabyte' surfaces data converter via injected alias", () => {
    const r = searchEntries('megabyte')
    const top3 = r.slice(0, 3).map((e) => e.href)
    expect(top3).toContain('/units/data')
  })

  it("'units' surfaces the units category landing page", () => {
    const r = searchEntries('units')
    const top5 = r.slice(0, 5)
    const hasUnitsCategory = top5.some((e) => e.kind === 'category' && e.href === '/units')
    expect(hasUnitsCategory).toBe(true)
  })

  it("'hexa' prefix-matches hexadecimal keyword on base-converter", () => {
    const r = searchEntries('hexa')
    expect(r.slice(0, 3).map((e) => e.slug)).toContain('base-converter')
  })

  it('empty query returns full alphabetical list', () => {
    const r = searchEntries('')
    expect(r.length).toBe(indexedEntries.length)
    for (let i = 1; i < r.length; i++) {
      expect(r[i - 1].name.localeCompare(r[i].name)).toBeLessThanOrEqual(0)
    }
  })
})
