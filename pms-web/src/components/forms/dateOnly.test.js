import { describe, expect, it } from 'vitest'
import { formatDateOnly, isDateOnly, parseDateOnly } from './dateOnly.js'

describe('date-only helpers', () => {
  it('round trips calendar dates without UTC conversion', () => {
    const date = parseDateOnly('2028-02-29')

    expect(date).not.toBeNull()
    expect(formatDateOnly(date)).toBe('2028-02-29')
  })

  it('rejects malformed and impossible calendar dates', () => {
    expect(parseDateOnly('')).toBeNull()
    expect(parseDateOnly('2026-02-29')).toBeNull()
    expect(parseDateOnly('09/14/2026')).toBeNull()
    expect(isDateOnly('2026-13-01')).toBe(false)
  })

  it('returns an empty value for invalid Date objects', () => {
    expect(formatDateOnly(null)).toBe('')
    expect(formatDateOnly(new Date('invalid'))).toBe('')
  })
})
