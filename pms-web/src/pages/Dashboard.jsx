import Snackbar from '@mui/material/Snackbar'
import { useQueryClient } from '@tanstack/react-query'
import { lazy, Suspense, useState } from 'react'
import { useAuth } from '../context/authContextDefinition.js'
import {
  DashboardPresentation,
  dashboardKeys,
  useDashboard,
} from '../features/dashboard/index.js'

const LazyCreateProjectDialog = lazy(() =>
  import('../features/projects/components/CreateProjectDialog.jsx').then(
    (module) => ({ default: module.CreateProjectDialog }),
  ),
)

export default function Dashboard() {
  const { logout, user } = useAuth()
  const queryClient = useQueryClient()
  const dashboard = useDashboard()
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  const [showCreatedMessage, setShowCreatedMessage] = useState(false)

  const handleProjectCreated = () => {
    setIsCreateProjectOpen(false)
    setShowCreatedMessage(true)
    void queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
  }

  return (
    <>
      <DashboardPresentation
        data={dashboard.data}
        error={dashboard.error}
        firstName={user?.firstName ?? 'there'}
        isError={dashboard.isError}
        isLoading={dashboard.isLoading}
        onCreateProject={() => setIsCreateProjectOpen(true)}
        onLogout={logout}
        onRetry={dashboard.refetch}
      />
      {isCreateProjectOpen ? (
        <Suspense fallback={null}>
          <LazyCreateProjectDialog
            onClose={() => setIsCreateProjectOpen(false)}
            onCreated={handleProjectCreated}
            open
          />
        </Suspense>
      ) : null}
      <Snackbar
        autoHideDuration={4000}
        message="Project created."
        onClose={() => setShowCreatedMessage(false)}
        open={showCreatedMessage}
      />
    </>
  )
}
