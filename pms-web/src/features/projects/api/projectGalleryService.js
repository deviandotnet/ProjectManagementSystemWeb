import { parseDashboardResponse } from '../../dashboard/api/dashboardService.js'
import { apiClient } from '../../../services/apiClient.js'
import { normalizeApiError } from '../../../services/apiError.js'

export const PROJECT_GALLERY_PAGE_SIZES = Object.freeze([6, 12, 24])

/**
 * Loads one backend-supported project KPI page for the authenticated user.
 * The endpoint accepts pagination only; unsupported search/status/sort params are never sent.
 *
 * @param {{pageNumber: number, pageSize: number}} input
 * @param {AbortSignal} [signal]
 */
export async function getProjectGalleryPage(input, signal) {
  const pageNumber = Math.max(1, Number(input.pageNumber) || 1)
  const pageSize = PROJECT_GALLERY_PAGE_SIZES.includes(Number(input.pageSize))
    ? Number(input.pageSize)
    : PROJECT_GALLERY_PAGE_SIZES[0]

  try {
    const response = await apiClient.get('/dashboard', {
      params: { pageNumber, pageSize },
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
