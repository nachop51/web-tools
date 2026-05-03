export function isPrime(n: number): boolean {
  if (!Number.isInteger(n) || n < 2) return false
  if (n === 2) return true
  if (n % 2 === 0) return false
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false
  }
  return true
}

export function primeFactors(n: number): number[] {
  if (n < 2) return []
  const factors: number[] = []
  let d = 2
  let num = n
  while (d * d <= num) {
    while (num % d === 0) {
      factors.push(d)
      num = num / d
    }
    d++
  }
  if (num > 1) factors.push(num)
  return factors
}

export function primeFactorsGrouped(n: number): Array<{ prime: number; exponent: number }> {
  const factors = primeFactors(n)
  const map = new Map<number, number>()
  for (const f of factors) map.set(f, (map.get(f) ?? 0) + 1)
  return Array.from(map.entries()).map(([prime, exponent]) => ({ prime, exponent }))
}

// Sieve of Eratosthenes, max 10000
export function primesUpTo(max: number): number[] {
  if (max < 2) return []
  max = Math.min(max, 10000)
  const sieve = new Uint8Array(max + 1).fill(1)
  sieve[0] = sieve[1] = 0
  for (let i = 2; i * i <= max; i++) {
    if (sieve[i]) {
      for (let j = i * i; j <= max; j += i) sieve[j] = 0
    }
  }
  const result: number[] = []
  for (let i = 2; i <= max; i++) {
    if (sieve[i]) result.push(i)
  }
  return result
}
