const AUTH_TOKEN_KEY = 'authToken'
const AUTH_USER_KEY = 'authUser'

const canUseStorage = () => typeof window !== 'undefined' && window.localStorage

export function readAuthSession() {
  if (!canUseStorage()) {
    return null
  }

  const rawUser = window.localStorage.getItem(AUTH_USER_KEY)
  const token = window.localStorage.getItem(AUTH_TOKEN_KEY)

  if (!rawUser && !token) {
    return null
  }

  try {
    const parsedUser = rawUser ? JSON.parse(rawUser) : {}

    return parsedUser?.token ? parsedUser : { ...parsedUser, token }
  } catch {
    clearAuthSession()
    return null
  }
}

export function persistAuthSession(authUser) {
  if (!canUseStorage() || !authUser) {
    return
  }

  if (authUser.token) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, authUser.token)
  }

  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser))
}

export function clearAuthSession() {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY)
  window.localStorage.removeItem(AUTH_USER_KEY)
}

export function isAdminSession(session) {
  return session?.role === 'Admin'
}
