import { zodResolver } from '@hookform/resolvers/zod'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { routes } from '../../../constants/routes.js'
import { useAuth } from '../../../context/authContextDefinition.js'
import { AuthFieldRow } from './AuthFieldRow.jsx'
import { AuthSwitchPrompt } from './AuthSwitchPrompt.jsx'
import { PasswordField } from './PasswordField.jsx'
import { registrationSchema } from '../schemas/registrationSchema.js'

export function RegisterForm() {
  const navigate = useNavigate()
  const { register: registerAccount } = useAuth()
  const {
    register: registerField,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const submitRegistration = async ({ confirmPassword, ...values }) => {
    void confirmPassword

    try {
      await registerAccount({ ...values, middleName: null })
      navigate(routes.login, {
        replace: true,
        state: {
          registeredEmail: values.email.trim(),
          registrationComplete: true,
        },
      })
    } catch (error) {
      setError('root', { message: error.message })
    }
  }

  return (
    <section aria-labelledby="register-title">
      <div>
        <h1
          className="text-3xl font-semibold tracking-[-0.03em] text-auth-ink"
          id="register-title"
        >
          Create your account
        </h1>
        <p className="mt-2 max-w-xl text-base leading-7 text-auth-muted">
          Get started with ProManage and turn your plans into progress.
        </p>
      </div>

      <form
        className="mt-7 flex flex-col gap-5"
        noValidate
        onSubmit={handleSubmit(submitRegistration)}
      >
        {errors.root?.message ? (
          <Alert aria-live="polite" severity="error">
            {errors.root.message}
          </Alert>
        ) : null}

        <div
          aria-labelledby="register-full-name-label"
          className="grid gap-2 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:items-start sm:gap-4"
          role="group"
        >
          <span
            className="text-sm font-medium text-auth-muted sm:pt-4"
            id="register-full-name-label"
          >
            Full name
          </span>
          <div className="grid min-w-0 gap-3 sm:grid-cols-2">
            <TextField
              autoComplete="given-name"
              error={Boolean(errors.firstName)}
              fullWidth
              helperText={errors.firstName?.message}
              id="register-first-name"
              placeholder="First name"
              slotProps={{ htmlInput: { 'aria-label': 'First name' } }}
              {...registerField('firstName')}
            />
            <TextField
              autoComplete="family-name"
              error={Boolean(errors.lastName)}
              fullWidth
              helperText={errors.lastName?.message}
              id="register-last-name"
              placeholder="Last name"
              slotProps={{ htmlInput: { 'aria-label': 'Last name' } }}
              {...registerField('lastName')}
            />
          </div>
        </div>

        <AuthFieldRow htmlFor="register-email" label="Email address">
          <TextField
            autoComplete="email"
            error={Boolean(errors.email)}
            fullWidth
            helperText={errors.email?.message}
            id="register-email"
            type="email"
            {...registerField('email')}
          />
        </AuthFieldRow>

        <AuthFieldRow htmlFor="register-password" label="Password">
          <PasswordField
            autoComplete="new-password"
            error={Boolean(errors.password)}
            fieldRegistration={registerField('password')}
            helperText={errors.password?.message}
            id="register-password"
          />
        </AuthFieldRow>

        <AuthFieldRow
          htmlFor="register-confirm-password"
          label="Confirm password"
        >
          <PasswordField
            autoComplete="new-password"
            error={Boolean(errors.confirmPassword)}
            fieldRegistration={registerField('confirmPassword')}
            helperText={errors.confirmPassword?.message}
            id="register-confirm-password"
          />
        </AuthFieldRow>

        <Alert severity="info">
          After your account is created, you will return here to sign in.
        </Alert>

        <div className="sm:ml-[9.5rem]">
          <Button
            aria-busy={isSubmitting}
            className="min-h-12 transition-transform active:translate-y-px"
            disabled={isSubmitting}
            fullWidth
            size="large"
            type="submit"
            variant="contained"
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </Button>
        </div>

        <AuthSwitchPrompt
          label="Already have an account?"
          linkLabel="Sign in"
          to={routes.login}
        />
      </form>
    </section>
  )
}
