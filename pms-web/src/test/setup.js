import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { cleanup, configure } from '@testing-library/react'
import { clearStoredSession } from '../features/auth/model/sessionStore.js'
import { server } from './server.js'

configure({ asyncUtilTimeout: 5000 })

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
  cleanup()
  server.resetHandlers()
  clearStoredSession({ broadcast: false })
  localStorage.clear()
  vi.unstubAllEnvs()
})

afterAll(() => server.close())
