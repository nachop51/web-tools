import { describe, expect, it } from 'vitest'
import { decodeJwt, formatJwtDate } from './jwt'

const SAMPLE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

describe('decodeJwt', () => {
  it('decodes header alg and typ', () => {
    const { header } = decodeJwt(SAMPLE_JWT)
    expect(header.alg).toBe('HS256')
    expect(header.typ).toBe('JWT')
  })

  it('decodes payload sub and name', () => {
    const { payload } = decodeJwt(SAMPLE_JWT)
    expect(payload.sub).toBe('1234567890')
    expect(payload.name).toBe('John Doe')
  })

  it('decodes payload iat', () => {
    const { payload } = decodeJwt(SAMPLE_JWT)
    expect(payload.iat).toBe(1516239022)
  })

  it('preserves signature as raw base64url string', () => {
    const { signature } = decodeJwt(SAMPLE_JWT)
    expect(signature).toBe('SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c')
  })

  it('throws on token with wrong number of parts', () => {
    expect(() => decodeJwt('abc.def')).toThrow(/3 parts/)
  })

  it('throws on completely invalid input', () => {
    expect(() => decodeJwt('not-a-jwt-at-all')).toThrow()
  })

  it('handles token with leading/trailing whitespace', () => {
    const { header } = decodeJwt(`  ${SAMPLE_JWT}  `)
    expect(header.alg).toBe('HS256')
  })
})

describe('formatJwtDate', () => {
  it('formats unix seconds as ISO string', () => {
    expect(formatJwtDate(0)).toBe('1970-01-01T00:00:00.000Z')
  })

  it('formats a known timestamp', () => {
    expect(formatJwtDate(1516239022)).toBe('2018-01-18T01:30:22.000Z')
  })
})
