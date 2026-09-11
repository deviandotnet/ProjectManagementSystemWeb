import { ApiError } from '../../../services/apiError.js'
import { getRefreshToken, storeTokenPair } from './sessionStore.js'

const REFRESH_LOCK_NAME = 'pms.auth.refresh-lock'
const REFRESH_LEASE_KEY = 'pms.auth.refresh-lease'
const LEASE_DURATION_MS = 10_000
const LOCK_WAIT_MS = 75

let refreshRequest = null
let refreshPromise = null

export function configureRefreshRequest(request) {
  refreshRequest = request

  return () => {
    if (refreshRequest === request) {
      refreshRequest = null
    }
  }
}

function wait(duration) {
  return new Promise((resolve) => setTimeout(resolve, duration))
}

async function withStorageLease(callback) {
  if (typeof localStorage === 'undefined') {
    return callback()
  }

  const owner = crypto.randomUUID()
  const deadline = Date.now() + LEASE_DURATION_MS

  while (Date.now() < deadline) {
    const existing = JSON.parse(
      localStorage.getItem(REFRESH_LEASE_KEY) ?? 'null',
    )

    if (!existing || existing.expiresAt <= Date.now()) {
      const lease = { owner, expiresAt: Date.now() + LEASE_DURATION_MS }
      localStorage.setItem(REFRESH_LEASE_KEY, JSON.stringify(lease))
      const confirmed = JSON.parse(
        localStorage.getItem(REFRESH_LEASE_KEY) ?? 'null',
      )

      if (confirmed?.owner === owner) {
        try {
          return await callback()
        } finally {
          const latest = JSON.parse(
            localStorage.getItem(REFRESH_LEASE_KEY) ?? 'null',
          )
          if (latest?.owner === owner) {
            localStorage.removeItem(REFRESH_LEASE_KEY)
          }
        }
      }
    }

    await wait(LOCK_WAIT_MS)
  }

  throw new ApiError('Another browser tab is still renewing the session.', {
    kind: 'refresh-lock-timeout',
  })
}

async function performRefresh() {
  if (!refreshRequest) {
    throw new ApiError('Session renewal is not configured.', {
      kind: 'session-configuration',
    })
  }

  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    throw new ApiError('Your session has ended. Sign in again.', {
      kind: 'invalid-session',
    })
  }

  const tokenPair = await refreshRequest(refreshToken)
  storeTokenPair(tokenPair)
  return tokenPair.accessToken
}

async function withCrossTabLock(callback) {
  if (globalThis.navigator?.locks?.request) {
    return navigator.locks.request(
      REFRESH_LOCK_NAME,
      { mode: 'exclusive' },
      callback,
    )
  }

  return withStorageLease(callback)
}

export function refreshAccessToken() {
  refreshPromise ??= withCrossTabLock(performRefresh).finally(() => {
    refreshPromise = null
  })

  return refreshPromise
}
