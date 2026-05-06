const ONES = [
  '',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
]

const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

const SCALES = [
  '',
  'thousand',
  'million',
  'billion',
  'trillion',
  'quadrillion',
  'quintillion',
  'sextillion',
  'septillion',
  'octillion',
  'nonillion',
  'decillion',
  'undecillion',
  'duodecillion',
  'tredecillion',
  'quattuordecillion',
  'quindecillion',
  'sexdecillion',
  'septendecillion',
  'octodecillion',
  'novemdecillion',
  'vigintillion',
]

export const MAX_DIGITS = SCALES.length * 3 // 66

const ORDINAL_REPLACEMENTS: Record<string, string> = {
  one: 'first',
  two: 'second',
  three: 'third',
  four: 'fourth',
  five: 'fifth',
  six: 'sixth',
  seven: 'seventh',
  eight: 'eighth',
  nine: 'ninth',
  ten: 'tenth',
  eleven: 'eleventh',
  twelve: 'twelfth',
  thirteen: 'thirteenth',
  fourteen: 'fourteenth',
  fifteen: 'fifteenth',
  sixteen: 'sixteenth',
  seventeen: 'seventeenth',
  eighteen: 'eighteenth',
  nineteen: 'nineteenth',
  twenty: 'twentieth',
  thirty: 'thirtieth',
  forty: 'fortieth',
  fifty: 'fiftieth',
  sixty: 'sixtieth',
  seventy: 'seventieth',
  eighty: 'eightieth',
  ninety: 'ninetieth',
  zero: 'zeroth',
}

export type Mode = 'cardinal' | 'ordinal' | 'currency'

export type Currency = {
  code: string
  label: string
  symbol: string
  major: { singular: string; plural: string }
  minor: { singular: string; plural: string } | null
  decimals: 0 | 2
}

export const CURRENCIES: Record<string, Currency> = {
  USD: {
    code: 'USD',
    label: 'US Dollar ($)',
    symbol: '$',
    major: { singular: 'dollar', plural: 'dollars' },
    minor: { singular: 'cent', plural: 'cents' },
    decimals: 2,
  },
  EUR: {
    code: 'EUR',
    label: 'Euro (€)',
    symbol: '€',
    major: { singular: 'euro', plural: 'euros' },
    minor: { singular: 'cent', plural: 'cents' },
    decimals: 2,
  },
  GBP: {
    code: 'GBP',
    label: 'Pound (£)',
    symbol: '£',
    major: { singular: 'pound', plural: 'pounds' },
    minor: { singular: 'penny', plural: 'pence' },
    decimals: 2,
  },
  JPY: {
    code: 'JPY',
    label: 'Yen (¥)',
    symbol: '¥',
    major: { singular: 'yen', plural: 'yen' },
    minor: null,
    decimals: 0,
  },
  CAD: {
    code: 'CAD',
    label: 'Canadian Dollar (C$)',
    symbol: 'C$',
    major: { singular: 'dollar', plural: 'dollars' },
    minor: { singular: 'cent', plural: 'cents' },
    decimals: 2,
  },
  AUD: {
    code: 'AUD',
    label: 'Australian Dollar (A$)',
    symbol: 'A$',
    major: { singular: 'dollar', plural: 'dollars' },
    minor: { singular: 'cent', plural: 'cents' },
    decimals: 2,
  },
  INR: {
    code: 'INR',
    label: 'Rupee (₹)',
    symbol: '₹',
    major: { singular: 'rupee', plural: 'rupees' },
    minor: { singular: 'paisa', plural: 'paise' },
    decimals: 2,
  },
  UYU: {
    code: 'UYU',
    label: 'Uruguayan Peso ($U)',
    symbol: '$U',
    major: { singular: 'peso', plural: 'pesos' },
    minor: { singular: 'centésimo', plural: 'centésimos' },
    decimals: 2,
  },
}

