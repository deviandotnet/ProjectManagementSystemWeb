import { describe, expect, it } from 'vitest'
import { loginSchema } from './loginSchema.js'

describe('loginSchema', () => {
  it('accepts valid credentials and trims only the email', () => {
    const result = loginSchema.parse({
      email: '  member@example.com  ',
      password: ' pass word ',
    })

    expect(result).toEqual({
      email: 'member@example.com',
      password: ' pass word ',
    })
  })

  it.each([
    [{ email: '', password: 'secret1' }, 'Enter your email address.'],
    [
      { email: 'not-an-email', password: 'secret1' },
      'Enter a valid email address.',
    ],
    [
      { email: 'member@example.com', password: 'short' },
      'Password must be at least 6 characters.',
    ],
  ])('rejects invalid credentials', (credentials, message) => {
    const result = loginSchema.safeParse(credentials)

    expect(result.success).toBe(false)
    expect(result.error.issues.some((issue) => issue.message === message)).toBe(
      true,
    )
  })
})
