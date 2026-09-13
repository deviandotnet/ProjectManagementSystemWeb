import { ApiError, normalizeApiError } from '../../../services/apiError.js'
import { apiClient } from '../../../services/apiClient.js'

export const DASHBOARD_PAGE_SIZE = 100

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

function isNonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0
}

function parseProject(project) {
  const isValid =
    project &&
    UUID_PATTERN.test(project.projectId) &&
    typeof project.projectName === 'string' &&
    project.projectName.length > 0 &&
    typeof project.status === 'string' &&
    isFiniteNumber(project.progressPercent) &&
    isNonNegativeInteger(project.totalActionItems) &&
    isNonNegativeInteger(project.completedActionItems) &&
    isNonNegativeInteger(project.ongoingActionItems) &&
    isNonNegativeInteger(project.delayedActionItems) &&
    isNonNegativeInteger(project.plannedActionItems) &&
    DATE_PATTERN.test(project.startDate) &&
    DATE_PATTERN.test(project.endDate) &&
    typeof project.myRole === 'string'

  if (!isValid) {
    throw new ApiError('The server returned invalid dashboard data.', {
      kind: 'invalid-response',
    })
  }

  return { ...project }
}

export function parseDashboardResponse(data) {
  const isValidEnvelope =
    data &&
    Array.isArray(data.projects) &&
    isNonNegativeInteger(data.pageNumber) &&
    isNonNegativeInteger(data.pageSize) &&
    isNonNegativeInteger(data.totalCount) &&
    isNonNegativeInteger(data.totalPages) &&
    typeof data.hasPreviousPage === 'boolean' &&
    typeof data.hasNextPage === 'boolean'

  if (!isValidEnvelope) {
    throw new ApiError('The server returned invalid dashboard data.', {
      kind: 'invalid-response',
    })
  }

  return {
    ...data,
    projects: data.projects.map(parseProject),
  }
}

export async function getDashboardPage(pageNumber, signal) {
  try {
    const response = await apiClient.get('/dashboard', {
      params: { pageNumber, pageSize: DASHBOARD_PAGE_SIZE },
      signal,
    })

    return parseDashboardResponse(response.data)
  } catch (error) {
    if (signal?.aborted) {
      throw error
    }

    throw normalizeApiError(error)
  }
}

export async function getDashboardSnapshot(signal) {
  const firstPage = await getDashboardPage(1, signal)

  if (firstPage.totalPages <= 1) {
    return firstPage
  }

  const remainingRequests = Array.from(
    { length: firstPage.totalPages - 1 },
    (_, index) => getDashboardPage(index + 2, signal),
  )
  const remainingPages = await Promise.all(remainingRequests)
  const projects = [
    ...firstPage.projects,
    ...remainingPages.flatMap((page) => page.projects),
  ]

  if (projects.length !== firstPage.totalCount) {
    throw new ApiError('The server returned incomplete dashboard data.', {
      kind: 'invalid-response',
    })
  }

  return { ...firstPage, projects }
}
