import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { routes } from '../constants/routes.js'
import { useAuth } from '../context/authContextDefinition.js'

function SessionStatus({ unavailable = false }) {
  const { error, retryRestoration } = useAuth()

  return (
    <main className="grid min-h-[100dvh] place-items-center bg-auth-canvas px-5">
      <section
        aria-live="polite"
        className="w-full max-w-md rounded-2xl border border-auth-border bg-auth-surface p-8"
        role="status"
      >
        {unavailable ? (
          <>
            <h1 className="text-xl font-semibold text-auth-ink">
              Session renewal is unavailable
            </h1>
            <p className="mt-3 text-sm leading-6 text-auth-muted">
              {error?.message ?? 'The server could not renew your session.'}
            </p>
            <Button
              className="mt-6"
              onClick={retryRestoration}
              variant="contained"
            >
              Try again
            </Button>
          </>
        ) : (
          <>
            <span className="sr-only">Restoring your session</span>
            <Skeleton height={32} variant="rounded" width="58%" />
            <Skeleton className="mt-4" variant="rounded" />
            <Skeleton className="mt-2" variant="rounded" width="82%" />
          </>
        )}
      </section>
    </main>
  )
}

export function ProtectedRoute() {
  const auth = useAuth()
  const location = useLocation()

  if (auth.status === 'restoring') {
    return <SessionStatus />
  }

  if (auth.status === 'unavailable') {
    return <SessionStatus unavailable />
  }

  if (!auth.isAuthenticated) {
    return <Navigate replace state={{ from: location }} to={routes.login} />
  }

  return <Outlet />
}

export function PublicOnlyRoute() {
  const auth = useAuth()

  if (auth.status === 'restoring') {
    return <SessionStatus />
  }

  if (auth.isAuthenticated) {
    return <Navigate replace to={routes.dashboard} />
  }

  return <Outlet />
}

export function RootRedirect() {
  const auth = useAuth()

  if (auth.status === 'restoring') {
    return <SessionStatus />
  }

  return (
    <Navigate
      replace
      to={auth.isAuthenticated ? routes.dashboard : routes.login}
    />
  )
}
