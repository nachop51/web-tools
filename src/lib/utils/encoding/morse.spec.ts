import { describe, it, expect } from 'vitest'
import { textToMorse, morseToText } from './morse'

describe('textToMorse', () => {
  it("encodes 'SOS'", () => {
    expect(textToMorse('SOS')).toBe('... --- ...')
  })

  it('encodes lowercase (case-insensitive)', () => {
    expect(textToMorse('sos')).toBe('... --- ...')
  })

  it("encodes 'HELLO WORLD' with word separator", () => {
    expect(textToMorse('HELLO WORLD')).toBe('.... . .-.. .-.. --- / .-- --- .-. .-.. -..')
  })

  it('encodes digits', () => {
    expect(textToMorse('42')).toBe('....- ..---')
  })

  it('returns empty for empty string', () => {
    expect(textToMorse('')).toBe('')
  })
})

describe('morseToText', () => {
  it("decodes '... --- ...' to 'SOS'", () => {
    expect(morseToText('... --- ...')).toBe('SOS')
  })

  it('decodes word separator correctly', () => {
    expect(morseToText('.... . .-.. .-.. --- / .-- --- .-. .-.. -..')).toBe('HELLO WORLD')
  })

  it('round-trips text through morse', () => {
    const text = 'HELLO WORLD'
    expect(morseToText(textToMorse(text))).toBe(text)
  })

  it('throws on unrecognized morse code', () => {
    expect(() => morseToText('....---')).toThrow('Unrecognized Morse code')
  })

  it('returns empty for empty string', () => {
    expect(morseToText('')).toBe('')
  })
})
