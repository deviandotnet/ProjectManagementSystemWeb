import { ApiError, normalizeApiError } from '../../../services/apiError.js'
import { apiClient } from '../../../services/apiClient.js'

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const DATE = /^\d{4}-\d{2}-\d{2}$/
const invalid = (label) =>
  new ApiError(`The server returned invalid ${label} data.`, {
    kind: 'invalid-response',
  })
const id = (value) => typeof value === 'string' && UUID.test(value)
const text = (value) => typeof value === 'string'
const number = (value) => typeof value === 'number' && Number.isFinite(value)
const integer = (value) => Number.isInteger(value)
const nullable = (value, check) =>
  value === null || value === undefined || check(value)
const date = (value) => text(value) && DATE.test(value)

function parsePaged(data, itemParser, label) {
  if (
    !data ||
    !Array.isArray(data.items) ||
    !integer(data.pageNumber) ||
    !integer(data.pageSize) ||
    !integer(data.totalCount) ||
    !integer(data.totalPages) ||
    typeof data.hasPreviousPage !== 'boolean' ||
    typeof data.hasNextPage !== 'boolean'
  )
    throw invalid(label)
  return { ...data, items: data.items.map(itemParser) }
}

export function parseProject(data) {
  if (
    !data ||
    !id(data.id) ||
    !text(data.name) ||
    !nullable(data.description, text) ||
    !date(data.startDate) ||
    !date(data.endDate) ||
    !integer(data.weekStartDay) ||
    !integer(data.defaultTimelineScale) ||
    !integer(data.progressMode) ||
    !integer(data.status) ||
    !id(data.createdByUserId)
  )
    throw invalid('project')
  return data
}

export function parseProgress(data) {
  const keys = [
    'progressPercent',
    'totalActionItems',
    'completedActionItems',
    'ongoingActionItems',
    'delayedActionItems',
    'plannedActionItems',
  ]
  if (
    !data ||
    !id(data.projectId) ||
    !text(data.projectName) ||
    !integer(data.progressMode) ||
    !text(data.progressModeLabel) ||
    keys.some((key) => !number(data[key])) ||
    !nullable(data.totalWeight, number) ||
    !nullable(data.completedWeight, number)
  )
    throw invalid('project progress')
  return data
}

function parseMember(item) {
  if (
    !item ||
    !id(item.memberId) ||
    !id(item.projectId) ||
    !id(item.userId) ||
    !text(item.firstName) ||
    !text(item.lastName) ||
    !text(item.email) ||
    !integer(item.role) ||
    !text(item.joinedAt)
  )
    throw invalid('project member')
  return item
}

function parseCategory(item) {
  if (
    !item ||
    !id(item.id) ||
    !id(item.projectId) ||
    !text(item.name) ||
    !integer(item.displayOrder) ||
    !nullable(item.color, text) ||
    !id(item.createdByUserId)
  )
    throw invalid('category')
  return item
}

function parseSubCategory(item) {
  if (
    !item ||
    !id(item.id) ||
    !id(item.categoryId) ||
    !text(item.name) ||
    !integer(item.displayOrder)
  )
    throw invalid('subcategory')
  return item
}

function parseSchedule(value) {
  if (value == null) return null
  if (
    !id(value.id) ||
    !date(value.plannedStartDate) ||
    !date(value.plannedEndDate) ||
    !text(value.plannedStartWeek) ||
    !text(value.plannedEndWeek) ||
    !integer(value.durationCalendarDays) ||
    !integer(value.durationWorkingDays)
  )
    throw invalid('Action Item schedule')
  return value
}

function parseExecution(value) {
  if (value == null) return null
  if (
    !id(value.id) ||
    !nullable(value.actualStartDate, date) ||
    !nullable(value.actualEndDate, date) ||
    !nullable(value.actualHours, number) ||
    !nullable(value.delayReason, text)
  )
    throw invalid('Action Item execution')
  return value
}

function parseActionItemSummary(item) {
  if (
    !item ||
    !id(item.id) ||
    !text(item.actionItemName) ||
    !id(item.categoryId) ||
    !text(item.categoryName) ||
    !nullable(item.subCategoryId, id) ||
    !nullable(item.subCategoryName, text) ||
    !integer(item.priority) ||
    !nullable(item.ownerName, text) ||
    !integer(item.sequence) ||
    !integer(item.computedStatus) ||
    !text(item.computedStatusLabel) ||
    !nullable(item.weight, number) ||
    !nullable(item.remarks, text)
  )
    throw invalid('Action Item')
  return {
    ...item,
    plannedSchedule: parseSchedule(item.plannedSchedule),
    actualExecution: parseExecution(item.actualExecution),
  }
}

export function parseActionItem(item) {
  const parsed = parseActionItemSummary(item)
  if (
    !Object.hasOwn(item, 'description') ||
    !nullable(item.description, text) ||
    !Object.hasOwn(item, 'ownerId') ||
    !nullable(item.ownerId, id)
  )
    throw invalid('Action Item detail')
  return parsed
}

