export type HashAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'
export const hashAlgorithms: HashAlgorithm[] = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']

export async function hashText(text: string, algorithm: HashAlgorithm): Promise<string> {
  const encoded = new TextEncoder().encode(text)
  const buffer = await crypto.subtle.digest(algorithm, encoded)
  const bytes = new Uint8Array(buffer)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
