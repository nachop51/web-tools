export interface ModuloResult {
  quotient: number
  remainder: number
  remainderPython: number
  remainderMath: number
  proof: string
}

export function modulo(a: number, m: number): ModuloResult {
  if (m === 0) throw new Error('Modulus cannot be zero')
  const quotient = Math.trunc(a / m)
  const remainder = a % m
  const remainderPython = ((a % m) + m) % m
  const remainderMath = ((a % Math.abs(m)) + Math.abs(m)) % Math.abs(m)
  return {
    quotient,
    remainder,
    remainderPython,
    remainderMath,
    proof: `${a} = ${quotient} × ${m} + ${remainder}`,
  }
}
