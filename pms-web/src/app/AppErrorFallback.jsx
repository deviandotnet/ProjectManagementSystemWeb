import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'

export function AppErrorFallback({ error, resetErrorBoundary }) {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <Alert
        action={
          <Button color="inherit" onClick={resetErrorBoundary} size="small">
            Try again
          </Button>
        }
        className="max-w-xl"
        severity="error"
      >
        The application could not be displayed. {error.message}
      </Alert>
    </main>
  )
}