export const CURRENCY_CODES = Object.keys(CURRENCIES) as (keyof typeof CURRENCIES)[]

const DEFAULT_CURRENCY = CURRENCIES.USD

function below100(n: number): string {
  if (n < 20) return ONES[n]
  const t = Math.floor(n / 10)
  const o = n % 10
  return o === 0 ? TENS[t] : `${TENS[t]}-${ONES[o]}`
}

function below1000(n: number): string {
  if (n === 0) return ''
  if (n < 100) return below100(n)
  const h = Math.floor(n / 100)
  const rest = n % 100
  return rest === 0 ? `${ONES[h]} hundred` : `${ONES[h]} hundred ${below100(rest)}`
}

function digitName(d: number): string {
  return d === 0 ? 'zero' : ONES[d]
}

type IntParseResult = { ok: true; negative: boolean; digits: string } | { ok: false; error: string }

function parseInteger(input: string | number | bigint): IntParseResult {
  let s: string
  if (typeof input === 'string') {
    s = input.trim()
  } else if (typeof input === 'bigint') {
    s = input.toString()
  } else {
    if (!Number.isFinite(input) || !Number.isInteger(input)) return { ok: false, error: 'Not an integer.' }
    s = input.toString()
  }
  if (!s) return { ok: false, error: 'Empty input.' }
  s = s.replace(/[,_\s]/g, '')
  let negative = false
  if (s[0] === '-') {
    negative = true
    s = s.slice(1)
  } else if (s[0] === '+') {
    s = s.slice(1)
  }
  if (!s) return { ok: false, error: 'Missing digits.' }
  if (!/^\d+$/.test(s)) return { ok: false, error: 'Only digits, optional leading sign, and separators are allowed.' }
  s = s.replace(/^0+/, '') || '0'
  if (s.length > MAX_DIGITS) {
    return { ok: false, error: `Number is too large (max ${MAX_DIGITS} digits, up to vigintillions).` }
  }
  return { ok: true, negative, digits: s }
}

type DecimalParseResult =
  | { ok: true; negative: boolean; integer: string; fraction: string }
  | { ok: false; error: string }

function parseDecimal(input: string | number | bigint): DecimalParseResult {
  let s: string
  if (typeof input === 'string') {
    s = input.trim()
  } else if (typeof input === 'bigint') {
    s = input.toString()
  } else {
    if (!Number.isFinite(input)) return { ok: false, error: 'Not a finite number.' }
    s = input.toString()
  }
  if (!s) return { ok: false, error: 'Empty input.' }
  s = s.replace(/[,_\s]/g, '')
  let negative = false
  if (s[0] === '-') {
    negative = true
    s = s.slice(1)
  } else if (s[0] === '+') {
    s = s.slice(1)
  }
  if (!s) return { ok: false, error: 'Missing digits.' }
  const m = s.match(/^(\d*)(?:\.(\d+))?$/)
  if (!m || (!m[1] && !m[2])) {
    return { ok: false, error: 'Only digits and a single decimal point are allowed (e.g. 3.14, .5).' }
  }
  const integer = (m[1] || '').replace(/^0+/, '') || '0'
  const fraction = m[2] || ''
  if (integer.length > MAX_DIGITS) {
    return { ok: false, error: `Integer part too large (max ${MAX_DIGITS} digits, up to vigintillions).` }
  }
  if (fraction.length > MAX_DIGITS) {
    return { ok: false, error: `Fraction too long (max ${MAX_DIGITS} decimal places).` }
  }
  return { ok: true, negative, integer, fraction }
}

function chunkInto3(digits: string): { chars: string; level: number }[] {
  const out: { chars: string; level: number }[] = []
  const totalGroups = Math.ceil(digits.length / 3)
  const firstLen = digits.length - (totalGroups - 1) * 3
  for (let i = 0; i < totalGroups; i++) {
    const start = i === 0 ? 0 : firstLen + (i - 1) * 3
    const end = i === 0 ? firstLen : start + 3
    out.push({ chars: digits.slice(start, end), level: totalGroups - 1 - i })
  }
  return out
}

