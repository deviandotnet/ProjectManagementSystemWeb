import { describe, expect, it } from 'vitest'
import { registrationSchema } from './registrationSchema.js'

const validRegistration = {
  firstName: 'Taylor',
  lastName: 'Kim',
  email: 'taylor@example.com',
  password: 'secret1',
  confirmPassword: 'secret1',
}

describe('registrationSchema', () => {
  it('trims names and email without changing password whitespace', () => {
    const result = registrationSchema.parse({
      ...validRegistration,
      firstName: '  Taylor ',
      lastName: ' Kim  ',
      email: '  taylor@example.com ',
      password: '      ',
      confirmPassword: '      ',
    })

    expect(result).toEqual({
      ...validRegistration,
      password: '      ',
      confirmPassword: '      ',
    })
  })

  it('rejects mismatched passwords', () => {
    const result = registrationSchema.safeParse({
      ...validRegistration,
      confirmPassword: 'different',
    })

    expect(result.success).toBe(false)
    expect(result.error.issues[0]).toMatchObject({
      message: 'Passwords must match.',
      path: ['confirmPassword'],
    })
  })

  it('enforces backend field limits', () => {
    const result = registrationSchema.safeParse({
      ...validRegistration,
      firstName: 'a'.repeat(101),
      email: `${'a'.repeat(245)}@example.com`,
      password: 'a'.repeat(101),
      confirmPassword: 'a'.repeat(101),
    })

    expect(result.success).toBe(false)
    expect(result.error.issues.map((issue) => issue.path[0])).toEqual(
      expect.arrayContaining(['firstName', 'email', 'password']),
    )
  })
})
