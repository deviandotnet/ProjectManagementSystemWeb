import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { WorkspaceShell } from '../components/layout/WorkspaceShell.jsx'
import { useAuth } from '../context/authContextDefinition.js'
import {
  ActionItemDetailsDrawer,
  ActionItemsRegister,
  ActionItemsToolbar,
  AnalyticsPreview,
  CategoryManagerDrawer,
  CreateActionItemDrawer,
  EmptyRegister,
  EditActionItemDrawer,
  ProjectWorkspaceHeader,
  TimelinePreview,
  WorkspaceProblem,
  WorkspaceTabs,
} from '../features/project-workspace/components/ProjectWorkspaceView.jsx'
import {
  useProjectWorkspace,
  useSubCategories,
} from '../features/project-workspace/hooks/useProjectWorkspace.js'
import {
  canCreateInProject,
  getProjectCapabilities,
  mergeRegisterCategories,
} from '../features/project-workspace/model/workspaceModel.js'

function useDebounced(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])
  return debounced
}

const initialFilters = {
  searchInput: '',
  ownerInput: '',
  categoryId: '',
  subCategoryId: '',
  statuses: [],
  priority: '',
  pageNumber: 1,
  pageSize: 50,
}

export default function ProjectWorkspace() {
  const { projectId } = useParams()
  const { logout, user } = useAuth()
  const [tab, setTab] = useState('items')
  const [filters, setFilters] = useState(initialFilters)
  const [collapsed, setCollapsed] = useState(() => new Set())
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [actionOpen, setActionOpen] = useState(false)
  const [detailId, setDetailId] = useState('')
  const [editId, setEditId] = useState('')
  const [notice, setNotice] = useState('')
  const search = useDebounced(filters.searchInput)
  const ownerName = useDebounced(filters.ownerInput)
  const queryFilters = useMemo(
    () => ({
      pageNumber: filters.pageNumber,
      pageSize: filters.pageSize,
      categoryId: filters.categoryId,
      subCategoryId: filters.subCategoryId,
      statuses: filters.statuses,
      priority: filters.priority,
      search,
      ownerName,
    }),
    [
      filters.pageNumber,
      filters.pageSize,
      filters.categoryId,
      filters.subCategoryId,
      filters.statuses,
      filters.priority,
      search,
      ownerName,
    ],
  )
  const workspace = useProjectWorkspace(projectId, queryFilters)
  const subs = useSubCategories(filters.categoryId)
  const queries = [
    workspace.project,
    workspace.progress,
    workspace.members,
    workspace.categories,
    workspace.grouped,
  ]
  const loading = queries.some((query) => query.isLoading)
  const errorQuery = queries.find((query) => query.isError)
  const permission = canCreateInProject(user, workspace.members.data)
  const hasFilters = Boolean(
    search ||
    ownerName ||
    filters.categoryId ||
    filters.subCategoryId ||
    filters.statuses.length ||
    filters.priority !== '',
  )
  const changeFilter = (key, value) =>
    setFilters((current) => ({
      ...current,
      [key]: value,
      pageNumber: 1,
      ...(key === 'categoryId' ? { subCategoryId: '' } : {}),
    }))
  const resetFilters = () =>
    setFilters({ ...initialFilters, pageSize: filters.pageSize })
  const retry = () => queries.forEach((query) => query.refetch())
  const toggle = (id) =>
    setCollapsed((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  if (loading)
    return (
      <WorkspaceShell
        activeSection="projects"
        onLogout={logout}
        pageHeader={<span />}
      >
        <div className="grid min-h-[70vh] place-items-center">
          <CircularProgress aria-label="Loading project workspace" />
        </div>
      </WorkspaceShell>
    )
  if (errorQuery)
    return (
      <WorkspaceShell
        activeSection="projects"
        onLogout={logout}
        pageHeader={<span />}
      >
        <WorkspaceProblem error={errorQuery.error} onRetry={retry} />
      </WorkspaceShell>
    )
  const { project, progress, members, categories, grouped } =
    Object.fromEntries(
      Object.entries(workspace).map(([key, query]) => [key, query.data]),
    )
  const capabilities = getProjectCapabilities(user, members, project)
  const registerData = hasFilters
    ? grouped
    : mergeRegisterCategories(grouped, categories)
  let emptyKind = ''
  if (grouped.totalCount === 0) {
    if (hasFilters) emptyKind = 'filtered'
    else if (categories.length === 0) emptyKind = 'fresh'
  }
  return (
    <>
      <WorkspaceShell
        activeSection="projects"
        onLogout={logout}
        pageHeader={
          <ProjectWorkspaceHeader
            project={project}
            progress={progress}
            role={permission.role}
          />
        }
      >
        <WorkspaceTabs active={tab} onChange={setTab} />
        {tab === 'items' ? (
          <div className="mt-5">
            <ActionItemsToolbar
              filters={filters}
              categories={categories}
              subCategories={subs.data ?? []}
              onChange={changeFilter}
              onManage={() => setCategoryOpen(true)}
              onNew={() => setActionOpen(true)}
              canWrite={permission.allowed}
            />
            {emptyKind ? (
              <EmptyRegister
                kind={emptyKind}
                canWrite={permission.allowed}
                onManage={() => setCategoryOpen(true)}
                onNew={() => setActionOpen(true)}
                onReset={resetFilters}
              />
            ) : (
              <ActionItemsRegister
                data={registerData}
                collapsed={collapsed}
                onToggle={toggle}
                onOpen={setDetailId}
                pageSize={filters.pageSize}
                onPage={(pageNumber) =>
                  setFilters((current) => ({ ...current, pageNumber }))
                }
                onPageSize={(pageSize) =>
                  setFilters((current) => ({
                    ...current,
                    pageSize,
                    pageNumber: 1,
                  }))
                }
                canDelete={capabilities.canDelete}
                canEdit={capabilities.canEdit}
                members={members}
                onEdit={setEditId}
                onNotice={setNotice}
                project={project}
              />
            )}
          </div>
        ) : null}
        {tab === 'timeline' ? <TimelinePreview project={project} /> : null}
        {tab === 'analytics' ? <AnalyticsPreview progress={progress} /> : null}
      </WorkspaceShell>
      <CategoryManagerDrawer
        open={categoryOpen}
        onClose={() => setCategoryOpen(false)}
        categories={categories}
        projectId={projectId}
      />
      <CreateActionItemDrawer
        open={actionOpen}
        onClose={() => setActionOpen(false)}
        categories={categories}
        members={members}
        project={project}
        projectId={projectId}
        onCreated={() => {
          setActionOpen(false)
          setNotice('Action Item created.')
        }}
      />
      <ActionItemDetailsDrawer
        projectId={projectId}
        actionItemId={detailId}
        onClose={() => setDetailId('')}
      />
      <EditActionItemDrawer
        key={editId || 'closed-edit'}
        actionItemId={editId}
        categories={categories}
        members={members}
        onClose={() => setEditId('')}
        onSaved={() => {
          setEditId('')
          setNotice('Action Item updated.')
        }}
        project={project}
        projectId={projectId}
      />
      <Snackbar
        open={Boolean(notice)}
        message={notice}
        autoHideDuration={4000}
        onClose={() => setNotice('')}
      />
    </>
  )
}