function integerToWords(digits: string, negative: boolean): string {
  if (digits === '0') return negative ? '' : 'zero'
  const groups = chunkInto3(digits)
  const parts: string[] = []
  for (const g of groups) {
    const v = parseInt(g.chars, 10)
    if (v === 0) continue
    const w = below1000(v)
    parts.push(g.level > 0 ? `${w} ${SCALES[g.level]}` : w)
  }
  const joined = parts.join(' ')
  return negative ? `negative ${joined}` : joined
}

export function numberToWords(input: string | number | bigint): string {
  const r = parseDecimal(input)
  if (!r.ok) return ''
  const intWords = integerToWords(r.integer, r.negative)
  if (!r.fraction) return intWords
  const fractionWords = r.fraction
    .split('')
    .map((c) => digitName(+c))
    .join(' ')
  return `${intWords} point ${fractionWords}`
}

export type WordToken = { text: string; group: number | null }

export type SegmentResult =
  | { ok: true; digitTokens: WordToken[]; wordTokens: WordToken[]; warning?: string }
  | { ok: false; error: string }

type WordEmitter = {
  push(text: string, group: number | null, sep?: string): void
}

function makeWordEmitter(): { tokens: WordToken[]; emit: WordEmitter } {
  const tokens: WordToken[] = []
  return {
    tokens,
    emit: {
      push(text, group, sep = ' ') {
        if (tokens.length > 0) tokens.push({ text: sep, group: null })
        tokens.push({ text, group })
      },
    },
  }
}

type GroupCounter = { next(): number }

function makeGroupCounter(start = 0): GroupCounter {
  let n = start
  return {
    next() {
      return n++
    },
  }
}

function emitChunk(
  chars: string,
  digitTokens: WordToken[],
  wordEmit: WordEmitter,
  counter: GroupCounter,
  decompose: boolean
): number {
  const value = parseInt(chars, 10)
  if (value === 0) {
    digitTokens.push({ text: chars, group: null })
    return -1
  }

  const padded = chars.padStart(3, '0')
  const hd = +padded[0]
  const td = +padded[1]
  const od = +padded[2]
  const rest = td * 10 + od
  const groupForChar: (number | null)[] = [null, null, null]
  let lastChunkGroup = -1

  if (hd > 0) {
    const g = counter.next()
    groupForChar[0] = g
    wordEmit.push(`${ONES[hd]} hundred`, g, ' ')
    lastChunkGroup = g
  }

  if (rest > 0) {
    if (rest < 20) {
      const g = counter.next()
      if (rest >= 10) groupForChar[1] = g
      groupForChar[2] = g
      wordEmit.push(ONES[rest], g, ' ')
      lastChunkGroup = g
    } else if (decompose) {
      const gt = counter.next()
      groupForChar[1] = gt
      wordEmit.push(TENS[td], gt, ' ')
      lastChunkGroup = gt
      if (od > 0) {
        const go = counter.next()
        groupForChar[2] = go
        wordEmit.push(ONES[od], go, '-')
        lastChunkGroup = go
      }
    } else {
      const g = counter.next()
      groupForChar[1] = g
      if (od > 0) groupForChar[2] = g
      wordEmit.push(below100(rest), g, ' ')
      lastChunkGroup = g
    }
  }

  const skip = 3 - chars.length
  let i = skip
  while (i < 3) {
    const g = groupForChar[i]
    let j = i
    while (j < 3 && groupForChar[j] === g) j++
    digitTokens.push({ text: padded.slice(i, j), group: g })
    i = j
  }

  return lastChunkGroup
}

