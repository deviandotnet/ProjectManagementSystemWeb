import AccountCircleOutlined from '@mui/icons-material/AccountCircleOutlined'
import AddOutlined from '@mui/icons-material/AddOutlined'
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined'
import DashboardOutlined from '@mui/icons-material/DashboardOutlined'
import FolderOutlined from '@mui/icons-material/FolderOutlined'
import LayersOutlined from '@mui/icons-material/LayersOutlined'
import LogoutOutlined from '@mui/icons-material/LogoutOutlined'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { Link as RouterLink } from 'react-router-dom'
import { routes } from '../../../constants/routes.js'

const CURRENT_DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

function BrandMark() {
  return (
    <div className="flex items-center gap-3 text-dashboard-sidebar-ink">
      <LayersOutlined className="text-dashboard-accent" fontSize="large" />
      <span className="text-xl font-bold tracking-[-0.025em]">Workflow</span>
    </div>
  )
}

function CreateProjectButton({ compact = false, onClick }) {
  return (
    <Button
      onClick={onClick}
      startIcon={<AddOutlined />}
      sx={{
        minHeight: compact ? 40 : 44,
        px: compact ? 1.5 : 2.5,
      }}
      variant="contained"
    >
      {compact ? 'New project' : 'Create project'}
    </Button>
  )
}

export function DashboardShell({
  children,
  firstName,
  isEmpty = false,
  onCreateProject,
  onLogout,
}) {
  const title = isEmpty
    ? `Welcome to Workflow, ${firstName}`
    : `Welcome back, ${firstName}`
  const subtitle = isEmpty
    ? 'Your project workspace is ready.'
    : 'Portfolio health across every project you can access.'
  const today = CURRENT_DATE_FORMATTER.format(new Date())

  return (
    <div className="min-h-[100dvh] bg-dashboard-canvas text-dashboard-ink md:grid md:grid-cols-[15.5rem_minmax(0,1fr)]">
      <aside className="hidden min-h-[100dvh] flex-col bg-dashboard-sidebar px-5 py-6 md:flex">
        <BrandMark />

        <nav aria-label="Workspace navigation" className="mt-12">
          <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-dashboard-sidebar-muted">
            Workspace
          </p>
          <RouterLink
            aria-current="page"
            className="flex min-h-12 items-center gap-3 rounded-xl bg-dashboard-sidebar-active px-4 font-semibold text-dashboard-sidebar-ink"
            to={routes.dashboard}
          >
            <DashboardOutlined fontSize="small" />
            Dashboard
          </RouterLink>
          <span
            aria-disabled="true"
            className="mt-2 flex min-h-12 items-center gap-3 px-4 text-dashboard-sidebar-muted opacity-70"
          >
            <FolderOutlined fontSize="small" />
            Projects
          </span>
        </nav>

        <div className="mt-auto border-t border-dashboard-sidebar-line pt-5">
          <RouterLink
            className="flex min-h-11 items-center gap-3 px-3 text-sm text-dashboard-sidebar-muted transition-colors hover:text-dashboard-sidebar-ink"
            to={routes.account}
          >
            <AccountCircleOutlined fontSize="small" />
            Account
          </RouterLink>
          <button
            className="flex min-h-11 w-full items-center gap-3 px-3 text-left text-sm text-dashboard-sidebar-muted transition-colors hover:text-dashboard-sidebar-ink"
            onClick={onLogout}
            type="button"
          >
            <LogoutOutlined fontSize="small" />
            Sign out
          </button>
          <p className="mt-9 font-mono text-[0.65rem] tracking-[0.08em] text-dashboard-sidebar-muted">
            Plan. Build. Deliver.
          </p>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="flex min-h-16 items-center justify-between bg-dashboard-sidebar px-4 md:hidden">
          <BrandMark />
          <IconButton
            aria-label="Sign out"
            onClick={onLogout}
            sx={{ color: 'var(--color-dashboard-sidebar-ink)' }}
          >
            <LogoutOutlined />
          </IconButton>
        </header>

        <main className="mx-auto w-full max-w-[96rem] px-4 py-6 sm:px-6 lg:px-8">
          <header className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="max-w-3xl text-3xl font-bold tracking-[-0.035em] text-balance sm:text-4xl">
                {title}
              </h1>
              <p className="mt-1 text-base text-dashboard-muted sm:text-lg">
                {subtitle}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 lg:justify-end">
              <span className="flex items-center gap-2 text-sm font-medium text-dashboard-muted">
                <CalendarMonthOutlined fontSize="small" />
                <time dateTime={new Date().toISOString()}>{today}</time>
              </span>
              <CreateProjectButton compact onClick={onCreateProject} />
              <span className="hidden border-l border-dashboard-border pl-4 font-mono text-[0.65rem] uppercase leading-4 tracking-[0.12em] text-dashboard-muted xl:block">
                Disciplined projects
                <br />
                deliver real outcomes
              </span>
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  )
}

export { CreateProjectButton }
