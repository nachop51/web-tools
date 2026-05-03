import { describe, expect, it } from 'vitest'
import {
  countBytes,
  countChars,
  countCharsNoSpaces,
  countLines,
  countParagraphs,
  countSentences,
  countWords,
} from './count'

describe('countChars', () => {
  it('returns 0 for empty string', () => {
    expect(countChars('')).toBe(0)
  })

  it('counts all chars including spaces', () => {
    expect(countChars('hello world')).toBe(11)
  })

  it('counts newlines as characters', () => {
    expect(countChars('hello\nworld')).toBe(11)
  })
})

describe('countCharsNoSpaces', () => {
  it('returns 0 for empty string', () => {
    expect(countCharsNoSpaces('')).toBe(0)
  })

  it('strips all whitespace before counting', () => {
    expect(countCharsNoSpaces('hello world')).toBe(10)
  })

  it('strips newlines and tabs', () => {
    expect(countCharsNoSpaces('hello\n\tworld')).toBe(10)
  })
})

describe('countWords', () => {
  it('returns 0 for empty string', () => {
    expect(countWords('')).toBe(0)
  })

  it('returns 0 for whitespace-only string', () => {
    expect(countWords('   ')).toBe(0)
  })

  it('counts words split by spaces', () => {
    expect(countWords('hello world')).toBe(2)
  })

  it('handles multiple spaces between words', () => {
    expect(countWords('foo  bar   baz')).toBe(3)
  })
})

describe('countLines', () => {
  it('returns 0 for empty string', () => {
    expect(countLines('')).toBe(0)
  })

  it('returns 1 for a single line with no newline', () => {
    expect(countLines('hello world')).toBe(1)
  })

  it('returns 2 for two lines', () => {
    expect(countLines('hello\nworld')).toBe(2)
  })

  it('returns 3 for three lines', () => {
    expect(countLines('a\nb\nc')).toBe(3)
  })
})

describe('countBytes', () => {
  it('returns 0 for empty string', () => {
    expect(countBytes('')).toBe(0)
  })

  it('counts ASCII bytes (1 byte per char)', () => {
    expect(countBytes('hello world')).toBe(11)
  })

  it('counts multi-byte UTF-8 characters', () => {
    // "é" is 2 bytes in UTF-8 (U+00E9)
    expect(countBytes('é')).toBe(2)
    // "€" is 3 bytes in UTF-8 (U+20AC)
    expect(countBytes('€')).toBe(3)
  })
})

describe('countSentences', () => {
  it('returns 0 for empty string', () => {
    expect(countSentences('')).toBe(0)
  })

  it('counts sentences delimited by . ! ?', () => {
    expect(countSentences('foo. Bar! Baz?')).toBe(3)
  })

  it('returns 1 for a single sentence without terminal punctuation', () => {
    expect(countSentences('hello world')).toBe(1)
  })

  it('handles consecutive delimiters as one boundary', () => {
    expect(countSentences('Really?! Yes.')).toBe(2)
  })
})

describe('countParagraphs', () => {
  it('returns 0 for empty string', () => {
    expect(countParagraphs('')).toBe(0)
  })

  it('returns 1 for a single paragraph', () => {
    expect(countParagraphs('hello world')).toBe(1)
  })

  it('returns 2 for two paragraphs separated by blank line', () => {
    expect(countParagraphs('first paragraph\n\nsecond paragraph')).toBe(2)
  })

  it('ignores blank-line-only content', () => {
    expect(countParagraphs('\n\n\n')).toBe(0)
  })
})
