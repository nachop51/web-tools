import { describe, expect, it } from 'vitest'
import { processJson } from './json'

describe('processJson', () => {
  it('formats valid JSON with 2-space indent', () => {
    const result = processJson('{"a":1,"b":2}', 2)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.formatted).toBe('{\n  "a": 1,\n  "b": 2\n}')
  })

  it('formats valid JSON with 4-space indent', () => {
    const result = processJson('{"a":1}', 4)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.formatted).toBe('{\n    "a": 1\n}')
  })

  it('minifies valid JSON', () => {
    const result = processJson('{\n  "a": 1,\n  "b": 2\n}', 2)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.minified).toBe('{"a":1,"b":2}')
  })

  it('returns size for both formatted and minified', () => {
    const result = processJson('{"x":1}', 2)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.size.formatted).toBeGreaterThan(result.size.minified)
  })

  it('returns error for invalid JSON', () => {
    const result = processJson('{bad json}', 2)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toBeTruthy()
  })

  it('returns error for empty string', () => {
    const result = processJson('', 2)
    expect(result.ok).toBe(false)
  })

  it('returns error for whitespace-only input', () => {
    const result = processJson('   ', 2)
    expect(result.ok).toBe(false)
  })
})
