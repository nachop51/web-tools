export const MORSE_MAP: Record<string, string> = {
  A: '.-',
  B: '-...',
  C: '-.-.',
  D: '-..',
  E: '.',
  F: '..-.',
  G: '--.',
  H: '....',
  I: '..',
  J: '.---',
  K: '-.-',
  L: '.-..',
  M: '--',
  N: '-.',
  O: '---',
  P: '.--.',
  Q: '--.-',
  R: '.-.',
  S: '...',
  T: '-',
  U: '..-',
  V: '...-',
  W: '.--',
  X: '-..-',
  Y: '-.--',
  Z: '--..',
  '0': '-----',
  '1': '.----',
  '2': '..---',
  '3': '...--',
  '4': '....-',
  '5': '.....',
  '6': '-....',
  '7': '--...',
  '8': '---..',
  '9': '----.',
  '.': '.-.-.-',
  ',': '--..--',
  '?': '..--..',
  "'": '.----.',
  '!': '-.-.--',
  '/': '-..-.',
  '(': '-.--.',
  ')': '-.--.-',
  '&': '.-...',
  ':': '---...',
  ';': '-.-.-.',
  '=': '-...-',
  '+': '.-.-.',
  '-': '-....-',
  _: '..--.-',
  '"': '.-..-.',
  '@': '.--.-.',
  ' ': '/',
}

// Reverse lookup: morse code → character
const REVERSE_MORSE_MAP: Record<string, string> = Object.fromEntries(Object.entries(MORSE_MAP).map(([k, v]) => [v, k]))

export function textToMorse(s: string): string {
  if (s === '') return ''
  return (
    s
      .toUpperCase()
      .split('')
      .map((c) => {
        if (MORSE_MAP[c] !== undefined) return MORSE_MAP[c]
        // Skip unknown characters
        return null
      })
      .filter((c) => c !== null)
      .join(' ')
      .replace(/ \/ /g, ' / ')
      // Collapse multiple consecutive "/" tokens that come from spaces in the original
      .replace(/\s+\/\s+/g, ' / ')
  )
}

export function morseToText(s: string): string {
  if (s.trim() === '') return ''
  // Split on word separator " / "
  const words = s.trim().split(' / ')
  return words
    .map((word) => {
      const chars = word.trim().split(' ')
      return chars
        .map((code) => {
          if (code === '') return ''
          const ch = REVERSE_MORSE_MAP[code]
          if (ch === undefined) {
            throw new Error(`Unrecognized Morse code: '${code}'`)
          }
          return ch
        })
        .join('')
    })
    .join(' ')
}
