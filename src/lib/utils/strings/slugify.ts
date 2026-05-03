export type SlugifyOptions = {
  separator?: '-' | '_' | '.'
  lowercase?: boolean
  trim?: boolean
}

export function slugify(input: string, opts: SlugifyOptions = {}): string {
  const sep = opts.separator ?? '-'
  const lower = opts.lowercase ?? true

  let s = input
  // Normalize Unicode: é → e (NFD decomposition + strip combining marks)
  s = s.normalize('NFD').replace(/[̀-ͯ]/g, '')
  // Replace anything that's not alphanumeric with the separator
  s = s.replace(/[^a-zA-Z0-9]+/g, sep)
  // Collapse multiple separators
  s = s.replace(new RegExp(`\\${sep}+`, 'g'), sep)
  // Trim separators from start/end
  if (opts.trim !== false) {
    const escaped = sep === '.' ? '\\.' : sep
    s = s.replace(new RegExp(`^${escaped}+|${escaped}+$`, 'g'), '')
  }
  if (lower) s = s.toLowerCase()
  return s
}
