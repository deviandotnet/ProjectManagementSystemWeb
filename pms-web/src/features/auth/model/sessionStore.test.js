import { describe, expect, it } from 'vitest'
import {
  applyTokenPair,
  clearStoredSession,
  getAccessToken,
  getRefreshToken,
  sessionStorageKeys,
} from './sessionStore.js'

describe('sessionStore', () => {
  it('keeps access in memory and refresh in local storage', () => {
    applyTokenPair({ accessToken: 'access', refreshToken: 'refresh' })

    expect(getAccessToken()).toBe('access')
    expect(getRefreshToken()).toBe('refresh')
    expect(localStorage.getItem(sessionStorageKeys.refreshToken)).toBe(
      'refresh',
    )
  })

  it('clears credentials and advances the session generation', () => {
    applyTokenPair({ accessToken: 'access', refreshToken: 'refresh' })
    clearStoredSession({ broadcast: false })

    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
    expect(localStorage.getItem(sessionStorageKeys.generation)).toBe('1')
  })
})
