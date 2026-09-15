import { isDateOnly } from './dateOnly.js'

export function validateDateRange(
  value,
  { endRequired = true, minDate = '', maxDate = '' } = {},
) {
  const startDate = value?.startDate ?? ''
  const endDate = value?.endDate ?? ''
  if (!startDate) return 'Select a start date.'
  if (!isDateOnly(startDate)) return 'Enter a valid start date.'
  if (endRequired && !endDate) return 'Select an end date.'
  if (endDate && !isDateOnly(endDate)) return 'Enter a valid end date.'
  if (endDate && endDate < startDate)
    return 'End date cannot be before start date.'
  if (minDate && startDate < minDate)
    return `Start date cannot be before ${minDate}.`
  if (maxDate && (startDate > maxDate || (endDate && endDate > maxDate)))
    return `Dates cannot be after ${maxDate}.`
  return ''
}
