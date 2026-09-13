import ErrorOutlineOutlined from '@mui/icons-material/ErrorOutlineOutlined'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import { DashboardEmptyState } from './DashboardEmptyState.jsx'
import { DashboardOverview } from './DashboardOverview.jsx'
import { DashboardShell } from './DashboardShell.jsx'

function DashboardLoading() {
  return (
    <section aria-label="Loading dashboard" className="space-y-4" role="status">
      <span className="sr-only">Loading dashboard</span>
      <Skeleton height={112} variant="rounded" />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Skeleton height={430} variant="rounded" />
        <Skeleton height={430} variant="rounded" />
      </div>
    </section>
  )
}

function DashboardUnavailable({ error, onRetry }) {
  return (
    <section
      aria-live="polite"
      className="grid min-h-[28rem] place-items-center rounded-2xl border border-dashboard-border bg-dashboard-surface p-6 text-center"
      role="alert"
    >
      <div className="max-w-md">
        <ErrorOutlineOutlined
          className="text-dashboard-danger"
          sx={{ fontSize: 42 }}
        />
        <h2 className="mt-4 text-2xl font-bold">Dashboard unavailable</h2>
        <p className="mt-2 leading-6 text-dashboard-muted">
          {error?.message ?? 'The dashboard could not be loaded.'}
        </p>
        <Button className="mt-6" onClick={onRetry} variant="contained">
          Try again
        </Button>
      </div>
    </section>
  )
}

export function DashboardPresentation({
  data,
  error,
  firstName,
  isError,
  isLoading,
  onLogout,
  onRetry,
}) {
  const isEmpty = !isLoading && !isError && data?.totalCount === 0

  return (
    <DashboardShell firstName={firstName} isEmpty={isEmpty} onLogout={onLogout}>
      {isLoading && <DashboardLoading />}
      {isError && <DashboardUnavailable error={error} onRetry={onRetry} />}
      {isEmpty && <DashboardEmptyState />}
      {!isLoading && !isError && data?.totalCount > 0 && (
        <DashboardOverview data={data} />
      )}
    </DashboardShell>
  )
}
