import { describe, expect, it } from 'vitest'
import { CURRENCIES, numberToWords, numberToWordSegments, numberToWordsForMode } from './words'

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

  it('reads decimals with point + per-digit names', () => {
    expect(numberToWords(3.7)).toBe('three point seven')
    expect(numberToWords(-2.5)).toBe('negative two point five')
    expect(numberToWords('0.123')).toBe('zero point one two three')
    expect(numberToWords('.5')).toBe('zero point five')
  })

  it('handles one million one thousand (1_001_000)', () => {
    expect(numberToWords(1_001_000)).toBe('one million one thousand')
  })

  it('accepts string input with separators', () => {
    expect(numberToWords('1,234,567')).toBe('one million two hundred thirty-four thousand five hundred sixty-seven')
    expect(numberToWords('1_000_000')).toBe('one million')
  })

  it('handles trillions', () => {
    expect(numberToWords('5000000000000')).toBe('five trillion')
  })

  it('handles very large numbers up to vigintillion', () => {
    expect(numberToWords('1' + '0'.repeat(63))).toBe('one vigintillion')
  })

  it('handles a mixed huge number', () => {
    expect(numberToWords('1' + '0'.repeat(33))).toBe('one decillion')
    expect(numberToWords('42' + '0'.repeat(36))).toBe('forty-two undecillion')
  })

  it('rejects numbers beyond max digits', () => {
    expect(numberToWords('1' + '0'.repeat(66))).toBe('')
  })

  it('accepts BigInt input', () => {
    expect(numberToWords(123n)).toBe('one hundred twenty-three')
  })
})

function joinWords(tokens: { text: string }[]): string {
  return tokens.map((t) => t.text).join('')
}

function joinDigits(tokens: { text: string }[]): string {
  return tokens.map((t) => t.text).join('')
}

