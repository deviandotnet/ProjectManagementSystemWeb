import { describe, expect, it } from 'vitest'
import { validateDateRange } from './dateRange.js'

describe('validateDateRange', () => {
  it('accepts leap-day and open-ended actual ranges', () => {
    expect(
      validateDateRange(
        { startDate: '2028-02-29', endDate: '' },
        { endRequired: false },
      ),
    ).toBe('')
  })

  it('rejects invalid, reversed, and out-of-bounds ranges', () => {
    expect(
      validateDateRange({ startDate: '2027-02-29', endDate: '2027-03-01' }),
    ).toMatch(/valid start/i)
    expect(
      validateDateRange({ startDate: '2026-05-02', endDate: '2026-05-01' }),
    ).toMatch(/before start/i)
    expect(
      validateDateRange(
        { startDate: '2026-01-01', endDate: '2026-02-01' },
        { minDate: '2026-01-15', maxDate: '2026-12-31' },
      ),
    ).toMatch(/cannot be before/i)
  })
})
