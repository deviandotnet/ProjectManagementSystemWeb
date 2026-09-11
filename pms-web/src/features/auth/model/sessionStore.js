const REFRESH_TOKEN_KEY = 'pms.auth.refresh-token'
const SESSION_GENERATION_KEY = 'pms.auth.generation'
const SESSION_CHANNEL_NAME = 'pms.auth.session'

let accessToken = null
let channel = null

function getChannel() {
  if (typeof BroadcastChannel === 'undefined') {
    return null
  }

  channel ??= new BroadcastChannel(SESSION_CHANNEL_NAME)
  return channel
}

export function getAccessToken() {
  return accessToken
}

export function getRefreshToken() {
  return typeof localStorage === 'undefined'
    ? null
    : localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function applyTokenPair(tokenPair) {
  accessToken = tokenPair.accessToken

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokenPair.refreshToken)
  }
}

export function storeTokenPair(tokenPair, { broadcast = true } = {}) {
  applyTokenPair(tokenPair)

  if (broadcast) {
    getChannel()?.postMessage({ type: 'tokens', tokenPair })
  }
}

export function clearStoredSession({ broadcast = true } = {}) {
  accessToken = null

  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    const nextGeneration =
      Number(localStorage.getItem(SESSION_GENERATION_KEY) ?? 0) + 1
    localStorage.setItem(SESSION_GENERATION_KEY, String(nextGeneration))
  }

  if (broadcast) {
    getChannel()?.postMessage({ type: 'logout' })
  }
}

export function subscribeToSessionEvents(listener) {
  const authChannel = getChannel()

  if (!authChannel) {
    return () => {}
  }

  const handleMessage = (event) => listener(event.data)
  authChannel.addEventListener('message', handleMessage)

  return () => authChannel.removeEventListener('message', handleMessage)
}

export const sessionStorageKeys = Object.freeze({
  refreshToken: REFRESH_TOKEN_KEY,
  generation: SESSION_GENERATION_KEY,
})