describe('numberToWordSegments:cardinal', () => {
  it('returns error for invalid input', () => {
    expect(numberToWordSegments('').ok).toBe(false)
    expect(numberToWordSegments('abc').ok).toBe(false)
    expect(numberToWordSegments('1.5.5').ok).toBe(false)
  })

  it('handles zero', () => {
    const r = numberToWordSegments('0')
    if (!r.ok) throw new Error('expected ok')
    expect(r.digitTokens).toEqual([{ text: '0', group: 0 }])
    expect(r.wordTokens).toEqual([{ text: 'zero', group: 0 }])
  })

  it('decomposes 21 with hyphen separator', () => {
    const r = numberToWordSegments('21')
    if (!r.ok) throw new Error('expected ok')
    expect(r.digitTokens).toEqual([
      { text: '2', group: 0 },
      { text: '1', group: 1 },
    ])
    expect(r.wordTokens).toEqual([
      { text: 'twenty', group: 0 },
      { text: '-', group: null },
      { text: 'one', group: 1 },
    ])
    expect(joinWords(r.wordTokens)).toBe('twenty-one')
  })

  it('keeps teens as a single chunk', () => {
    const r = numberToWordSegments('15')
    if (!r.ok) throw new Error('expected ok')
    expect(r.wordTokens).toEqual([{ text: 'fifteen', group: 0 }])
  })

  it('decomposes 234 into hundreds + tens + ones with proper separators', () => {
    const r = numberToWordSegments('234')
    if (!r.ok) throw new Error('expected ok')
    expect(joinWords(r.wordTokens)).toBe('two hundred thirty-four')
    expect(r.digitTokens).toEqual([
      { text: '2', group: 0 },
      { text: '3', group: 1 },
      { text: '4', group: 2 },
    ])
  })

  it('keeps 48 atomic in 48 million', () => {
    const r = numberToWordSegments('48000000')
    if (!r.ok) throw new Error('expected ok')
    expect(joinWords(r.wordTokens)).toBe('forty-eight million')
    expect(r.wordTokens.filter((t) => t.group !== null).map((t) => t.text)).toEqual(['forty-eight', 'million'])
  })

  it('groups 1,234,567 by atomic chunk', () => {
    const r = numberToWordSegments('1234567')
    if (!r.ok) throw new Error('expected ok')
    expect(joinWords(r.wordTokens)).toBe('one million two hundred thirty-four thousand five hundred sixty-seven')
    expect(joinDigits(r.digitTokens)).toBe('1,234,567')
  })

  it('handles negative sign as its own pair', () => {
    const r = numberToWordSegments('-5')
    if (!r.ok) throw new Error('expected ok')
    expect(joinWords(r.wordTokens)).toBe('negative five')
    expect(r.digitTokens[0]).toEqual({ text: '-', group: 0 })
  })

  it('emits zero-only groups as neutral chars in display', () => {
    const r = numberToWordSegments('1000000')
    if (!r.ok) throw new Error('expected ok')
    expect(joinDigits(r.digitTokens)).toBe('1,000,000')
    expect(joinWords(r.wordTokens)).toBe('one million')
  })

  it('handles simple decimal 1.5', () => {
    const r = numberToWordSegments('1.5')
    if (!r.ok) throw new Error('expected ok')
    expect(joinDigits(r.digitTokens)).toBe('1.5')
    expect(joinWords(r.wordTokens)).toBe('one point five')
  })

  it('reads each fraction digit individually', () => {
    const r = numberToWordSegments('3.14159')
    if (!r.ok) throw new Error('expected ok')
    expect(joinDigits(r.digitTokens)).toBe('3.14159')
    expect(joinWords(r.wordTokens)).toBe('three point one four one five nine')
  })

  it('treats leading zero in fraction', () => {
    const r = numberToWordSegments('0.07')
    if (!r.ok) throw new Error('expected ok')
    expect(joinDigits(r.digitTokens)).toBe('0.07')
    expect(joinWords(r.wordTokens)).toBe('zero point zero seven')
  })

  it('each fraction digit gets its own color group', () => {
    const r = numberToWordSegments('1.23')
    if (!r.ok) throw new Error('expected ok')
    const colored = r.wordTokens.filter((t) => t.group !== null)
    expect(colored.map((t) => t.text)).toEqual(['one', 'two', 'three'])
    expect(colored.map((t) => t.group)).toEqual([0, 1, 2])
  })

  it('rejects fractions exceeding MAX_DIGITS decimal places', () => {
    const r = numberToWordSegments('1.' + '0'.repeat(67))
    expect(r.ok).toBe(false)
  })

  it('accepts a long fraction up to MAX_DIGITS decimal places', () => {
    const r = numberToWordSegments('1.' + '0'.repeat(66))
    expect(r.ok).toBe(true)
  })
})

describe('numberToWordSegments:ordinal', () => {
  it('1 → first / 1st', () => {
    const r = numberToWordSegments('1', 'ordinal')
    if (!r.ok) throw new Error('expected ok')
    expect(joinWords(r.wordTokens)).toBe('first')
    expect(joinDigits(r.digitTokens)).toBe('1st')
  })

  it('21 → twenty-first / 21st', () => {
    const r = numberToWordSegments('21', 'ordinal')
    if (!r.ok) throw new Error('expected ok')
    expect(joinWords(r.wordTokens)).toBe('twenty-first')
    expect(joinDigits(r.digitTokens)).toBe('21st')
  })

  it('22 → twenty-second / 22nd', () => {
    const r = numberToWordSegments('22', 'ordinal')
    if (!r.ok) throw new Error('expected ok')
    expect(joinWords(r.wordTokens)).toBe('twenty-second')
    expect(joinDigits(r.digitTokens)).toBe('22nd')
  })

  it('11 → eleventh / 11th', () => {
    const r = numberToWordSegments('11', 'ordinal')
    if (!r.ok) throw new Error('expected ok')
    expect(joinWords(r.wordTokens)).toBe('eleventh')
    expect(joinDigits(r.digitTokens)).toBe('11th')
  })

  it('100 → one hundredth / 100th', () => {
    const r = numberToWordSegments('100', 'ordinal')
    if (!r.ok) throw new Error('expected ok')
    expect(joinWords(r.wordTokens)).toBe('one hundredth')
    expect(joinDigits(r.digitTokens)).toBe('100th')
  })

  it('1000000 → one millionth', () => {
    const r = numberToWordSegments('1000000', 'ordinal')
    if (!r.ok) throw new Error('expected ok')
    expect(joinWords(r.wordTokens)).toBe('one millionth')
    expect(joinDigits(r.digitTokens)).toBe('1,000,000th')
  })

  it('1234 → one thousand two hundred thirty-fourth', () => {
    const r = numberToWordSegments('1234', 'ordinal')
    if (!r.ok) throw new Error('expected ok')
    expect(joinWords(r.wordTokens)).toBe('one thousand two hundred thirty-fourth')
    expect(joinDigits(r.digitTokens)).toBe('1,234th')
  })

  it('230 → two hundred thirtieth', () => {
    const r = numberToWordSegments('230', 'ordinal')
    if (!r.ok) throw new Error('expected ok')
    expect(joinWords(r.wordTokens)).toBe('two hundred thirtieth')
    expect(joinDigits(r.digitTokens)).toBe('230th')
  })

  it('drops decimal part and emits a warning', () => {
    const r = numberToWordSegments('21.5', 'ordinal')
    if (!r.ok) throw new Error('expected ok')
    expect(joinWords(r.wordTokens)).toBe('twenty-first')
    expect(joinDigits(r.digitTokens)).toBe('21st')
    expect(r.warning).toMatch(/decimal/i)
  })

  it('no warning for clean integer input', () => {
    const r = numberToWordSegments('21', 'ordinal')
    if (!r.ok) throw new Error('expected ok')
    expect(r.warning).toBeUndefined()
  })
})

