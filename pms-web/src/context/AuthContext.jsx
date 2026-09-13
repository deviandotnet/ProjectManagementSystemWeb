import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { configureUnauthorizedHandler } from '../services/apiClient.js'
import { normalizeApiError } from '../services/apiError.js'
import {
  getAuthenticatedUser,
  loginUser,
  refreshTokens,
  registerUser,
} from '../features/auth/api/authService.js'
import {
  configureRefreshRequest,
  refreshAccessToken,
} from '../features/auth/model/refreshCoordinator.js'
import {
  applyTokenPair,
  clearStoredSession,
  getRefreshToken,
  storeTokenPair,
  subscribeToSessionEvents,
} from '../features/auth/model/sessionStore.js'
import { AuthContext } from './authContextDefinition.js'

function isTerminalSessionError(error) {
  return (
    error.kind === 'invalid-session' ||
    error.kind === 'invalid-response' ||
    (error.status >= 400 && error.status < 500 && error.status !== 429)
  )
}

export function AuthProvider({ children }) {
  const queryClient = useQueryClient()
  const operationId = useRef(0)
  const restorationStarted = useRef(false)
  const [session, setSession] = useState(() => ({
    status: getRefreshToken() ? 'restoring' : 'anonymous',
    user: null,
    error: null,
  }))

  const loadUser = useCallback(async (accessToken, signal) => {
    return getAuthenticatedUser(accessToken, signal)
  }, [])

  const endSession = useCallback(
    ({ broadcast = true } = {}) => {
      operationId.current += 1
      clearStoredSession({ broadcast })
      queryClient.clear()
      setSession({ status: 'anonymous', user: null, error: null })
    },
    [queryClient],
  )

  const restoreSession = useCallback(async () => {
    if (!getRefreshToken()) {
      setSession({ status: 'anonymous', user: null, error: null })
      return
    }

    const currentOperation = ++operationId.current
    setSession((current) => ({ ...current, status: 'restoring', error: null }))

    try {
      const accessToken = await refreshAccessToken()
      const user = await loadUser(accessToken)

      if (currentOperation === operationId.current) {
        setSession({ status: 'authenticated', user, error: null })
      }
    } catch (error) {
      if (currentOperation !== operationId.current) {
        return
      }

      const normalizedError = normalizeApiError(error)

      if (isTerminalSessionError(normalizedError)) {
        endSession()
        return
      }

      setSession({ status: 'unavailable', user: null, error: normalizedError })
    }
  }, [endSession, loadUser])

  const login = useCallback(
    async (credentials, signal) => {
      const currentOperation = ++operationId.current
      const tokenPair = await loginUser(credentials, signal)
      storeTokenPair(tokenPair)
      const user = await loadUser(tokenPair.accessToken, signal)

      if (currentOperation === operationId.current) {
        queryClient.clear()
        setSession({ status: 'authenticated', user, error: null })
      }

      return user
    },
    [loadUser, queryClient],
  )

  const register = useCallback(async (credentials, signal) => {
    return registerUser(credentials, signal)
  }, [])

  const logout = useCallback(() => endSession(), [endSession])

  useEffect(() => {
    const removeRefreshRequest = configureRefreshRequest(refreshTokens)
    const removeUnauthorizedHandler = configureUnauthorizedHandler(async () => {
      try {
        return await refreshAccessToken()
      } catch (error) {
        const normalizedError = normalizeApiError(error)
        if (isTerminalSessionError(normalizedError)) {
          endSession()
        }
        throw normalizedError
      }
    })
    const unsubscribe = subscribeToSessionEvents(async (event) => {
      if (event?.type === 'logout') {
        endSession({ broadcast: false })
        return
      }

      if (event?.type === 'tokens' && event.tokenPair) {
        const currentOperation = ++operationId.current
        applyTokenPair(event.tokenPair)

        try {
          const user = await loadUser(event.tokenPair.accessToken)
          if (currentOperation === operationId.current) {
            setSession({ status: 'authenticated', user, error: null })
          }
        } catch {
          // The active tab will handle its own request error and session state.
        }
      }
    })

    if (!restorationStarted.current) {
      restorationStarted.current = true
      void restoreSession()
    }

    return () => {
      removeRefreshRequest()
      removeUnauthorizedHandler()
      unsubscribe()
    }
  }, [endSession, loadUser, restoreSession])

  const value = useMemo(
    () => ({
      ...session,
      isAuthenticated: session.status === 'authenticated',
      login,
      logout,
      register,
      retryRestoration: restoreSession,
    }),
    [login, logout, register, restoreSession, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
