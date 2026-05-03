import { describe, it, expect } from 'vitest'
import { testRegex } from './regex'

describe('testRegex', () => {
  it('finds all matches with global flag', () => {
    const result = testRegex('\\d+', 'g', 'foo 123 bar 456')
    expect(result.error).toBeNull()
    expect(result.matches).toHaveLength(2)
    expect(result.matches[0].fullMatch).toBe('123')
    expect(result.matches[1].fullMatch).toBe('456')
  })

  it('captures groups', () => {
    const result = testRegex('(\\w+)@(\\w+)', 'g', 'user@example test@host')
    expect(result.error).toBeNull()
    expect(result.matches[0].groups).toEqual(['user', 'example'])
    expect(result.matches[1].groups).toEqual(['test', 'host'])
  })

  it('returns error for invalid pattern', () => {
    const result = testRegex('[invalid', 'g', 'text')
    expect(result.error).not.toBeNull()
    expect(result.matches).toHaveLength(0)
  })

  it('returns empty matches for empty pattern', () => {
    const result = testRegex('', 'g', 'hello')
    expect(result.matches).toHaveLength(0)
    expect(result.error).toBeNull()
  })

  it('case-insensitive flag works', () => {
    const result = testRegex('hello', 'gi', 'Hello HELLO hello')
    expect(result.matches).toHaveLength(3)
  })

  it('records correct index', () => {
    const result = testRegex('b', 'g', 'abc')
    expect(result.matches[0].index).toBe(1)
  })
})
