import axios from 'axios'
import { getAccessToken } from '../features/auth/model/sessionStore.js'
import { getApiBaseUrl } from './apiConfig.js'

function createClient() {
  const client = axios.create({
    headers: { Accept: 'application/json' },
  })

  client.interceptors.request.use((config) => ({
    ...config,
    baseURL: getApiBaseUrl(),
  }))

  return client
}

export const publicApiClient = createClient()
export const apiClient = createClient()

let unauthorizedHandler = null

export function configureUnauthorizedHandler(handler) {
  unauthorizedHandler = handler

  return () => {
    if (unauthorizedHandler === handler) {
      unauthorizedHandler = null
    }
  }
}

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken()

  if (!accessToken) {
    return config
  }

  return {
    ...config,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  }
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status !== 401 ||
      originalRequest?._authRetried ||
      !unauthorizedHandler
    ) {
      throw error
    }

    originalRequest._authRetried = true
    const accessToken = await unauthorizedHandler()
    originalRequest.headers = {
      ...originalRequest.headers,
      Authorization: `Bearer ${accessToken}`,
    }

    return apiClient(originalRequest)
  },
)
