import InfoOutlined from '@mui/icons-material/InfoOutlined'
import Link from '@mui/material/Link'
import { Link as RouterLink } from 'react-router-dom'
import { routes } from '../../../constants/routes.js'
import { DisabledCreateButton } from './DashboardShell.jsx'

const SETUP_STEPS = [
  {
    title: 'Create a project',
    description: 'Set dates and timeline defaults.',
  },
  {
    title: 'Structure the work',
    description: 'Add categories and optional subcategories.',
  },
  {
    title: 'Add Action Items',
    description: 'Assign owners and planned dates.',
  },
]

function FolderBlueprint() {
  return (
    <div
      className="relative mx-auto aspect-[1.25] w-full max-w-lg overflow-hidden"
      aria-hidden="true"
    >
      <svg className="h-full w-full" viewBox="0 0 520 410">
        <defs>
          <pattern
            height="42"
            id="dashboard-grid"
            patternUnits="userSpaceOnUse"
            width="42"
          >
            <path
              d="M 42 0 L 0 0 0 42"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.13"
            />
          </pattern>
        </defs>
        <rect fill="url(#dashboard-grid)" height="100%" width="100%" />
        <circle
          cx="220"
          cy="205"
          fill="none"
          r="145"
          stroke="currentColor"
          strokeDasharray="7 8"
          strokeOpacity="0.28"
        />
        <path
          d="M120 142v-34c0-12 10-22 22-22h86l38 42h136c14 0 25 11 25 25v38"
          fill="var(--color-dashboard-blueprint-fill)"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          d="M120 172c3-14 15-24 29-24h274c18 0 31 17 27 34l-49 150c-4 13-16 22-29 22H143c-13 0-23-12-20-25z"
          fill="var(--color-dashboard-blueprint-fill)"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          d="M450 54v34M433 71h34"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <circle
          cx="412"
          cy="346"
          fill="none"
          r="22"
          stroke="currentColor"
          strokeDasharray="5 5"
          strokeOpacity="0.4"
        />
      </svg>
    </div>
  )
}

export function DashboardEmptyState() {
  return (
    <section className="rounded-2xl border border-dashboard-border bg-dashboard-surface p-5 sm:p-8 lg:p-10">
      <p className="font-mono text-xs uppercase tracking-[0.13em] text-dashboard-muted">
        Workspace / Zero projects
      </p>

      <div className="mt-8 grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
        <div className="lg:pl-6">
          <h2 className="max-w-xl text-4xl font-bold tracking-[-0.04em] text-balance sm:text-5xl">
            Create your first project
          </h2>
          <p className="mt-4 max-w-[38rem] text-lg leading-8 text-dashboard-muted sm:text-xl">
            Projects organize schedules, categories, members, and Action Items
            in one shared workspace.
          </p>
          <div className="mt-7">
            <DisabledCreateButton />
          </div>
          <Link
            className="mt-5 inline-flex"
            component={RouterLink}
            to={routes.account}
            underline="always"
          >
            View account details
          </Link>
        </div>
        <FolderBlueprint />
      </div>

      <ol className="mt-8 grid border-t border-dashboard-border md:grid-cols-3">
        {SETUP_STEPS.map((step, index) => (
          <li
            className="flex gap-4 border-b border-dashboard-border py-6 md:border-b-0 md:px-6 md:first:pl-0 md:not-first:border-l"
            key={step.title}
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-dashboard-accent-soft text-lg font-bold text-dashboard-accent-strong">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div>
              <h3 className="text-base font-bold">{step.title}</h3>
              <p className="mt-1 text-sm leading-5 text-dashboard-muted">
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-2 flex items-center gap-4 rounded-xl bg-dashboard-info px-5 py-4 text-dashboard-muted md:mt-6">
        <InfoOutlined className="shrink-0 text-dashboard-accent-strong" />
        <p className="text-sm sm:text-base">
          You become Project Manager for projects you create.
        </p>
      </div>
    </section>
  )
}
