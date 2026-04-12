import { useState } from 'react'
import { apiRequest } from '../../lib/apiClient'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^\d{10}$/
const namePattern = /^[A-Za-z\u0600-\u06FF'-]+$/
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

const INITIAL_FORM = {
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  password: '',
}

function validateForm(values) {
  if (!namePattern.test(values.firstName.trim())) {
    return 'First name must contain letters only.'
  }

  if (values.middleName.trim() && !namePattern.test(values.middleName.trim())) {
    return 'Middle name must contain letters only.'
  }

  if (!namePattern.test(values.lastName.trim())) {
    return 'Last name must contain letters only.'
  }

  if (!emailPattern.test(values.email.trim())) {
    return 'Enter a valid email address.'
  }

  if (!phonePattern.test(values.phoneNumber.trim())) {
    return 'Phone number must be exactly 10 digits.'
  }

  if (!passwordPattern.test(values.password)) {
    return 'Password must be at least 8 characters and include uppercase, lowercase, and a number.'
  }

  return ''
}

function AdminRegisterAdminPage({ session }) {
  const [formValues, setFormValues] = useState(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState({ tone: 'idle', message: '' })
  const [createdAdmin, setCreatedAdmin] = useState(null)

  const handleChange = ({ target: { name, value } }) => {
    const nextValue =
      name === 'phoneNumber' ? value.replace(/\D/g, '').slice(0, 10) : value

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: nextValue,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const validationMessage = validateForm(formValues)

    if (validationMessage) {
      setFeedback({ tone: 'error', message: validationMessage })
      return
    }

    setSubmitting(true)
    setFeedback({ tone: 'idle', message: '' })

    try {
      const result = await apiRequest('/api/admin/register-admin', {
        method: 'POST',
        token: session?.token,
        body: formValues,
      })

      setCreatedAdmin(result)
      setFormValues(INITIAL_FORM)
      setFeedback({
        tone: 'success',
        message:
          'New admin account created successfully. The returned token was not saved locally.',
      })
    } catch (requestError) {
      setFeedback({
        tone: 'error',
        message:
          requestError instanceof Error
            ? requestError.message
            : 'Unable to create the admin account.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Create a new admin</h2>
          <p>
            This page wraps <code>POST /api/admin/register-admin</code> and
            keeps your current admin session intact.
          </p>
        </div>
      </div>

      {feedback.message ? (
        <div
          className={`admin-status${
            feedback.tone !== 'idle' ? ` is-${feedback.tone}` : ''
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <div className="admin-layout-grid">
        <article className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Admin registration form</h2>
              <p className="admin-card-copy">
                The backend accepts the same base DTO shape used for normal
                registration, but this endpoint creates an admin role instead.
              </p>
            </div>
          </div>

          <form className="admin-stack" onSubmit={handleSubmit}>
            <div className="admin-form-grid">
              <div className="admin-field">
                <label htmlFor="admin-first-name">First name</label>
                <input
                  id="admin-first-name"
                  name="firstName"
                  value={formValues.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-field">
                <label htmlFor="admin-middle-name">Middle name</label>
                <input
                  id="admin-middle-name"
                  name="middleName"
                  value={formValues.middleName}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-field">
                <label htmlFor="admin-last-name">Last name</label>
                <input
                  id="admin-last-name"
                  name="lastName"
                  value={formValues.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-field">
                <label htmlFor="admin-phone-number">Phone number</label>
                <input
                  id="admin-phone-number"
                  name="phoneNumber"
                  inputMode="numeric"
                  value={formValues.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-field" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="admin-email">Email</label>
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  value={formValues.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-field" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="admin-password">Password</label>
                <input
                  id="admin-password"
                  name="password"
                  type="password"
                  value={formValues.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="admin-actions-wrap">
              <button type="submit" className="admin-button" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create admin'}
              </button>
            </div>
          </form>
        </article>

        <article className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Request outcome</h2>
              <p className="admin-card-copy">
                Any token returned by this endpoint is displayed only as metadata
                and is never written to local storage.
              </p>
            </div>
          </div>

          {createdAdmin ? (
            <div className="admin-summary-list">
              <div className="admin-summary-item">
                <div>
                  <strong>{createdAdmin.fullName}</strong>
                  <span>{createdAdmin.email}</span>
                </div>
                <span className="admin-badge success">
                  {createdAdmin.role ?? 'Admin'}
                </span>
              </div>

              <div className="admin-summary-item">
                <div>
                  <strong>Returned token</strong>
                  <span>
                    {createdAdmin.token
                      ? `${createdAdmin.token.slice(0, 28)}...`
                      : 'No token returned'}
                  </span>
                </div>
                <span className="admin-badge">Preview only</span>
              </div>
            </div>
          ) : (
            <div className="admin-empty-state">
              Submit the form to see the newly created admin response here.
            </div>
          )}

          <div className="admin-note-box">
            Use strong passwords and a unique email for each admin account. The
            current backend endpoint is protected, so this page assumes the
            signed-in user already has an admin token.
          </div>
        </article>
      </div>
    </section>
  )
}

export default AdminRegisterAdminPage
