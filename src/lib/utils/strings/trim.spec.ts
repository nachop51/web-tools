import { describe, expect, it } from 'vitest'
import {
  applyTrimOps,
  collapseSpaces,
  deduplicateLines,
  normalizeLineEndings,
  removeBlankLines,
  trimLeadingTrailing,
  trimLines,
} from './trim'

describe('trimLeadingTrailing', () => {
  it('trims leading and trailing whitespace', () => {
    expect(trimLeadingTrailing('  hello  ')).toBe('hello')
  })

  it('returns empty string unchanged', () => {
    expect(trimLeadingTrailing('')).toBe('')
  })

  it('trims newlines at edges', () => {
    expect(trimLeadingTrailing('\nhello\n')).toBe('hello')
  })
})

describe('collapseSpaces', () => {
  it('collapses multiple spaces into one per line', () => {
    expect(collapseSpaces('foo  bar   baz')).toBe('foo bar baz')
  })

  it('handles multi-line input', () => {
    expect(collapseSpaces('foo  bar\nbaz  qux')).toBe('foo bar\nbaz qux')
  })

  it('trims each line', () => {
    expect(collapseSpaces('  hello  world  ')).toBe('hello world')
  })

  it('returns empty string for empty input', () => {
    expect(collapseSpaces('')).toBe('')
  })
})

describe('trimLines', () => {
  it('trims each line individually', () => {
    expect(trimLines('  hello  \n  world  ')).toBe('hello\nworld')
  })

  it('returns empty string for empty input', () => {
    expect(trimLines('')).toBe('')
  })

  it('preserves blank lines between content', () => {
    expect(trimLines('  foo  \n\n  bar  ')).toBe('foo\n\nbar')
  })
})

describe('removeBlankLines', () => {
  it('removes blank lines', () => {
    expect(removeBlankLines('foo\n\nbar')).toBe('foo\nbar')
  })

  it('removes whitespace-only lines', () => {
    expect(removeBlankLines('foo\n   \nbar')).toBe('foo\nbar')
  })

  it('returns empty string for empty input', () => {
    expect(removeBlankLines('')).toBe('')
  })

  it('removes all lines if all are blank', () => {
    expect(removeBlankLines('\n\n\n')).toBe('')
  })
})

describe('normalizeLineEndings', () => {
  it('normalizes CRLF to LF', () => {
    expect(normalizeLineEndings('foo\r\nbar', 'lf')).toBe('foo\nbar')
  })

  it('normalizes CR to LF', () => {
    expect(normalizeLineEndings('foo\rbar', 'lf')).toBe('foo\nbar')
  })

  it('converts LF to CRLF', () => {
    expect(normalizeLineEndings('foo\nbar', 'crlf')).toBe('foo\r\nbar')
  })

  it('converts LF to CR', () => {
    expect(normalizeLineEndings('foo\nbar', 'cr')).toBe('foo\rbar')
  })

  it('returns empty string for empty input', () => {
    expect(normalizeLineEndings('', 'lf')).toBe('')
  })
})

describe('deduplicateLines', () => {
  it('removes duplicate lines preserving order', () => {
    expect(deduplicateLines('foo\nbar\nfoo\nbaz')).toBe('foo\nbar\nbaz')
  })

  it('keeps first occurrence', () => {
    expect(deduplicateLines('a\nb\na')).toBe('a\nb')
  })

  it('returns empty string for empty input', () => {
    expect(deduplicateLines('')).toBe('')
  })

  it('handles no duplicates', () => {
    expect(deduplicateLines('a\nb\nc')).toBe('a\nb\nc')
  })
})

describe('applyTrimOps', () => {
  it('applies trimEdges', () => {
    expect(applyTrimOps('  hello  ', { trimEdges: true })).toBe('hello')
  })

  it('applies collapseSpaces', () => {
    expect(applyTrimOps('foo  bar', { collapseSpaces: true })).toBe('foo bar')
  })

  it('applies removeBlank', () => {
    expect(applyTrimOps('foo\n\nbar', { removeBlank: true })).toBe('foo\nbar')
  })

  it('applies dedupe', () => {
    expect(applyTrimOps('a\nb\na', { dedupe: true })).toBe('a\nb')
  })

  it('applies lineEndings lf', () => {
    expect(applyTrimOps('foo\r\nbar', { lineEndings: 'lf' })).toBe('foo\nbar')
  })

  it('skips lineEndings when none', () => {
    const input = 'foo\r\nbar'
    expect(applyTrimOps(input, { lineEndings: 'none' })).toBe(input)
  })

  it('combines multiple options', () => {
    const input = '  foo  \n\n  foo  \n  bar  '
    const result = applyTrimOps(input, {
      trimLines: true,
      removeBlank: true,
      dedupe: true,
      trimEdges: true,
    })
    expect(result).toBe('foo\nbar')
  })
})
