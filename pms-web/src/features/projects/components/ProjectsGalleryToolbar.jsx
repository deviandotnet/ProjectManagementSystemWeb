import GridViewOutlined from '@mui/icons-material/GridViewOutlined'
import ViewListOutlined from '@mui/icons-material/ViewListOutlined'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Skeleton from '@mui/material/Skeleton'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { PROJECT_GALLERY_PAGE_SIZES } from '../api/projectGalleryService.js'

export function ProjectsGalleryToolbar({
  onPageSizeChange,
  onViewModeChange,
  pageSize,
  state,
  totalCount,
  viewMode,
}) {
  return (
    <section
      aria-label="Project gallery controls"
      className="flex flex-col gap-4 rounded-xl border border-dashboard-border bg-dashboard-surface p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel id="project-page-size-label">Items per page</InputLabel>
        <Select
          label="Items per page"
          labelId="project-page-size-label"
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          value={pageSize}
        >
          {PROJECT_GALLERY_PAGE_SIZES.map((size) => (
            <MenuItem key={size} value={size}>
              {size}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        {state === 'loading' ? (
          <Skeleton aria-label="Loading project count" width={72} />
        ) : (
          <span className="text-sm font-medium text-dashboard-muted">
            {state === 'error'
              ? 'Count unavailable'
              : `${totalCount} ${totalCount === 1 ? 'project' : 'projects'}`}
          </span>
        )}
        <ToggleButtonGroup
          aria-label="Project display"
          exclusive
          onChange={(_, value) => value && onViewModeChange(value)}
          size="small"
          value={viewMode}
        >
          <ToggleButton
            aria-label="Grid view"
            className="min-h-11 min-w-11"
            value="grid"
          >
            <GridViewOutlined />
          </ToggleButton>
          <ToggleButton
            aria-label="List view"
            className="min-h-11 min-w-11"
            value="list"
          >
            <ViewListOutlined />
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
    </section>
  )
}
