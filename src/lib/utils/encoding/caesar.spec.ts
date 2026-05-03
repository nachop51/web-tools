import { describe, expect, it } from 'vitest'
import { caesarShift } from './caesar'

describe('caesarShift', () => {
  it('encodes with shift=3 (ABC → DEF)', () => {
    expect(caesarShift('ABC', 3, 'encode')).toBe('DEF')
  })

  it('decodes with shift=3 (DEF → ABC)', () => {
    expect(caesarShift('DEF', 3, 'decode')).toBe('ABC')
  })

  it('ROT13 is symmetric for encode and decode', () => {
    const text = 'Hello, World!'
    const encoded = caesarShift(text, 13, 'encode')
    expect(encoded).toBe('Uryyb, Jbeyq!')
    expect(caesarShift(encoded, 13, 'decode')).toBe(text)
    // Encoding twice with ROT13 returns the original
    expect(caesarShift(encoded, 13, 'encode')).toBe(text)
  })

  it('preserves non-alphabetic characters', () => {
    expect(caesarShift('Hi, 123!', 5, 'encode')).toBe('Mn, 123!')
    expect(caesarShift('a-b_c d.e', 1, 'encode')).toBe('b-c_d e.f')
  })

  it('preserves case', () => {
    expect(caesarShift('AbCdEf', 2, 'encode')).toBe('CdEfGh')
    expect(caesarShift('xYz', 3, 'encode')).toBe('aBc')
  })

  it('wraps around (Z+1 → A, z+1 → a)', () => {
    expect(caesarShift('Z', 1, 'encode')).toBe('A')
    expect(caesarShift('z', 1, 'encode')).toBe('a')
    expect(caesarShift('XYZ', 3, 'encode')).toBe('ABC')
    expect(caesarShift('A', 1, 'decode')).toBe('Z')
  })

  it('returns input unchanged for shift=0', () => {
    expect(caesarShift('Hello', 0, 'encode')).toBe('Hello')
    expect(caesarShift('Hello', 0, 'decode')).toBe('Hello')
  })

  it('normalizes shifts outside 0–25', () => {
    expect(caesarShift('ABC', 29, 'encode')).toBe('DEF') // 29 mod 26 = 3
    expect(caesarShift('ABC', -23, 'encode')).toBe('DEF') // -23 mod 26 = 3
  })

  it('handles empty string', () => {
    expect(caesarShift('', 5, 'encode')).toBe('')
  })
})
