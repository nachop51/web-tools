import { describe, expect, it } from 'vitest'
import { convertTemp } from './temperature'

describe('temperature conversions', () => {
  it('converts 0°C to 32°F', () => {
    expect(convertTemp(0, 'c', 'f')).toBe(32)
  })

  it('converts 100°C to 212°F', () => {
    expect(convertTemp(100, 'c', 'f')).toBe(212)
  })

  it('converts 0°C to 273.15 K', () => {
    expect(convertTemp(0, 'c', 'k')).toBe(273.15)
  })

  it('converts -40°C to -40°F', () => {
    expect(convertTemp(-40, 'c', 'f')).toBe(-40)
  })

  it('round-trips 0°C → K → °C = 0', () => {
    const kelvin = convertTemp(0, 'c', 'k')
    const backToCelsius = convertTemp(kelvin, 'k', 'c')
    expect(backToCelsius).toBeCloseTo(0, 10)
  })

  it('returns NaN for NaN input', () => {
    expect(convertTemp(NaN, 'c', 'f')).toBeNaN()
  })
})
