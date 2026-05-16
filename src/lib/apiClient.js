const DEFAULT_API_URL = 'http://localhost:5000'

// Deployment-aware API base URL for Vite and Vercel environments.
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ??
  import.meta.env.VITE_API_BASE_URL ??
  DEFAULT_API_URL
).replace(/\/+$/, '')

export async function parseResponseBody(response) {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export function getResponseMessage(payload, fallbackMessage) {
  if (typeof payload === 'string') {
    return payload
  }

  if (Array.isArray(payload?.errors)) {
    return payload.errors.join(' ')
  }

  if (payload?.errors && typeof payload.errors === 'object') {
    return Object.values(payload.errors).flat().join(' ')
  }

  return payload?.message ?? payload?.title ?? fallbackMessage
}

export function resolveApiAssetUrl(value) {
  if (typeof value !== 'string') {
    return ''
  }

  const trimmedValue = value.trim()
  if (!trimmedValue) {
    return ''
  }

  if (
    /^https?:\/\//i.test(trimmedValue) ||
    /^data:/i.test(trimmedValue) ||
    /^blob:/i.test(trimmedValue)
  ) {
    return trimmedValue
  }

  if (trimmedValue.startsWith('/')) {
    return `${API_BASE_URL}${trimmedValue}`
  }

  return `${API_BASE_URL}/${trimmedValue.replace(/^\/+/, '')}`
}

export async function apiRequest(
  path,
  { method = 'GET', token, body, headers = {} } = {},
) {
  const isFormData = body instanceof FormData
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      ...(body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body
      ? {
          body: isFormData ? body : JSON.stringify(body),
        }
      : {}),
  })

  const payload = await parseResponseBody(response)

  if (!response.ok) {
    throw new Error(getResponseMessage(payload, 'Request failed.'))
  }

  return payload
}

export async function getVenueAvailableSlots(venueId, date, options = {}) {
  if (!venueId || !date) {
    return []
  }

  const query = new URLSearchParams({ date }).toString()
  const payload = await apiRequest(
    `/api/venue-availabilities/${venueId}/available?${query}`,
    options,
  )

  return Array.isArray(payload) ? payload : []
}
