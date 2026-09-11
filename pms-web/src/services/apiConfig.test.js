import { describe, expect, it } from 'vitest'
import { normalizeApiBaseUrl } from './apiConfig.js'

describe('normalizeApiBaseUrl', () => {
  it.each([
    ['http://localhost:5141', 'http://localhost:5141/api'],
    ['http://localhost:5141/', 'http://localhost:5141/api'],
    ['http://localhost:5141/api/', 'http://localhost:5141/api'],
    ['http://localhost:5141/api/api', 'http://localhost:5141/api'],
    ['https://example.com/backend', 'https://example.com/backend/api'],
  ])('normalizes %s', (input, expected) => {
    expect(normalizeApiBaseUrl(input)).toBe(expected)
  })

  it('rejects missing configuration', () => {
    expect(() => normalizeApiBaseUrl('')).toThrow(
      'VITE_API_BASE_URL is required.',
    )
  })

  it('rejects non-HTTP URLs', () => {
    expect(() => normalizeApiBaseUrl('file:///tmp/api')).toThrow(
      'VITE_API_BASE_URL must use HTTP or HTTPS.',
    )
  })
})
