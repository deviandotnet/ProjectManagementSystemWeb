import axios from 'axios'

export class ApiError extends Error {
  constructor(
    message,
    { kind = 'unexpected', retryAfter = null, status = null } = {},
  ) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.retryAfter = retryAfter
    this.status = status
  }
}

export function normalizeApiError(error) {
  if (error instanceof ApiError) {
    return error
  }

  if (!axios.isAxiosError(error) || !error.response) {
    return new ApiError(
      'Unable to reach the server. Check your connection and try again.',
      { kind: 'network' },
    )
  }

  const status = error.response.status

  if (status === 429) {
    return new ApiError(
      'Too many sign-in attempts. Wait a moment and try again.',
      {
        kind: 'rate-limit',
        retryAfter: error.response.headers?.['retry-after'] ?? null,
        status,
      },
    )
  }

  const description =
    error.response.data?.description ??
    error.response.data?.detail ??
    error.response.data?.title

  return new ApiError(
    description || 'The server could not complete the request.',
    { kind: status >= 500 ? 'server' : 'request', status },
  )
}
