export type AngleUnit = 'deg' | 'rad' | 'grad' | 'turn'

export type TrigFn = 'sin' | 'cos' | 'tan' | 'csc' | 'sec' | 'cot'

export interface TrigValue {
  fn: TrigFn
  exact: string | null
  decimal: number
}

export interface TrigResult {
  radians: number
  degrees: number
  values: TrigValue[]
}

const TWO_PI = Math.PI * 2

export function toRadians(value: number, unit: AngleUnit): number {
  switch (unit) {
    case 'rad':
      return value
    case 'deg':
      return (value * Math.PI) / 180
    case 'grad':
      return (value * Math.PI) / 200
    case 'turn':
      return value * TWO_PI
  }
}

export function fromRadians(rad: number, unit: AngleUnit): number {
  switch (unit) {
    case 'rad':
      return rad
    case 'deg':
      return (rad * 180) / Math.PI
    case 'grad':
      return (rad * 200) / Math.PI
    case 'turn':
      return rad / TWO_PI
  }
}

const SPECIAL_DEG: Array<{ deg: number; sin: string; cos: string; tan: string }> = [
  { deg: 0, sin: '0', cos: '1', tan: '0' },
  { deg: 30, sin: '1/2', cos: '√3/2', tan: '√3/3' },
  { deg: 45, sin: '√2/2', cos: '√2/2', tan: '1' },
  { deg: 60, sin: '√3/2', cos: '1/2', tan: '√3' },
  { deg: 90, sin: '1', cos: '0', tan: 'undefined' },
  { deg: 120, sin: '√3/2', cos: '-1/2', tan: '-√3' },
  { deg: 135, sin: '√2/2', cos: '-√2/2', tan: '-1' },
  { deg: 150, sin: '1/2', cos: '-√3/2', tan: '-√3/3' },
  { deg: 180, sin: '0', cos: '-1', tan: '0' },
  { deg: 210, sin: '-1/2', cos: '-√3/2', tan: '√3/3' },
  { deg: 225, sin: '-√2/2', cos: '-√2/2', tan: '1' },
  { deg: 240, sin: '-√3/2', cos: '-1/2', tan: '√3' },
  { deg: 270, sin: '-1', cos: '0', tan: 'undefined' },
  { deg: 300, sin: '-√3/2', cos: '1/2', tan: '-√3' },
  { deg: 315, sin: '-√2/2', cos: '√2/2', tan: '-1' },
  { deg: 330, sin: '-1/2', cos: '√3/2', tan: '-√3/3' },
]

function reciprocalExact(s: string): string {
  if (s === '0') return 'undefined'
  if (s === 'undefined') return '0'
  if (s === '1') return '1'
  if (s === '-1') return '-1'
  const reciprocals: Record<string, string> = {
    '1/2': '2',
    '-1/2': '-2',
    '√3/2': '2√3/3',
    '-√3/2': '-2√3/3',
    '√2/2': '√2',
    '-√2/2': '-√2',
    '√3/3': '√3',
    '-√3/3': '-√3',
    '√3': '√3/3',
    '-√3': '-√3/3',
  }
  return reciprocals[s] ?? `1/(${s})`
}

function specialFor(rad: number): { sin: string; cos: string; tan: string } | null {
  let deg = ((rad * 180) / Math.PI) % 360
  if (deg < 0) deg += 360
  for (const s of SPECIAL_DEG) {
    if (Math.abs(deg - s.deg) < 1e-9) return { sin: s.sin, cos: s.cos, tan: s.tan }
  }
  return null
}

function safeDecimal(n: number): number {
  if (!isFinite(n)) return n
  if (Math.abs(n) < 1e-12) return 0
  return n
}

export function trigOf(rad: number): TrigResult {
  const exact = specialFor(rad)
  const sinV = safeDecimal(Math.sin(rad))
  const cosV = safeDecimal(Math.cos(rad))
  const tanV = safeDecimal(Math.tan(rad))

  const tanIsUndef = exact?.tan === 'undefined' || cosV === 0
  const tanFinal = tanIsUndef ? Infinity : tanV
  const csc = sinV === 0 ? Infinity : 1 / sinV
  const sec = cosV === 0 ? Infinity : 1 / cosV
  const cot = tanV === 0 ? Infinity : tanIsUndef ? 0 : 1 / tanV

  const values: TrigValue[] = [
    { fn: 'sin', exact: exact ? exact.sin : null, decimal: sinV },
    { fn: 'cos', exact: exact ? exact.cos : null, decimal: cosV },
    { fn: 'tan', exact: exact ? exact.tan : null, decimal: tanFinal },
    { fn: 'csc', exact: exact ? reciprocalExact(exact.sin) : null, decimal: csc },
    { fn: 'sec', exact: exact ? reciprocalExact(exact.cos) : null, decimal: sec },
    { fn: 'cot', exact: exact ? reciprocalExact(exact.tan) : null, decimal: cot },
  ]

  return {
    radians: rad,
    degrees: (rad * 180) / Math.PI,
    values,
  }
}

export type InverseFn = 'asin' | 'acos' | 'atan'

export interface InverseResult {
  rad: number
  deg: number
  grad: number
  turn: number
  valid: boolean
}

export function inverseTrig(fn: InverseFn, value: number): InverseResult {
  if (!isFinite(value)) return { rad: NaN, deg: NaN, grad: NaN, turn: NaN, valid: false }
  let rad: number
  switch (fn) {
    case 'asin':
      if (value < -1 || value > 1) return { rad: NaN, deg: NaN, grad: NaN, turn: NaN, valid: false }
      rad = Math.asin(value)
      break
    case 'acos':
      if (value < -1 || value > 1) return { rad: NaN, deg: NaN, grad: NaN, turn: NaN, valid: false }
      rad = Math.acos(value)
      break
    case 'atan':
      rad = Math.atan(value)
      break
  }
  return {
    rad,
    deg: (rad * 180) / Math.PI,
    grad: (rad * 200) / Math.PI,
    turn: rad / TWO_PI,
    valid: true,
  }
}

// Pretty-print a radian value in terms of π for special angles, otherwise return null.
export function formatRadAsPi(rad: number): string | null {
  if (rad === 0) return '0'
  const ratio = rad / Math.PI
  const denominators = [1, 2, 3, 4, 6, 12]
  for (const d of denominators) {
    const num = ratio * d
    if (Math.abs(num - Math.round(num)) < 1e-9) {
      const n = Math.round(num)
      if (n === 0) return '0'
      const sign = n < 0 ? '-' : ''
      const a = Math.abs(n)
      if (d === 1) return `${sign}${a === 1 ? '' : a}π`
      if (a === 1) return `${sign}π/${d}`
      return `${sign}${a}π/${d}`
    }
  }
  return null
}
