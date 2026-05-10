import { describe, expect, it } from 'vitest'
import { fromRadians, inverseTrig, toRadians, trigOf, formatRadAsPi } from './trig'

describe('toRadians / fromRadians', () => {
  it('deg ↔ rad', () => {
    expect(toRadians(180, 'deg')).toBeCloseTo(Math.PI)
    expect(fromRadians(Math.PI, 'deg')).toBeCloseTo(180)
  })
  it('grad ↔ rad', () => {
    expect(toRadians(200, 'grad')).toBeCloseTo(Math.PI)
    expect(fromRadians(Math.PI, 'grad')).toBeCloseTo(200)
  })
  it('turn ↔ rad', () => {
    expect(toRadians(1, 'turn')).toBeCloseTo(Math.PI * 2)
    expect(fromRadians(Math.PI * 2, 'turn')).toBeCloseTo(1)
  })
})

describe('trigOf', () => {
  it('exact values at 0', () => {
    const r = trigOf(0)
    const sin = r.values.find((v) => v.fn === 'sin')!
    const cos = r.values.find((v) => v.fn === 'cos')!
    expect(sin.exact).toBe('0')
    expect(cos.exact).toBe('1')
    expect(sin.decimal).toBe(0)
    expect(cos.decimal).toBe(1)
  })

  it('exact values at 30°', () => {
    const r = trigOf(toRadians(30, 'deg'))
    const sin = r.values.find((v) => v.fn === 'sin')!
    const cos = r.values.find((v) => v.fn === 'cos')!
    expect(sin.exact).toBe('1/2')
    expect(cos.exact).toBe('√3/2')
    expect(sin.decimal).toBeCloseTo(0.5)
  })

  it('exact values at 45°', () => {
    const r = trigOf(toRadians(45, 'deg'))
    const tan = r.values.find((v) => v.fn === 'tan')!
    expect(tan.exact).toBe('1')
    expect(tan.decimal).toBeCloseTo(1)
  })

  it('tan undefined at 90°', () => {
    const r = trigOf(toRadians(90, 'deg'))
    const tan = r.values.find((v) => v.fn === 'tan')!
    expect(tan.exact).toBe('undefined')
    expect(isFinite(tan.decimal)).toBe(false)
  })

  it('csc=1/sin at 30°', () => {
    const r = trigOf(toRadians(30, 'deg'))
    const csc = r.values.find((v) => v.fn === 'csc')!
    expect(csc.decimal).toBeCloseTo(2)
    expect(csc.exact).toBe('2')
  })

  it('non-special angle has null exact', () => {
    const r = trigOf(toRadians(17, 'deg'))
    expect(r.values.every((v) => v.exact === null)).toBe(true)
  })
})

describe('inverseTrig', () => {
  it('asin(1) = π/2', () => {
    const r = inverseTrig('asin', 1)
    expect(r.rad).toBeCloseTo(Math.PI / 2)
    expect(r.deg).toBeCloseTo(90)
    expect(r.valid).toBe(true)
  })
  it('asin out of range invalid', () => {
    const r = inverseTrig('asin', 2)
    expect(r.valid).toBe(false)
    expect(isNaN(r.rad)).toBe(true)
  })
  it('atan handles any number', () => {
    const r = inverseTrig('atan', 1)
    expect(r.deg).toBeCloseTo(45)
    expect(r.valid).toBe(true)
  })
})

describe('formatRadAsPi', () => {
  it('π/2', () => {
    expect(formatRadAsPi(Math.PI / 2)).toBe('π/2')
  })
  it('π', () => {
    expect(formatRadAsPi(Math.PI)).toBe('π')
  })
  it('-π/3', () => {
    expect(formatRadAsPi(-Math.PI / 3)).toBe('-π/3')
  })
  it('2π', () => {
    expect(formatRadAsPi(2 * Math.PI)).toBe('2π')
  })
  it('non-special returns null', () => {
    expect(formatRadAsPi(1.234)).toBeNull()
  })
})
