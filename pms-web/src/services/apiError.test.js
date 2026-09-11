import { describe, expect, it } from 'vitest'
import { normalizeApiError } from './apiError.js'

describe('normalizeApiError', () => {
  it('normalizes network errors', () => {
    const result = normalizeApiError({ isAxiosError: true })

    expect(result.kind).toBe('network')
  })

  it('retains rate-limit retry information', () => {
    const result = normalizeApiError({
      isAxiosError: true,
      response: {
        status: 429,
        headers: { 'retry-after': '30' },
      },
    })

    expect(result.kind).toBe('rate-limit')
    expect(result.retryAfter).toBe('30')
  })
})
