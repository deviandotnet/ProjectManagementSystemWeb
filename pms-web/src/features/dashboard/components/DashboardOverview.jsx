import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined'
import FolderOpenOutlined from '@mui/icons-material/FolderOpenOutlined'
import PlayCircleOutlined from '@mui/icons-material/PlayCircleOutlined'
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined'
import {
  createDashboardSummary,
  formatDashboardDate,
  formatRole,
  getProjectStatus,
} from '../model/dashboardViewModel.js'

const STATUS_TONE_CLASSES = {
  complete: 'bg-dashboard-complete-soft text-dashboard-complete',
  neutral: 'bg-dashboard-neutral-soft text-dashboard-muted',
  success: 'bg-dashboard-success-soft text-dashboard-success',
  warning: 'bg-dashboard-warning-soft text-dashboard-warning',
}

function ProgressBar({ label, value }) {
  const normalizedValue = Math.max(0, Math.min(100, value))

  return (
    <div className="flex min-w-28 items-center gap-3">
      <div
        aria-label={label}
        aria-valuemax="100"
        aria-valuemin="0"
        aria-valuenow={Math.round(normalizedValue)}
        className="h-2 flex-1 overflow-hidden rounded-full bg-dashboard-track"
        role="progressbar"
      >
        <span
          className="block h-full rounded-full bg-dashboard-accent-strong"
          style={{ width: `${normalizedValue}%` }}
        />
      </div>
      <span className="w-10 text-right font-mono text-xs font-bold tabular-nums">
        {Math.round(normalizedValue)}%
      </span>
    </div>
  )
}

function StatusBadge({ status }) {
  const statusView = getProjectStatus(status)

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_TONE_CLASSES[statusView.tone]}`}
    >
      {statusView.label}
    </span>
  )
}

function MetricBand({ summary }) {
  const metrics = [
    {
      label: 'Accessible projects',
      value: summary.accessibleProjects,
      icon: FolderOpenOutlined,
      tone: 'text-dashboard-accent-strong bg-dashboard-accent-soft',
    },
    {
      label: 'Active projects',
      value: summary.activeProjects,
      icon: PlayCircleOutlined,
      tone: 'text-dashboard-success bg-dashboard-success-soft',
    },
    {
      label: 'Projects with delays',
      value: summary.projectsWithDelays,
      icon: WarningAmberOutlined,
      tone: 'text-dashboard-danger bg-dashboard-danger-soft',
    },
    {
      label: 'Completed projects',
      value: summary.completedProjects,
      icon: CheckCircleOutlined,
      tone: 'text-dashboard-complete bg-dashboard-complete-soft',
    },
  ]

  return (
    <section
      aria-label="Project overview"
      className="grid overflow-hidden rounded-2xl border border-dashboard-border bg-dashboard-surface min-[360px]:grid-cols-2 xl:grid-cols-4"
    >
      {metrics.map(({ icon: Icon, label, tone, value }) => (
        <div
          className="flex min-h-28 items-center gap-3 border-b border-dashboard-border px-4 py-4 min-[360px]:odd:border-r sm:gap-4 sm:px-5 xl:border-b-0 xl:not-last:border-r"
          key={label}
        >
          <span
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${tone}`}
          >
            <Icon fontSize="small" />
          </span>
          <div>
            <p className="text-3xl font-bold tracking-[-0.03em] tabular-nums">
              {value}
            </p>
            <p className="mt-0.5 text-sm text-dashboard-muted">{label}</p>
          </div>
        </div>
      ))}
    </section>
  )
}

