export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:9000'

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

export async function apiRequest(
  path,
  { method = 'GET', token, body, headers = {} } = {},
) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  const payload = await parseResponseBody(response)

  if (!response.ok) {
    throw new Error(getResponseMessage(payload, 'Request failed.'))
  }

  return payload
}
