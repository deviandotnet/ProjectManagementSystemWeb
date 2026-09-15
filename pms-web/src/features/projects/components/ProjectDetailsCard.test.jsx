import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProjectDetailsCard } from './ProjectDetailsCard.jsx'
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

describe('ProjectDetailsCard', () => {
  it('renders API project fields and links to the workspace', () => {
    render(
      <MemoryRouter>
        <ProjectDetailsCard project={project} />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: 'Website redesign' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '42',
    )
    expect(screen.getByText('Project Manager')).toBeInTheDocument()
    expect(screen.getByText('1')).toHaveClass('text-dashboard-danger')
    expect(screen.getByRole('link', { name: 'Open project' })).toHaveAttribute(
      'href',
      `/projects/${project.projectId}`,
    )
  })
})
