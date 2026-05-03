export type CaesarDirection = 'encode' | 'decode'

const A_UPPER = 65
const A_LOWER = 97

function normalizeShift(shift: number): number {
  // Normalize to [0, 25] even for negative or large values.
  const n = Math.trunc(shift)
  return ((n % 26) + 26) % 26
}

export function caesarShift(text: string, shift: number, direction: CaesarDirection = 'encode'): string {
  const effective = normalizeShift(direction === 'decode' ? -shift : shift)
  if (text === '' || effective === 0) return text

  let out = ''
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i)
    if (code >= A_UPPER && code <= A_UPPER + 25) {
      out += String.fromCharCode(((code - A_UPPER + effective) % 26) + A_UPPER)
    } else if (code >= A_LOWER && code <= A_LOWER + 25) {
      out += String.fromCharCode(((code - A_LOWER + effective) % 26) + A_LOWER)
    } else {
      out += text[i]
    }
  }
  return out
}