function ProjectTable({ projects, totalCount }) {
  const visibleProjects = projects.slice(0, 8)

  return (
    <section className="overflow-hidden rounded-2xl border border-dashboard-border bg-dashboard-surface">
      <header className="flex items-end justify-between gap-5 border-b border-dashboard-border px-5 py-5">
        <div>
          <h2 className="text-xl font-bold tracking-[-0.025em]">
            Portfolio health
          </h2>
          <p className="mt-1 text-sm text-dashboard-muted">
            Project progress, key dates, ownership, and Action Item status.
          </p>
        </div>
        <p className="hidden text-xs text-dashboard-muted sm:block">
          Showing {visibleProjects.length} of {totalCount}
        </p>
      </header>

      <div className="hidden overflow-x-auto xl:block">
        <table className="w-full min-w-[850px] border-collapse text-left text-sm">
          <caption className="sr-only">
            Accessible project health summary
          </caption>
          <thead className="bg-dashboard-surface-muted text-[0.68rem] uppercase tracking-[0.08em] text-dashboard-muted">
            <tr>
              <th className="px-5 py-3 font-semibold" scope="col">
                Project
              </th>
              <th className="px-4 py-3 font-semibold" scope="col">
                Progress
              </th>
              <th className="px-4 py-3 font-semibold" scope="col">
                Dates
              </th>
              <th className="px-4 py-3 font-semibold" scope="col">
                Status
              </th>
              <th className="px-4 py-3 font-semibold" scope="col">
                My role
              </th>
              <th className="px-3 py-3 text-center font-semibold" scope="col">
                Plan
              </th>
              <th className="px-3 py-3 text-center font-semibold" scope="col">
                Ongoing
              </th>
              <th className="px-3 py-3 text-center font-semibold" scope="col">
                Delayed
              </th>
              <th className="px-3 py-3 text-center font-semibold" scope="col">
                Completed
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleProjects.map((project) => (
              <tr
                className="border-t border-dashboard-border"
                key={project.projectId}
              >
                <th className="px-5 py-3 font-semibold" scope="row">
                  <span className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-dashboard-accent-soft text-dashboard-accent-strong">
                      <FolderOpenOutlined fontSize="small" />
                    </span>
                    <span className="max-w-48 truncate">
                      {project.projectName}
                    </span>
                  </span>
                </th>
                <td className="px-4 py-3">
                  <ProgressBar
                    label={`${project.projectName} progress`}
                    value={project.progressPercent}
                  />
                </td>
                <td className="px-4 py-3 text-xs leading-5 text-dashboard-muted">
                  {formatDashboardDate(project.startDate)}
                  <br />
                  {formatDashboardDate(project.endDate)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={project.status} />
                </td>
                <td className="px-4 py-3 text-dashboard-muted">
                  {formatRole(project.myRole)}
                </td>
                <td className="px-3 py-3 text-center font-mono tabular-nums">
                  {project.plannedActionItems}
                </td>
                <td className="px-3 py-3 text-center font-mono tabular-nums">
                  {project.ongoingActionItems}
                </td>
                <td className="px-3 py-3 text-center font-mono tabular-nums">
                  {project.delayedActionItems}
                </td>
                <td className="px-3 py-3 text-center font-mono tabular-nums">
                  {project.completedActionItems}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-dashboard-border xl:hidden">
        {visibleProjects.map((project) => (
          <article className="p-5" key={project.projectId}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold">{project.projectName}</h3>
                <p className="mt-1 text-xs text-dashboard-muted">
                  {formatDashboardDate(project.startDate)} to{' '}
                  {formatDashboardDate(project.endDate)}
                </p>
                <p className="mt-1 text-xs text-dashboard-muted">
                  {formatRole(project.myRole)}
                </p>
              </div>
              <StatusBadge status={project.status} />
            </div>
            <div className="mt-4">
              <ProgressBar
                label={`${project.projectName} progress`}
                value={project.progressPercent}
              />
            </div>
            <dl className="mt-4 grid grid-cols-4 divide-x divide-dashboard-border border-t border-dashboard-border pt-4 text-center">
              {[
                ['Plan', project.plannedActionItems],
                ['Ongoing', project.ongoingActionItems],
                ['Delayed', project.delayedActionItems],
                ['Done', project.completedActionItems],
              ].map(([label, value]) => (
                <div key={label}>
                  <dd className="font-mono text-sm font-bold tabular-nums">
                    {value}
                  </dd>
                  <dt className="mt-1 text-[0.65rem] text-dashboard-muted">
                    {label}
                  </dt>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </section>
  )
}

function Distribution({ summary }) {
  const segments = [
    ['Plan', summary.planned, 'var(--color-dashboard-plan)'],
    ['Ongoing', summary.ongoing, 'var(--color-dashboard-success)'],
    ['Delayed', summary.delayed, 'var(--color-dashboard-danger)'],
    ['Completed', summary.completed, 'var(--color-dashboard-complete)'],
  ]
  let currentStop = 0
  const stops = segments.map(([, value, color]) => {
    const start = currentStop
    currentStop += summary.totalActionItems
      ? (value / summary.totalActionItems) * 100
      : 0
    return `${color} ${start}% ${currentStop}%`
  })
  const background = summary.totalActionItems
    ? `conic-gradient(${stops.join(', ')})`
    : 'var(--color-dashboard-track)'

  return (
    <section className="rounded-2xl border border-dashboard-border bg-dashboard-surface p-5">
      <h2 className="text-lg font-bold">Action Item status</h2>
      <p className="mt-1 text-sm text-dashboard-muted">
        Across all accessible projects.
      </p>
      <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row">
        <div
          className="relative grid h-40 w-40 shrink-0 place-items-center rounded-full"
          style={{ background }}
        >
          <div className="grid h-24 w-24 place-items-center rounded-full bg-dashboard-surface text-center">
            <span>
              <strong className="block text-2xl tabular-nums">
                {summary.totalActionItems}
              </strong>
              <span className="text-xs text-dashboard-muted">Action Items</span>
            </span>
          </div>
        </div>
        <dl className="w-full space-y-2">
          {segments.map(([label, value, color]) => (
            <div
              className="flex items-center justify-between gap-4 border-b border-dashboard-border pb-2 text-sm"
              key={label}
            >
              <dt className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {label}
              </dt>
              <dd className="font-mono font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

function ProjectProgress({ projects }) {
  return (
    <section className="rounded-2xl border border-dashboard-border bg-dashboard-surface p-5">
      <h2 className="text-lg font-bold">Project progress</h2>
      <p className="mt-1 text-sm text-dashboard-muted">
        Completion percentage by project.
      </p>
      <div className="mt-6 space-y-5">
        {projects.slice(0, 5).map((project) => (
          <div
            className="grid gap-2 sm:grid-cols-[minmax(7rem,0.8fr)_1.2fr] sm:items-center"
            key={project.projectId}
          >
            <p className="truncate text-sm font-medium">
              {project.projectName}
            </p>
            <ProgressBar
              label={`${project.projectName} progress`}
              value={project.progressPercent}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

function Attention({ delayedProjects }) {
  return (
    <section className="rounded-2xl border border-dashboard-border bg-dashboard-surface">
      <header className="border-b border-dashboard-border px-5 py-5">
        <h2 className="text-xl font-bold">Attention</h2>
        <p className="mt-1 text-sm text-dashboard-muted">
          Projects containing delayed Action Items.
        </p>
      </header>
      {delayedProjects.length ? (
        <ul className="divide-y divide-dashboard-border">
          {delayedProjects.slice(0, 6).map((project) => (
            <li
              className="flex items-center justify-between gap-4 px-5 py-4"
              key={project.projectId}
            >
              <span className="flex min-w-0 items-center gap-3 font-semibold">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-dashboard-danger" />
                <span className="truncate">{project.projectName}</span>
              </span>
              <span className="shrink-0 text-sm font-semibold text-dashboard-danger">
                {project.delayedActionItems} delayed
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-5 py-8 text-sm text-dashboard-muted">
          No projects currently contain delayed Action Items.
        </p>
      )}
    </section>
  )
}

export function DashboardOverview({ data }) {
  const summary = createDashboardSummary(data)

  return (
    <div className="space-y-4">
      <MetricBand summary={summary} />
      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <ProjectTable projects={data.projects} totalCount={data.totalCount} />
          <div className="grid gap-4 lg:grid-cols-2">
            <Distribution summary={summary} />
            <ProjectProgress projects={summary.projectsByProgress} />
          </div>
        </div>
        <Attention delayedProjects={summary.delayedProjects} />
      </div>
    </div>
  )
}
