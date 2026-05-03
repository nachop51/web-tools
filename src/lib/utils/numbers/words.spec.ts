import { describe, expect, it } from 'vitest'
import { numberToWords } from './words'

describe('numberToWords', () => {
  it("converts 0 to 'zero'", () => {
    expect(numberToWords(0)).toBe('zero')
  })

  it("converts 1 to 'one'", () => {
    expect(numberToWords(1)).toBe('one')
  })

  it("converts 13 to 'thirteen'", () => {
    expect(numberToWords(13)).toBe('thirteen')
  })

  it("converts 20 to 'twenty'", () => {
    expect(numberToWords(20)).toBe('twenty')
  })

  it("converts 42 to 'forty-two'", () => {
    expect(numberToWords(42)).toBe('forty-two')
  })

  it("converts 100 to 'one hundred'", () => {
    expect(numberToWords(100)).toBe('one hundred')
  })

  it("converts 101 to 'one hundred one'", () => {
    expect(numberToWords(101)).toBe('one hundred one')
  })

  it("converts 1000 to 'one thousand'", () => {
    expect(numberToWords(1000)).toBe('one thousand')
  })

  it("converts 1001 to 'one thousand one'", () => {
    expect(numberToWords(1001)).toBe('one thousand one')
  })

  it("converts 1_000_000 to 'one million'", () => {
    expect(numberToWords(1_000_000)).toBe('one million')
  })

  it("converts 1_000_001 to 'one million one'", () => {
    expect(numberToWords(1_000_001)).toBe('one million one')
  })

  it('converts 1_234_567 correctly', () => {
    expect(numberToWords(1_234_567)).toBe('one million two hundred thirty-four thousand five hundred sixty-seven')
  })

  it("converts -5 to 'negative five'", () => {
    expect(numberToWords(-5)).toBe('negative five')
  })

  it("returns '' for NaN", () => {
    expect(numberToWords(NaN)).toBe('')
  })

  it("returns '' for Infinity", () => {
    expect(numberToWords(Infinity)).toBe('')
    expect(numberToWords(-Infinity)).toBe('')
  })

  it("returns '' for floats with fractional part", () => {
    expect(numberToWords(3.7)).toBe('')
    expect(numberToWords(-2.5)).toBe('')
  })

  it('handles one million one thousand (1_001_000)', () => {
    expect(numberToWords(1_001_000)).toBe('one million one thousand')
  })
})