function buildIntegerSegments(
  digits: string,
  negative: boolean,
  counter: GroupCounter
): { digitTokens: WordToken[]; wordTokens: WordToken[]; lastGroup: number } {
  const digitTokens: WordToken[] = []
  const { tokens: wordTokens, emit } = makeWordEmitter()

  if (digits === '0') {
    const g = counter.next()
    digitTokens.push({ text: '0', group: g })
    emit.push('zero', g, ' ')
    return { digitTokens, wordTokens, lastGroup: g }
  }

  if (negative) {
    const g = counter.next()
    digitTokens.push({ text: '-', group: g })
    emit.push('negative', g, ' ')
  }

  const groups = chunkInto3(digits)
  const decompose = digits.length <= 3
  let lastNonScaleGroup = -1

  for (let gi = 0; gi < groups.length; gi++) {
    const { chars, level } = groups[gi]
    if (gi > 0) digitTokens.push({ text: ',', group: null })
    const lastGroupOfChunk = emitChunk(chars, digitTokens, emit, counter, decompose)
    if (level > 0 && lastGroupOfChunk >= 0) {
      emit.push(SCALES[level], lastGroupOfChunk, ' ')
    }
    if (lastGroupOfChunk >= 0) lastNonScaleGroup = lastGroupOfChunk
  }

  return { digitTokens, wordTokens, lastGroup: lastNonScaleGroup }
}

function ordinalize(word: string): string {
  const hyphen = word.lastIndexOf('-')
  if (hyphen >= 0) return word.slice(0, hyphen + 1) + ordinalize(word.slice(hyphen + 1))
  const space = word.lastIndexOf(' ')
  if (space >= 0) return word.slice(0, space + 1) + ordinalize(word.slice(space + 1))
  if (word in ORDINAL_REPLACEMENTS) return ORDINAL_REPLACEMENTS[word]
  return `${word}th`
}

function ordinalSuffix(digits: string): string {
  const lastTwo = digits.slice(-2).padStart(2, '0')
  if (lastTwo === '11' || lastTwo === '12' || lastTwo === '13') return 'th'
  switch (digits.slice(-1)) {
    case '1':
      return 'st'
    case '2':
      return 'nd'
    case '3':
      return 'rd'
    default:
      return 'th'
  }
}

function applyOrdinal(
  digitTokens: WordToken[],
  wordTokens: WordToken[],
  digits: string,
  negative: boolean
): void {
  // Replace last colored word token with its ordinal form
  for (let i = wordTokens.length - 1; i >= 0; i--) {
    if (wordTokens[i].group !== null) {
      wordTokens[i] = { text: ordinalize(wordTokens[i].text), group: wordTokens[i].group }
      break
    }
  }
  // Append ordinal suffix to digit display
  if (digits === '0' && !negative) {
    // 0 → "zeroth" already handled. No suffix on the digit display.
    return
  }
  let lastGroup: number | null = null
  for (let i = digitTokens.length - 1; i >= 0; i--) {
    if (digitTokens[i].group !== null) {
      lastGroup = digitTokens[i].group
      break
    }
  }
  digitTokens.push({ text: ordinalSuffix(digits), group: lastGroup })
}

type CurrencyParseResult =
  | {
      ok: true
      negative: boolean
      major: string
      minor: string
      rawMajor: string
      rawFraction: string
      rounded: boolean
    }
  | { ok: false; error: string }

function incrementDigits(s: string): string {
  let carry = 1
  let result = ''
  for (let i = s.length - 1; i >= 0; i--) {
    const d = +s[i] + carry
    if (d >= 10) {
      result = '0' + result
      carry = 1
    } else {
      result = String(d) + result
      carry = 0
    }
  }
  if (carry) result = '1' + result
  return result
}

function roundToDecimals(integer: string, fraction: string, decimals: number): { integer: string; fraction: string } {
  if (fraction.length <= decimals) {
    return { integer, fraction: fraction.padEnd(decimals, '0') }
  }
  const kept = fraction.slice(0, decimals)
  const next = fraction[decimals]
  if (next < '5') return { integer, fraction: kept }
  if (decimals === 0) return { integer: incrementDigits(integer), fraction: '' }
  const incremented = incrementDigits(kept)
  if (incremented.length > kept.length) {
    return { integer: incrementDigits(integer), fraction: incremented.slice(1) }
  }
  return { integer, fraction: incremented }
}

