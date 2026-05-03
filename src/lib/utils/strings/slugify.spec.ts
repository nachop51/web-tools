import { describe, expect, it } from 'vitest'
import { slugify } from './slugify'

describe('slugify', () => {
  it('returns empty string for empty input', () => {
    expect(slugify('')).toBe('')
  })

  it('converts basic text to lowercase hyphen slug', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('trims leading and trailing spaces', () => {
    expect(slugify('  foo  bar  ')).toBe('foo-bar')
  })

  it('collapses multiple spaces into single separator', () => {
    expect(slugify('foo   bar')).toBe('foo-bar')
  })

  it('strips combining accent marks (Unicode normalization)', () => {
    expect(slugify('Ünïcödé')).toBe('unicode')
  })

  it('strips accents from common Latin characters', () => {
    expect(slugify('café')).toBe('cafe')
  })

  it('uses underscore separator when specified', () => {
    expect(slugify('Hello World', { separator: '_' })).toBe('hello_world')
  })

  it('uses dot separator when specified', () => {
    expect(slugify('Hello World', { separator: '.' })).toBe('hello.world')
  })

  it('preserves case when lowercase is false', () => {
    expect(slugify('Hello World', { lowercase: false })).toBe('Hello-World')
  })

  it('handles mixed punctuation', () => {
    expect(slugify('foo--bar__baz')).toBe('foo-bar-baz')
  })

  it('handles numbers', () => {
    expect(slugify('Version 2.0 Release')).toBe('version-2-0-release')
  })
})
