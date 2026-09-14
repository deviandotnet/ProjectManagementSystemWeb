const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

/**
 * Converts an API date-only value to a local Date without applying a timezone.
 *
 * @param {string} value
 * @returns {Date | null}
 */
export function parseDateOnly(value) {
  const match = DATE_ONLY_PATTERN.exec(value)

  if (!match) {
    return null
  }

  const [, yearText, monthText, dayText] = match
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  const date = new Date(year, month - 1, day, 12)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return date
}

/**
 * Converts a local Date to the API's YYYY-MM-DD date-only format.
 *
 * @param {Date | null | undefined} value
 * @returns {string}
 */
export function formatDateOnly(value) {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return ''
  }

  const year = String(value.getFullYear()).padStart(4, '0')
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function isDateOnly(value) {
  return parseDateOnly(value) !== null
}
