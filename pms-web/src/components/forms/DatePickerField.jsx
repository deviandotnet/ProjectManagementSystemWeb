import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import { forwardRef } from 'react'
import ReactDatePicker from 'react-datepicker'
import { formatDateOnly, parseDateOnly } from './dateOnly.js'

function assignRef(ref, value) {
  if (typeof ref === 'function') {
    ref(value)
  } else if (ref) {
    ref.current = value
  }
}

const DateInput = forwardRef(function DateInput(
  {
    disabled,
    error,
    formRef,
    helperText,
    id,
    label,
    onBlur,
    onChange,
    onClick,
    required,
    value,
  },
  ref,
) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-semibold text-dashboard-ink" htmlFor={id}>
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-1 text-dashboard-danger">
            *
          </span>
        ) : null}
      </label>
      <TextField
        disabled={disabled}
        error={error}
        fullWidth
        helperText={helperText}
        id={id}
        inputRef={(input) => {
          assignRef(ref, input)
          assignRef(formRef, input)
        }}
        onBlur={onBlur}
        onChange={onChange}
        onClick={onClick}
        required={required}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={`Open ${label.toLowerCase()} calendar`}
                  disabled={disabled}
                  edge="end"
                  onClick={onClick}
                  size="small"
                >
                  <CalendarMonthOutlined fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        value={value ?? ''}
      />
    </div>
  )
})

/**
 * Reusable date-only input backed by react-datepicker.
 *
 * @param {{
 *   disabled?: boolean,
 *   error?: boolean,
 *   helperText?: string,
 *   id: string,
 *   label: string,
 *   minDate?: string,
 *   name?: string,
 *   onBlur?: () => void,
 *   onChange: (value: string) => void,
 *   required?: boolean,
 *   value: string,
 * }} props
 */
export const DatePickerField = forwardRef(function DatePickerField(
  {
    disabled = false,
    error = false,
    helperText,
    id,
    label,
    minDate = '',
    name,
    onBlur,
    onChange,
    required = false,
    value,
  },
  ref,
) {
  return (
    <ReactDatePicker
      calendarClassName="workflow-datepicker"
      customInput={
        <DateInput
          disabled={disabled}
          error={error}
          formRef={ref}
          helperText={helperText}
          id={id}
          label={label}
          required={required}
        />
      }
      dateFormat="MMM dd, yyyy"
      disabled={disabled}
      dropdownMode="select"
      id={id}
      minDate={parseDateOnly(minDate)}
      name={name}
      onBlur={onBlur}
      onChange={(date) => onChange(formatDateOnly(date))}
      placeholderText="Select a date"
      popperClassName="workflow-datepicker-popper"
      selected={parseDateOnly(value)}
      showMonthDropdown
      showYearDropdown
      strictParsing
    />
  )
})
