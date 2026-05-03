import { createSignal } from 'solid-js'
import { isServer } from 'solid-js/web'

import { getEntryById, type IndexedEntry } from './search-index'

const KEY = 'web-tools:recent-entries'
const MAX = 6

function readStorage(): string[] {
  if (isServer) return []
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((v): v is string => typeof v === 'string').slice(0, MAX)
  } catch {
    return []
  }
}

function writeStorage(ids: string[]): void {
  if (isServer) return
  try {
    localStorage.setItem(KEY, JSON.stringify(ids))
  } catch {
    /* ignore */
  }
}

const [recentIds, setRecentIds] = createSignal<string[]>(readStorage())

export function getRecentEntries(): IndexedEntry[] {
  const out: IndexedEntry[] = []
  for (const id of recentIds()) {
    const entry = getEntryById(id)
    if (entry) out.push(entry)
  }
  return out
}

export function pushRecent(id: string): void {
  const next = [id, ...recentIds().filter((x) => x !== id)].slice(0, MAX)
  setRecentIds(next)
  writeStorage(next)
}
