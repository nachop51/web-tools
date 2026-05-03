export type PasswordOpts = {
  length: number
  upper: boolean
  lower: boolean
  digits: boolean
  symbols: boolean
}

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWER = 'abcdefghijklmnopqrstuvwxyz'
const DIGITS = '0123456789'
const SYMBOLS = '!@#$%^&*()-_=+[]{}|;:,.<>?'

export function generatePassword(opts: PasswordOpts): string {
  let charset = ''
  if (opts.upper) charset += UPPER
  if (opts.lower) charset += LOWER
  if (opts.digits) charset += DIGITS
  if (opts.symbols) charset += SYMBOLS
  if (!charset) return ''

  const len = opts.length
  const rand = crypto.getRandomValues(new Uint32Array(len))
  let result = ''
  for (let i = 0; i < len; i++) {
    result += charset[rand[i] % charset.length]
  }
  return result
}

export function calcEntropy(charsetSize: number, length: number): number {
  return length * Math.log2(charsetSize)
}

export function strengthLabel(entropy: number): 'Weak' | 'Fair' | 'Strong' | 'Very strong' {
  if (entropy < 28) return 'Weak'
  if (entropy < 60) return 'Fair'
  if (entropy < 100) return 'Strong'
  return 'Very strong'
}

// --- Passphrase ---

const WORDLIST: readonly string[] = [
  'above',
  'adapt',
  'adept',
  'agile',
  'alarm',
  'alert',
  'amber',
  'angel',
  'anvil',
  'ardor',
  'armor',
  'array',
  'arrow',
  'atlas',
  'azure',
  'apple',
  'badge',
  'basin',
  'beach',
  'bench',
  'birch',
  'blade',
  'blaze',
  'blend',
  'bloom',
  'board',
  'brave',
  'brook',
  'build',
  'brisk',
  'bronze',
  'brief',
  'cabin',
  'cedar',
  'chain',
  'chase',
  'civic',
  'cliff',
  'clock',
  'cloud',
  'coast',
  'coral',
  'craft',
  'crisp',
  'cross',
  'crown',
  'curve',
  'cycle',
  'dawn',
  'delta',
  'dense',
  'depot',
  'depth',
  'dome',
  'drift',
  'drone',
  'dusk',
  'dwarf',
  'eager',
  'eagle',
  'earth',
  'ember',
  'empty',
  'exist',
  'exact',
  'feast',
  'field',
  'fjord',
  'flame',
  'flask',
  'fleet',
  'flora',
  'float',
  'fluid',
  'flint',
  'forge',
  'frost',
  'gauge',
  'ghost',
  'glass',
  'globe',
  'glyph',
  'grace',
  'grand',
  'grove',
  'guard',
  'guide',
  'grain',
  'harbor',
  'harsh',
  'haven',
  'hedge',
  'helix',
  'hollow',
  'honor',
  'hover',
  'hound',
  'humid',
  'ideal',
  'ivory',
  'jewel',
  'joust',
  'judge',
  'juror',
  'keen',
  'lance',
  'latch',
  'learn',
  'ledge',
  'light',
  'lotus',
  'loyal',
  'lunar',
  'lyric',
  'magic',
  'major',
  'maple',
  'march',
  'marsh',
  'match',
  'mist',
  'model',
  'moon',
  'mural',
  'nerve',
  'noble',
  'north',
  'nymph',
  'ocean',
  'omega',
  'orbit',
  'order',
  'outer',
  'ozone',
  'panel',
  'patch',
  'pearl',
  'pilot',
  'pixel',
  'plain',
  'plume',
  'polar',
  'prism',
  'probe',
  'proof',
  'proud',
  'pulse',
  'quest',
  'quick',
  'quiet',
  'radar',
  'range',
  'rapid',
  'realm',
  'relay',
  'ridge',
  'rigid',
  'river',
  'rocky',
  'rouge',
  'round',
  'royal',
  'rune',
  'scout',
  'shard',
  'sharp',
  'shift',
  'shore',
  'signal',
  'slice',
  'slope',
  'smoke',
  'solar',
  'solid',
  'spark',
  'speed',
  'spire',
  'split',
  'staff',
  'stark',
  'steel',
  'stern',
  'stone',
  'storm',
  'stride',
  'swift',
  'sword',
  'table',
  'tempo',
  'theme',
  'thorn',
  'tidal',
  'token',
  'torch',
  'tower',
  'trace',
  'track',
  'trail',
  'trend',
  'tribe',
  'trove',
  'trust',
  'ultra',
  'union',
  'urban',
  'valid',
  'valor',
  'vault',
  'vapor',
  'venom',
  'vital',
  'vivid',
  'vocal',
  'voice',
  'water',
  'whale',
  'wheel',
  'white',
  'whole',
  'wield',
  'witch',
  'world',
  'yield',
  'acorn',
  'aisle',
  'agony',
  'basis',
  'batch',
  'bayou',
  'blunt',
  'blush',
  'boast',
  'bonus',
  'brace',
  'chasm',
  'chief',
  'chime',
  'chord',
  'cloak',
  'comet',
  'creek',
  'crimp',
  'crude',
  'crush',
  'dance',
  'debug',
  'decor',
  'digit',
  'drape',
  'druid',
  'elbow',
  'elite',
  'elven',
  'embed',
  'excel',
  'edgy',
]

if (WORDLIST.length !== 256) {
  // dev-time invariant; passphrase entropy assumes 256-word list
  // eslint-disable-next-line no-console
  console.warn(`WORDLIST length is ${WORDLIST.length}, expected 256`)
}

export type PassphraseOpts = {
  wordCount: number
  separator: string // " " | "-" | "." | ""
  capitalize: boolean
  appendNumber: boolean
}

export function generatePassphrase(opts: PassphraseOpts): string {
  if (opts.wordCount <= 0) return ''
  const idx = crypto.getRandomValues(new Uint32Array(opts.wordCount))
  const words = Array.from(idx).map((n) => {
    const w = WORDLIST[n % WORDLIST.length]
    return opts.capitalize ? w[0].toUpperCase() + w.slice(1) : w
  })
  let out = words.join(opts.separator)
  if (opts.appendNumber) {
    const n = crypto.getRandomValues(new Uint8Array(1))[0] % 100
    out += opts.separator + String(n).padStart(2, '0')
  }
  return out
}

export function passphraseEntropy(wordCount: number): number {
  return wordCount * Math.log2(WORDLIST.length)
}

export function passphraseWordlistSize(): number {
  return WORDLIST.length
}

// --- Random key ---

export type KeyFormat = 'hex' | 'base64' | 'urlsafe'

export function generateKey(bytes: number, format: KeyFormat): string {
  if (bytes <= 0) return ''
  const buf = crypto.getRandomValues(new Uint8Array(bytes))
  if (format === 'hex') {
    return Array.from(buf)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }
  let bin = ''
  for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i])
  const b64 = btoa(bin)
  if (format === 'base64') return b64
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export function keyEntropy(bytes: number): number {
  return bytes * 8
}
