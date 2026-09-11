import { describe, expect, it } from 'vitest'
import { ApiError } from '../../../services/apiError.js'
import { getUserIdFromAccessToken, parseTokenPair } from './authService.js'

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

describe('authService contracts', () => {
  it('parses the exact token-pair response', () => {
    expect(
      parseTokenPair({ accessToken: 'access', refreshToken: 'refresh' }),
    ).toEqual({ accessToken: 'access', refreshToken: 'refresh' })
  })

  it('rejects malformed token responses', () => {
    expect(() => parseTokenPair({ accessToken: 'access' })).toThrow(ApiError)
  })

  it('reads the user id from the JWT subject', () => {
    const token = `${encode({ alg: 'none' })}.${encode({ sub: 'user-123' })}.signature`

    expect(getUserIdFromAccessToken(token)).toBe('user-123')
  })
})
