import { zodResolver } from '@hookform/resolvers/zod'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { routes } from '../../../constants/routes.js'
import { useAuth } from '../../../context/authContextDefinition.js'
import { AuthFieldRow } from './AuthFieldRow.jsx'
import { AuthSwitchPrompt } from './AuthSwitchPrompt.jsx'
import { PasswordField } from './PasswordField.jsx'
import { loginSchema } from '../schemas/loginSchema.js'

export function LoginForm() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const registeredEmail =
    typeof location.state?.registeredEmail === 'string'
      ? location.state.registeredEmail
      : ''
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: registeredEmail, password: '' },
  })

  const submitLogin = async (credentials) => {
    try {
      await login(credentials)
      const destination = location.state?.from?.pathname ?? routes.dashboard
      navigate(destination, { replace: true })
    } catch (error) {
      setError('root', { message: error.message })
    }
  }

  return (
    <section aria-labelledby="login-title">
      <div>
        <h1
          className="text-3xl font-semibold tracking-[-0.03em] text-auth-ink"
          id="login-title"
        >
          Sign in to your workspace
        </h1>
        <p className="mt-2 max-w-xl text-base leading-7 text-auth-muted">
          Continue planning, tracking, and delivering work with your team.
        </p>
      </div>

      <form
        className="mt-7 flex flex-col gap-5"
        noValidate
        onSubmit={handleSubmit(submitLogin)}
      >
        {errors.root?.message ? (
          <Alert aria-live="polite" severity="error">
            {errors.root.message}
          </Alert>
        ) : null}

        <AuthFieldRow htmlFor="login-email" label="Email address">
          <TextField
            autoComplete="username"
            error={Boolean(errors.email)}
            fullWidth
            helperText={errors.email?.message}
            id="login-email"
            type="email"
            {...register('email')}
          />
        </AuthFieldRow>

        <AuthFieldRow htmlFor="login-password" label="Password">
          <PasswordField
            autoComplete="current-password"
            error={Boolean(errors.password)}
            fieldRegistration={register('password')}
            helperText={errors.password?.message}
            id="login-password"
          />
        </AuthFieldRow>

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
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </div>

        <AuthSwitchPrompt
          label="Need an account?"
          linkLabel="Create account"
          to={routes.register}
        />
      </form>
    </section>
  )
}
