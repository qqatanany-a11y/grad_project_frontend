const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^\d{10}$/
const namePattern = /^[A-Za-z\u0621-\u063A\u0641-\u064A]+(?:\s+[A-Za-z\u0621-\u063A\u0641-\u064A]+)*$/u

export function sanitizeNameInput(value = '') {
  return value
    .replace(/[^A-Za-z\u0621-\u063A\u0641-\u064A\s]/gu, '')
    .replace(/\s{2,}/g, ' ')
}

export function sanitizePhoneInput(value = '') {
  return value.replace(/\D/g, '').slice(0, 10)
}

export function validateName(value, label = 'Name', options = {}) {
  const { required = true } = options
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return required ? `${label} is required.` : ''
  }

  return namePattern.test(trimmedValue)
    ? ''
    : `${label} can only contain Arabic or English letters.`
}

export function validateEmail(value, options = {}) {
  const { required = true } = options
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return required ? 'Email is required.' : ''
  }

  return emailPattern.test(trimmedValue) ? '' : 'Enter a valid email address.'
}

export function validatePhone(value, label = 'Phone number', options = {}) {
  const { required = true } = options
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return required ? `${label} is required.` : ''
  }

  return phonePattern.test(trimmedValue)
    ? ''
    : `${label} must be 10 digits only.`
}
