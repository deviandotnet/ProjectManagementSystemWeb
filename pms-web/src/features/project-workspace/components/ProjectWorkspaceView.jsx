import AddOutlined from '@mui/icons-material/AddOutlined'
import ArrowBackOutlined from '@mui/icons-material/ArrowBackOutlined'
import CategoryOutlined from '@mui/icons-material/CategoryOutlined'
import ChevronRightOutlined from '@mui/icons-material/ChevronRightOutlined'
import CloseOutlined from '@mui/icons-material/CloseOutlined'
import ExpandMoreOutlined from '@mui/icons-material/ExpandMoreOutlined'
import FilterAltOffOutlined from '@mui/icons-material/FilterAltOffOutlined'
import FolderOpenOutlined from '@mui/icons-material/FolderOpenOutlined'
import DeleteOutlineOutlined from '@mui/icons-material/DeleteOutlineOutlined'
import EditOutlined from '@mui/icons-material/EditOutlined'
import MoreHorizOutlined from '@mui/icons-material/MoreHorizOutlined'
import SearchOutlined from '@mui/icons-material/SearchOutlined'
import TimelineOutlined from '@mui/icons-material/TimelineOutlined'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import Collapse from '@mui/material/Collapse'
import Drawer from '@mui/material/Drawer'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Menu from '@mui/material/Menu'
import Pagination from '@mui/material/Pagination'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import { Fragment, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { routes } from '../../../constants/routes.js'
import { cn } from '../../../utils/cn.js'
import { DateRangePicker } from '../../../components/forms/index.js'
import {
  useActionItem,
  useSubCategories,
  useWorkspaceMutations,
} from '../hooks/useProjectWorkspace.js'
import {
  actionItemToWritePayload,
  quickActionItemPayload,
} from '../model/actionItemForm.js'
import {
  ACTION_STATUSES,
  formatDate,
  getPriority,
  getStatus,
  MEMBER_ROLE,
  memberName,
  PRIORITIES,
  PROJECT_STATUS,
  TIMELINE_SCALE,
} from '../model/workspaceModel.js'

const fieldSx = { '& .MuiInputBase-root': { minHeight: 44 } }
const toneClass = {
  plan: 'bg-dashboard-neutral-soft text-dashboard-muted',
  complete: 'bg-dashboard-complete-soft text-dashboard-complete',
  ongoing: 'action-status-ongoing text-dashboard-success',
  danger: 'bg-dashboard-danger-soft text-dashboard-danger',
  success: 'bg-dashboard-success-soft text-dashboard-success',
  warning: 'bg-dashboard-warning-soft text-dashboard-warning',
}

function Badge({ item }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-lg px-2 py-1 text-xs font-semibold',
        toneClass[item.tone],
      )}
    >
      {item.label}
    </span>
  )
}
function Missing({ children = 'Not set' }) {
  return <span className="text-dashboard-muted">{children}</span>
}