describe('numberToWordSegments:currency', () => {
  it('1.00 → one dollar', () => {
    const r = numberToWordSegments('1.00', 'currency')
    if (!r.ok) throw new Error('expected ok')
    expect(joinWords(r.wordTokens)).toBe('one dollar')
    expect(joinDigits(r.digitTokens)).toBe('$1.00')
  })

  it('1 → one dollar (no decimal supplied)', () => {
    const r = numberToWordSegments('1', 'currency')
    if (!r.ok) throw new Error('expected ok')
    expect(joinWords(r.wordTokens)).toBe('one dollar')
    expect(joinDigits(r.digitTokens)).toBe('$1.00')
  })

  it('0.01 → zero dollars and one cent', () => {
    const r = numberToWordSegments('0.01', 'currency')
    if (!r.ok) throw new Error('expected ok')
    expect(joinWords(r.wordTokens)).toBe('zero dollars and one cent')
    expect(joinDigits(r.digitTokens)).toBe('$0.01')
  })

  it('1234.56 → one thousand two hundred thirty-four dollars and fifty-six cents', () => {
    const r = numberToWordSegments('1234.56', 'currency')
    if (!r.ok) throw new Error('expected ok')
    expect(joinWords(r.wordTokens)).toBe('one thousand two hundred thirty-four dollars and fifty-six cents')
    expect(joinDigits(r.digitTokens)).toBe('$1,234.56')
  })

  it('-12.50 → negative twelve dollars and fifty cents', () => {
    const r = numberToWordSegments('-12.50', 'currency')
    if (!r.ok) throw new Error('expected ok')
    expect(joinWords(r.wordTokens)).toBe('negative twelve dollars and fifty cents')
    expect(joinDigits(r.digitTokens)).toBe('-$12.50')
  })

  it('accepts $ prefix', () => {
    const r = numberToWordSegments('$5.99', 'currency')
    if (!r.ok) throw new Error('expected ok')
    expect(joinWords(r.wordTokens)).toBe('five dollars and ninety-nine cents')
  })

  it('rounds extra decimals to currency precision', () => {
    expect(numberToWordsForMode('1.234', 'currency')).toBe('one dollar and twenty-three cents')
    expect(numberToWordsForMode('1.235', 'currency')).toBe('one dollar and twenty-four cents')
    expect(numberToWordsForMode('0.999', 'currency')).toBe('one dollar')
    expect(numberToWordsForMode('999.999', 'currency')).toBe('one thousand dollars')
  })

  it('emits a warning when rounding extra decimals (USD)', () => {
    const r = numberToWordSegments('1.234', 'currency')
    if (!r.ok) throw new Error('expected ok')
    expect(r.warning).toBeDefined()
    expect(r.warning).toContain('1.234')
    expect(r.warning).toContain('1.23')
    expect(r.warning).toContain('USD')
  })

  it('emits a warning when rounding to whole yen (JPY)', () => {
    const r = numberToWordSegments('1.5', 'currency', CURRENCIES.JPY)
    if (!r.ok) throw new Error('expected ok')
    expect(r.warning).toBeDefined()
    expect(r.warning).toContain('1.5')
    expect(r.warning).toContain('JPY')
    expect(r.warning).toMatch(/whole/i)
  })

  it('no warning when fraction fits the currency precision', () => {
    const r1 = numberToWordSegments('1.50', 'currency')
    if (!r1.ok) throw new Error('expected ok')
    expect(r1.warning).toBeUndefined()
    const r2 = numberToWordSegments('1234', 'currency', CURRENCIES.JPY)
    if (!r2.ok) throw new Error('expected ok')
    expect(r2.warning).toBeUndefined()
  })

  it('rounds to whole units for zero-decimal currencies (JPY)', () => {
    expect(numberToWordsForMode('1.4', 'currency', CURRENCIES.JPY)).toBe('one yen')
    expect(numberToWordsForMode('1.5', 'currency', CURRENCIES.JPY)).toBe('two yen')
    expect(numberToWordsForMode('999.6', 'currency', CURRENCIES.JPY)).toBe('one thousand yen')
  })

  it('EUR uses euro/euros symbol', () => {
    const r = numberToWordSegments('5.50', 'currency', CURRENCIES.EUR)
    if (!r.ok) throw new Error('expected ok')
    expect(joinWords(r.wordTokens)).toBe('five euros and fifty cents')
    expect(joinDigits(r.digitTokens)).toBe('€5.50')
  })

  it('GBP uses penny/pence', () => {
    const r1 = numberToWordSegments('1.01', 'currency', CURRENCIES.GBP)
    if (!r1.ok) throw new Error('expected ok')
    expect(joinWords(r1.wordTokens)).toBe('one pound and one penny')
    const r2 = numberToWordSegments('1.50', 'currency', CURRENCIES.GBP)
    if (!r2.ok) throw new Error('expected ok')
    expect(joinWords(r2.wordTokens)).toBe('one pound and fifty pence')
    expect(joinDigits(r2.digitTokens)).toBe('£1.50')
  })

  it('JPY has no minor unit and rounds decimals to whole yen', () => {
    const r = numberToWordSegments('1234', 'currency', CURRENCIES.JPY)
    if (!r.ok) throw new Error('expected ok')
    expect(joinWords(r.wordTokens)).toBe('one thousand two hundred thirty-four yen')
    expect(joinDigits(r.digitTokens)).toBe('¥1,234')
    const r2 = numberToWordSegments('1.50', 'currency', CURRENCIES.JPY)
    if (!r2.ok) throw new Error('expected ok')
    expect(joinWords(r2.wordTokens)).toBe('two yen')
  })

  it('JPY pluralizes singularly (1 yen, 5 yen)', () => {
    expect(numberToWordsForMode('1', 'currency', CURRENCIES.JPY)).toBe('one yen')
    expect(numberToWordsForMode('5', 'currency', CURRENCIES.JPY)).toBe('five yen')
  })

  it('INR uses paisa/paise', () => {
    const r = numberToWordSegments('100.25', 'currency', CURRENCIES.INR)
    if (!r.ok) throw new Error('expected ok')
    expect(joinWords(r.wordTokens)).toBe('one hundred rupees and twenty-five paise')
    expect(joinDigits(r.digitTokens)).toBe('₹100.25')
  })
})

describe('numberToWordsForMode', () => {
  it('returns plain string for cardinal', () => {
    expect(numberToWordsForMode('1234567')).toBe('one million two hundred thirty-four thousand five hundred sixty-seven')
  })

  it('returns ordinal string', () => {
    expect(numberToWordsForMode('21', 'ordinal')).toBe('twenty-first')
  })

  it('returns currency string', () => {
    expect(numberToWordsForMode('1.50', 'currency')).toBe('one dollar and fifty cents')
  })
})
