export type QuadraticRoot = { type: 'real'; value: number } | { type: 'complex'; real: number; imaginary: number }

export interface QuadraticResult {
  discriminant: number
  roots: QuadraticRoot[]
  nature: 'two-real' | 'one-real' | 'complex'
}

export function solveQuadratic(a: number, b: number, c: number): QuadraticResult {
  if (a === 0) throw new Error("Coefficient 'a' cannot be zero")
  const disc = b * b - 4 * a * c
  if (disc > 0) {
    return {
      discriminant: disc,
      nature: 'two-real',
      roots: [
        { type: 'real', value: (-b + Math.sqrt(disc)) / (2 * a) },
        { type: 'real', value: (-b - Math.sqrt(disc)) / (2 * a) },
      ],
    }
  } else if (disc === 0) {
    return {
      discriminant: 0,
      nature: 'one-real',
      roots: [{ type: 'real', value: -b / (2 * a) }],
    }
  } else {
    const real = -b / (2 * a)
    const imag = Math.sqrt(-disc) / (2 * a)
    return {
      discriminant: disc,
      nature: 'complex',
      roots: [
        { type: 'complex', real, imaginary: imag },
        { type: 'complex', real, imaginary: -imag },
      ],
    }
  }
}
