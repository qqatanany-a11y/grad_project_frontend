import { useState } from 'react'
import { apiRequest } from '../../lib/apiClient'
import { makeDashStyles } from './dashboardPageStyles'

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

const styles =
  makeDashStyles('cp') +
  `
    .cp-shell {
      display: grid;
      grid-template-columns: minmax(0, 720px);
      gap: 1.25rem;
    }
    .cp-note {
      padding: 1rem 1.1rem;
      border-radius: 14px;
      border: 1.5px solid rgba(245, 158, 11, 0.24);
      background: rgba(245, 158, 11, 0.08);
      color: #92400e;
      font-size: 0.9rem;
      line-height: 1.6;
    }
    .cp-copy {
      margin: 0 0 1.25rem;
      color: #64748b;
      line-height: 1.7;
      font-size: 0.92rem;
    }
    .cp-help {
      margin-top: 1rem;
      padding: 0.95rem 1rem;
      border-radius: 12px;
      border: 1.5px dashed rgba(79, 70, 229, 0.2);
      background: rgba(79, 70, 229, 0.04);
      color: #64748b;
      font-size: 0.85rem;
      line-height: 1.6;
    }
  `

const initialValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

function validateField(name, value, values) {
  if (name === 'currentPassword') {
    return value ? '' : 'Current password is required.'
  }

  if (name === 'newPassword') {
    if (!value) {
      return 'New password is required.'
    }

    if (!passwordPattern.test(value)) {
      return 'Password must be at least 8 characters with uppercase, lowercase, and a number.'
    }

    if (values.currentPassword && value === values.currentPassword) {
      return 'New password must be different from the current password.'
    }

    return ''
  }

  if (name === 'confirmPassword') {
    if (!value) {
      return 'Please confirm your new password.'
    }

    if (value !== values.newPassword) {
      return 'Passwords do not match.'
    }
  }

  return ''
}

function ChangePassword({ session, onPasswordChanged }) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [feedback, setFeedback] = useState({ tone: 'idle', message: '' })
  const [submitting, setSubmitting] = useState(false)

  const setField = (name, value) => {
    const nextValues = { ...values, [name]: value }

    setValues(nextValues)
    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: validateField(name, value, nextValues),
      ...(name === 'newPassword'
        ? {
            confirmPassword: nextValues.confirmPassword
              ? validateField('confirmPassword', nextValues.confirmPassword, nextValues)
              : currentErrors.confirmPassword,
          }
        : {}),
    }))
  }

  const handleBlur = ({ target: { name, value } }) => {
    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: validateField(name, value, values),
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const nextErrors = Object.keys(values).reduce((result, key) => {
      const error = validateField(key, values[key], values)

      if (error) {
        result[key] = error
      }

      return result
    }, {})

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setSubmitting(true)
    setFeedback({ tone: 'idle', message: '' })

    try {
      await apiRequest('/api/auth/change-password', {
        method: 'PUT',
        token: session?.token,
        body: {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
      })

      setValues(initialValues)
      setErrors({})
      setFeedback({
        tone: 'success',
        message: 'Password changed successfully. You can continue using the dashboard now.',
      })
      onPasswordChanged?.()
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Request failed.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <style>{styles}</style>

      <div className="cp-shell">
        {session?.isFirstLogin ? (
          <div className="cp-note">
            For security, change your password before continuing.
          </div>
        ) : null}

        {feedback.message ? (
          <div className={`cp-status${feedback.tone === 'error' ? ' error' : ''}`}>
            {feedback.message}
          </div>
        ) : null}

        <form className="cp-panel" onSubmit={handleSubmit}>
          <p className="cp-panel-title">Change Password</p>
          <p className="cp-copy">
            Update your account password here. Your current session stays active after the change.
          </p>

          <div className="cp-grid">
            <div className="cp-field">
              <label className="cp-label" htmlFor="currentPassword">
                Current Password
              </label>
              <input
                id="currentPassword"
                className="cp-input"
                type="password"
                name="currentPassword"
                value={values.currentPassword}
                onChange={({ target }) => setField(target.name, target.value)}
                onBlur={handleBlur}
                autoComplete="current-password"
              />
              {errors.currentPassword ? (
                <span className="cp-copy" style={{ color: '#be123c', margin: 0 }}>
                  {errors.currentPassword}
                </span>
              ) : null}
            </div>

            <div className="cp-field">
              <label className="cp-label" htmlFor="newPassword">
                New Password
              </label>
              <input
                id="newPassword"
                className="cp-input"
                type="password"
                name="newPassword"
                value={values.newPassword}
                onChange={({ target }) => setField(target.name, target.value)}
                onBlur={handleBlur}
                autoComplete="new-password"
              />
              {errors.newPassword ? (
                <span className="cp-copy" style={{ color: '#be123c', margin: 0 }}>
                  {errors.newPassword}
                </span>
              ) : null}
            </div>

            <div className="cp-field">
              <label className="cp-label" htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                className="cp-input"
                type="password"
                name="confirmPassword"
                value={values.confirmPassword}
                onChange={({ target }) => setField(target.name, target.value)}
                onBlur={handleBlur}
                autoComplete="new-password"
              />
              {errors.confirmPassword ? (
                <span className="cp-copy" style={{ color: '#be123c', margin: 0 }}>
                  {errors.confirmPassword}
                </span>
              ) : null}
            </div>
          </div>

          <div className="cp-help">
            Use a strong password with at least 8 characters, uppercase, lowercase, and a number.
          </div>

          <div className="cp-actions">
            <button className="cp-button" type="submit" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default ChangePassword
