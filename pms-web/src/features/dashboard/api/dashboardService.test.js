import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../../../services/apiClient.js'
import { ApiError } from '../../../services/apiError.js'
import {
  DASHBOARD_PAGE_SIZE,
  getDashboardPage,
  getDashboardSnapshot,
  parseDashboardResponse,
} from './dashboardService.js'

vi.mock('../../../services/apiClient.js', () => ({
  apiClient: { get: vi.fn() },
}))

const project = {
  projectId: '7da8200f-6ecf-48df-9f12-1fa49e150f70',
  projectName: 'Website redesign',
  status: 'Active',
  progressPercent: 42,
  totalActionItems: 7,
  completedActionItems: 2,
  ongoingActionItems: 3,
  delayedActionItems: 1,
  plannedActionItems: 1,
  startDate: '2026-09-01',
  endDate: '2026-12-15',
  myRole: 'ProjectManager',
}

function createPage(overrides = {}) {
  return {
    projects: [project],
    pageNumber: 1,
    pageSize: DASHBOARD_PAGE_SIZE,
    totalCount: 1,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
    ...overrides,
  }
}

beforeEach(() => {
  apiClient.get.mockReset()
})

describe('dashboard service', () => {
  it('parses the dashboard response contract', () => {
    expect(parseDashboardResponse(createPage())).toEqual(createPage())
  })

  it('rejects malformed dashboard data', () => {
    expect(() =>
      parseDashboardResponse(
        createPage({ projects: [{ ...project, projectId: 'invalid' }] }),
      ),
    ).toThrowError(ApiError)
  })

  it('forwards pagination and the abort signal', async () => {
    const controller = new AbortController()
    apiClient.get.mockResolvedValue({ data: createPage() })

    await getDashboardPage(1, controller.signal)

    expect(apiClient.get).toHaveBeenCalledWith('/dashboard', {
      params: { pageNumber: 1, pageSize: DASHBOARD_PAGE_SIZE },
      signal: controller.signal,
    })
  })

  it('aggregates every dashboard page', async () => {
    const secondProject = {
      ...project,
      projectId: 'b4a30c59-2092-40e0-a88f-d734a063fe04',
      projectName: 'Mobile launch',
    }
    apiClient.get
      .mockResolvedValueOnce({
        data: createPage({ totalCount: 2, totalPages: 2, hasNextPage: true }),
      })
      .mockResolvedValueOnce({
        data: createPage({
          projects: [secondProject],
          pageNumber: 2,
          totalCount: 2,
          totalPages: 2,
          hasPreviousPage: true,
        }),
      })

    const response = await getDashboardSnapshot()

    expect(response.projects).toEqual([project, secondProject])
    expect(apiClient.get).toHaveBeenCalledTimes(2)
  })

  it('rejects an incomplete multi-page snapshot', async () => {
    apiClient.get
      .mockResolvedValueOnce({
        data: createPage({ totalCount: 2, totalPages: 2, hasNextPage: true }),
      })
      .mockResolvedValueOnce({
        data: createPage({
          projects: [],
          pageNumber: 2,
          totalCount: 2,
          totalPages: 2,
          hasPreviousPage: true,
        }),
      })

    await expect(getDashboardSnapshot()).rejects.toMatchObject({
      kind: 'invalid-response',
    })
  })
})
