import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ErrorBoundary } from 'react-error-boundary'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext.jsx'
import { applicationRouter } from '../routes/router.jsx'
import { AppErrorFallback } from './AppErrorFallback.jsx'
import { queryClient } from './queryClient.js'
import { appTheme } from './theme.js'

export function AppProviders({
  router = applicationRouter,
  client = queryClient,
  showDevtools = import.meta.env.DEV,
}) {
  return (
    <ErrorBoundary FallbackComponent={AppErrorFallback}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <QueryClientProvider client={client}>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
          {showDevtools ? <ReactQueryDevtools initialIsOpen={false} /> : null}
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
