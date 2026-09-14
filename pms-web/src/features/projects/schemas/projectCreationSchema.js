import { z } from 'zod'
import { isDateOnly } from '../../../components/forms/index.js'

const requiredDate = (label) =>
  z
    .string()
    .min(1, `Select the ${label}.`)
    .refine(isDateOnly, `Select a valid ${label}.`)

export const projectCreationSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Enter a project name.')
      .max(200, 'Project name must not exceed 200 characters.'),
    description: z.string(),
    startDate: requiredDate('start date'),
    endDate: requiredDate('end date'),
    weekStartDay: z.number().int().min(0).max(6),
    defaultTimelineScale: z.number().int().min(1).max(5),
    progressMode: z.number().int().min(1).max(2),
  })
  .superRefine((value, context) => {
    if (
      isDateOnly(value.startDate) &&
      isDateOnly(value.endDate) &&
      value.endDate < value.startDate
    ) {
      context.addIssue({
        code: 'custom',
        message: 'End date must be on or after the start date.',
        path: ['endDate'],
      })
    }
  })
