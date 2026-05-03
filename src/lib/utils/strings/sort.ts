export type SortOptions = {
  order: 'asc' | 'desc'
  mode: 'alpha' | 'numeric' | 'length'
  dedupe: boolean
  caseSensitive: boolean
}

export function sortLines(text: string, opts: SortOptions): string {
  if (!text) return ''

  let lines = text.split('\n')

  if (opts.dedupe) {
    const seen = new Set<string>()
    lines = lines.filter((line) => {
      const key = opts.caseSensitive ? line : line.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  lines.sort((a, b) => {
    let cmp = 0
    if (opts.mode === 'numeric') {
      const na = parseFloat(a)
      const nb = parseFloat(b)
      if (!isNaN(na) && !isNaN(nb)) {
        cmp = na - nb
      } else {
        const ca = opts.caseSensitive ? a : a.toLowerCase()
        const cb = opts.caseSensitive ? b : b.toLowerCase()
        cmp = ca.localeCompare(cb)
      }
    } else if (opts.mode === 'length') {
      cmp = a.length - b.length
    } else {
      const ca = opts.caseSensitive ? a : a.toLowerCase()
      const cb = opts.caseSensitive ? b : b.toLowerCase()
      cmp = ca.localeCompare(cb)
    }
    return opts.order === 'asc' ? cmp : -cmp
  })

  return lines.join('\n')
}
