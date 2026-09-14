import { ApiError, normalizeApiError } from '../../../services/apiError.js'
import { apiClient } from '../../../services/apiClient.js'

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/**
 * @typedef {object} ProjectCreationInput
 * @property {string} name
 * @property {string | null} description
 * @property {string} startDate
 * @property {string} endDate
 * @property {number} weekStartDay
 * @property {number} defaultTimelineScale
 * @property {number} progressMode
 */

export function parseCreateProjectResponse(data) {
  if (typeof data !== 'string' || !UUID_PATTERN.test(data)) {
    throw new ApiError('The server returned an invalid project response.', {
      kind: 'invalid-response',
    })
  }

  return data
}

/**
 * @param {ProjectCreationInput} input
 * @param {AbortSignal} [signal]
 * @returns {Promise<string>}
 */
export async function createProject(input, signal) {
  try {
    const response = await apiClient.post('/projects', input, { signal })
    return parseCreateProjectResponse(response.data)
  } catch (error) {
    const normalizedError = normalizeApiError(error)

    if (normalizedError.status === 409) {
      throw new ApiError(
        'A project with this name already exists. Choose a different name.',
        { kind: 'duplicate-project', status: 409 },
      )
    }

    if (normalizedError.status === 429) {
      throw new ApiError(
        'Too many project creation attempts. Wait a moment and try again.',
        {
          kind: 'rate-limit',
          retryAfter: normalizedError.retryAfter,
          status: 429,
        },
      )
    }

    throw normalizedError
  }
}
