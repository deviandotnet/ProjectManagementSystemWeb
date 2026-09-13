const DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
})

export function formatDashboardDate(value) {
  return DATE_FORMATTER.format(new Date(`${value}T00:00:00Z`))
}

export function formatRole(value) {
  return value.replace(/([a-z])([A-Z])/g, '$1 $2')
}

export function getProjectStatus(status) {
  const normalized = status.toLowerCase()

  if (normalized === 'active') {
    return { label: 'Active', tone: 'success' }
  }

  if (normalized === 'completed') {
    return { label: 'Completed', tone: 'complete' }
  }

  if (normalized === 'onhold') {
    return { label: 'On hold', tone: 'warning' }
  }

  return { label: status, tone: 'neutral' }
}

export function createDashboardSummary(data) {
  const counts = data.projects.reduce(
    (summary, project) => ({
      activeProjects:
        summary.activeProjects + (project.status === 'Active' ? 1 : 0),
      completedProjects:
        summary.completedProjects + (project.status === 'Completed' ? 1 : 0),
      projectsWithDelays:
        summary.projectsWithDelays + (project.delayedActionItems > 0 ? 1 : 0),
      planned: summary.planned + project.plannedActionItems,
      ongoing: summary.ongoing + project.ongoingActionItems,
      delayed: summary.delayed + project.delayedActionItems,
      completed: summary.completed + project.completedActionItems,
    }),
    {
      activeProjects: 0,
      completedProjects: 0,
      projectsWithDelays: 0,
      planned: 0,
      ongoing: 0,
      delayed: 0,
      completed: 0,
    },
  )

  return {
    ...counts,
    accessibleProjects: data.totalCount,
    totalActionItems:
      counts.planned + counts.ongoing + counts.delayed + counts.completed,
    delayedProjects: data.projects.filter(
      (project) => project.delayedActionItems > 0,
    ),
    projectsByProgress: [...data.projects].sort(
      (left, right) => right.progressPercent - left.progressPercent,
    ),
  }
}
