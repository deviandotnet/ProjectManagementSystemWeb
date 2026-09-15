import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import { cn } from '../../../utils/cn.js'
import { ProjectDetailsCard } from './ProjectDetailsCard.jsx'
import { ProjectsGalleryEmpty } from './ProjectsGalleryEmpty.jsx'
import { ProjectsGalleryToolbar } from './ProjectsGalleryToolbar.jsx'

function GalleryLoading({ viewMode }) {
  return (
    <div
      aria-label="Loading projects"
      className={cn(
        'mt-4 grid gap-4',
        viewMode === 'grid' && 'lg:grid-cols-2 xl:grid-cols-3',
      )}
      role="status"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton
          className="rounded-2xl"
          height={330}
          key={index}
          variant="rectangular"
        />
      ))}
    </div>
  )
}

function GalleryPagination({ data, disabled, onPageChange }) {
  if (data.totalPages <= 1) {
    return null
  }

  const visiblePages = Array.from(
    { length: Math.min(5, data.totalPages) },
    (_, index) => {
      const firstPage = Math.min(
        Math.max(1, data.pageNumber - 2),
        Math.max(1, data.totalPages - 4),
      )
      return firstPage + index
    },
  )

  return (
    <nav
      aria-label="Project pages"
      className="flex flex-wrap items-center justify-end gap-2"
    >
      <Button
        disabled={disabled || !data.hasPreviousPage}
        onClick={() => onPageChange(data.pageNumber - 1)}
        variant="outlined"
      >
        Previous
      </Button>
      {visiblePages.map((page) => (
        <Button
          aria-current={page === data.pageNumber ? 'page' : undefined}
          key={page}
          onClick={() => onPageChange(page)}
          variant={page === data.pageNumber ? 'contained' : 'outlined'}
        >
          {page}
        </Button>
      ))}
      <Button
        disabled={disabled || !data.hasNextPage}
        onClick={() => onPageChange(data.pageNumber + 1)}
        variant="outlined"
      >
        Next
      </Button>
    </nav>
  )
}

export function ProjectsGallery({
  accountId,
  data,
  error,
  isError,
  isFetching,
  isLoading,
  onCopyAccountId,
  onCreateProject,
  onPageChange,
  onPageSizeChange,
  onRetry,
  onViewModeChange,
  pageSize,
  viewMode,
}) {
  return (
    <>
      <ProjectsGalleryToolbar
        onPageSizeChange={onPageSizeChange}
        onViewModeChange={onViewModeChange}
        pageSize={pageSize}
        state={isLoading ? 'loading' : isError ? 'error' : 'success'}
        totalCount={data?.totalCount}
        viewMode={viewMode}
      />

      {isLoading ? <GalleryLoading viewMode={viewMode} /> : null}

      {isError ? (
        <Alert
          action={
            <Button color="inherit" onClick={onRetry} size="small">
              Retry
            </Button>
          }
          className="mt-4"
          severity="error"
        >
          {error?.message ?? 'Projects could not be loaded.'}
        </Alert>
      ) : null}

      {!isLoading && !isError && data?.totalCount === 0 ? (
        <ProjectsGalleryEmpty
          accountId={accountId}
          onCopyAccountId={onCopyAccountId}
          onCreateProject={onCreateProject}
        />
      ) : null}

      {!isLoading && !isError && data?.totalCount > 0 ? (
        <>
          <div
            aria-busy={isFetching}
            className={cn(
              'mt-4 grid gap-4',
              viewMode === 'grid' && 'lg:grid-cols-2 xl:grid-cols-3',
            )}
          >
            {data.projects.map((project) => (
              <ProjectDetailsCard
                key={project.projectId}
                project={project}
                viewMode={viewMode}
              />
            ))}
          </div>
          <footer className="mt-6 flex flex-col gap-4 border-t border-dashboard-border pt-5 text-sm text-dashboard-muted sm:flex-row sm:items-center sm:justify-between">
            <span>
              {(data.pageNumber - 1) * data.pageSize + 1}–
              {Math.min(data.pageNumber * data.pageSize, data.totalCount)} of{' '}
              {data.totalCount} projects
            </span>
            <GalleryPagination
              data={data}
              disabled={isFetching}
              onPageChange={onPageChange}
            />
          </footer>
          <span aria-live="polite" className="sr-only">
            {isFetching ? 'Updating projects' : 'Projects updated'}
          </span>
        </>
      ) : null}
    </>
  )
}
