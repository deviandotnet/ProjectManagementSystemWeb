import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { DashboardPresentation } from './DashboardPresentation.jsx'

const project = {
  projectId: '7da8200f-6ecf-48df-9f12-1fa49e150f70',
  projectName: 'Website redesign',
  status: 'Active',
  progressPercent: 42,
  totalActionItems: 7,
  completedActionItems: 2,
  ongoingActionItems: 3,
  delayedActionItems: 1,
  plannedActionItems: 1,
  startDate: '2026-09-01',
  endDate: '2026-12-15',
  myRole: 'ProjectManager',
}

function renderDashboard(props = {}) {
  render(
    <MemoryRouter>
      <DashboardPresentation
        data={undefined}
        error={null}
        firstName="Taylor"
        isError={false}
        isLoading={false}
        onLogout={vi.fn()}
        onRetry={vi.fn()}
        {...props}
      />
    </MemoryRouter>,
  )
}

describe('dashboard presentation', () => {
  it('shows the reference empty state when there are no accessible projects', () => {
    renderDashboard({
      data: {
        projects: [],
        pageNumber: 1,
        pageSize: 100,
        totalCount: 0,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    })

    expect(
      screen.getByRole('heading', {
        name: 'Welcome to ProManage, Taylor',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Create your first project' }),
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole('button', { name: 'Create project unavailable' }),
    ).toHaveLength(2)
    expect(
      screen.getAllByRole('button', { name: 'Create project unavailable' })[0],
    ).toBeDisabled()
  })

  it('renders real project data and delayed-project attention', () => {
    renderDashboard({
      data: {
        projects: [project],
        pageNumber: 1,
        pageSize: 100,
        totalCount: 1,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    })

    expect(
      screen.getByRole('heading', { name: 'Welcome back, Taylor' }),
    ).toBeInTheDocument()
    expect(screen.getAllByText('Website redesign').length).toBeGreaterThan(0)
    expect(screen.getByText('1 delayed')).toBeInTheDocument()
    expect(
      screen.queryByText('Create your first project'),
    ).not.toBeInTheDocument()
  })

  it('shows loading and unavailable states with retry', async () => {
    const onRetry = vi.fn()
    const user = userEvent.setup()
    const { rerender } = render(
      <MemoryRouter>
        <DashboardPresentation
          firstName="Taylor"
          isError={false}
          isLoading
          onLogout={vi.fn()}
          onRetry={onRetry}
        />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('status', { name: 'Loading dashboard' }),
    ).toBeInTheDocument()

    rerender(
      <MemoryRouter>
        <DashboardPresentation
          error={{ message: 'Unable to reach the server.' }}
          firstName="Taylor"
          isError
          isLoading={false}
          onLogout={vi.fn()}
          onRetry={onRetry}
        />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('preserves the existing sign-out action', async () => {
    const onLogout = vi.fn()
    const user = userEvent.setup()
    renderDashboard({
      data: {
        projects: [],
        pageNumber: 1,
        pageSize: 100,
        totalCount: 0,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false,
      },
      onLogout,
    })

    await user.click(screen.getAllByRole('button', { name: 'Sign out' })[0])
    expect(onLogout).toHaveBeenCalledOnce()
  })
})
