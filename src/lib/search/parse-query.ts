import { findUnitByAlias, type UnitAliasEntry } from './unit-aliases'

export type ParsedQuery =
  | { kind: 'unit'; entry: UnitAliasEntry; toEntry?: UnitAliasEntry; value?: string }
  | { kind: 'fuzzy' }

const SEPARATOR_RE = /^(.+?)\s+(?:to|->|→|in)\s+(.+)$/i
const NUMBER_PREFIX_RE = /^([\d][\d.,_]*)\s+/

export function parseQuery(input: string): ParsedQuery {
  const collapsed = input.trim().replace(/\s+/g, ' ')
  if (!collapsed) return { kind: 'fuzzy' }

  let working = collapsed
  let value: string | undefined
  const numMatch = NUMBER_PREFIX_RE.exec(working)
  if (numMatch) {
    value = numMatch[1]
    working = working.slice(numMatch[0].length)
  }

  const sepMatch = SEPARATOR_RE.exec(working)
  if (!sepMatch) return { kind: 'fuzzy' }

  const [, fromRaw, toRaw] = sepMatch
  const fromCandidates = findUnitByAlias(fromRaw)
  if (fromCandidates.length === 0) return { kind: 'fuzzy' }

  const toCandidates = findUnitByAlias(toRaw)
  if (toCandidates.length === 0) return { kind: 'fuzzy' }

  const toCategories = new Set(toCandidates.map((e) => e.category))
  const sharedFrom = fromCandidates.find((e) => toCategories.has(e.category))
  if (!sharedFrom) return { kind: 'fuzzy' }
  const sharedTo = toCandidates.find((e) => e.category === sharedFrom.category)!
  return { kind: 'unit', entry: sharedFrom, toEntry: sharedTo, value }
}
