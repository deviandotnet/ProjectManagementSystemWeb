import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ProjectsGallery } from './ProjectsGallery.jsx'
import { MemoryRouter } from 'react-router-dom'

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

function renderGallery(overrides = {}) {
  const props = {
    accountId: '5e39ca38-f773-4bd0-bd7a-ccdbb1c2298a',
    data: {
      projects: [project],
      pageNumber: 1,
      pageSize: 6,
      totalCount: 8,
      totalPages: 2,
      hasPreviousPage: false,
      hasNextPage: true,
    },
    error: null,
    isError: false,
    isFetching: false,
    isLoading: false,
    onCopyAccountId: vi.fn(),
    onCreateProject: vi.fn(),
    onPageChange: vi.fn(),
    onPageSizeChange: vi.fn(),
    onRetry: vi.fn(),
    onViewModeChange: vi.fn(),
    pageSize: 6,
    viewMode: 'grid',
    ...overrides,
  }

  render(
    <MemoryRouter>
      <ProjectsGallery {...props} />
    </MemoryRouter>,
  )
  return props
}

describe('ProjectsGallery', () => {
  it('renders project cards and valid pagination controls', async () => {
    const user = userEvent.setup()
    const props = renderGallery()

    expect(
      screen.getByRole('heading', { name: 'Website redesign' }),
    ).toBeInTheDocument()
    expect(screen.getByText('1–6 of 8 projects')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(props.onPageChange).toHaveBeenCalledWith(2)

    await user.click(screen.getByRole('button', { name: 'List view' }))
    expect(props.onViewModeChange).toHaveBeenCalledWith('list')
  })

  it('renders the reference empty state and both available actions', async () => {
    const user = userEvent.setup()
    const props = renderGallery({
      data: {
        projects: [],
        pageNumber: 1,
        pageSize: 6,
        totalCount: 0,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    })

    expect(
      screen.getByRole('heading', { name: 'No projects yet' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Create project' }))
    await user.click(
      screen.getByRole('button', { name: 'Copy your account ID' }),
    )
    expect(props.onCreateProject).toHaveBeenCalledOnce()
    expect(props.onCopyAccountId).toHaveBeenCalledOnce()
  })

  it('shows a recoverable error state', async () => {
    const user = userEvent.setup()
    const props = renderGallery({
      data: undefined,
      error: { message: 'Unable to reach the server.' },
      isError: true,
    })

    expect(screen.getByText('Unable to reach the server.')).toBeInTheDocument()
    expect(screen.getByText('Count unavailable')).toBeInTheDocument()
    expect(screen.queryByText('0 projects')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(props.onRetry).toHaveBeenCalledOnce()
  })

  it('does not report zero projects while the first page is loading', () => {
    renderGallery({ data: undefined, isLoading: true })

    expect(screen.getByLabelText('Loading project count')).toBeInTheDocument()
    expect(screen.queryByText('0 projects')).not.toBeInTheDocument()
  })
})
