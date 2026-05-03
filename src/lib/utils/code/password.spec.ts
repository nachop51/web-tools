import { describe, it, expect } from 'vitest'
import {
  generatePassword,
  calcEntropy,
  strengthLabel,
  generatePassphrase,
  passphraseEntropy,
  passphraseWordlistSize,
  generateKey,
  keyEntropy,
} from './password'

describe('generatePassword', () => {
  it('generates password of correct length', () => {
    const p = generatePassword({ length: 16, upper: true, lower: true, digits: true, symbols: false })
    expect(p).toHaveLength(16)
  })

  it('returns empty when no charset selected', () => {
    const p = generatePassword({ length: 10, upper: false, lower: false, digits: false, symbols: false })
    expect(p).toBe('')
  })

  it('only contains digits when only digits selected', () => {
    const p = generatePassword({ length: 20, upper: false, lower: false, digits: true, symbols: false })
    expect(p).toMatch(/^\d+$/)
  })

  it('only contains uppercase when only upper selected', () => {
    const p = generatePassword({ length: 20, upper: true, lower: false, digits: false, symbols: false })
    expect(p).toMatch(/^[A-Z]+$/)
  })
})

describe('calcEntropy', () => {
  it('calculates entropy correctly', () => {
    expect(calcEntropy(26, 1)).toBeCloseTo(Math.log2(26), 5)
  })

  it('scales with length', () => {
    expect(calcEntropy(26, 10)).toBeCloseTo(10 * Math.log2(26), 5)
  })

  it('charset size 2 gives 1 bit per char', () => {
    expect(calcEntropy(2, 8)).toBeCloseTo(8, 5)
  })
})

describe('strengthLabel', () => {
  it('weak below 28', () => {
    expect(strengthLabel(10)).toBe('Weak')
    expect(strengthLabel(27)).toBe('Weak')
  })

  it('fair 28-59', () => {
    expect(strengthLabel(28)).toBe('Fair')
    expect(strengthLabel(59)).toBe('Fair')
  })

  it('strong 60-99', () => {
    expect(strengthLabel(60)).toBe('Strong')
    expect(strengthLabel(99)).toBe('Strong')
  })

  it('very strong at 100+', () => {
    expect(strengthLabel(100)).toBe('Very strong')
    expect(strengthLabel(200)).toBe('Very strong')
  })
})

describe('generatePassphrase', () => {
  it('produces the requested word count separated by separator', () => {
    const p = generatePassphrase({ wordCount: 4, separator: '-', capitalize: false, appendNumber: false })
    const parts = p.split('-')
    expect(parts).toHaveLength(4)
    for (const part of parts) {
      expect(part).toMatch(/^[a-z]+$/)
    }
  })

  it('supports space separator', () => {
    const p = generatePassphrase({ wordCount: 3, separator: ' ', capitalize: false, appendNumber: false })
    expect(p.split(' ')).toHaveLength(3)
  })

  it('capitalizes first letter of each word when requested', () => {
    const p = generatePassphrase({ wordCount: 5, separator: '-', capitalize: true, appendNumber: false })
    const parts = p.split('-')
    for (const part of parts) {
      expect(part[0]).toMatch(/[A-Z]/)
      expect(part.slice(1)).toMatch(/^[a-z]+$/)
    }
  })

  it('appends a 2-digit number when requested', () => {
    const p = generatePassphrase({ wordCount: 3, separator: '-', capitalize: false, appendNumber: true })
    const parts = p.split('-')
    expect(parts).toHaveLength(4)
    expect(parts[3]).toMatch(/^\d{2}$/)
  })

  it('joins with empty separator when separator is empty', () => {
    const p = generatePassphrase({ wordCount: 3, separator: '', capitalize: true, appendNumber: false })
    expect(p).toMatch(/^[A-Z][a-z]+[A-Z][a-z]+[A-Z][a-z]+$/)
  })

  it('returns empty string when wordCount is zero or negative', () => {
    expect(generatePassphrase({ wordCount: 0, separator: '-', capitalize: false, appendNumber: false })).toBe('')
    expect(generatePassphrase({ wordCount: -1, separator: '-', capitalize: false, appendNumber: false })).toBe('')
  })
})

describe('passphraseEntropy', () => {
  it('returns wordCount * log2(wordlistSize)', () => {
    const size = passphraseWordlistSize()
    expect(passphraseEntropy(4)).toBeCloseTo(4 * Math.log2(size), 5)
  })

  it('yields 8 bits per word for a 256-word list', () => {
    expect(passphraseWordlistSize()).toBe(256)
    expect(passphraseEntropy(5)).toBeCloseTo(40, 5)
  })
})

describe('generateKey', () => {
  it('produces 2 hex chars per byte', () => {
    const k = generateKey(16, 'hex')
    expect(k).toHaveLength(32)
    expect(k).toMatch(/^[0-9a-f]+$/)
  })

  it('produces standard base64 with proper length', () => {
    const k = generateKey(24, 'base64')
    expect(k).toMatch(/^[A-Za-z0-9+/]+=*$/)
    expect(k).toHaveLength(32) // 24 bytes -> 32 base64 chars (no padding for 24)
  })

  it('urlsafe contains no +, /, or = and uses - and _', () => {
    const k = generateKey(64, 'urlsafe')
    expect(k).not.toMatch(/[+/=]/)
    expect(k).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('returns empty when bytes is zero', () => {
    expect(generateKey(0, 'hex')).toBe('')
    expect(generateKey(0, 'base64')).toBe('')
    expect(generateKey(0, 'urlsafe')).toBe('')
  })

  it('hex output for varying sizes has 2*bytes chars', () => {
    for (const n of [16, 24, 32, 48, 64, 128]) {
      expect(generateKey(n, 'hex')).toHaveLength(n * 2)
    }
  })
})

describe('keyEntropy', () => {
  it('returns bytes * 8', () => {
    expect(keyEntropy(16)).toBe(128)
    expect(keyEntropy(32)).toBe(256)
    expect(keyEntropy(64)).toBe(512)
  })
})
