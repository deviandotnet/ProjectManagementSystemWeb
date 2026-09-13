import { z } from 'zod'

const requiredName = (label) =>
  z
    .string()
    .trim()
    .min(1, `Enter your ${label.toLowerCase()}.`)
    .max(100, `${label} must be 100 characters or fewer.`)

export const registrationSchema = z
  .object({
    firstName: requiredName('First name'),
    lastName: requiredName('Last name'),
    email: z
      .string()
      .trim()
      .min(1, 'Enter your email address.')
      .max(256, 'Email address must be 256 characters or fewer.')
      .email('Enter a valid email address.'),
    password: z
      .string()
      .min(1, 'Enter a password.')
      .min(6, 'Password must be at least 6 characters.')
      .max(100, 'Password must be 100 characters or fewer.'),
    confirmPassword: z.string().min(1, 'Confirm your password.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords must match.',
    path: ['confirmPassword'],
  })