function parseCurrency(input: string, currency: Currency): CurrencyParseResult {
  let s = input.trim()
  // Strip leading currency symbols/letters and any thousands separators
  s = s.replace(/[,_\s$€£¥₹]/g, '')
  s = s.replace(/^[a-zA-Z]+/, '')
  if (!s) return { ok: false, error: 'Empty input.' }
  let negative = false
  if (s[0] === '-') {
    negative = true
    s = s.slice(1)
  } else if (s[0] === '+') {
    s = s.slice(1)
  }
  if (!s) return { ok: false, error: 'Missing digits.' }
  const m = s.match(/^(\d+)(?:\.(\d*))?$/)
  if (!m) return { ok: false, error: 'Enter an amount like 1234 or 1234.56.' }
  const majorRaw = m[1].replace(/^0+/, '') || '0'
  const fractionRaw = m[2] ?? ''
  const rounded = fractionRaw.length > currency.decimals
  const { integer, fraction } = roundToDecimals(majorRaw, fractionRaw, currency.decimals)
  if (integer.length > MAX_DIGITS) {
    return { ok: false, error: `Amount is too large (max ${MAX_DIGITS} digits).` }
  }
  return { ok: true, negative, major: integer, minor: fraction, rawMajor: majorRaw, rawFraction: fractionRaw, rounded }
}

function buildCurrencySegments(input: string, currency: Currency): SegmentResult {
  const r = parseCurrency(input, currency)
  if (!r.ok) return { ok: false, error: r.error }

  const digitTokens: WordToken[] = []
  const { tokens: wordTokens, emit } = makeWordEmitter()
  const counter = makeGroupCounter()

  if (r.negative) {
    digitTokens.push({ text: '-', group: null })
  }
  digitTokens.push({ text: currency.symbol, group: null })

  const majorIsOne = r.major === '1'

  if (r.negative) {
    const g = counter.next()
    emit.push('negative', g, ' ')
  }

  const majorDigitTokens: WordToken[] = []
  if (r.major === '0') {
    const g = counter.next()
    majorDigitTokens.push({ text: '0', group: g })
    emit.push('zero', g, ' ')
  } else {
    const groups = chunkInto3(r.major)
    const decompose = r.major.length <= 3
    for (let gi = 0; gi < groups.length; gi++) {
      const { chars, level } = groups[gi]
      if (gi > 0) majorDigitTokens.push({ text: ',', group: null })
      const last = emitChunk(chars, majorDigitTokens, emit, counter, decompose)
      if (level > 0 && last >= 0) emit.push(SCALES[level], last, ' ')
    }
  }
  digitTokens.push(...majorDigitTokens)

  let lastMajorGroup: number | null = null
  for (let i = wordTokens.length - 1; i >= 0; i--) {
    if (wordTokens[i].group !== null) {
      lastMajorGroup = wordTokens[i].group
      break
    }
  }
  emit.push(majorIsOne ? currency.major.singular : currency.major.plural, lastMajorGroup, ' ')
  const majorTagIdx = wordTokens.length - 1

  if (currency.decimals === 2 && currency.minor) {
    digitTokens.push({ text: '.', group: null })
    const minorValue = parseInt(r.minor, 10)
    if (minorValue === 0) {
      digitTokens.push({ text: r.minor, group: null })
    } else {
      const last = emitChunkForCents(r.minor, digitTokens, emit, counter)
      emit.push(minorValue === 1 ? currency.minor.singular : currency.minor.plural, last, ' ')
      // Replace separator after major tag with " and "
      if (majorTagIdx + 1 < wordTokens.length && wordTokens[majorTagIdx + 1].group === null) {
        wordTokens[majorTagIdx + 1] = { text: ' and ', group: null }
      }
    }
  }

  let warning: string | undefined
  if (r.rounded) {
    const sign = r.negative ? '-' : ''
    const original = `${sign}${r.rawMajor}${r.rawFraction ? '.' + r.rawFraction : ''}`
    const finalAmount = `${sign}${r.major}${currency.decimals > 0 ? '.' + r.minor : ''}`
    const precision =
      currency.decimals === 0
        ? `whole ${currency.major.plural}`
        : `${currency.decimals} decimal places`
    warning = `Rounded ${original} → ${finalAmount} (${currency.code} uses ${precision}).`
  }

  return { ok: true, digitTokens, wordTokens, warning }
}

