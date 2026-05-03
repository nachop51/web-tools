import MiniSearch, { type SearchResult } from 'minisearch'

import { categories, tools, type CategoryId } from '~/lib/tools/registry'
import { unitAliasIndex } from './unit-aliases'

export type IndexedEntry = {
  id: string
  kind: 'tool' | 'category'
  slug: string
  category: CategoryId | null
  categoryName: string
  name: string
  description: string
  href: string
  keywords: string[]
  aliases: string[]
}

const categoryNameById = new Map(categories.map((c) => [c.id, c.name]))

const aliasesByHref = (() => {
  const map = new Map<string, string[]>()
  for (const entry of unitAliasIndex) {
    const list = map.get(entry.routeHref) ?? []
    for (const alias of entry.aliases) {
      if (!list.includes(alias)) list.push(alias)
    }
    map.set(entry.routeHref, list)
  }
  return map
})()

function buildEntries(): IndexedEntry[] {
  const out: IndexedEntry[] = []
  for (const t of tools) {
    out.push({
      id: `tool:${t.category}:${t.slug}`,
      kind: 'tool',
      slug: t.slug,
      category: t.category,
      categoryName: categoryNameById.get(t.category) ?? t.category,
      name: t.name,
      description: t.description,
      href: t.href,
      keywords: t.keywords,
      aliases: aliasesByHref.get(t.href) ?? [],
    })
  }
  for (const c of categories) {
    out.push({
      id: `category:${c.id}`,
      kind: 'category',
      slug: c.id,
      category: c.id,
      categoryName: c.name,
      name: c.name,
      description: c.description,
      href: c.href,
      keywords: [c.id, c.name.toLowerCase()],
      aliases: [],
    })
  }
  return out
}

export const indexedEntries: IndexedEntry[] = buildEntries()

const entryById = new Map(indexedEntries.map((e) => [e.id, e]))

export const miniSearch = new MiniSearch<IndexedEntry>({
  idField: 'id',
  fields: ['name', 'keywords', 'aliases', 'description', 'categoryName'],
  storeFields: ['id', 'kind', 'slug', 'name', 'description', 'href', 'category', 'categoryName', 'keywords', 'aliases'],
  extractField: (doc, field) => {
    const value = (doc as unknown as Record<string, unknown>)[field]
    if (Array.isArray(value)) return value.join(' ')
    return value == null ? '' : String(value)
  },
  searchOptions: {
    boost: { name: 4, keywords: 3, aliases: 3, categoryName: 2, description: 1 },
    prefix: true,
    fuzzy: 0.2,
    combineWith: 'AND',
  },
})
miniSearch.addAll(indexedEntries)

const alphabetical: IndexedEntry[] = [...indexedEntries].sort((a, b) => a.name.localeCompare(b.name))

export function getEntryById(id: string): IndexedEntry | undefined {
  return entryById.get(id)
}

export function searchEntries(query: string): IndexedEntry[] {
  const trimmed = query.trim()
  if (!trimmed) return alphabetical

  const results: SearchResult[] = miniSearch.search(trimmed)
  const out: IndexedEntry[] = []
  for (const r of results) {
    const entry = entryById.get(String(r.id))
    if (entry) out.push(entry)
  }
  return out
}
