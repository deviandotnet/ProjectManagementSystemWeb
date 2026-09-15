import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined'
import FolderOpenOutlined from '@mui/icons-material/FolderOpenOutlined'
import OpenInNewOutlined from '@mui/icons-material/OpenInNewOutlined'
import PersonOutlineOutlined from '@mui/icons-material/PersonOutlineOutlined'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import { cn } from '../../../utils/cn.js'
import { Link as RouterLink } from 'react-router-dom'
import { projectRoute } from '../../../constants/routes.js'
import {
  formatDashboardDate,
  formatRole,
  getProjectStatus,
} from '../../dashboard/model/dashboardViewModel.js'

function Stat({ label, tone = 'default', value }) {
  return (
    <div className="min-w-0 text-center">
      <strong
        className={cn(
          'block text-lg tabular-nums',
          tone === 'danger' && 'text-dashboard-danger',
          tone === 'success' && 'text-dashboard-success',
        )}
      >
        {value}
      </strong>
      <span className="text-xs text-dashboard-muted">{label}</span>
    </div>
  )
}

/** @param {{project: import('../../../types/dashboard.js').DashboardProjectSummary, viewMode?: 'grid'|'list'}} props */
export function ProjectDetailsCard({ project, viewMode = 'grid' }) {
  const status = getProjectStatus(project.status)
  const headingId = `project-${project.projectId}-title`

  return (
    <article
      aria-labelledby={headingId}
      className={cn(
        'rounded-2xl border border-dashboard-border bg-dashboard-surface p-5',
        viewMode === 'list' &&
          'lg:grid lg:grid-cols-[minmax(15rem,1fr)_minmax(20rem,1.4fr)_minmax(18rem,1fr)] lg:items-center lg:gap-8',
      )}
    >
      <div>
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-dashboard-muted">
          Project / {project.projectId.slice(0, 8)}
        </p>
        <div className="mt-3 flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-dashboard-accent-soft text-dashboard-accent-strong">
            <FolderOpenOutlined />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2
                className="font-display text-lg font-bold tracking-[-0.02em] text-dashboard-ink"
                id={headingId}
              >
                {project.projectName}
              </h2>
              <span
                className={cn(
                  'rounded-lg px-3 py-1 text-xs font-semibold',
                  status.tone === 'success' &&
                    'bg-dashboard-success-soft text-dashboard-success',
                  status.tone === 'complete' &&
                    'bg-dashboard-complete-soft text-dashboard-complete',
                  status.tone === 'warning' &&
                    'bg-dashboard-warning-soft text-dashboard-warning',
                  status.tone === 'neutral' &&
                    'bg-dashboard-neutral-soft text-dashboard-muted',
                )}
              >
                {status.label}
              </span>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <LinearProgress
                aria-label={`${project.progressPercent}% complete`}
                className="h-2 flex-1 rounded-full bg-dashboard-track"
                value={Math.min(100, Math.max(0, project.progressPercent))}
                variant="determinate"
              />
              <strong className="text-sm tabular-nums">
                {project.progressPercent}%
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div className={cn('mt-5', viewMode === 'list' && 'lg:mt-0')}>
        <div className="flex flex-col gap-2 text-sm text-dashboard-muted sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2">
            <CalendarMonthOutlined fontSize="small" />
            <time dateTime={project.startDate}>
              {formatDashboardDate(project.startDate)}
            </time>
            <span aria-hidden="true">→</span>
            <time dateTime={project.endDate}>
              {formatDashboardDate(project.endDate)}
            </time>
          </span>
          <span className="flex items-center gap-2">
            <PersonOutlineOutlined fontSize="small" />
            {formatRole(project.myRole)}
          </span>
        </div>
        <div className="mt-5 border-t border-dashboard-border pt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.06em] text-dashboard-muted">
            Action Items
          </p>
          <div className="grid grid-cols-4 divide-x divide-dashboard-border">
            <Stat label="Total" value={project.totalActionItems} />
            <Stat label="Ongoing" value={project.ongoingActionItems} />
            <Stat
              label="Delayed"
              tone="danger"
              value={project.delayedActionItems}
            />
            <Stat
              label="Completed"
              tone="success"
              value={project.completedActionItems}
            />
          </div>
        </div>
      </div>

      <div
        className={cn(
          'mt-5 border-t border-dashboard-border pt-3',
          viewMode === 'list' &&
            'lg:mt-0 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0',
        )}
      >
        <Button
          component={RouterLink}
          to={projectRoute(project.projectId)}
          startIcon={<OpenInNewOutlined />}
          variant="outlined"
        >
          Open project
        </Button>
      </div>
    </article>
  )
}
