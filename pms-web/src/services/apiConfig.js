const API_SEGMENT = '/api'

export function normalizeApiBaseUrl(rawBaseUrl) {
  if (!rawBaseUrl?.trim()) {
    throw new Error('VITE_API_BASE_URL is required.')
  }

  let url

  try {
    url = new URL(rawBaseUrl.trim())
  } catch {
    throw new Error('VITE_API_BASE_URL must be an absolute HTTP(S) URL.')
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('VITE_API_BASE_URL must use HTTP or HTTPS.')
  }

  const pathWithoutTrailingSlashes = url.pathname.replace(/\/+$/, '')
  const pathWithoutRepeatedApi = pathWithoutTrailingSlashes.replace(
    /(?:\/api)+$/i,
    API_SEGMENT,
  )

  url.pathname = pathWithoutRepeatedApi.endsWith(API_SEGMENT)
    ? pathWithoutRepeatedApi
    : `${pathWithoutRepeatedApi}${API_SEGMENT}`
  url.search = ''
  url.hash = ''

  return url.toString().replace(/\/$/, '')
}

export function getApiBaseUrl() {
  return normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL)
}
