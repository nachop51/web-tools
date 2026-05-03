export type JsonResult =
  | { ok: true; formatted: string; minified: string; size: { formatted: number; minified: number } }
  | { ok: false; error: string; line?: number; column?: number }

function parseErrorPosition(message: string, input: string): { line?: number; column?: number } {
  const m = message.match(/line (\d+) column (\d+)/i)
  if (m) return { line: parseInt(m[1], 10), column: parseInt(m[2], 10) }
  const pos = message.match(/position (\d+)/i)
  if (pos) {
    const offset = Math.min(parseInt(pos[1], 10), input.length)
    let line = 1
    let column = 1
    for (let i = 0; i < offset; i++) {
      if (input.charCodeAt(i) === 10) {
        line++
        column = 1
      } else {
        column++
      }
    }
    return { line, column }
  }
  return {}
}

export function processJson(input: string, indent: number): JsonResult {
  if (input.trim() === '') return { ok: false, error: 'Empty input' }
  try {
    const parsed = JSON.parse(input)
    const formatted = JSON.stringify(parsed, null, indent)
    const minified = JSON.stringify(parsed)
    return {
      ok: true,
      formatted,
      minified,
      size: { formatted: formatted.length, minified: minified.length },
    }
  } catch (e) {
    const message = e instanceof SyntaxError ? e.message : 'Invalid JSON'
    return { ok: false, error: message, ...parseErrorPosition(message, input) }
  }
}
