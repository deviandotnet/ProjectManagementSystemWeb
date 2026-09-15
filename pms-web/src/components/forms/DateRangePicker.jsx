import CloseOutlined from '@mui/icons-material/CloseOutlined'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import TextField from '@mui/material/TextField'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useMemo, useState } from 'react'
import ReactDatePicker from 'react-datepicker'
import { formatDateOnly, parseDateOnly } from './dateOnly.js'
import { validateDateRange } from './dateRange.js'

const emptyRange = { startDate: '', endDate: '' }

function DateRangeContent({
  endRequired,
  error,
  loading,
  maxDate,
  minDate,
  mobile,
  onApply,
  onClose,
  submitting,
  title,
  value,
}) {
  const [draft, setDraft] = useState(value ?? emptyRange)
  const validation = useMemo(
    () => validateDateRange(draft, { endRequired, minDate, maxDate }),
    [draft, endRequired, maxDate, minDate],
  )

  return (
    <div className="w-full bg-dashboard-surface text-dashboard-ink">
      <header className="flex items-center justify-between border-b border-dashboard-border px-4 py-3">
        <h2 className="font-display text-lg font-bold">{title}</h2>
        <IconButton
          aria-label="Close date picker"
          onClick={onClose}
          size="small"
        >
          <CloseOutlined fontSize="small" />
        </IconButton>
      </header>
      <div className="grid gap-4 p-4">
        {loading ? (
          <div className="grid min-h-48 place-items-center" role="status">
            <CircularProgress aria-label="Loading Action Item" size={28} />
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                fullWidth
                label="Start date"
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    startDate: event.target.value,
                  }))
                }
                placeholder="YYYY-MM-DD"
                size="small"
                value={draft.startDate}
              />
              <TextField
                fullWidth
                label={endRequired ? 'End date' : 'End date (optional)'}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    endDate: event.target.value,
                  }))
                }
                placeholder="YYYY-MM-DD"
                size="small"
                value={draft.endDate}
              />
            </div>
            <ReactDatePicker
              calendarClassName="workflow-datepicker workflow-date-range"
              endDate={parseDateOnly(draft.endDate)}
              inline
              maxDate={parseDateOnly(maxDate)}
              minDate={parseDateOnly(minDate)}
              monthsShown={mobile ? 1 : 2}
              onChange={([start, end]) =>
                setDraft({
                  startDate: formatDateOnly(start),
                  endDate: formatDateOnly(end),
                })
              }
              selected={parseDateOnly(draft.startDate)}
              selectsRange
              shouldCloseOnSelect={false}
              startDate={parseDateOnly(draft.startDate)}
            />
            {error ? <Alert severity="error">{error}</Alert> : null}
            {validation ? (
              <p className="text-sm text-dashboard-danger" role="alert">
                {validation}
              </p>
            ) : null}
          </>
        )}
      </div>
      <footer className="flex justify-end gap-2 border-t border-dashboard-border px-4 py-3">
        <Button disabled={submitting} onClick={onClose}>
          Cancel
        </Button>
        <Button
          disabled={loading || submitting || Boolean(validation)}
          onClick={() => onApply(draft)}
          variant="contained"
        >
          {submitting ? 'Saving...' : 'Apply'}
        </Button>
      </footer>
    </div>
  )
}

export function DateRangePicker({
  anchorEl,
  endRequired = true,
  error = '',
  loading = false,
  maxDate = '',
  minDate = '',
  onApply,
  onClose,
  open,
  submitting = false,
  title = 'Select date range',
  value = emptyRange,
}) {
  const mobile = useMediaQuery('(max-width:767px)')
  const content = (
    <DateRangeContent
      key={`${open}-${value.startDate}-${value.endDate}`}
      endRequired={endRequired}
      error={error}
      loading={loading}
      maxDate={maxDate}
      minDate={minDate}
      mobile={mobile}
      onApply={onApply}
      onClose={onClose}
      submitting={submitting}
      title={title}
      value={value}
    />
  )
  if (mobile || !anchorEl)
    return (
      <Dialog
        fullWidth
        maxWidth="xs"
        onClose={submitting ? undefined : onClose}
        open={open}
        PaperProps={{
          sx: mobile
            ? {
                m: 0,
                position: 'fixed',
                bottom: 0,
                borderRadius: '16px 16px 0 0',
              }
            : { borderRadius: 2 },
        }}
      >
        <DialogContent sx={{ p: 0 }}>{content}</DialogContent>
      </Dialog>
    )
  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      onClose={submitting ? undefined : onClose}
      open={open}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      slotProps={{
        paper: { sx: { mt: 0.5, width: 590, maxWidth: 'calc(100vw - 32px)' } },
      }}
    >
      {content}
    </Popover>
  )
}
