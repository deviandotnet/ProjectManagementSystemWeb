import { jwtDecode } from 'jwt-decode'
import { apiClient, publicApiClient } from '../../../services/apiClient.js'
import { ApiError, normalizeApiError } from '../../../services/apiError.js'

export function parseTokenPair(data) {
  if (
    !data ||
    typeof data.accessToken !== 'string' ||
    !data.accessToken ||
    typeof data.refreshToken !== 'string' ||
    !data.refreshToken
  ) {
    throw new ApiError(
      'The server returned an invalid authentication response.',
      {
        kind: 'invalid-response',
      },
    )
  }

  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  }
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function parseRegistrationResponse(data) {
  if (typeof data !== 'string' || !UUID_PATTERN.test(data)) {
    throw new ApiError(
      'The server returned an invalid registration response.',
      {
        kind: 'invalid-response',
      },
    )
  }

  return data
}

export function getUserIdFromAccessToken(accessToken) {
  try {
    const claims = jwtDecode(accessToken)

    if (typeof claims.sub !== 'string' || !claims.sub) {
      throw new Error('Missing subject claim')
    }

    return claims.sub
  } catch {
    throw new ApiError('The server returned an invalid access token.', {
      kind: 'invalid-response',
    })
  }
}

export async function loginUser(credentials, signal) {
  try {
    const response = await publicApiClient.post('/users/login', credentials, {
      signal,
    })
    return parseTokenPair(response.data)
  } catch (error) {
    const normalizedError = normalizeApiError(error)

    if ([400, 401, 404].includes(normalizedError.status)) {
      throw new ApiError('Email or password is incorrect.', {
        kind: 'invalid-credentials',
        status: normalizedError.status,
      })
    }

    throw normalizedError
  }
}

export async function registerUser(credentials, signal) {
  try {
    const response = await publicApiClient.post('/users', credentials, {
      signal,
    })
    return parseRegistrationResponse(response.data)
  } catch (error) {
    const normalizedError = normalizeApiError(error)

    if (normalizedError.status === 409) {
      throw new ApiError(
        'An account with this email already exists. Sign in instead.',
        { kind: 'duplicate-email', status: 409 },
      )
    }

    if (normalizedError.status === 429) {
      throw new ApiError(
        'Too many account creation attempts. Wait a moment and try again.',
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

export async function refreshTokens(refreshToken) {
  try {
    const response = await publicApiClient.post('/auth/refresh', {
      refreshToken,
    })
    return parseTokenPair(response.data)
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function getAuthenticatedUser(accessToken, signal) {
  const userId = getUserIdFromAccessToken(accessToken)

  try {
    const response = await apiClient.get(
      `/users/${encodeURIComponent(userId)}`,
      {
        signal,
      },
    )
    return response.data
  } catch (error) {
    throw normalizeApiError(error)
  }
}
