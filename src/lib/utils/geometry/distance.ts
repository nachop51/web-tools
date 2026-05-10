export type Point2D = { x: number; y: number }
export type Point3D = { x: number; y: number; z: number }

export interface DistanceResult2D {
  distance: number
  manhattan: number
  midpoint: Point2D
  dx: number
  dy: number
}

export interface DistanceResult3D {
  distance: number
  manhattan: number
  midpoint: Point3D
  dx: number
  dy: number
  dz: number
}

export function distance2D(a: Point2D, b: Point2D): DistanceResult2D {
  const dx = b.x - a.x
  const dy = b.y - a.y
  return {
    distance: Math.sqrt(dx * dx + dy * dy),
    manhattan: Math.abs(dx) + Math.abs(dy),
    midpoint: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
    dx,
    dy,
  }
}

export function distance3D(a: Point3D, b: Point3D): DistanceResult3D {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const dz = b.z - a.z
  return {
    distance: Math.sqrt(dx * dx + dy * dy + dz * dz),
    manhattan: Math.abs(dx) + Math.abs(dy) + Math.abs(dz),
    midpoint: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2 },
    dx,
    dy,
    dz,
  }
}
