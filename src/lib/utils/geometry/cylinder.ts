export type SolidShape = 'cylinder' | 'cone' | 'frustum'

export interface SolidResult {
  volume: number
  lateralArea: number
  totalArea: number
  slantHeight: number | null
}

export function cylinder(r: number, h: number): SolidResult {
  const volume = Math.PI * r * r * h
  const lateralArea = 2 * Math.PI * r * h
  const baseArea = Math.PI * r * r
  return {
    volume,
    lateralArea,
    totalArea: lateralArea + 2 * baseArea,
    slantHeight: null,
  }
}

export function cone(r: number, h: number): SolidResult {
  const slant = Math.sqrt(r * r + h * h)
  const volume = (1 / 3) * Math.PI * r * r * h
  const lateralArea = Math.PI * r * slant
  const baseArea = Math.PI * r * r
  return {
    volume,
    lateralArea,
    totalArea: lateralArea + baseArea,
    slantHeight: slant,
  }
}

export function frustum(r1: number, r2: number, h: number): SolidResult {
  const dr = r1 - r2
  const slant = Math.sqrt(dr * dr + h * h)
  const volume = (1 / 3) * Math.PI * h * (r1 * r1 + r2 * r2 + r1 * r2)
  const lateralArea = Math.PI * (r1 + r2) * slant
  const baseArea = Math.PI * (r1 * r1 + r2 * r2)
  return {
    volume,
    lateralArea,
    totalArea: lateralArea + baseArea,
    slantHeight: slant,
  }
}

export function solveSolid(
  shape: SolidShape,
  inputs: { r?: number; r1?: number; r2?: number; h: number }
): SolidResult {
  switch (shape) {
    case 'cylinder':
      return cylinder(inputs.r ?? 0, inputs.h)
    case 'cone':
      return cone(inputs.r ?? 0, inputs.h)
    case 'frustum':
      return frustum(inputs.r1 ?? 0, inputs.r2 ?? 0, inputs.h)
  }
}
