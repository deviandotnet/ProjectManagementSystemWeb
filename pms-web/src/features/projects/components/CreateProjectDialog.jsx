import { zodResolver } from '@hookform/resolvers/zod'
import AccountCircleOutlined from '@mui/icons-material/AccountCircleOutlined'
import CloseOutlined from '@mui/icons-material/CloseOutlined'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { DatePickerField } from '../../../components/forms/index.js'
import { projectCreationSchema } from '../schemas/projectCreationSchema.js'
import { useCreateProject } from '../hooks/useCreateProject.js'

const WEEK_DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

const TIMELINE_SCALES = [
  [1, 'Daily'],
  [2, 'Weekly'],
  [3, 'Biweekly'],
  [4, 'Monthly'],
  [5, 'Quarterly'],
]

const PROGRESS_MODES = [
  [1, 'Count based'],
  [2, 'Weight based'],
]

const DEFAULT_VALUES = {
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  weekStartDay: 1,
  defaultTimelineScale: 2,
  progressMode: 1,
}

function ConfigurationSelect({ control, label, name, options }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <TextField {...field} fullWidth label={label} select>
          {options.map(([value, optionLabel]) => (
            <MenuItem key={value} value={value}>
              {optionLabel}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  )
}

export function CreateProjectDialog({ onClose, onCreated, open }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const mutation = useCreateProject()
  const {
    clearErrors,
    control,
    handleSubmit,
    register,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: DEFAULT_VALUES,
    resolver: zodResolver(projectCreationSchema),
  })
  const startDate = useWatch({ control, name: 'startDate' })
  const isBusy = isSubmitting || mutation.isPending

  const closeDialog = () => {
    if (isBusy) {
      return
    }

    reset(DEFAULT_VALUES)
    mutation.reset()
    onClose()
  }

  const submitProject = async (values) => {
    clearErrors('root')

    try {
      const projectId = await mutation.mutateAsync({
        ...values,
        name: values.name.trim(),
        description: values.description.trim() || null,
      })
      reset(DEFAULT_VALUES)
      onCreated(projectId)
    } catch (error) {
      setError('root', {
        message: error?.message ?? 'The project could not be created.',
      })
    }
  }

  return (
    <Dialog
      aria-describedby="create-project-description"
      aria-labelledby="create-project-title"
      fullScreen={isMobile}
      fullWidth
      maxWidth="md"
      onClose={closeDialog}
      open={open}
      slotProps={{
        paper: {
          className: 'bg-dashboard-surface text-dashboard-ink md:rounded-2xl',
          sx: { maxWidth: '50rem' },
        },
      }}
    >
      <form noValidate onSubmit={handleSubmit(submitProject)}>
        <DialogContent className="px-5 pb-6 pt-6 sm:px-8 sm:pt-8">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.13em] text-dashboard-muted">
                New project / Configuration
              </p>
              <h2
                className="mt-2 text-3xl font-bold tracking-[-0.035em] sm:text-4xl"
                id="create-project-title"
              >
                Create project
              </h2>
              <p
                className="mt-1 text-base text-dashboard-muted sm:text-lg"
                id="create-project-description"
              >
                Set the project schedule and working defaults.
              </p>
            </div>
            <IconButton
              aria-label="Close create project form"
              disabled={isBusy}
              onClick={closeDialog}
              sx={{ height: 44, width: 44 }}
            >
              <CloseOutlined />
            </IconButton>
          </div>

          {errors.root?.message ? (
            <Alert aria-live="polite" className="mt-6" severity="error">
              {errors.root.message}
            </Alert>
          ) : null}

          <div className="mt-7 grid gap-5 md:grid-cols-[minmax(0,1.45fr)_minmax(15rem,0.9fr)] md:gap-x-6">
            <div className="grid content-start gap-5">
              <TextField
                error={Boolean(errors.name)}
                fullWidth
                helperText={errors.name?.message}
                label="Project name"
                required
                {...register('name')}
              />
              <TextField
                error={Boolean(errors.description)}
                fullWidth
                helperText={errors.description?.message}
                label="Description"
                minRows={3}
                multiline
                {...register('description')}
              />
            </div>

            <div className="grid content-start gap-5">
              <Controller
                control={control}
                name="startDate"
                render={({ field }) => (
                  <DatePickerField
                    {...field}
                    error={Boolean(errors.startDate)}
                    helperText={errors.startDate?.message}
                    id="project-start-date"
                    label="Start date"
                    required
                  />
                )}
              />
              <Controller
                control={control}
                name="endDate"
                render={({ field }) => (
                  <DatePickerField
                    {...field}
                    error={Boolean(errors.endDate)}
                    helperText={errors.endDate?.message}
                    id="project-end-date"
                    label="End date"
                    minDate={startDate}
                    required
                  />
                )}
              />
            </div>
          </div>

          <div className="mt-6 grid gap-4 border-t border-dashboard-border pt-6 md:grid-cols-3">
            <ConfigurationSelect
              control={control}
              label="Week starts on"
              name="weekStartDay"
              options={WEEK_DAYS.map((label, value) => [value, label])}
            />
            <ConfigurationSelect
              control={control}
              label="Default timeline scale"
              name="defaultTimelineScale"
              options={TIMELINE_SCALES}
            />
            <div>
              <ConfigurationSelect
                control={control}
                label="Progress mode"
                name="progressMode"
                options={PROGRESS_MODES}
              />
              <p className="mt-2 text-xs leading-4 text-dashboard-muted">
                Count based uses completed Action Items divided by total Action
                Items.
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-xl bg-dashboard-accent-soft px-4 py-3 text-sm text-dashboard-muted">
            <AccountCircleOutlined className="shrink-0 text-dashboard-accent-strong" />
            <p>
              You will be added to this project as{' '}
              <strong className="text-dashboard-ink">Project Manager</strong>.
            </p>
          </div>
        </DialogContent>

        <DialogActions className="sticky bottom-0 gap-2 border-t border-dashboard-border bg-dashboard-surface px-5 py-4 sm:px-8">
          <Button disabled={isBusy} onClick={closeDialog} variant="outlined">
            Cancel
          </Button>
          <Button
            aria-busy={isBusy}
            disabled={isBusy}
            type="submit"
            variant="contained"
          >
            {isBusy ? 'Creating project...' : 'Create project'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