export function parseGroupedActionItems(data) {
  if (
    !data ||
    !Array.isArray(data.categories) ||
    !integer(data.pageNumber) ||
    !integer(data.pageSize) ||
    !integer(data.totalCount) ||
    !integer(data.totalPages) ||
    typeof data.hasPreviousPage !== 'boolean' ||
    typeof data.hasNextPage !== 'boolean'
  )
    throw invalid('grouped Action Item')
  return {
    ...data,
    categories: data.categories.map((category) => {
      if (
        !category ||
        !id(category.id) ||
        !id(category.projectId) ||
        !text(category.name) ||
        !integer(category.displayOrder) ||
        !nullable(category.color, text) ||
        !Array.isArray(category.actionItems)
      )
        throw invalid('grouped category')
      return {
        ...category,
        actionItems: category.actionItems.map(parseActionItemSummary),
      }
    }),
  }
}

async function request(work, signal) {
  try {
    return await work()
  } catch (error) {
    if (signal?.aborted) throw error
    throw normalizeApiError(error)
  }
}

export const getProject = (projectId, signal) =>
  request(
    async () =>
      parseProject(
        (
          await apiClient.get(`/projects/${encodeURIComponent(projectId)}`, {
            signal,
          })
        ).data,
      ),
    signal,
  )
export const getProjectProgress = (projectId, signal) =>
  request(
    async () =>
      parseProgress(
        (
          await apiClient.get(
            `/projects/${encodeURIComponent(projectId)}/progress`,
            { signal },
          )
        ).data,
      ),
    signal,
  )

async function getAllPages(url, parser, signal) {
  const first = parser(
    (
      await apiClient.get(url, {
        params: { pageNumber: 1, pageSize: 100 },
        signal,
      })
    ).data,
  )
  if (first.totalPages <= 1) return first.items
  const pages = await Promise.all(
    Array.from({ length: first.totalPages - 1 }, (_, index) =>
      apiClient.get(url, {
        params: { pageNumber: index + 2, pageSize: 100 },
        signal,
      }),
    ),
  )
  const items = [
    first,
    ...pages.map((response) => parser(response.data)),
  ].flatMap((page) => page.items)
  if (items.length !== first.totalCount) throw invalid('paged collection')
  return items
}

export const getAllProjectMembers = (projectId, signal) =>
  request(
    () =>
      getAllPages(
        `/projects/${encodeURIComponent(projectId)}/members`,
        (data) => parsePaged(data, parseMember, 'project members'),
        signal,
      ),
    signal,
  )
export const getAllCategories = (projectId, signal) =>
  request(
    () =>
      getAllPages(
        `/projects/${encodeURIComponent(projectId)}/categories`,
        (data) => parsePaged(data, parseCategory, 'categories'),
        signal,
      ),
    signal,
  )
export const getAllSubCategories = (categoryId, signal) =>
  request(
    () =>
      getAllPages(
        `/categories/${encodeURIComponent(categoryId)}/subcategories`,
        (data) => parsePaged(data, parseSubCategory, 'subcategories'),
        signal,
      ),
    signal,
  )

export async function getGroupedActionItems(projectId, filters, signal) {
  const params = { pageNumber: filters.pageNumber, pageSize: filters.pageSize }
  for (const key of ['categoryId', 'subCategoryId', 'priority'])
    if (filters[key] !== '' && filters[key] != null) params[key] = filters[key]
  if (filters.statuses?.length) params.status = filters.statuses.join(',')
  if (filters.search?.trim()) params.search = filters.search.trim()
  if (filters.ownerName?.trim()) params.ownerName = filters.ownerName.trim()
  return request(
    async () =>
      parseGroupedActionItems(
        (
          await apiClient.get(
            `/projects/${encodeURIComponent(projectId)}/categories/action-items`,
            { params, signal },
          )
        ).data,
      ),
    signal,
  )
}

export const getActionItem = (projectId, actionItemId, signal) =>
  request(
    async () =>
      parseActionItem(
        (
          await apiClient.get(
            `/projects/${encodeURIComponent(projectId)}/action-items/${encodeURIComponent(actionItemId)}`,
            { signal },
          )
        ).data,
      ),
    signal,
  )

async function create(url, body) {
  return request(async () => {
    const data = (await apiClient.post(url, body)).data
    if (!id(data)) throw invalid('creation response')
    return data
  })
}

export const createCategory = (projectId, body) =>
  create(`/projects/${encodeURIComponent(projectId)}/categories`, body)
export const createSubCategory = (categoryId, body) =>
  create(`/categories/${encodeURIComponent(categoryId)}/subcategories`, body)
export const createActionItem = (projectId, body) =>
  create(`/projects/${encodeURIComponent(projectId)}/action-items`, body)

export const updateActionItem = (projectId, actionItemId, body, signal) =>
  request(async () => {
    await apiClient.put(
      `/projects/${encodeURIComponent(projectId)}/action-items/${encodeURIComponent(actionItemId)}`,
      body,
      { signal },
    )
  }, signal)

export const deleteActionItem = (projectId, actionItemId, signal) =>
  request(async () => {
    await apiClient.delete(
      `/projects/${encodeURIComponent(projectId)}/action-items/${encodeURIComponent(actionItemId)}`,
      { signal },
    )
  }, signal)
