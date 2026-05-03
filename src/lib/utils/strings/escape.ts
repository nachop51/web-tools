export type EscapeMode = 'js' | 'json' | 'regex' | 'csv' | 'sql'

const LINE_SEP_RE = new RegExp('\u2028', 'g')
const PARA_SEP_RE = new RegExp('\u2029', 'g')
const LINE_SEP = '\u2028'
const PARA_SEP = '\u2029'

export function escapeString(s: string, mode: EscapeMode): string {
  switch (mode) {
    case 'js':
    case 'json':
      return s
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
        .replace(/\0/g, '\\0')
        .replace(LINE_SEP_RE, '\\u2028')
        .replace(PARA_SEP_RE, '\\u2029')
    case 'regex':
      return s.replace(/[.^+?*{}[\]|()\\]/g, '\\$&')
    case 'csv':
      if (/[",\n\r]/.test(s)) {
        return '"' + s.replace(/"/g, '""') + '"'
      }
      return s
    case 'sql':
      return s.replace(/'/g, "''")
  }
}

export function unescapeString(s: string, mode: EscapeMode): string {
  switch (mode) {
    case 'js':
    case 'json':
      return s
        .replace(/\\u2029/g, PARA_SEP)
        .replace(/\\u2028/g, LINE_SEP)
        .replace(/\\0/g, '\0')
        .replace(/\\t/g, '\t')
        .replace(/\\r/g, '\r')
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
    case 'regex':
      return s.replace(/\\([.^+?*{}[\]|()\\])/g, '$1')
    case 'csv':
      if (s.startsWith('"') && s.endsWith('"')) {
        return s.slice(1, -1).replace(/""/g, '"')
      }
      return s
    case 'sql':
      return s.replace(/''/g, "'")
  }
}
