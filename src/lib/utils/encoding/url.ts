export type URLMode = 'component' | 'full'

export function encodeURL(str: string, mode: URLMode): string {
  if (str === '') return ''
  return mode === 'component' ? encodeURIComponent(str) : encodeURI(str)
}

export function decodeURL(str: string, mode: URLMode): string {
  if (str === '') return ''
  // These can throw URIError on malformed %-sequences
  return mode === 'component' ? decodeURIComponent(str) : decodeURI(str)
}
