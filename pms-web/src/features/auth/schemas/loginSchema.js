import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Enter your email address.')
    .max(255, 'Email address must be 255 characters or fewer.')
    .email('Enter a valid email address.'),
  password: z
    .string()
    .min(1, 'Enter your password.')
    .min(6, 'Password must be at least 6 characters.'),
})
