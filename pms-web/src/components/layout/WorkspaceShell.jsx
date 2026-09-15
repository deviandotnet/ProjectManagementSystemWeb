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
import { routes } from '../../constants/routes.js'
import { cn } from '../../utils/cn.js'

const CURRENT_DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

function BrandMark() {
  return (
    <div className="flex shrink-0 items-center gap-3 text-dashboard-sidebar-ink">
      <LayersOutlined className="text-dashboard-accent" fontSize="large" />
      <span className="font-display text-xl font-bold tracking-[-0.025em]">
        Workflow
      </span>
    </div>
  )
}

function WorkspaceLink({ active, children, icon, to }) {
  return (
    <RouterLink
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex min-h-12 items-center gap-3 rounded-xl px-4 font-semibold transition-colors',
        active
          ? 'bg-dashboard-sidebar-active text-dashboard-sidebar-ink'
          : 'text-dashboard-sidebar-muted hover:bg-white/5 hover:text-dashboard-sidebar-ink',
      )}
      to={to}
    >
      {icon}
      {children}
    </RouterLink>
  )
}

export function CreateProjectButton({ compact = false, onClick }) {
  return (
    <Button
      onClick={onClick}
      startIcon={<AddOutlined />}
      sx={{ minHeight: 44, px: compact ? 1.5 : 2.5 }}
      variant="contained"
    >
      {compact ? 'New project' : 'Create project'}
    </Button>
  )
}

export function WorkspaceShell({
  activeSection,
  children,
  onCreateProject,
  onLogout,
  pageHeader,
  subtitle,
  title,
}) {
  const today = CURRENT_DATE_FORMATTER.format(new Date())

  return (
    <div className="min-h-[100dvh] bg-dashboard-canvas text-dashboard-ink md:grid md:grid-cols-[15.5rem_minmax(0,1fr)]">
      <aside className="hidden h-[100vh] min-h-0 self-start flex-col overflow-y-auto bg-dashboard-sidebar px-5 py-6 supports-[height:100dvh]:h-[100dvh] md:sticky md:top-0 md:flex">
        <BrandMark />
        <nav aria-label="Workspace navigation" className="mt-12 shrink-0">
          <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-dashboard-sidebar-muted">
            Workspace
          </p>
          <div className="grid gap-2">
            <WorkspaceLink
              active={activeSection === 'dashboard'}
              icon={<DashboardOutlined fontSize="small" />}
              to={routes.dashboard}
            >
              Dashboard
            </WorkspaceLink>
            <WorkspaceLink
              active={activeSection === 'projects'}
              icon={<FolderOutlined fontSize="small" />}
              to={routes.projects}
            >
              Projects
            </WorkspaceLink>
          </div>
        </nav>
        <div className="mt-auto shrink-0 border-t border-dashboard-sidebar-line pt-5">
          <RouterLink
            className="flex min-h-11 items-center gap-3 px-3 text-sm text-dashboard-sidebar-muted transition-colors hover:text-dashboard-sidebar-ink"
            to={routes.account}
          >
            <AccountCircleOutlined fontSize="small" /> Account
          </RouterLink>
          <button
            className="flex min-h-11 w-full items-center gap-3 px-3 text-left text-sm text-dashboard-sidebar-muted transition-colors hover:text-dashboard-sidebar-ink"
            onClick={onLogout}
            type="button"
          >
            <LogoutOutlined fontSize="small" /> Sign out
          </button>
          <p className="mt-9 font-mono text-[0.65rem] tracking-[0.08em] text-dashboard-sidebar-muted">
            Plan. Build. Deliver.
          </p>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="bg-dashboard-sidebar px-4 md:hidden">
          <div className="flex min-h-16 items-center justify-between">
            <BrandMark />
            <IconButton
              aria-label="Sign out"
              onClick={onLogout}
              sx={{ color: 'var(--color-dashboard-sidebar-ink)' }}
            >
              <LogoutOutlined />
            </IconButton>
          </div>
          <nav
            aria-label="Mobile workspace navigation"
            className="flex gap-1 pb-3"
          >
            <WorkspaceLink
              active={activeSection === 'dashboard'}
              icon={<DashboardOutlined fontSize="small" />}
              to={routes.dashboard}
            >
              Dashboard
            </WorkspaceLink>
            <WorkspaceLink
              active={activeSection === 'projects'}
              icon={<FolderOutlined fontSize="small" />}
              to={routes.projects}
            >
              Projects
            </WorkspaceLink>
          </nav>
        </header>

        <main className="mx-auto w-full max-w-[96rem] px-4 py-6 sm:px-6 lg:px-8">
          {pageHeader !== undefined ? (
            pageHeader
          ) : (
            <header className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h1 className="font-display max-w-3xl text-3xl font-bold tracking-[-0.035em] text-balance sm:text-4xl">
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
                {onCreateProject ? (
                  <CreateProjectButton compact onClick={onCreateProject} />
                ) : null}
                <span className="hidden border-l border-dashboard-border pl-4 font-mono text-[0.65rem] uppercase leading-4 tracking-[0.12em] text-dashboard-muted xl:block">
                  Disciplined projects
                  <br />
                  deliver real outcomes
                </span>
              </div>
            </header>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}
