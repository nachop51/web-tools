import { describe, it, expect } from 'vitest'
import { textToBinary, binaryToText, textToHex, hexToText, textToDecimal, decimalToText } from './binary-text'

describe('textToBinary / binaryToText', () => {
  it("converts 'Hi' to 8-bit binary", () => {
    expect(textToBinary('Hi')).toBe('01001000 01101001')
  })

  it('round-trips ASCII text', () => {
    const text = 'Hello World'
    expect(binaryToText(textToBinary(text))).toBe(text)
  })

  it('round-trips UTF-8 multi-byte characters', () => {
    const text = 'café'
    expect(binaryToText(textToBinary(text))).toBe(text)
  })

  it('returns empty string for empty input', () => {
    expect(textToBinary('')).toBe('')
    expect(binaryToText('')).toBe('')
  })
})

describe('textToHex / hexToText', () => {
  it("converts 'Hello' to lowercase hex pairs", () => {
    expect(textToHex('Hello')).toBe('48 65 6c 6c 6f')
  })

  it('round-trips ASCII text', () => {
    const text = 'Hello, World!'
    expect(hexToText(textToHex(text))).toBe(text)
  })

  it('round-trips UTF-8 text', () => {
    const text = 'naïve'
    expect(hexToText(textToHex(text))).toBe(text)
  })

  it('returns empty string for empty input', () => {
    expect(textToHex('')).toBe('')
    expect(hexToText('')).toBe('')
  })
})

describe('textToDecimal / decimalToText', () => {
  it("converts 'A' to '65'", () => {
    expect(textToDecimal('A')).toBe('65')
  })

  it("converts 'Hi' to decimal byte values", () => {
    expect(textToDecimal('Hi')).toBe('72 105')
  })

  it('round-trips ASCII text', () => {
    const text = 'Test 123'
    expect(decimalToText(textToDecimal(text))).toBe(text)
  })

  it('returns empty string for empty input', () => {
    expect(textToDecimal('')).toBe('')
    expect(decimalToText('')).toBe('')
  })
})
