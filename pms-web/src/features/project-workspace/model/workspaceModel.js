export const ACTION_STATUSES = [
  { value: 0, label: 'Plan', tone: 'plan' },
  { value: 1, label: 'Ongoing', tone: 'ongoing' },
  { value: 2, label: 'Delayed', tone: 'danger' },
  { value: 3, label: 'Completed early', tone: 'success' },
  { value: 4, label: 'Completed on time', tone: 'success' },
  { value: 5, label: 'Completed late', tone: 'warning' },
]
export const PRIORITIES = [
  { value: 0, label: 'Low', tone: 'success' },
  { value: 1, label: 'Medium', tone: 'warning' },
  { value: 2, label: 'High', tone: 'danger' },
  { value: 3, label: 'Critical', tone: 'danger' },
]
export const PROJECT_STATUS = {
  1: 'Active',
  2: 'On hold',
  3: 'Completed',
  4: 'Cancelled',
}
export const MEMBER_ROLE = {
  1: 'Project Admin',
  2: 'Project Manager',
  3: 'Team Leader',
  4: 'Member',
  5: 'Viewer',
}
export const TIMELINE_SCALE = {
  0: 'Daily',
  1: 'Weekly',
  2: 'Biweekly',
  3: 'Monthly',
  4: 'Quarterly',
}
export const WEEK_DAY = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
}

export const getStatus = (value) =>
  ACTION_STATUSES.find((item) => item.value === value) ?? {
    label: 'Unknown',
    tone: 'plan',
  }
export const getPriority = (value) =>
  PRIORITIES.find((item) => item.value === value) ?? {
    label: 'Unknown',
    tone: 'plan',
  }
export const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(`${value}T00:00:00`))
    : 'Not set'
export const memberName = (member) =>
  `${member.firstName} ${member.lastName}`.trim()
export const canCreateInProject = (user, members) => {
  const systemAdmin = user?.systemRole === 2 || user?.systemRole === 'Admin'
  const membership = members?.find((member) => member.userId === user?.id)
  return {
    allowed: systemAdmin || Boolean(membership && membership.role !== 5),
    role:
      systemAdmin && !membership
        ? 'System administrator'
        : (MEMBER_ROLE[membership?.role] ?? 'Viewer'),
  }
}

export const getProjectCapabilities = (user, members, project) => {
  const systemAdmin = user?.systemRole === 2 || user?.systemRole === 'Admin'
  const membership = members?.find((member) => member.userId === user?.id)
  const canEdit = systemAdmin || Boolean(membership && membership.role !== 5)
  const canDelete =
    systemAdmin ||
    project?.createdByUserId === user?.id ||
    Boolean(membership && [1, 2, 3].includes(membership.role))
  return { canEdit, canDelete }
}

export function mergeRegisterCategories(grouped, categories) {
  const groupedById = new Map(
    grouped.categories.map((category) => [category.id, category]),
  )
  const catalogIds = new Set(categories.map((category) => category.id))
  const catalogGroups = categories.map((category) => ({
    ...category,
    ...groupedById.get(category.id),
    actionItems: groupedById.get(category.id)?.actionItems ?? [],
  }))
  const uncataloguedGroups = grouped.categories.filter(
    (category) => !catalogIds.has(category.id),
  )

  return {
    ...grouped,
    categories: [...catalogGroups, ...uncataloguedGroups].sort(
      (left, right) =>
        left.displayOrder - right.displayOrder ||
        left.name.localeCompare(right.name),
    ),
  }
}
