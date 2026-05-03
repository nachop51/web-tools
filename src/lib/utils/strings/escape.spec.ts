import { describe, expect, it } from 'vitest'
import { escapeString, unescapeString } from './escape'

describe('escapeString / unescapeString - js', () => {
  it('escapes newlines and tabs', () => {
    expect(escapeString('line1\nline2\ttab', 'js')).toBe('line1\\nline2\\ttab')
  })

  it('escapes backslashes and quotes', () => {
    expect(escapeString('say "hello"', 'js')).toBe('say \\"hello\\"')
    expect(escapeString('a\\b', 'js')).toBe('a\\\\b')
  })

  it('roundtrips correctly', () => {
    const original = 'hello\nworld\t"quoted"\\path'
    expect(unescapeString(escapeString(original, 'js'), 'js')).toBe(original)
  })
})

describe('escapeString / unescapeString - regex', () => {
  it('escapes regex special chars', () => {
    expect(escapeString('a.b*c+d?', 'regex')).toBe('a\\.b\\*c\\+d\\?')
  })

  it('unescapes regex chars', () => {
    expect(unescapeString('a\\.b\\*', 'regex')).toBe('a.b*')
  })

  it('roundtrips', () => {
    const original = '^start (middle) end$'
    expect(unescapeString(escapeString(original, 'regex'), 'regex')).toBe(original)
  })
})

describe('escapeString / unescapeString - csv', () => {
  it('wraps in quotes when comma present', () => {
    expect(escapeString('hello, world', 'csv')).toBe('"hello, world"')
  })

  it('doubles internal quotes', () => {
    expect(escapeString('say "hi"', 'csv')).toBe('"say ""hi"""')
  })

  it('roundtrips', () => {
    const original = 'value with "quotes" and, comma'
    expect(unescapeString(escapeString(original, 'csv'), 'csv')).toBe(original)
  })
})

describe('escapeString / unescapeString - sql', () => {
  it('doubles single quotes', () => {
    expect(escapeString("it's a test", 'sql')).toBe("it''s a test")
  })

  it('unescapes doubled single quotes', () => {
    expect(unescapeString("it''s a test", 'sql')).toBe("it's a test")
  })

  it('leaves strings without quotes unchanged', () => {
    expect(escapeString('hello world', 'sql')).toBe('hello world')
  })
})
