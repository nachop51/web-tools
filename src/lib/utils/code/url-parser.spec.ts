import { describe, it, expect } from 'vitest'
import { parseUrl } from './url-parser'

describe('parseUrl', () => {
  it('parses a simple URL', () => {
    const r = parseUrl('https://example.com/path')
    expect(r.protocol).toBe('https:')
    expect(r.hostname).toBe('example.com')
    expect(r.pathname).toBe('/path')
  })

  it('parses query params', () => {
    const r = parseUrl('https://example.com?foo=1&bar=2')
    expect(r.params.foo).toBe('1')
    expect(r.params.bar).toBe('2')
    expect(r.search).toBe('?foo=1&bar=2')
  })

  it('parses hash', () => {
    const r = parseUrl('https://example.com/page#section')
    expect(r.hash).toBe('#section')
  })

  it('parses port', () => {
    const r = parseUrl('http://localhost:3000/api')
    expect(r.port).toBe('3000')
    expect(r.hostname).toBe('localhost')
    expect(r.pathname).toBe('/api')
  })

  it('parses username and password', () => {
    const r = parseUrl('ftp://user:pass@example.com')
    expect(r.username).toBe('user')
    expect(r.password).toBe('pass')
  })

  it('throws on invalid URL', () => {
    expect(() => parseUrl('not a url')).toThrow()
  })
})
