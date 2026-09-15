import { beforeEach, expect, it, vi } from 'vitest'
import { apiClient } from '../../../services/apiClient.js'
import {
  createActionItem,
  createCategory,
  createSubCategory,
  deleteActionItem,
  getActionItem,
  getGroupedActionItems,
  parseGroupedActionItems,
  updateActionItem,
} from './projectWorkspaceService.js'

vi.mock('../../../services/apiClient.js', () => ({
  apiClient: { delete: vi.fn(), get: vi.fn(), post: vi.fn(), put: vi.fn() },
}))
const ids = {
  project: '7da8200f-6ecf-48df-9f12-1fa49e150f70',
  category: '9c4c080e-fdc4-47ab-8e5c-82844d091726',
  sub: '32e3ef9c-fe1d-43d9-9813-21c69ef1bd5b',
  item: '541f1990-68d1-492c-93de-1ce4d73dcc68',
  schedule: '74fb6ea9-772d-41ed-bff3-44b1bc11c393',
  execution: 'e91d9c85-29f4-4ff1-80e4-11a03970795d',
}
const grouped = {
  categories: [
    {
      id: ids.category,
      projectId: ids.project,
      name: 'Design',
      displayOrder: 10,
      color: '#C96A45',
      actionItems: [
        {
          id: ids.item,
          actionItemName: 'Responsive wireframes',
          categoryId: ids.category,
          categoryName: 'Design',
          subCategoryId: ids.sub,
          subCategoryName: 'UX',
          priority: 2,
          ownerName: null,
          sequence: 20,
          plannedSchedule: {
            id: ids.schedule,
            plannedStartDate: '2026-11-02',
            plannedEndDate: '2026-11-13',
            plannedStartWeek: 'WW45',
            plannedEndWeek: 'WW46',
            durationCalendarDays: 12,
            durationWorkingDays: 10,
          },
          actualExecution: {
            id: ids.execution,
            actualStartDate: null,
            actualEndDate: null,
            actualHours: null,
            delayReason: null,
          },
          computedStatus: 4,
          computedStatusLabel: 'Completed on time',
          weight: 15,
          remarks: null,
        },
      ],
    },
  ],
  pageNumber: 1,
  pageSize: 50,
  totalCount: 1,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage: false,
}

beforeEach(() => {
  apiClient.delete.mockReset()
  apiClient.get.mockReset()
  apiClient.post.mockReset()
  apiClient.put.mockReset()
})

it('parses safe detail fields and forwards update and delete requests', async () => {
  const detail = {
    ...grouped.categories[0].actionItems[0],
    description: 'Detail copy',
    ownerId: ids.project,
  }
  const signal = new AbortController().signal
  apiClient.get.mockResolvedValue({ data: detail })
  apiClient.put.mockResolvedValue({ data: null })
  apiClient.delete.mockResolvedValue({ data: null })

  await expect(
    getActionItem(ids.project, ids.item, signal),
  ).resolves.toMatchObject({
    description: 'Detail copy',
    ownerId: ids.project,
  })
  await updateActionItem(ids.project, ids.item, { priority: 2 }, signal)
  await deleteActionItem(ids.project, ids.item, signal)

  expect(apiClient.put).toHaveBeenCalledWith(
    `/projects/${ids.project}/action-items/${ids.item}`,
    { priority: 2 },
    { signal },
  )
  expect(apiClient.delete).toHaveBeenCalledWith(
    `/projects/${ids.project}/action-items/${ids.item}`,
    { signal },
  )
})

it('parses grouped categories with nullable nested execution values', () => {
  const actionItem =
    parseGroupedActionItems(grouped).categories[0].actionItems[0]

  expect(actionItem.computedStatus).toBe(4)
  expect(actionItem.plannedSchedule).toMatchObject({
    plannedStartWeek: 'WW45',
    plannedEndWeek: 'WW46',
  })
})

it('rejects malformed grouped responses', () => {
  expect(() =>
    parseGroupedActionItems({ ...grouped, totalCount: '1' }),
  ).toThrow(/invalid grouped/i)
})

it('serializes supported filters and comma-separated statuses', async () => {
  apiClient.get.mockResolvedValue({ data: grouped })
  const signal = new AbortController().signal
  await getGroupedActionItems(
    ids.project,
    {
      pageNumber: 2,
      pageSize: 20,
      categoryId: ids.category,
      subCategoryId: '',
      statuses: [1, 2, 4],
      priority: 2,
      search: ' wire ',
      ownerName: ' Morgan ',
    },
    signal,
  )
  expect(apiClient.get).toHaveBeenCalledWith(
    `/projects/${ids.project}/categories/action-items`,
    {
      params: {
        pageNumber: 2,
        pageSize: 20,
        categoryId: ids.category,
        priority: 2,
        status: '1,2,4',
        search: 'wire',
        ownerName: 'Morgan',
      },
      signal,
    },
  )
})

it('uses exact creation routes and preserves request bodies', async () => {
  apiClient.post.mockResolvedValue({ data: ids.item })
  const category = { name: 'Design', displayOrder: 20, color: '#C96A45' }
  const sub = { name: 'UX', displayOrder: 10 }
  const item = {
    categoryId: ids.category,
    subCategoryId: ids.sub,
    actionItemName: 'Wireframes',
    description: null,
    priority: 2,
    ownerName: 'Morgan Chen',
    ownerId: null,
    weight: null,
    sequence: 20,
    remarks: null,
    plannedStartDate: '2026-11-02',
    plannedEndDate: '2026-11-13',
    actualStartDate: null,
    actualEndDate: null,
    actualHours: null,
    delayReason: null,
  }
  await createCategory(ids.project, category)
  await createSubCategory(ids.category, sub)
  await createActionItem(ids.project, item)
  expect(apiClient.post).toHaveBeenNthCalledWith(
    1,
    `/projects/${ids.project}/categories`,
    category,
  )
  expect(apiClient.post).toHaveBeenNthCalledWith(
    2,
    `/categories/${ids.category}/subcategories`,
    sub,
  )
  expect(apiClient.post).toHaveBeenNthCalledWith(
    3,
    `/projects/${ids.project}/action-items`,
    item,
  )
})
