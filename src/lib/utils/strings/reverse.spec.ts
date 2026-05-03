import { describe, it, expect } from 'vitest'
import { reverseChars, reverseWords, reverseLines } from './reverse'

describe('reverseChars', () => {
  it('reverses a simple string', () => {
    expect(reverseChars('hello')).toBe('olleh')
  })

  it('handles empty string', () => {
    expect(reverseChars('')).toBe('')
  })

  it('handles unicode/emoji', () => {
    expect(reverseChars('abc')).toBe('cba')
  })

  it('handles single char', () => {
    expect(reverseChars('x')).toBe('x')
  })
})

describe('reverseWords', () => {
  it('reverses words in a sentence', () => {
    expect(reverseWords('hello world foo')).toBe('foo world hello')
  })

  it('handles multiple spaces between words', () => {
    expect(reverseWords('a  b  c')).toBe('c b a')
  })

  it('handles single word', () => {
    expect(reverseWords('hello')).toBe('hello')
  })
})

describe('reverseLines', () => {
  it('reverses lines', () => {
    expect(reverseLines('line1\nline2\nline3')).toBe('line3\nline2\nline1')
  })

  it('handles single line', () => {
    expect(reverseLines('only')).toBe('only')
  })

  it('handles empty string', () => {
    expect(reverseLines('')).toBe('')
  })

  it('preserves blank lines', () => {
    expect(reverseLines('a\n\nb')).toBe('b\n\na')
  })
})
