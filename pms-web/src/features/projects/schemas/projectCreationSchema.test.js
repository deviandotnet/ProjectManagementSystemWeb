import { describe, expect, it } from 'vitest'
import { projectCreationSchema } from './projectCreationSchema.js'

const validProject = {
  name: 'Website redesign',
  description: '',
  startDate: '2026-09-14',
  endDate: '2026-10-14',
  weekStartDay: 1,
  defaultTimelineScale: 2,
  progressMode: 1,
}

describe('projectCreationSchema', () => {
  it('accepts the backend project creation contract', () => {
    expect(projectCreationSchema.parse(validProject)).toEqual(validProject)
  })

  it('trims and enforces the project name limit', () => {
    expect(
      projectCreationSchema.parse({
        ...validProject,
        name: '  Website redesign  ',
      }).name,
    ).toBe('Website redesign')

    expect(
      projectCreationSchema.safeParse({
        ...validProject,
        name: 'a'.repeat(201),
      }).success,
    ).toBe(false)
  })

  it('rejects invalid dates and unknown enums', () => {
    const result = projectCreationSchema.safeParse({
      ...validProject,
      startDate: '2026-02-29',
      weekStartDay: 7,
      defaultTimelineScale: 6,
      progressMode: 3,
    })

    expect(result.success).toBe(false)
    expect(result.error.issues.map((issue) => issue.path[0])).toEqual(
      expect.arrayContaining([
        'startDate',
        'weekStartDay',
        'defaultTimelineScale',
        'progressMode',
      ]),
    )
  })

  it('rejects a project end date before its start date', () => {
    const result = projectCreationSchema.safeParse({
      ...validProject,
      startDate: '2026-09-14',
      endDate: '2026-09-13',
    })

    expect(result.success).toBe(false)
    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: 'End date must be on or after the start date.',
          path: ['endDate'],
        }),
      ]),
    )
  })
})
