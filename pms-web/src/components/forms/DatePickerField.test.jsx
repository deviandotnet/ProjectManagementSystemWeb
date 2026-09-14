import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { DatePickerField } from './DatePickerField.jsx'

describe('DatePickerField', () => {
  it('opens from the input and emits an API date-only value', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()

    render(
      <DatePickerField
        id="start-date"
        label="Start date"
        onChange={onChange}
        value="2026-09-14"
      />,
    )

    await user.click(screen.getByLabelText('Start date'))
    expect(document.querySelector('.workflow-datepicker')).toBeInTheDocument()

    await user.click(
      screen.getByText('15', { selector: '.react-datepicker__day' }),
    )
    expect(onChange).toHaveBeenCalledWith('2026-09-15')
  })

  it('opens from its labeled calendar button', async () => {
    const user = userEvent.setup()

    render(
      <DatePickerField
        id="end-date"
        label="End date"
        onChange={vi.fn()}
        value=""
      />,
    )

    await user.click(
      screen.getByRole('button', { name: 'Open end date calendar' }),
    )
    expect(document.querySelector('.workflow-datepicker')).toBeInTheDocument()
  })

  it('forwards its ref to the date input', () => {
    const inputRef = createRef()

    render(
      <DatePickerField
        id="deadline"
        label="Deadline"
        onChange={vi.fn()}
        ref={inputRef}
        value=""
      />,
    )

    expect(inputRef.current).toBe(screen.getByLabelText('Deadline'))
  })
})
