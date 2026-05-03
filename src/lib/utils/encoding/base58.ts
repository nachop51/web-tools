const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

export function encodeBase58(input: string): string {
  if (input === '') return ''
  const bytes = new TextEncoder().encode(input)

  // Count leading zero bytes
  let leadingZeros = 0
  for (const b of bytes) {
    if (b !== 0) break
    leadingZeros++
  }

  // Convert bytes to BigInt
  let num = 0n
  for (const b of bytes) {
    num = num * 256n + BigInt(b)
  }

  // Convert BigInt to base58 digits
  const digits: string[] = []
  while (num > 0n) {
    const rem = num % 58n
    num = num / 58n
    digits.push(BASE58_ALPHABET[Number(rem)])
  }

  // Prepend '1' for each leading zero byte
  return '1'.repeat(leadingZeros) + digits.reverse().join('')
}

export function decodeBase58(input: string): string {
  if (input === '') return ''

  // Count leading '1's
  let leadingOnes = 0
  for (const c of input) {
    if (c !== '1') break
    leadingOnes++
  }

  // Convert base58 characters to BigInt
  let num = 0n
  for (const c of input) {
    const idx = BASE58_ALPHABET.indexOf(c)
    if (idx === -1) {
      throw new Error(`Invalid Base58 character: '${c}'`)
    }
    num = num * 58n + BigInt(idx)
  }

  // Convert BigInt to byte array
  const byteList: number[] = []
  while (num > 0n) {
    byteList.push(Number(num % 256n))
    num = num / 256n
  }

  // Prepend leading zero bytes
  const result = new Uint8Array(leadingOnes + byteList.length)
  for (let i = 0; i < leadingOnes; i++) result[i] = 0
  byteList.reverse()
  for (let i = 0; i < byteList.length; i++) result[leadingOnes + i] = byteList[i]

  return new TextDecoder().decode(result)
}
