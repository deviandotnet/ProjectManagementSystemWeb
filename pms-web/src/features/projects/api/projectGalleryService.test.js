import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../../../services/apiClient.js'
import {
  getProjectGalleryPage,
  PROJECT_GALLERY_PAGE_SIZES,
} from './projectGalleryService.js'

vi.mock('../../../services/apiClient.js', () => ({
  apiClient: { get: vi.fn() },
}))

const response = {
  projects: [],
  pageNumber: 2,
  pageSize: 12,
  totalCount: 13,
  totalPages: 2,
  hasPreviousPage: true,
  hasNextPage: false,
}

beforeEach(() => {
  apiClient.get.mockReset()
})

describe('project gallery service', () => {
  it('sends only backend-supported pagination and forwards the abort signal', async () => {
    const controller = new AbortController()
    apiClient.get.mockResolvedValue({ data: response })

    await getProjectGalleryPage(
      { pageNumber: 2, pageSize: 12 },
      controller.signal,
    )

    expect(apiClient.get).toHaveBeenCalledWith('/dashboard', {
      params: { pageNumber: 2, pageSize: 12 },
      signal: controller.signal,
    })
  })

  it('normalizes unsupported pagination values before requesting', async () => {
    apiClient.get.mockResolvedValue({
      data: { ...response, pageNumber: 1, pageSize: 6 },
    })

    await getProjectGalleryPage({ pageNumber: -3, pageSize: 999 })

    expect(apiClient.get).toHaveBeenCalledWith('/dashboard', {
      params: { pageNumber: 1, pageSize: PROJECT_GALLERY_PAGE_SIZES[0] },
      signal: undefined,
    })
  })
})
