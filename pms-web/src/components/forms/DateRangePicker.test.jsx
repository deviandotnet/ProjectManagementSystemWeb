import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DateRangePicker } from './DateRangePicker.jsx'

describe('DateRangePicker', () => {
  it('keeps edits in a draft until Apply is selected', async () => {
    const onApply = vi.fn()
    const user = userEvent.setup()

    render(
      <DateRangePicker
        onApply={onApply}
        onClose={vi.fn()}
        open
        title="Edit planned dates"
        value={{ startDate: '2026-09-08', endDate: '2026-09-18' }}
      />,
    )

    const endDate = screen.getByLabelText('End date')
    await user.clear(endDate)
    await user.type(endDate, '2026-09-22')
    expect(onApply).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Apply' }))
    expect(onApply).toHaveBeenCalledWith({
      startDate: '2026-09-08',
      endDate: '2026-09-22',
    })
  })

  it('allows an open-ended actual range to be cancelled', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    const trigger = document.createElement('button')
    trigger.textContent = 'Actual dates'
    document.body.append(trigger)
    trigger.focus()

    render(
      <DateRangePicker
        anchorEl={trigger}
        endRequired={false}
        onApply={vi.fn()}
        onClose={onClose}
        open
        title="Edit actual dates"
        value={{ startDate: '2026-09-10', endDate: '' }}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalledOnce()
    trigger.remove()
  })

  it('blocks Apply when a range falls outside project bounds', () => {
    render(
      <DateRangePicker
        maxDate="2026-09-30"
        minDate="2026-09-01"
        onApply={vi.fn()}
        onClose={vi.fn()}
        open
        value={{ startDate: '2026-08-31', endDate: '2026-09-18' }}
      />,
    )

    expect(
      screen.getByText('Start date cannot be before 2026-09-01.'),
    ).toHaveTextContent('Start date cannot be before 2026-09-01.')
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled()
  })
})
