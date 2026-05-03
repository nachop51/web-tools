import { diffLines, type Change } from 'diff'

export interface DiffLine {
  value: string
  type: 'added' | 'removed' | 'unchanged'
}

export interface DiffStats {
  added: number
  removed: number
  unchanged: number
}

function normalize(text: string): string {
  return text.replace(/\r\n/g, '\n')
}

export function computeDiff(original: string, modified: string): { lines: DiffLine[]; stats: DiffStats } {
  const changes: Change[] = diffLines(normalize(original), normalize(modified))
  const lines: DiffLine[] = []
  const stats: DiffStats = { added: 0, removed: 0, unchanged: 0 }

  for (const change of changes) {
    const raw = change.value.endsWith('\n') ? change.value.slice(0, -1) : change.value
    const parts = raw.split('\n')
    for (const part of parts) {
      const type = change.added ? 'added' : change.removed ? 'removed' : 'unchanged'
      lines.push({ value: part, type })
      stats[type]++
    }
  }

  return { lines, stats }
}
