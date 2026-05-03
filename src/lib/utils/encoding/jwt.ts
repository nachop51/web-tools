export type JwtParts = {
  header: Record<string, unknown>
  payload: Record<string, unknown>
  signature: string
}

function base64urlDecode(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
  return atob(padded)
}

export function decodeJwt(token: string): JwtParts {
  const trimmed = token.trim()
  const parts = trimmed.split('.')

  if (parts.length !== 3) {
    throw new Error(`JWT must have 3 parts separated by ".", got ${parts.length}`)
  }

  const [rawHeader, rawPayload, signature] = parts

  let header: Record<string, unknown>
  try {
    header = JSON.parse(base64urlDecode(rawHeader))
  } catch {
    throw new Error('Failed to decode JWT header. Invalid base64url or JSON')
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(base64urlDecode(rawPayload))
  } catch {
    throw new Error('Failed to decode JWT payload. Invalid base64url or JSON')
  }

  return { header, payload, signature }
}

export function formatJwtDate(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toISOString()
}
