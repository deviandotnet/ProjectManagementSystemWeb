import ContentCopyOutlined from '@mui/icons-material/ContentCopyOutlined'
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined'
import GroupsOutlined from '@mui/icons-material/GroupsOutlined'
import Button from '@mui/material/Button'
import emptyProjectsImage from '../../../assets/projects-gallery-empty.png'
import { CreateProjectButton } from '../../../components/layout/WorkspaceShell.jsx'

export function ProjectsGalleryEmpty({
  accountId,
  onCopyAccountId,
  onCreateProject,
}) {
  return (
    <section className="mt-4 overflow-hidden rounded-2xl border border-dashboard-border bg-dashboard-surface px-5 py-10 text-center sm:px-8 sm:py-14">
      <img
        alt="An empty project archive drawer"
        className="mx-auto w-full max-w-xl object-contain"
        decoding="async"
        src={emptyProjectsImage}
      />
      <h2 className="font-display mt-2 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
        No projects yet
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-base leading-7 text-dashboard-muted sm:text-lg">
        Create a project to begin planning, or wait until a project manager adds
        you to an existing project.
      </p>
      <div className="mt-6">
        <CreateProjectButton onClick={onCreateProject} />
      </div>
      <Button
        className="mt-3"
        disabled={!accountId}
        onClick={onCopyAccountId}
        startIcon={<ContentCopyOutlined />}
        variant="text"
      >
        Copy your account ID
      </Button>
      <p className="text-sm text-dashboard-muted">
        Share it with a project manager to be added.
      </p>

      <div className="mx-auto mt-10 grid max-w-3xl gap-6 border-t border-dashboard-border pt-8 text-left sm:grid-cols-2 sm:divide-x sm:divide-dashboard-border">
        <div className="flex gap-4 sm:pr-8">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-dashboard-accent-soft text-dashboard-accent-strong">
            <DescriptionOutlined />
          </span>
          <div>
            <h3 className="font-display font-bold">Start a project</h3>
            <p className="mt-1 text-sm text-dashboard-muted">
              You become its Project Manager.
            </p>
          </div>
        </div>
        <div className="flex gap-4 sm:pl-8">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-dashboard-accent-soft text-dashboard-accent-strong">
            <GroupsOutlined />
          </span>
          <div>
            <h3 className="font-display font-bold">Join a project</h3>
            <p className="mt-1 text-sm text-dashboard-muted">
              A manager adds your account ID.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
