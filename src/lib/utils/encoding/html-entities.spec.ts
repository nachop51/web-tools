import { describe, expect, it } from 'vitest'
import { decodeHTMLEntities, encodeHTMLEntities } from './html-entities'

describe('encodeHTMLEntities', () => {
  it('encodes < and > in a script tag', () => {
    expect(encodeHTMLEntities('<script>')).toBe('&lt;script&gt;')
  })

  it('encodes ampersand', () => {
    expect(encodeHTMLEntities('a & b')).toBe('a &amp; b')
  })

  it('encodes double quotes', () => {
    expect(encodeHTMLEntities('"hello"')).toBe('&quot;hello&quot;')
  })

  it('encodes single quotes', () => {
    expect(encodeHTMLEntities("it's")).toBe('it&#039;s')
  })

  it('encodes non-ASCII as numeric entities when extended=true', () => {
    expect(encodeHTMLEntities('é', true)).toBe('&#233;')
  })

  it('does not encode non-ASCII when extended=false (default)', () => {
    expect(encodeHTMLEntities('é')).toBe('é')
  })

  it('returns empty string for empty input', () => {
    expect(encodeHTMLEntities('')).toBe('')
  })

  it('round-trips a complex string', () => {
    const original = '<div class="test">Hello & World</div>'
    expect(decodeHTMLEntities(encodeHTMLEntities(original))).toBe(original)
  })
})

describe('decodeHTMLEntities', () => {
  it('decodes &lt; to <', () => {
    expect(decodeHTMLEntities('&lt;')).toBe('<')
  })

  it('decodes &amp; to &', () => {
    expect(decodeHTMLEntities('&amp;')).toBe('&')
  })

  it('decodes decimal numeric entity &#65; to A', () => {
    expect(decodeHTMLEntities('&#65;')).toBe('A')
  })

  it('decodes hex numeric entity &#x41; to A', () => {
    expect(decodeHTMLEntities('&#x41;')).toBe('A')
  })

  it('decodes uppercase hex &#X41; to A', () => {
    expect(decodeHTMLEntities('&#X41;')).toBe('A')
  })

  it('decodes named entities like &copy;, &trade;, &euro;', () => {
    expect(decodeHTMLEntities('&copy;')).toBe('©')
    expect(decodeHTMLEntities('&trade;')).toBe('™')
    expect(decodeHTMLEntities('&euro;')).toBe('€')
  })

  it('returns empty string for empty input', () => {
    expect(decodeHTMLEntities('')).toBe('')
  })
})
