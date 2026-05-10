export type Vec2 = [number, number]
export type Vec3 = [number, number, number]
export type Vec = Vec2 | Vec3

export interface VectorResult2D {
  dim: 2
  magA: number
  magB: number
  sum: Vec2
  diff: Vec2
  dot: number
  cross: number // scalar z-component for 2D
  angleRad: number
  angleDeg: number
  projection: Vec2 | null // projection of A onto B
  unitA: Vec2 | null
  unitB: Vec2 | null
}

export interface VectorResult3D {
  dim: 3
  magA: number
  magB: number
  sum: Vec3
  diff: Vec3
  dot: number
  cross: Vec3
  angleRad: number
  angleDeg: number
  projection: Vec3 | null
  unitA: Vec3 | null
  unitB: Vec3 | null
}

export type VectorResult = VectorResult2D | VectorResult3D

const EPS = 1e-12

function magnitude(v: number[]): number {
  let s = 0
  for (const x of v) s += x * x
  return Math.sqrt(s)
}

function dotProduct(a: number[], b: number[]): number {
  let s = 0
  for (let i = 0; i < a.length; i++) s += a[i] * b[i]
  return s
}

export function vector2D(a: Vec2, b: Vec2): VectorResult2D {
  const magA = magnitude(a)
  const magB = magnitude(b)
  const dot = dotProduct(a, b)
  const cross = a[0] * b[1] - a[1] * b[0]
  let angleRad = NaN
  if (magA > EPS && magB > EPS) {
    const cosT = Math.max(-1, Math.min(1, dot / (magA * magB)))
    angleRad = Math.acos(cosT)
  }
  const projection: Vec2 | null =
    magB > EPS ? [(dot / (magB * magB)) * b[0], (dot / (magB * magB)) * b[1]] : null
  const unitA: Vec2 | null = magA > EPS ? [a[0] / magA, a[1] / magA] : null
  const unitB: Vec2 | null = magB > EPS ? [b[0] / magB, b[1] / magB] : null
  return {
    dim: 2,
    magA,
    magB,
    sum: [a[0] + b[0], a[1] + b[1]],
    diff: [a[0] - b[0], a[1] - b[1]],
    dot,
    cross,
    angleRad,
    angleDeg: (angleRad * 180) / Math.PI,
    projection,
    unitA,
    unitB,
  }
}

export function vector3D(a: Vec3, b: Vec3): VectorResult3D {
  const magA = magnitude(a)
  const magB = magnitude(b)
  const dot = dotProduct(a, b)
  const cross: Vec3 = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
  let angleRad = NaN
  if (magA > EPS && magB > EPS) {
    const cosT = Math.max(-1, Math.min(1, dot / (magA * magB)))
    angleRad = Math.acos(cosT)
  }
  const projection: Vec3 | null =
    magB > EPS
      ? [(dot / (magB * magB)) * b[0], (dot / (magB * magB)) * b[1], (dot / (magB * magB)) * b[2]]
      : null
  const unitA: Vec3 | null = magA > EPS ? [a[0] / magA, a[1] / magA, a[2] / magA] : null
  const unitB: Vec3 | null = magB > EPS ? [b[0] / magB, b[1] / magB, b[2] / magB] : null
  return {
    dim: 3,
    magA,
    magB,
    sum: [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
    diff: [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
    dot,
    cross,
    angleRad,
    angleDeg: (angleRad * 180) / Math.PI,
    projection,
    unitA,
    unitB,
  }
}
