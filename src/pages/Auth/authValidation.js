const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

export function validatePassword(value) {
  return passwordPattern.test(value)
    ? ''
    : 'Password must be at least 8 characters with uppercase, lowercase, and a number.'
}