function emitChunkForCents(
  cents: string,
  digitTokens: WordToken[],
  emit: WordEmitter,
  counter: GroupCounter
): number {
  // cents is exactly 2 chars
  const td = +cents[0]
  const od = +cents[1]
  const value = td * 10 + od
  const groupForChar: (number | null)[] = [null, null]
  let last = -1
  if (value < 20) {
    const g = counter.next()
    if (value >= 10) groupForChar[0] = g
    groupForChar[1] = g
    emit.push(ONES[value], g, ' ')
    last = g
  } else {
    // Decompose tens + ones
    const gt = counter.next()
    groupForChar[0] = gt
    emit.push(TENS[td], gt, ' ')
    last = gt
    if (od > 0) {
      const go = counter.next()
      groupForChar[1] = go
      emit.push(ONES[od], go, '-')
      last = go
    }
  }
  let i = 0
  while (i < 2) {
    const g = groupForChar[i]
    let j = i
    while (j < 2 && groupForChar[j] === g) j++
    digitTokens.push({ text: cents.slice(i, j), group: g })
    i = j
  }
  return last
}

function buildCardinalSegments(input: string): SegmentResult {
  const r = parseDecimal(input)
  if (!r.ok) return { ok: false, error: r.error }

  const counter = makeGroupCounter()
  const built = buildIntegerSegments(r.integer, r.negative, counter)
  const digitTokens = built.digitTokens
  const wordTokens = built.wordTokens

  if (r.fraction) {
    digitTokens.push({ text: '.', group: null })
    wordTokens.push({ text: ' point ', group: null })
    for (let i = 0; i < r.fraction.length; i++) {
      const d = +r.fraction[i]
      const g = counter.next()
      digitTokens.push({ text: r.fraction[i], group: g })
      if (i > 0) wordTokens.push({ text: ' ', group: null })
      wordTokens.push({ text: digitName(d), group: g })
    }
  }

  return { ok: true, digitTokens, wordTokens }
}

export function numberToWordSegments(
  input: string,
  mode: Mode = 'cardinal',
  currency: Currency = DEFAULT_CURRENCY
): SegmentResult {
  if (mode === 'currency') return buildCurrencySegments(input, currency)
  if (mode === 'ordinal') {
    const r = parseDecimal(input)
    if (!r.ok) return { ok: false, error: r.error }
    const counter = makeGroupCounter()
    const built = buildIntegerSegments(r.integer, r.negative, counter)
    applyOrdinal(built.digitTokens, built.wordTokens, r.integer, r.negative)
    const warning = r.fraction
      ? `Ordinals are integers only; decimal part .${r.fraction} dropped.`
      : undefined
    return { ok: true, digitTokens: built.digitTokens, wordTokens: built.wordTokens, warning }
  }
  return buildCardinalSegments(input)
}

export function numberToWordsForMode(
  input: string,
  mode: Mode = 'cardinal',
  currency: Currency = DEFAULT_CURRENCY
): string {
  const seg = numberToWordSegments(input, mode, currency)
  if (!seg.ok) return ''
  return seg.wordTokens.map((t) => t.text).join('')
}
