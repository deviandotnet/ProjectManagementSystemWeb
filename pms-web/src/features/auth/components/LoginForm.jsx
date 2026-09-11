import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { routes } from '../../../constants/routes.js'
import { useAuth } from '../../../context/authContextDefinition.js'
import { loginSchema } from '../schemas/loginSchema.js'

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [submissionError, setSubmissionError] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const submitLogin = async (credentials) => {
    setSubmissionError(null)

    try {
      await login(credentials)
      const destination = location.state?.from?.pathname ?? routes.dashboard
      navigate(destination, { replace: true })
    } catch (error) {
      setSubmissionError(error.message)
    }
  }

  return (
    <section
      aria-labelledby="login-title"
      className="rounded-2xl border border-auth-border bg-auth-surface p-6 shadow-[0_1.5rem_4rem_rgba(8,47,45,0.10)] sm:p-9"
    >
      <div>
        <p className="text-sm font-semibold text-auth-accent">Welcome back</p>
        <h1
          className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-auth-ink sm:text-4xl"
          id="login-title"
        >
          Sign in to your workspace
        </h1>
        <p className="mt-3 max-w-md text-base leading-7 text-auth-muted">
          Continue planning, tracking, and delivering work with your team.
        </p>
      </div>

      <form
        className="mt-8 space-y-5"
        noValidate
        onSubmit={handleSubmit(submitLogin)}
      >
        {submissionError ? (
          <Alert aria-live="polite" severity="error">
            {submissionError}
          </Alert>
        ) : null}

        <TextField
          autoComplete="username"
          error={Boolean(errors.email)}
          fullWidth
          helperText={
            errors.email?.message ?? 'Use the email linked to your account.'
          }
          id="email"
          label="Email address"
          type="email"
          {...register('email')}
        />

        <TextField
          autoComplete="current-password"
          error={Boolean(errors.password)}
          fullWidth
          helperText={
            errors.password?.message ?? 'Enter at least 6 characters.'
          }
          id="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                    edge="end"
                    onClick={() => setShowPassword((visible) => !visible)}
                  >
                    {showPassword ? (
                      <VisibilityOffOutlinedIcon />
                    ) : (
                      <VisibilityOutlinedIcon />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          {...register('password')}
        />

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
      </form>

      <p className="mt-7 text-center text-sm text-auth-muted">
        Need an account?{' '}
        <Link
          className="font-semibold text-auth-accent underline-offset-4 hover:underline"
          to={routes.register}
        >
          Create account
        </Link>
      </p>
    </section>
  )
}
