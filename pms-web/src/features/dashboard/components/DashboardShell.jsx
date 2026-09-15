import {
  CreateProjectButton,
  WorkspaceShell,
} from '../../../components/layout/WorkspaceShell.jsx'

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

  return (
    <WorkspaceShell
      activeSection="dashboard"
      onCreateProject={onCreateProject}
      onLogout={onLogout}
      subtitle={subtitle}
      title={title}
    >
      {children}
    </WorkspaceShell>
  )
}

export { CreateProjectButton }