export function ProjectWorkspaceHeader({ project, progress, role }) {
  return (
    <div className="mb-6 border-b border-dashboard-border pb-6">
      <div className="flex flex-wrap items-center gap-2 text-sm text-dashboard-muted">
        <RouterLink
          className="inline-flex min-h-11 items-center gap-2 font-semibold text-dashboard-accent-strong"
          to={routes.projects}
        >
          <ArrowBackOutlined fontSize="small" /> Projects
        </RouterLink>
        <ChevronRightOutlined fontSize="small" aria-hidden="true" />
        <span>{project.name}</span>
      </div>
      <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
              {project.name}
            </h1>
            <Badge
              item={{
                label: PROJECT_STATUS[project.status] ?? 'Unknown',
                tone:
                  project.status === 1
                    ? 'success'
                    : project.status === 3
                      ? 'complete'
                      : 'warning',
              }}
            />
          </div>
          <p className="mt-2 max-w-3xl text-dashboard-muted">
            {project.description || 'No project description has been provided.'}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-x-7 gap-y-3 border-t border-dashboard-border pt-4 text-sm sm:grid-cols-4 xl:border-l xl:border-t-0 xl:pl-7 xl:pt-0">
          <div>
            <dt className="text-dashboard-muted">Progress</dt>
            <dd className="mt-1 font-mono text-lg font-bold tabular-nums">
              {progress.progressPercent}%
            </dd>
          </div>
          <div>
            <dt className="text-dashboard-muted">Schedule</dt>
            <dd className="mt-1 font-mono text-xs">
              {formatDate(project.startDate)}–{formatDate(project.endDate)}
            </dd>
          </div>
          <div>
            <dt className="text-dashboard-muted">Timeline</dt>
            <dd className="mt-1 font-semibold">
              {TIMELINE_SCALE[project.defaultTimelineScale] ?? 'Configured'}
            </dd>
          </div>
          <div>
            <dt className="text-dashboard-muted">Your role</dt>
            <dd className="mt-1 font-semibold">{role}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

export function WorkspaceTabs({ active, onChange }) {
  return (
    <div
      className="flex gap-1 border-b border-dashboard-border"
      role="tablist"
      aria-label="Project workspace views"
    >
      {[
        ['items', 'Action Items'],
        ['timeline', 'Timeline'],
        ['analytics', 'Analytics'],
      ].map(([value, label]) => (
        <button
          key={value}
          className={cn(
            'min-h-11 border-b-2 px-4 text-sm font-semibold',
            active === value
              ? 'border-dashboard-accent-strong text-dashboard-accent-strong'
              : 'border-transparent text-dashboard-muted hover:text-dashboard-ink',
          )}
          onClick={() => onChange(value)}
          role="tab"
          aria-selected={active === value}
          type="button"
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export function ActionItemsToolbar({
  filters,
  categories,
  subCategories,
  onChange,
  onManage,
  onNew,
  canWrite,
}) {
  return (
    <section
      aria-label="Action Item filters"
      className="grid gap-3 border-b border-dashboard-border bg-dashboard-surface p-4 xl:grid-cols-[minmax(11rem,1.2fr)_repeat(5,minmax(6.5rem,1fr))_auto]"
    >
      <TextField
        value={filters.searchInput}
        onChange={(e) => onChange('searchInput', e.target.value)}
        placeholder="Search Action Items"
        size="small"
        sx={fieldSx}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlined fontSize="small" />
            </InputAdornment>
          ),
        }}
      />
      <FormControl size="small">
        <InputLabel>Category</InputLabel>
        <Select
          label="Category"
          value={filters.categoryId}
          onChange={(e) => onChange('categoryId', e.target.value)}
        >
          <MenuItem value="">All categories</MenuItem>
          {categories.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" disabled={!filters.categoryId}>
        <InputLabel>Subcategory</InputLabel>
        <Select
          label="Subcategory"
          value={filters.subCategoryId}
          onChange={(e) => onChange('subCategoryId', e.target.value)}
        >
          <MenuItem value="">All subcategories</MenuItem>
          {subCategories.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small">
        <InputLabel>Status</InputLabel>
        <Select
          multiple
          label="Status"
          value={filters.statuses}
          renderValue={(values) =>
            values.length ? `${values.length} selected` : 'All statuses'
          }
          onChange={(e) => onChange('statuses', e.target.value)}
        >
          {ACTION_STATUSES.map((item) => (
            <MenuItem key={item.value} value={item.value}>
              <Checkbox checked={filters.statuses.includes(item.value)} />
              {item.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small">
        <InputLabel>Priority</InputLabel>
        <Select
          label="Priority"
          value={filters.priority}
          onChange={(e) => onChange('priority', e.target.value)}
        >
          <MenuItem value="">All priorities</MenuItem>
          {PRIORITIES.map((item) => (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        value={filters.ownerInput}
        onChange={(e) => onChange('ownerInput', e.target.value)}
        placeholder="Owner name"
        size="small"
        sx={fieldSx}
      />
      <div className="flex flex-wrap gap-2 xl:flex-nowrap xl:justify-end">
        <Button
          onClick={onManage}
          startIcon={<CategoryOutlined />}
          sx={{ whiteSpace: 'nowrap' }}
          variant="outlined"
          disabled={!canWrite}
        >
          Manage categories
        </Button>
        <Button
          onClick={onNew}
          startIcon={<AddOutlined />}
          sx={{ whiteSpace: 'nowrap' }}
          variant="contained"
          disabled={!canWrite}
        >
          New Action Item
        </Button>
      </div>
    </section>
  )
}

function dateRangeText(startDate, endDate, fallback = 'Not set') {
  if (!startDate) return fallback
  return `${formatDate(startDate)} → ${endDate ? formatDate(endDate) : 'Open'}`
}

function RowMenu({ item, canEdit, canDelete, onDelete, onEdit, onOpen }) {
  const [anchor, setAnchor] = useState(null)
  const choose = (callback) => {
    setAnchor(null)
    callback(item)
  }
  return (
    <>
      <IconButton
        aria-label={`More options for ${item.actionItemName}`}
        onClick={(event) => setAnchor(event.currentTarget)}
        size="small"
        sx={{ width: 44, height: 44 }}
      >
        <MoreHorizOutlined fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        open={Boolean(anchor)}
      >
        <MenuItem onClick={() => choose(() => onOpen(item.id))}>
          View details
        </MenuItem>
        {canEdit ? (
          <MenuItem onClick={() => choose(() => onEdit(item.id))}>
            <EditOutlined className="mr-2" fontSize="small" /> Edit
          </MenuItem>
        ) : null}
        {canDelete ? (
          <MenuItem
            onClick={() => choose(onDelete)}
            sx={{ color: 'error.main' }}
          >
            <DeleteOutlineOutlined className="mr-2" fontSize="small" /> Delete
          </MenuItem>
        ) : null}
      </Menu>
    </>
  )
}

function DateCell({ children, disabled, label, onClick }) {
  if (disabled) return <span className="whitespace-nowrap">{children}</span>
  return (
    <button
      className="min-h-9 whitespace-nowrap rounded-md px-1 text-left font-mono text-xs hover:bg-dashboard-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dashboard-accent-strong"
      onClick={onClick}
      type="button"
      aria-label={label}
    >
      {children}
    </button>
  )
}

function ActionRow({
  item,
  canDelete,
  canEdit,
  onDates,
  onDelete,
  onEdit,
  onOpen,
}) {
  return (
    <tr className="border-t border-dashboard-border hover:bg-dashboard-surface-muted">
      <td className="min-w-64 px-3 py-1.5 font-semibold leading-5">
        <span className="line-clamp-2">{item.actionItemName}</span>
      </td>
      <td className="min-w-48 px-2 py-0.5">
        <DateCell
          disabled={!canEdit}
          label={`Edit planned dates for ${item.actionItemName}`}
          onClick={(event) => onDates(event.currentTarget, item, 'planned')}
        >
          {item.plannedSchedule ? (
            dateRangeText(
              item.plannedSchedule.plannedStartDate,
              item.plannedSchedule.plannedEndDate,
            )
          ) : (
            <Missing />
          )}
        </DateCell>
      </td>
      <td className="min-w-48 px-2 py-0.5">
        <DateCell
          disabled={!canEdit}
          label={`Edit actual dates for ${item.actionItemName}`}
          onClick={(event) => onDates(event.currentTarget, item, 'actual')}
        >
          {item.actualExecution ? (
            dateRangeText(
              item.actualExecution.actualStartDate,
              item.actualExecution.actualEndDate,
              'Not started',
            )
          ) : (
            <Missing>Not started</Missing>
          )}
        </DateCell>
      </td>
      <td className="min-w-36 max-w-52 px-3 py-1.5">
        <span className="line-clamp-2">{item.ownerName || <Missing />}</span>
      </td>
      <td className="px-2 py-1">
        <Badge item={getPriority(item.priority)} />
      </td>
      <td className="px-2 py-1">
        <Badge item={getStatus(item.computedStatus)} />
      </td>
      <td className="w-12 px-0 text-center">
        <RowMenu
          canDelete={canDelete}
          canEdit={canEdit}
          item={item}
          onDelete={onDelete}
          onEdit={onEdit}
          onOpen={onOpen}
        />
      </td>
    </tr>
  )
}

function MobileActionCard(props) {
  const { item, canEdit, onDates } = props
  return (
    <article className="border-t border-dashboard-border px-3 py-2.5">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <strong className="min-w-0 flex-1 break-words leading-5">
          {item.actionItemName}
        </strong>
        <RowMenu {...props} />
      </div>
      <div className="mt-1 grid gap-0.5 font-mono text-xs text-dashboard-muted">
        <DateCell
          disabled={!canEdit}
          label={`Edit planned dates for ${item.actionItemName}`}
          onClick={(event) => onDates(event.currentTarget, item, 'planned')}
        >
          {item.plannedSchedule
            ? dateRangeText(
                item.plannedSchedule.plannedStartDate,
                item.plannedSchedule.plannedEndDate,
              )
            : 'Not set'}
        </DateCell>
        <DateCell
          disabled={!canEdit}
          label={`Edit actual dates for ${item.actionItemName}`}
          onClick={(event) => onDates(event.currentTarget, item, 'actual')}
        >
          {item.actualExecution
            ? dateRangeText(
                item.actualExecution.actualStartDate,
                item.actualExecution.actualEndDate,
                'Not started',
              )
            : 'Not started'}
        </DateCell>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="min-w-0 flex-1 truncate">
          {item.ownerName || 'Unassigned'}
        </span>
        <Badge item={getPriority(item.priority)} />
        <Badge item={getStatus(item.computedStatus)} />
      </div>
    </article>
  )
}

function DateEditor({ editor, project, onClose, onSaved }) {
  const query = useActionItem(project.id, editor?.item.id)
  const mutations = useWorkspaceMutations(project.id)
  const detail = query.data
  const planned = editor?.kind === 'planned'
  const value = planned
    ? {
        startDate:
          detail?.plannedSchedule?.plannedStartDate ??
          editor?.item.plannedSchedule?.plannedStartDate ??
          '',
        endDate:
          detail?.plannedSchedule?.plannedEndDate ??
          editor?.item.plannedSchedule?.plannedEndDate ??
          '',
      }
    : {
        startDate:
          detail?.actualExecution?.actualStartDate ??
          editor?.item.actualExecution?.actualStartDate ??
          '',
        endDate:
          detail?.actualExecution?.actualEndDate ??
          editor?.item.actualExecution?.actualEndDate ??
          '',
      }
  const save = async (range) => {
    const body = actionItemToWritePayload(
      detail,
      planned
        ? { plannedStartDate: range.startDate, plannedEndDate: range.endDate }
        : {
            actualStartDate: range.startDate,
            actualEndDate: range.endDate || null,
          },
    )
    await mutations.updateActionItem.mutateAsync({
      actionItemId: detail.id,
      body,
    })
    onSaved()
  }
  return (
    <DateRangePicker
      anchorEl={editor?.anchorEl}
      endRequired={planned}
      error={
        query.error?.message || mutations.updateActionItem.error?.message || ''
      }
      loading={query.isLoading}
      maxDate={planned ? project.endDate : ''}
      minDate={planned ? project.startDate : ''}
      onApply={save}
      onClose={onClose}
      open={Boolean(editor)}
      submitting={mutations.updateActionItem.isPending}
      title={planned ? 'Edit planned dates' : 'Edit actual execution'}
      value={value}
    />
  )
}

const quickEmpty = {
  actionItemName: '',
  subCategoryId: '',
  priority: 1,
  ownerId: '',
  weight: '',
  sequence: 0,
  plannedStartDate: '',
  plannedEndDate: '',
  actualStartDate: '',
  actualEndDate: '',
}

function QuickAddPanel({ category, members, project, onCancel, onCreated }) {
  const [form, setForm] = useState(quickEmpty)
  const [picker, setPicker] = useState(null)
  const subs = useSubCategories(category.id)
  const mutations = useWorkspaceMutations(project.id)
  const set = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }))
  const submit = async (event) => {
    event.preventDefault()
    await mutations.createActionItem.mutateAsync(
      quickActionItemPayload(form, category.id, project, members),
    )
    setForm(quickEmpty)
    onCreated()
  }
  const range =
    picker?.kind === 'actual'
      ? { startDate: form.actualStartDate, endDate: form.actualEndDate }
      : { startDate: form.plannedStartDate, endDate: form.plannedEndDate }
  return (
    <form
      className="grid gap-3 bg-dashboard-blueprint-fill p-3 lg:grid-cols-4"
      onSubmit={submit}
    >
      <TextField
        required
        label="Action Item"
        inputProps={{ maxLength: 500 }}
        onChange={(event) => set('actionItemName', event.target.value)}
        size="small"
        value={form.actionItemName}
      />
      <FormControl size="small">
        <InputLabel>Subcategory</InputLabel>
        <Select
          label="Subcategory"
          onChange={(event) => set('subCategoryId', event.target.value)}
          value={form.subCategoryId}
        >
          <MenuItem value="">None</MenuItem>
          {subs.data?.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button
        className="justify-start"
        onClick={(event) =>
          setPicker({ kind: 'planned', anchorEl: event.currentTarget })
        }
        variant="outlined"
      >
        {form.plannedStartDate
          ? dateRangeText(form.plannedStartDate, form.plannedEndDate)
          : 'Planned dates'}
      </Button>
      <Button
        className="justify-start"
        onClick={(event) =>
          setPicker({ kind: 'actual', anchorEl: event.currentTarget })
        }
        variant="outlined"
      >
        {form.actualStartDate
          ? dateRangeText(form.actualStartDate, form.actualEndDate)
          : 'Actual dates (optional)'}
      </Button>
      <FormControl size="small">
        <InputLabel>Owner</InputLabel>
        <Select
          label="Owner"
          onChange={(event) => set('ownerId', event.target.value)}
          value={form.ownerId}
        >
          <MenuItem value="">Unassigned</MenuItem>
          {members.map((item) => (
            <MenuItem key={item.userId} value={item.userId}>
              {memberName(item)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small">
        <InputLabel>Priority</InputLabel>
        <Select
          label="Priority"
          onChange={(event) => set('priority', event.target.value)}
          value={form.priority}
        >
          {PRIORITIES.map((item) => (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="Display order"
        inputProps={{ min: 0 }}
        onChange={(event) => set('sequence', event.target.value)}
        size="small"
        type="number"
        value={form.sequence}
      />
      {project.progressMode === 1 ? (
        <TextField
          required
          label="Weight"
          inputProps={{ min: 0, max: 100 }}
          onChange={(event) => set('weight', event.target.value)}
          size="small"
          type="number"
          value={form.weight}
        />
      ) : null}
      {mutations.createActionItem.error ? (
        <Alert className="lg:col-span-4" severity="error">
          {mutations.createActionItem.error.message}
        </Alert>
      ) : null}
      <div className="flex justify-end gap-2 lg:col-span-4">
        <Button
          disabled={mutations.createActionItem.isPending}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          disabled={
            !form.actionItemName.trim() ||
            !form.plannedStartDate ||
            !form.plannedEndDate ||
            (project.progressMode === 1 && form.weight === '') ||
            mutations.createActionItem.isPending
          }
          type="submit"
          variant="contained"
        >
          {mutations.createActionItem.isPending ? 'Adding...' : 'Confirm add'}
        </Button>
      </div>
      <DateRangePicker
        anchorEl={picker?.anchorEl}
        endRequired={picker?.kind !== 'actual'}
        maxDate={picker?.kind === 'planned' ? project.endDate : ''}
        minDate={picker?.kind === 'planned' ? project.startDate : ''}
        onApply={(next) => {
          if (picker.kind === 'actual') {
            set('actualStartDate', next.startDate)
            set('actualEndDate', next.endDate)
          } else {
            set('plannedStartDate', next.startDate)
            set('plannedEndDate', next.endDate)
          }
          setPicker(null)
        }}
        onClose={() => setPicker(null)}
        open={Boolean(picker)}
        title={
          picker?.kind === 'actual'
            ? 'Set actual execution'
            : 'Set planned dates'
        }
        value={range}
      />
    </form>
  )
}

export function ActionItemsRegister({
  data,
  collapsed,
  onToggle,
  onOpen,
  pageSize,
  onPage,
  onPageSize,
  canDelete,
  canEdit,
  members,
  onEdit,
  onNotice,
  project,
}) {
  const [addingCategory, setAddingCategory] = useState('')
  const [dateEditor, setDateEditor] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const mutations = useWorkspaceMutations(project.id)
  const openDates = (anchorEl, item, kind) =>
    setDateEditor({ anchorEl, item, kind })
  const confirmDelete = async () => {
    await mutations.deleteActionItem.mutateAsync({
      actionItemId: deleteItem.id,
    })
    setDeleteItem(null)
    onNotice('Action Item deleted.')
    if (
      data.categories.flatMap((category) => category.actionItems).length ===
        1 &&
      data.pageNumber > 1
    )
      onPage(data.pageNumber - 1)
  }
  const itemProps = (item) => ({
    item,
    canDelete,
    canEdit,
    onDates: openDates,
    onDelete: setDeleteItem,
    onEdit,
    onOpen,
  })
  return (
    <section className="overflow-hidden border-x border-b border-dashboard-border bg-dashboard-surface">
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[980px] border-collapse text-left text-sm">
          <thead className="bg-dashboard-surface">
            <tr className="border-t border-dashboard-border text-[0.68rem] uppercase tracking-[0.05em] text-dashboard-muted">
              {[
                'Action Item',
                'Planned dates',
                'Actual dates',
                'Owner',
                'Priority',
                'Status',
                '',
              ].map((label) => (
                <th className="px-3 py-2" key={label || 'actions'}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.categories.map((category) => (
              <Fragment key={category.id}>
                <tr className="border-t border-dashboard-border bg-dashboard-surface-muted">
                  <td colSpan={7} className="p-0">
                    <button
                      className="flex min-h-10 w-full items-center justify-between px-3 text-left"
                      onClick={() => onToggle(category.id)}
                      type="button"
                    >
                      <span className="flex min-w-0 items-center gap-2 font-bold">
                        <ExpandMoreOutlined
                          className={cn(
                            'text-base transition-transform',
                            collapsed.has(category.id) && '-rotate-90',
                          )}
                        />
                        <span className="truncate">{category.name}</span>
                      </span>
                      <span className="font-mono text-xs font-normal text-dashboard-muted">
                        {category.actionItems.length}{' '}
                        {category.actionItems.length === 1 ? 'item' : 'items'}
                      </span>
                    </button>
                  </td>
                </tr>
                {!collapsed.has(category.id) ? (
                  <>
                    {category.actionItems.map((item, index, array) => (
                      <FragmentGroup
                        key={item.id}
                        item={item}
                        previous={array[index - 1]}
                        items={array}
                      >
                        <ActionRow {...itemProps(item)} />
                      </FragmentGroup>
                    ))}
                    <tr className="border-t border-dashboard-border">
                      <td colSpan={7} className="p-0">
                        {addingCategory === category.id ? (
                          <QuickAddPanel
                            category={category}
                            members={members}
                            project={project}
                            onCancel={() => setAddingCategory('')}
                            onCreated={() => {
                              setAddingCategory('')
                              onNotice('Action Item created.')
                            }}
                          />
                        ) : (
                          <button
                            className="flex min-h-11 w-full items-center justify-center cursor-pointer gap-2 text-sm font-semibold text-dashboard-accent-strong hover:bg-dashboard-accent-soft"
                            disabled={!canEdit}
                            onClick={() => setAddingCategory(category.id)}
                            type="button"
                          >
                            <AddOutlined fontSize="small" /> Add Action Item
                          </button>
                        )}
                      </td>
                    </tr>
                  </>
                ) : null}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <div className="lg:hidden">
        {data.categories.map((category) => (
          <section key={category.id}>
            <button
              className="flex min-h-11 w-full items-center justify-between border-t border-dashboard-border bg-dashboard-surface-muted px-3 text-left"
              onClick={() => onToggle(category.id)}
              type="button"
            >
              <span className="flex min-w-0 items-center gap-2 font-bold">
                <ExpandMoreOutlined
                  className={cn(
                    'transition-transform',
                    collapsed.has(category.id) && '-rotate-90',
                  )}
                />
                <span className="truncate">{category.name}</span>
              </span>
              <span className="font-mono text-xs text-dashboard-muted">
                {category.actionItems.length} items
              </span>
            </button>
            {!collapsed.has(category.id) ? (
              <>
                {category.actionItems.map((item, index, array) => (
                  <Fragment key={item.id}>
                    {item.subCategoryId &&
                    item.subCategoryId !== array[index - 1]?.subCategoryId ? (
                      <div className="border-t border-dashboard-border bg-dashboard-blueprint-fill px-3 py-1.5 text-xs font-bold text-dashboard-accent-strong">
                        {item.subCategoryName}
                      </div>
                    ) : null}
                    <MobileActionCard {...itemProps(item)} />
                  </Fragment>
                ))}
                {addingCategory === category.id ? (
                  <QuickAddPanel
                    category={category}
                    members={members}
                    project={project}
                    onCancel={() => setAddingCategory('')}
                    onCreated={() => {
                      setAddingCategory('')
                      onNotice('Action Item created.')
                    }}
                  />
                ) : (
                  <button
                    className="flex min-h-11 w-full items-center justify-center gap-2 border-t border-dashboard-border text-sm font-semibold text-dashboard-accent-strong"
                    disabled={!canEdit}
                    onClick={() => setAddingCategory(category.id)}
                    type="button"
                  >
                    <AddOutlined fontSize="small" /> Add Action Item
                  </button>
                )}
              </>
            ) : null}
          </section>
        ))}
      </div>
      <div className="flex flex-col gap-4 border-t border-dashboard-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-dashboard-muted">
          {data.totalCount === 0
            ? '0'
            : (data.pageNumber - 1) * data.pageSize + 1}
          –{Math.min(data.pageNumber * data.pageSize, data.totalCount)} of{' '}
          {data.totalCount} Action Items
        </p>
        <div className="flex items-center gap-3">
          <FormControl size="small">
            <Select
              aria-label="Action Items per page"
              value={pageSize}
              onChange={(e) => onPageSize(Number(e.target.value))}
            >
              {[20, 50, 100].map((value) => (
                <MenuItem key={value} value={value}>
                  {value} / page
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Pagination
            count={Math.max(1, data.totalPages)}
            page={data.pageNumber}
            onChange={(_, value) => onPage(value)}
            shape="rounded"
          />
        </div>
      </div>
      <DateEditor
        editor={dateEditor}
        project={project}
        onClose={() => setDateEditor(null)}
        onSaved={() => {
          setDateEditor(null)
          onNotice('Dates updated.')
        }}
      />
      <Dialog
        open={Boolean(deleteItem)}
        onClose={
          mutations.deleteActionItem.isPending
            ? undefined
            : () => setDeleteItem(null)
        }
      >
        <DialogTitle>Delete Action Item?</DialogTitle>
        <DialogContent>
          <p>
            This permanently deletes{' '}
            <strong>{deleteItem?.actionItemName}</strong> and its schedule and
            execution data.
          </p>
          {mutations.deleteActionItem.error ? (
            <Alert className="mt-3" severity="error">
              {mutations.deleteActionItem.error.message}
            </Alert>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button
            disabled={mutations.deleteActionItem.isPending}
            onClick={() => setDeleteItem(null)}
          >
            Cancel
          </Button>
          <Button
            color="error"
            disabled={mutations.deleteActionItem.isPending}
            onClick={confirmDelete}
            variant="contained"
          >
            {mutations.deleteActionItem.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  )
}

function FragmentGroup({ children, item, items, previous }) {
  const subCount = item.subCategoryId
    ? items.filter(
        (candidate) => candidate.subCategoryId === item.subCategoryId,
      ).length
    : 0
  return (
    <>
      {item.subCategoryId && item.subCategoryId !== previous?.subCategoryId ? (
        <tr>
          <td
            className="bg-dashboard-blueprint-fill px-8 py-1.5 text-xs font-semibold text-dashboard-accent-strong"
            colSpan={7}
          >
            <span className="flex justify-between">
              <span>{item.subCategoryName}</span>
              <span className="font-mono font-normal text-dashboard-muted">
                {subCount} {subCount === 1 ? 'item' : 'items'}
              </span>
            </span>
          </td>
        </tr>
      ) : null}
      {children}
    </>
  )
}

export function EmptyRegister({ kind, canWrite, onManage, onNew, onReset }) {
  const content =
    kind === 'fresh'
      ? {
          title: 'Structure your first Action Items',
          body: 'Create a category to establish the project hierarchy, then add the first Action Item.',
          action: 'Create first category',
        }
      : kind === 'category'
        ? {
            title: 'Your structure is ready',
            body: 'Categories exist, but this project has no Action Items yet.',
            action: 'Create first Action Item',
          }
        : {
            title: 'No Action Items match these filters',
            body: 'Clear the current filters to return to the complete register.',
            action: 'Reset filters',
          }
  const handler =
    kind === 'fresh' ? onManage : kind === 'category' ? onNew : onReset
  return (
    <section className="border-x border-b border-dashboard-border bg-dashboard-surface px-5 py-16 text-center">
      <div className="mx-auto max-w-xl">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-dashboard-accent-soft text-dashboard-accent-strong">
          <FolderOpenOutlined fontSize="large" />
        </span>
        <h2 className="mt-6 font-display text-2xl font-bold tracking-[-0.025em]">
          {content.title}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-dashboard-muted">
          {canWrite
            ? content.body
            : 'You have read-only access. A project member with edit access can create the project structure.'}
        </p>
        {canWrite || kind === 'filtered' ? (
          <Button
            className="mt-6"
            onClick={handler}
            startIcon={
              kind === 'filtered' ? <FilterAltOffOutlined /> : <AddOutlined />
            }
            variant="contained"
          >
            {content.action}
          </Button>
        ) : null}
        {kind === 'fresh' ? (
          <div className="mt-10 grid gap-3 text-left sm:grid-cols-2">
            <div className="border-t border-dashboard-border pt-4">
              <strong>1. Create categories</strong>
              <p className="mt-1 text-sm text-dashboard-muted">
                Group work by phase, discipline, or deliverable.
              </p>
            </div>
            <div className="border-t border-dashboard-border pt-4">
              <strong>2. Add Action Items</strong>
              <p className="mt-1 text-sm text-dashboard-muted">
                Assign owners, dates, priority, and progress weight.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

function DrawerHeader({ title, subtitle, onClose }) {
  return (
    <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-dashboard-border bg-dashboard-surface p-5">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-[-0.025em]">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-dashboard-muted">{subtitle}</p>
        ) : null}
      </div>
      <IconButton aria-label="Close" onClick={onClose}>
        <CloseOutlined />
      </IconButton>
    </header>
  )
}

export function CategoryManagerDrawer({
  open,
  onClose,
  categories,
  projectId,
}) {
  const mutations = useWorkspaceMutations(projectId)
  const [expanded, setExpanded] = useState('')
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    color: '',
    displayOrder: 0,
  })
  const [subForm, setSubForm] = useState({ name: '', displayOrder: 0 })
  const sub = useSubCategories(expanded)
  const addCategory = async (e) => {
    e.preventDefault()
    await mutations.createCategory.mutateAsync({
      name: categoryForm.name.trim(),
      color: categoryForm.color.trim() || null,
      displayOrder: Number(categoryForm.displayOrder),
    })
    setCategoryForm({ name: '', color: '', displayOrder: 0 })
  }
  const addSub = async (e) => {
    e.preventDefault()
    await mutations.createSubCategory.mutateAsync({
      categoryId: expanded,
      body: {
        name: subForm.name.trim(),
        displayOrder: Number(subForm.displayOrder),
      },
    })
    setSubForm({ name: '', displayOrder: 0 })
  }
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 520 },
          bgcolor: 'var(--color-dashboard-surface)',
          color: 'var(--color-dashboard-ink)',
        },
      }}
    >
      <DrawerHeader
        title="Manage categories"
        subtitle="Build the grouping hierarchy for this project."
        onClose={onClose}
      />
      <div className="space-y-6 p-5">
        <form
          className="grid gap-3 rounded-2xl bg-dashboard-surface-muted p-4"
          onSubmit={addCategory}
        >
          <h3 className="font-bold">Create category</h3>
          <TextField
            required
            label="Name"
            inputProps={{ maxLength: 100 }}
            value={categoryForm.name}
            onChange={(e) =>
              setCategoryForm({ ...categoryForm, name: e.target.value })
            }
          />
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Color"
              placeholder="#C96A45"
              inputProps={{ pattern: '#[0-9A-Fa-f]{6}' }}
              value={categoryForm.color}
              onChange={(e) =>
                setCategoryForm({ ...categoryForm, color: e.target.value })
              }
            />
            <TextField
              required
              type="number"
              label="Display order"
              inputProps={{ min: 0 }}
              value={categoryForm.displayOrder}
              onChange={(e) =>
                setCategoryForm({
                  ...categoryForm,
                  displayOrder: e.target.value,
                })
              }
            />
          </div>
          {mutations.createCategory.error ? (
            <Alert severity="error">
              {mutations.createCategory.error.message}
            </Alert>
          ) : null}
          <Button
            disabled={
              !categoryForm.name.trim() || mutations.createCategory.isPending
            }
            type="submit"
            variant="contained"
          >
            Create category
          </Button>
        </form>
        <div>
          <h3 className="mb-3 font-bold">Current hierarchy</h3>
          {categories.length ? (
            categories.map((category) => (
              <div
                className="border-t border-dashboard-border"
                key={category.id}
              >
                <button
                  className="flex min-h-12 w-full items-center justify-between text-left"
                  onClick={() =>
                    setExpanded(expanded === category.id ? '' : category.id)
                  }
                  type="button"
                >
                  <span className="flex items-center gap-3">
                    <span
                      className="size-3 rounded-sm"
                      style={{
                        backgroundColor:
                          category.color ||
                          'var(--color-dashboard-accent-strong)',
                      }}
                    />
                    <strong>{category.name}</strong>
                    <span className="font-mono text-xs text-dashboard-muted">
                      ORDER {category.displayOrder}
                    </span>
                  </span>
                  <ExpandMoreOutlined />
                </button>
                <Collapse in={expanded === category.id}>
                  <div className="pb-5 pl-6">
                    {sub.isLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      sub.data?.map((item) => (
                        <p
                          className="border-t border-dashboard-border py-2 text-sm"
                          key={item.id}
                        >
                          {item.name}{' '}
                          <span className="font-mono text-xs text-dashboard-muted">
                            · {item.displayOrder}
                          </span>
                        </p>
                      ))
                    )}
                    <form className="mt-3 grid gap-3" onSubmit={addSub}>
                      <TextField
                        required
                        size="small"
                        label="New subcategory"
                        inputProps={{ maxLength: 150 }}
                        value={subForm.name}
                        onChange={(e) =>
                          setSubForm({ ...subForm, name: e.target.value })
                        }
                      />
                      <TextField
                        required
                        size="small"
                        type="number"
                        label="Display order"
                        inputProps={{ min: 0 }}
                        value={subForm.displayOrder}
                        onChange={(e) =>
                          setSubForm({
                            ...subForm,
                            displayOrder: e.target.value,
                          })
                        }
                      />
                      {mutations.createSubCategory.error ? (
                        <Alert severity="error">
                          {mutations.createSubCategory.error.message}
                        </Alert>
                      ) : null}
                      <Button
                        disabled={
                          !subForm.name.trim() ||
                          mutations.createSubCategory.isPending
                        }
                        type="submit"
                        variant="outlined"
                      >
                        Add subcategory
                      </Button>
                    </form>
                  </div>
                </Collapse>
              </div>
            ))
          ) : (
            <p className="text-sm text-dashboard-muted">
              No categories have been created.
            </p>
          )}
        </div>
      </div>
    </Drawer>
  )
}

const emptyAction = {
  actionItemName: '',
  description: '',
  categoryId: '',
  subCategoryId: '',
  priority: 1,
  ownerMode: 'member',
  ownerId: '',
  ownerName: '',
  weight: '',
  sequence: 0,
  remarks: '',
  plannedStartDate: '',
  plannedEndDate: '',
  includeActual: false,
  actualStartDate: '',
  actualEndDate: '',
  actualHours: '',
  delayReason: '',
}
export function CreateActionItemDrawer({
  open,
  onClose,
  categories,
  members,
  project,
  projectId,
  onCreated,
}) {
  const mutations = useWorkspaceMutations(projectId)
  const [form, setForm] = useState(emptyAction)
  const [quick, setQuick] = useState('')
  const [quickName, setQuickName] = useState('')
  const [datePicker, setDatePicker] = useState(null)
  const subs = useSubCategories(form.categoryId)
  const set = (key, value) =>
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === 'categoryId' ? { subCategoryId: '' } : {}),
    }))
  const quickCreate = async () => {
    if (quick === 'category') {
      const newId = await mutations.createCategory.mutateAsync({
        name: quickName.trim(),
        color: null,
        displayOrder: categories.length * 10,
      })
      set('categoryId', newId)
    } else {
      const newId = await mutations.createSubCategory.mutateAsync({
        categoryId: form.categoryId,
        body: {
          name: quickName.trim(),
          displayOrder: (subs.data?.length ?? 0) * 10,
        },
      })
      set('subCategoryId', newId)
    }
    setQuick('')
    setQuickName('')
  }
  const submit = async (e) => {
    e.preventDefault()
    const selected = members.find((member) => member.userId === form.ownerId)
    const body = {
      categoryId: form.categoryId,
      subCategoryId: form.subCategoryId || null,
      actionItemName: form.actionItemName.trim(),
      description: form.description.trim() || null,
      priority: Number(form.priority),
      ownerName:
        form.ownerMode === 'member'
          ? selected
            ? memberName(selected)
            : null
          : form.ownerName.trim() || null,
      ownerId: form.ownerMode === 'member' ? form.ownerId || null : null,
      weight: project.progressMode === 1 ? Number(form.weight) : null,
      sequence: Number(form.sequence),
      remarks: form.remarks.trim() || null,
      plannedStartDate: form.plannedStartDate || null,
      plannedEndDate: form.plannedEndDate || null,
      actualStartDate:
        form.includeActual && form.actualStartDate
          ? form.actualStartDate
          : null,
      actualEndDate:
        form.includeActual && form.actualEndDate ? form.actualEndDate : null,
      actualHours:
        form.includeActual && form.actualHours !== ''
          ? Number(form.actualHours)
          : null,
      delayReason:
        form.includeActual && form.delayReason.trim()
          ? form.delayReason.trim()
          : null,
    }
    await mutations.createActionItem.mutateAsync(body)
    setForm(emptyAction)
    onCreated()
  }
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', md: 720 },
          bgcolor: 'var(--color-dashboard-surface)',
          color: 'var(--color-dashboard-ink)',
        },
      }}
    >
      <DrawerHeader
        title="New Action Item"
        subtitle="Add scoped work to the project register."
        onClose={onClose}
      />
      <form className="grid gap-6 p-5" onSubmit={submit}>
        <section className="grid gap-3">
          <h3 className="font-bold">Identity</h3>
          <TextField
            required
            label="Action Item name"
            inputProps={{ maxLength: 500 }}
            value={form.actionItemName}
            onChange={(e) => set('actionItemName', e.target.value)}
          />
          <TextField
            multiline
            minRows={3}
            label="Description"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </section>
        <section className="grid gap-3 border-t border-dashboard-border pt-5">
          <h3 className="font-bold">Classification</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormControl required>
              <InputLabel>Category</InputLabel>
              <Select
                label="Category"
                value={form.categoryId}
                onChange={(e) => set('categoryId', e.target.value)}
              >
                {categories.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl disabled={!form.categoryId}>
              <InputLabel>Subcategory</InputLabel>
              <Select
                label="Subcategory"
                value={form.subCategoryId}
                onChange={(e) => set('subCategoryId', e.target.value)}
              >
                <MenuItem value="">None</MenuItem>
                {subs.data?.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setQuick('category')} variant="text">
              Create category
            </Button>
            <Button
              disabled={!form.categoryId}
              onClick={() => setQuick('subcategory')}
              variant="text"
            >
              Create subcategory
            </Button>
          </div>
          <Collapse in={Boolean(quick)}>
            <div className="flex gap-2 rounded-xl bg-dashboard-surface-muted p-3">
              <TextField
                fullWidth
                size="small"
                label={
                  quick === 'category' ? 'Category name' : 'Subcategory name'
                }
                value={quickName}
                onChange={(e) => setQuickName(e.target.value)}
              />
              <Button
                disabled={!quickName.trim()}
                onClick={quickCreate}
                variant="outlined"
              >
                Create
              </Button>
              <IconButton
                aria-label="Cancel quick creation"
                onClick={() => setQuick('')}
              >
                <CloseOutlined />
              </IconButton>
            </div>
          </Collapse>
          <FormControl>
            <InputLabel>Priority</InputLabel>
            <Select
              label="Priority"
              value={form.priority}
              onChange={(e) => set('priority', e.target.value)}
            >
              {PRIORITIES.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </section>
        <section className="grid gap-3 border-t border-dashboard-border pt-5">
          <h3 className="font-bold">Ownership and planning</h3>
          <div className="flex gap-4">
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.ownerMode === 'member'}
                  onChange={() => set('ownerMode', 'member')}
                />
              }
              label="Project member"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.ownerMode === 'text'}
                  onChange={() => set('ownerMode', 'text')}
                />
              }
              label="Free-text owner"
            />
          </div>
          {form.ownerMode === 'member' ? (
            <FormControl>
              <InputLabel>Owner</InputLabel>
              <Select
                label="Owner"
                value={form.ownerId}
                onChange={(e) => set('ownerId', e.target.value)}
              >
                <MenuItem value="">Unassigned</MenuItem>
                {members.map((item) => (
                  <MenuItem key={item.userId} value={item.userId}>
                    {memberName(item)} · {MEMBER_ROLE[item.role]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <TextField
              label="Owner name"
              value={form.ownerName}
              onChange={(e) => set('ownerName', e.target.value)}
            />
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <Button onClick={() => setDatePicker('planned')} variant="outlined">
              {dateRangeText(
                form.plannedStartDate,
                form.plannedEndDate,
                'Planned dates',
              )}
            </Button>
            <TextField
              required
              type="number"
              label="Display order"
              inputProps={{ min: 0 }}
              value={form.sequence}
              onChange={(e) => set('sequence', e.target.value)}
            />
            {project.progressMode === 1 ? (
              <TextField
                required
                type="number"
                label="Weight"
                helperText="Required for weight-based progress (0–100)."
                inputProps={{ min: 0, max: 100 }}
                value={form.weight}
                onChange={(e) => set('weight', e.target.value)}
              />
            ) : null}
          </div>
        </section>
        <section className="grid gap-3 border-t border-dashboard-border pt-5">
          <TextField
            multiline
            minRows={2}
            label="Remarks"
            value={form.remarks}
            onChange={(e) => set('remarks', e.target.value)}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={form.includeActual}
                onChange={(e) => set('includeActual', e.target.checked)}
              />
            }
            label="Add optional actual execution"
          />
          <Collapse in={form.includeActual}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                onClick={() => setDatePicker('actual')}
                variant="outlined"
              >
                {dateRangeText(
                  form.actualStartDate,
                  form.actualEndDate,
                  'Actual dates',
                )}
              </Button>
              <TextField
                type="number"
                label="Actual hours"
                inputProps={{ min: 0, step: '0.25' }}
                value={form.actualHours}
                onChange={(e) => set('actualHours', e.target.value)}
              />
              <TextField
                label="Delay reason"
                value={form.delayReason}
                onChange={(e) => set('delayReason', e.target.value)}
              />
            </div>
          </Collapse>
        </section>
        {mutations.createActionItem.error ? (
          <Alert severity="error">
            {mutations.createActionItem.error.message}
          </Alert>
        ) : null}
        <DateRangePicker
          endRequired={datePicker !== 'actual'}
          maxDate={datePicker === 'planned' ? project.endDate : ''}
          minDate={datePicker === 'planned' ? project.startDate : ''}
          onApply={(range) => {
            if (datePicker === 'actual') {
              set('actualStartDate', range.startDate)
              set('actualEndDate', range.endDate)
            } else {
              set('plannedStartDate', range.startDate)
              set('plannedEndDate', range.endDate)
            }
            setDatePicker(null)
          }}
          onClose={() => setDatePicker(null)}
          open={Boolean(datePicker)}
          title={
            datePicker === 'actual'
              ? 'Set actual execution'
              : 'Set planned dates'
          }
          value={
            datePicker === 'actual'
              ? { startDate: form.actualStartDate, endDate: form.actualEndDate }
              : {
                  startDate: form.plannedStartDate,
                  endDate: form.plannedEndDate,
                }
          }
        />
        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-dashboard-border bg-dashboard-surface py-4">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            disabled={
              !form.actionItemName.trim() ||
              !form.categoryId ||
              !form.plannedStartDate ||
              !form.plannedEndDate ||
              (project.progressMode === 1 && form.weight === '') ||
              mutations.createActionItem.isPending
            }
            type="submit"
            variant="contained"
          >
            Create Action Item
          </Button>
        </div>
      </form>
    </Drawer>
  )
}

export function EditActionItemDrawer({
  actionItemId,
  categories,
  members,
  onClose,
  onSaved,
  project,
  projectId,
}) {
  const query = useActionItem(projectId, actionItemId)
  const mutations = useWorkspaceMutations(projectId)
  const [changes, setChanges] = useState({})
  const [picker, setPicker] = useState(null)
  const item = query.data
  const form = item
    ? {
        actionItemName: item.actionItemName,
        description: item.description ?? '',
        categoryId: item.categoryId,
        subCategoryId: item.subCategoryId ?? '',
        priority: item.priority,
        ownerId: item.ownerId ?? '',
        ownerName: item.ownerName ?? '',
        weight: item.weight ?? '',
        sequence: item.sequence,
        remarks: item.remarks ?? '',
        plannedStartDate: item.plannedSchedule?.plannedStartDate ?? '',
        plannedEndDate: item.plannedSchedule?.plannedEndDate ?? '',
        actualStartDate: item.actualExecution?.actualStartDate ?? '',
        actualEndDate: item.actualExecution?.actualEndDate ?? '',
        actualHours: item.actualExecution?.actualHours ?? '',
        delayReason: item.actualExecution?.delayReason ?? '',
        ...changes,
      }
    : null
  const subs = useSubCategories(form?.categoryId ?? '')
  const set = (key, value) =>
    setChanges((current) => ({
      ...current,
      [key]: value,
      ...(key === 'categoryId' ? { subCategoryId: '' } : {}),
    }))
  const submit = async (event) => {
    event.preventDefault()
    const selected = members.find((member) => member.userId === form.ownerId)
    const body = actionItemToWritePayload(item, {
      actionItemName: form.actionItemName.trim(),
      description: form.description.trim() || null,
      categoryId: form.categoryId,
      subCategoryId: form.subCategoryId || null,
      priority: Number(form.priority),
      ownerId: form.ownerId || null,
      ownerName: selected
        ? memberName(selected)
        : form.ownerName.trim() || null,
      weight: project.progressMode === 1 ? Number(form.weight) : null,
      sequence: Number(form.sequence),
      remarks: form.remarks.trim() || null,
      plannedStartDate: form.plannedStartDate,
      plannedEndDate: form.plannedEndDate,
      actualStartDate: form.actualStartDate || null,
      actualEndDate: form.actualEndDate || null,
      actualHours: form.actualHours === '' ? null : Number(form.actualHours),
      delayReason: form.delayReason.trim() || null,
    })
    await mutations.updateActionItem.mutateAsync({ actionItemId, body })
    onSaved()
  }
  const currentRange =
    picker === 'actual'
      ? {
          startDate: form?.actualStartDate ?? '',
          endDate: form?.actualEndDate ?? '',
        }
      : {
          startDate: form?.plannedStartDate ?? '',
          endDate: form?.plannedEndDate ?? '',
        }
  return (
    <Drawer
      anchor="right"
      open={Boolean(actionItemId)}
      onClose={mutations.updateActionItem.isPending ? undefined : onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', md: 720 },
          bgcolor: 'var(--color-dashboard-surface)',
          color: 'var(--color-dashboard-ink)',
        },
      }}
    >
      <DrawerHeader
        title="Edit Action Item"
        subtitle="Update the complete server record."
        onClose={onClose}
      />
      {query.isLoading || !form ? (
        <div className="grid flex-1 place-items-center">
          <CircularProgress aria-label="Loading Action Item" />
        </div>
      ) : query.isError ? (
        <Alert className="m-5" severity="error">
          {query.error.message}
        </Alert>
      ) : (
        <form className="grid gap-4 p-5" onSubmit={submit}>
          <TextField
            required
            label="Action Item name"
            inputProps={{ maxLength: 500 }}
            onChange={(event) => set('actionItemName', event.target.value)}
            value={form.actionItemName}
          />
          <TextField
            label="Description"
            multiline
            minRows={2}
            onChange={(event) => set('description', event.target.value)}
            value={form.description}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <FormControl required>
              <InputLabel>Category</InputLabel>
              <Select
                label="Category"
                onChange={(event) => set('categoryId', event.target.value)}
                value={form.categoryId}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel>Subcategory</InputLabel>
              <Select
                label="Subcategory"
                onChange={(event) => set('subCategoryId', event.target.value)}
                value={form.subCategoryId}
              >
                <MenuItem value="">None</MenuItem>
                {subs.data?.map((sub) => (
                  <MenuItem key={sub.id} value={sub.id}>
                    {sub.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel>Priority</InputLabel>
              <Select
                label="Priority"
                onChange={(event) => set('priority', event.target.value)}
                value={form.priority}
              >
                {PRIORITIES.map((priority) => (
                  <MenuItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel>Owner</InputLabel>
              <Select
                label="Owner"
                onChange={(event) => {
                  const ownerId = event.target.value
                  const owner = members.find(
                    (member) => member.userId === ownerId,
                  )
                  setChanges((current) => ({
                    ...current,
                    ownerId,
                    ownerName: owner ? memberName(owner) : form.ownerName,
                  }))
                }}
                value={form.ownerId}
              >
                <MenuItem value="">Free-text / unassigned</MenuItem>
                {members.map((member) => (
                  <MenuItem key={member.userId} value={member.userId}>
                    {memberName(member)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          {!form.ownerId ? (
            <TextField
              label="Owner name"
              inputProps={{ maxLength: 200 }}
              onChange={(event) => set('ownerName', event.target.value)}
              value={form.ownerName}
            />
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <Button onClick={() => setPicker('planned')} variant="outlined">
              {dateRangeText(
                form.plannedStartDate,
                form.plannedEndDate,
                'Planned dates',
              )}
            </Button>
            <Button onClick={() => setPicker('actual')} variant="outlined">
              {dateRangeText(
                form.actualStartDate,
                form.actualEndDate,
                'Actual dates',
              )}
            </Button>
            <TextField
              required
              label="Display order"
              inputProps={{ min: 0 }}
              onChange={(event) => set('sequence', event.target.value)}
              type="number"
              value={form.sequence}
            />
            {project.progressMode === 1 ? (
              <TextField
                required
                label="Weight"
                inputProps={{ min: 0, max: 100 }}
                onChange={(event) => set('weight', event.target.value)}
                type="number"
                value={form.weight}
              />
            ) : null}
            <TextField
              label="Actual hours"
              inputProps={{ min: 0, step: 0.25 }}
              onChange={(event) => set('actualHours', event.target.value)}
              type="number"
              value={form.actualHours}
            />
            <TextField
              label="Delay reason"
              onChange={(event) => set('delayReason', event.target.value)}
              value={form.delayReason}
            />
          </div>
          <TextField
            label="Remarks"
            multiline
            minRows={2}
            onChange={(event) => set('remarks', event.target.value)}
            value={form.remarks}
          />
          {mutations.updateActionItem.error ? (
            <Alert severity="error">
              {mutations.updateActionItem.error.message}
            </Alert>
          ) : null}
          <div className="sticky bottom-0 flex justify-end gap-2 border-t border-dashboard-border bg-dashboard-surface py-4">
            <Button
              disabled={mutations.updateActionItem.isPending}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              disabled={
                !form.actionItemName.trim() ||
                !form.plannedStartDate ||
                !form.plannedEndDate ||
                (project.progressMode === 1 && form.weight === '') ||
                mutations.updateActionItem.isPending
              }
              type="submit"
              variant="contained"
            >
              {mutations.updateActionItem.isPending
                ? 'Saving...'
                : 'Save changes'}
            </Button>
          </div>
          <DateRangePicker
            endRequired={picker !== 'actual'}
            maxDate={picker === 'planned' ? project.endDate : ''}
            minDate={picker === 'planned' ? project.startDate : ''}
            onApply={(range) => {
              if (picker === 'actual')
                setChanges((current) => ({
                  ...current,
                  actualStartDate: range.startDate,
                  actualEndDate: range.endDate,
                }))
              else
                setChanges((current) => ({
                  ...current,
                  plannedStartDate: range.startDate,
                  plannedEndDate: range.endDate,
                }))
              setPicker(null)
            }}
            onClose={() => setPicker(null)}
            open={Boolean(picker)}
            title={
              picker === 'actual' ? 'Set actual execution' : 'Set planned dates'
            }
            value={currentRange}
          />
        </form>
      )}
    </Drawer>
  )
}

export function ActionItemDetailsDrawer({ projectId, actionItemId, onClose }) {
  const query = useActionItem(projectId, actionItemId)
  const item = query.data
  return (
    <Drawer
      anchor="right"
      open={Boolean(actionItemId)}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 520 },
          bgcolor: 'var(--color-dashboard-surface)',
          color: 'var(--color-dashboard-ink)',
        },
      }}
    >
      <DrawerHeader
        title="Action Item details"
        subtitle="Read-only server record"
        onClose={onClose}
      />
      {query.isLoading ? (
        <div className="grid flex-1 place-items-center">
          <CircularProgress />
        </div>
      ) : query.isError ? (
        <Alert className="m-5" severity="error">
          {query.error.message}
        </Alert>
      ) : item ? (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-6 p-5">
          <div className="col-span-2">
            <dt className="text-sm text-dashboard-muted">Action Item</dt>
            <dd className="mt-1 text-xl font-bold">{item.actionItemName}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-sm text-dashboard-muted">Description</dt>
            <dd>{item.description || 'No description'}</dd>
          </div>
          <div>
            <dt className="text-sm text-dashboard-muted">Category</dt>
            <dd>{item.categoryName}</dd>
          </div>
          <div>
            <dt className="text-sm text-dashboard-muted">Subcategory</dt>
            <dd>{item.subCategoryName || 'Not set'}</dd>
          </div>
          <div>
            <dt className="text-sm text-dashboard-muted">Owner</dt>
            <dd>{item.ownerName || 'Not set'}</dd>
          </div>
          <div>
            <dt className="text-sm text-dashboard-muted">Sequence</dt>
            <dd className="font-mono">{item.sequence}</dd>
          </div>
          <div>
            <dt className="text-sm text-dashboard-muted">Priority</dt>
            <dd>
              <Badge item={getPriority(item.priority)} />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-dashboard-muted">Status</dt>
            <dd>
              <Badge item={getStatus(item.computedStatus)} />
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-sm text-dashboard-muted">Planned dates</dt>
            <dd className="font-mono text-sm">
              {item.plannedSchedule
                ? `${formatDate(item.plannedSchedule.plannedStartDate)} – ${formatDate(item.plannedSchedule.plannedEndDate)}`
                : 'Not set'}
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-sm text-dashboard-muted">Actual execution</dt>
            <dd className="font-mono text-sm">
              {item.actualExecution
                ? `${formatDate(item.actualExecution.actualStartDate)} – ${formatDate(item.actualExecution.actualEndDate)}`
                : 'Not started'}
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-sm text-dashboard-muted">Remarks</dt>
            <dd>{item.remarks || 'No remarks'}</dd>
          </div>
        </dl>
      ) : null}
    </Drawer>
  )
}

export function TimelinePreview({ project }) {
  return (
    <section className="mt-5 overflow-hidden border border-dashboard-border bg-dashboard-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashboard-border p-4">
        <div>
          <h2 className="font-display text-xl font-bold">Project timeline</h2>
          <p className="text-sm text-dashboard-muted">
            Structural preview · {formatDate(project.startDate)}–
            {formatDate(project.endDate)}
          </p>
        </div>
        <Badge item={{ label: 'Preview', tone: 'warning' }} />
      </div>
      <div className="flex flex-wrap gap-2 border-b border-dashboard-border p-4">
        {['Daily', 'Weekly', 'Biweekly', 'Monthly', 'Quarterly'].map(
          (label) => (
            <Button disabled key={label} variant="outlined">
              {label}
            </Button>
          ),
        )}
        <Button disabled startIcon={<TimelineOutlined />}>
          Export
        </Button>
      </div>
      <div className="grid min-h-96 grid-cols-[14rem_repeat(5,minmax(10rem,1fr))] overflow-x-auto bg-dashboard-surface-muted">
        <div className="border-r border-dashboard-border bg-dashboard-surface p-4 font-bold">
          Category / Action Item
        </div>
        {['Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5'].map(
          (label) => (
            <div
              className="border-r border-dashboard-border p-4 text-center font-mono text-xs"
              key={label}
            >
              {label}
            </div>
          ),
        )}
      </div>
      <Alert severity="info">
        Timeline visualization controls remain disabled until selected-range
        overlap, clipping, and pagination behavior are supported.
      </Alert>
    </section>
  )
}
export function AnalyticsPreview({ progress }) {
  const values = [
    ['Total Action Items', progress.totalActionItems],
    ['Completed', progress.completedActionItems],
    ['Ongoing', progress.ongoingActionItems],
    ['Delayed', progress.delayedActionItems],
    ['Planned', progress.plannedActionItems],
  ]
  return (
    <section className="mt-5 border border-dashboard-border bg-dashboard-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashboard-border p-4">
        <div>
          <h2 className="font-display text-xl font-bold">Project analytics</h2>
          <p className="text-sm text-dashboard-muted">
            Current project progress totals
          </p>
        </div>
        <Badge item={{ label: 'Preview', tone: 'warning' }} />
      </div>
      <div className="grid md:grid-cols-[1.35fr_repeat(4,1fr)]">
        {values.map(([label, value], index) => (
          <div
            className={cn(
              'p-6',
              index > 0 &&
                'border-t border-dashboard-border md:border-l md:border-t-0',
            )}
            key={label}
          >
            <strong
              className={cn(
                'font-mono font-bold tabular-nums',
                index === 0 ? 'text-4xl' : 'text-2xl',
              )}
            >
              {value}
            </strong>
            <p className="mt-2 text-sm text-dashboard-muted">{label}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-dashboard-border p-6">
        <div className="flex justify-between text-sm">
          <span>Overall progress</span>
          <strong className="font-mono">{progress.progressPercent}%</strong>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-dashboard-track">
          <div
            className="h-full bg-dashboard-accent-strong"
            style={{
              width: `${Math.min(100, Math.max(0, progress.progressPercent))}%`,
            }}
          />
        </div>
      </div>
    </section>
  )
}

export function WorkspaceProblem({ error, onRetry }) {
  const status = error?.status
  const title =
    status === 403
      ? 'Project access is restricted'
      : status === 404
        ? 'Project not found'
        : 'Project workspace could not load'
  return (
    <section className="grid min-h-[55vh] place-items-center">
      <div className="max-w-lg text-center">
        <h1 className="font-display text-3xl font-bold">{title}</h1>
        <p className="mt-3 text-dashboard-muted">
          {status === 403
            ? 'Your account does not have access to this project.'
            : status === 404
              ? 'The project may have been removed or the address is incorrect.'
              : error?.message}
        </p>
        {!status || status >= 500 ? (
          <Button className="mt-6" onClick={onRetry} variant="contained">
            Retry
          </Button>
        ) : (
          <Button className="mt-6" component={RouterLink} to={routes.projects}>
            Back to Projects
          </Button>
        )}
      </div>
    </section>
  )
}
