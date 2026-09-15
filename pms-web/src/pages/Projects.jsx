import Snackbar from '@mui/material/Snackbar'
import { useQueryClient } from '@tanstack/react-query'
import { lazy, Suspense, useState } from 'react'
import { WorkspaceShell } from '../components/layout/WorkspaceShell.jsx'
import { useAuth } from '../context/authContextDefinition.js'
import { dashboardKeys } from '../features/dashboard/index.js'
import {
  projectGalleryKeys,
  ProjectsGallery,
  useProjectGallery,
} from '../features/projects/index.js'

const LazyCreateProjectDialog = lazy(() =>
  import('../features/projects/components/CreateProjectDialog.jsx').then(
    (module) => ({ default: module.CreateProjectDialog }),
  ),
)

export default function Projects() {
  const { logout, user } = useAuth()
  const queryClient = useQueryClient()
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(6)
  const [viewMode, setViewMode] = useState('grid')
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const gallery = useProjectGallery(pageNumber, pageSize)

  const handlePageSizeChange = (nextPageSize) => {
    setPageSize(nextPageSize)
    setPageNumber(1)
  }

  const handleProjectCreated = () => {
    setIsCreateProjectOpen(false)
    setNotice('Project created.')
    void queryClient.invalidateQueries({ queryKey: projectGalleryKeys.all })
    void queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
  }

  const handleCopyAccountId = async () => {
    if (!user?.id) {
      return
    }

    try {
      await navigator.clipboard.writeText(user.id)
      setNotice('Account ID copied.')
    } catch {
      setNotice('Account ID could not be copied.')
    }
  }

  return (
    <>
      <WorkspaceShell
        activeSection="projects"
        onCreateProject={() => setIsCreateProjectOpen(true)}
        onLogout={logout}
        subtitle="View and manage the projects you can access."
        title="Projects"
      >
        <ProjectsGallery
          accountId={user?.id}
          data={gallery.data}
          error={gallery.error}
          isError={gallery.isError}
          isFetching={gallery.isFetching}
          isLoading={gallery.isLoading}
          onCopyAccountId={handleCopyAccountId}
          onCreateProject={() => setIsCreateProjectOpen(true)}
          onPageChange={setPageNumber}
          onPageSizeChange={handlePageSizeChange}
          onRetry={gallery.refetch}
          onViewModeChange={setViewMode}
          pageSize={pageSize}
          viewMode={viewMode}
        />
      </WorkspaceShell>

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
        message={notice}
        onClose={() => setNotice('')}
        open={Boolean(notice)}
      />
    </>
  )
}
