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
