export interface LineResult {
  slope: number // Infinity for vertical
  yIntercept: number // NaN for vertical
  xIntercept: number // NaN for horizontal y = b ≠ 0; equals constant for vertical
  slopeIntercept: string
  pointSlope: string
  standardForm: string
  inclinationDeg: number
  inclinationRad: number
  vertical: boolean
  horizontal: boolean
  // The two reference points / point used
  x0: number
  y0: number
}

const EPS = 1e-12

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '-'
  return parseFloat(n.toPrecision(10)).toString()
}

function fmtSign(n: number): string {
  if (n >= 0) return ` + ${fmt(n)}`
  return ` - ${fmt(-n)}`
}

function buildLineResult(x0: number, y0: number, slope: number): LineResult {
  if (!isFinite(slope)) {
    // vertical line x = x0
    return {
      slope: Infinity,
      yIntercept: NaN,
      xIntercept: x0,
      slopeIntercept: 'undefined (vertical line)',
      pointSlope: `x = ${fmt(x0)}`,
      standardForm: `x = ${fmt(x0)}`,
      inclinationDeg: 90,
      inclinationRad: Math.PI / 2,
      vertical: true,
      horizontal: false,
      x0,
      y0,
    }
  }
  const horizontal = Math.abs(slope) < EPS
  const yInt = y0 - slope * x0
  // standard: Ax + By = C with integer-friendly when easy: −m x + y = b → m x − y = −b → mx − y + b = 0 ; we'll keep -m, 1, b form
  // Use Ax + By = C with A = -slope, B = 1, C = yInt
  let std: string
  if (horizontal) {
    std = `y = ${fmt(yInt)}`
  } else {
    std = `${fmt(-slope)}x + y = ${fmt(yInt)}`
  }
  const slopeIntercept = horizontal
    ? `y = ${fmt(yInt)}`
    : `y = ${slope === 1 ? '' : slope === -1 ? '-' : fmt(slope)}x${yInt === 0 ? '' : fmtSign(yInt)}`
  const pointSlope = `y${y0 >= 0 ? ' - ' + fmt(y0) : ' + ' + fmt(-y0)} = ${fmt(slope)}(x${
    x0 >= 0 ? ' - ' + fmt(x0) : ' + ' + fmt(-x0)
  })`
  const inclinationRad = Math.atan(slope)
  const inclinationDeg = (inclinationRad * 180) / Math.PI
  const xInt = horizontal ? (Math.abs(yInt) < EPS ? 0 : NaN) : -yInt / slope

  return {
    slope,
    yIntercept: yInt,
    xIntercept: xInt,
    slopeIntercept,
    pointSlope,
    standardForm: std,
    inclinationDeg,
    inclinationRad,
    vertical: false,
    horizontal,
    x0,
    y0,
  }
}

export function lineFromTwoPoints(x1: number, y1: number, x2: number, y2: number): LineResult {
  const dx = x2 - x1
  const dy = y2 - y1
  const slope = Math.abs(dx) < EPS ? Infinity : dy / dx
  return buildLineResult(x1, y1, slope)
}

export function lineFromPointSlope(x: number, y: number, slope: number): LineResult {
  return buildLineResult(x, y, slope)
}
