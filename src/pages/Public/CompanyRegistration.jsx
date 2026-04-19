import { useState } from 'react'
import { apiRequest } from '../../lib/apiClient'
import {
  sanitizeNameInput,
  sanitizePhoneInput,
  validateEmail,
  validateName,
  validatePhone,
} from '../../lib/validation'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap');

  .ahr-root {
    min-height: 100vh;
    background: #fafaf9;
    font-family: 'Inter', 'Segoe UI', sans-serif;
    color: #1c1917;
    display: flex;
    flex-direction: column;
  }

  .ahr-topbar {
    background: #fff;
    border-bottom: 1px solid #e7e5e4;
    padding: 0 2rem;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .ahr-brand,
  .ahr-back-btn {
    border: none;
    background: none;
    font: inherit;
    cursor: pointer;
  }

  .ahr-brand {
    font-size: 0.92rem;
    font-weight: 600;
    color: #1c1917;
  }

  .ahr-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    color: #78716c;
  }

  .ahr-body {
    flex: 1;
    display: flex;
    justify-content: center;
    padding: 2.5rem 1rem;
  }

  .ahr-card {
    width: 100%;
    max-width: 720px;
    background: #fff;
    border: 1px solid #e7e5e4;
    padding: 2rem;
  }

  .ahr-card-title {
    margin: 0 0 0.5rem;
    font-size: 1.45rem;
    font-weight: 500;
    letter-spacing: -0.02em;
  }

  .ahr-card-sub {
    margin: 0 0 1.75rem;
    font-size: 0.9rem;
    color: #78716c;
    line-height: 1.7;
  }

  .ahr-section-label {
    margin: 0 0 1rem;
    font-size: 0.7rem;
    font-weight: 600;
    color: #a8a29e;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }

  .ahr-grid-2 {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .ahr-field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    margin-bottom: 1rem;
  }

  .ahr-label {
    font-size: 0.7rem;
    font-weight: 600;
    color: #78716c;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .ahr-input,
  .ahr-textarea {
    width: 100%;
    border: 1px solid #e7e5e4;
    background: #fff;
    color: #1c1917;
    font: inherit;
    box-sizing: border-box;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  .ahr-input {
    height: 3rem;
    padding: 0 0.85rem;
  }

  .ahr-textarea {
    min-height: 5rem;
    padding: 0.8rem 0.85rem;
    resize: vertical;
  }

  .ahr-input:focus,
  .ahr-textarea:focus {
    outline: none;
    border-color: #1c1917;
    box-shadow: 0 0 0 2px rgba(28, 25, 23, 0.08);
  }

  .ahr-input[aria-invalid="true"],
  .ahr-textarea[aria-invalid="true"] {
    border-color: #dc2626;
  }

  .ahr-error {
    margin: 0;
    font-size: 0.75rem;
    color: #dc2626;
  }

  .ahr-divider {
    border: none;
    border-top: 1px solid #e7e5e4;
    margin: 1rem 0 1.5rem;
  }

  .ahr-submit {
    width: 100%;
    height: 3.15rem;
    margin-top: 0.5rem;
    border: none;
    background: #1c1917;
    color: #fff;
    font: inherit;
    font-weight: 500;
    cursor: pointer;
  }

  .ahr-submit:hover {
    background: #292524;
  }

  .ahr-submit:disabled {
    cursor: wait;
    opacity: 0.75;
  }

  .ahr-success {
    border: 1px solid #bbf7d0;
    background: #f0fdf4;
    padding: 1.5rem;
  }

  .ahr-success-title {
    margin: 0 0 0.5rem;
    color: #166534;
    font-size: 1rem;
    font-weight: 600;
  }

  .ahr-success-sub {
    margin: 0 0 1rem;
    color: #166534;
    line-height: 1.7;
  }

  .ahr-new-btn {
    height: 2.6rem;
    padding: 0 1.25rem;
    border: 1px solid #bbf7d0;
    background: #fff;
    color: #166534;
    font: inherit;
    cursor: pointer;
  }

  @media (max-width: 760px) {
    .ahr-grid-2 {
      grid-template-columns: 1fr;
    }
  }
`

const initialValues = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  companyName: '',
  businessPhone: '',
  businessAddress: '',
  venueName: '',
}

function buildOwnerRequestPayload(values) {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    phoneNumber: values.phoneNumber.trim(),
    companyName: values.companyName.trim(),
    businessPhone: values.businessPhone.trim(),
    businessAddress: values.businessAddress.trim(),
    venueName: values.venueName.trim(),
  }
}

function CompanyRegistration({ onNavigate }) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const getFieldError = (name, value) => {
    if (name === 'firstName') return validateName(value, 'First name')
    if (name === 'lastName') return validateName(value, 'Last name')
    if (name === 'email') return validateEmail(value)
    if (name === 'phoneNumber') return validatePhone(value, 'Phone number')
    if (name === 'businessPhone') return validatePhone(value, 'Business phone')
    if (name === 'companyName') return value.trim() ? '' : 'Company name is required.'
    if (name === 'businessAddress') return value.trim() ? '' : 'Business address is required.'
    return ''
  }

  const validate = (nextValues) => {
    const nextErrors = {}

    ;['firstName', 'lastName', 'email', 'phoneNumber', 'companyName', 'businessPhone', 'businessAddress'].forEach((fieldName) => {
      const fieldError = getFieldError(fieldName, nextValues[fieldName])
      if (fieldError) {
        nextErrors[fieldName] = fieldError
      }
    })

    return nextErrors
  }

  const handleChange = ({ target: { name, value } }) => {
    const nextValue =
      name === 'firstName' || name === 'lastName'
        ? sanitizeNameInput(value)
        : name === 'phoneNumber' || name === 'businessPhone'
          ? sanitizePhoneInput(value)
          : value

    setValues((currentValues) => ({ ...currentValues, [name]: nextValue }))

    if (errors[name]) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        [name]: getFieldError(name, nextValue),
      }))
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const nextErrors = validate(values)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setSubmitting(true)
    setSubmitError('')

    try {
      await apiRequest('/api/owner/request', {
        method: 'POST',
        body: buildOwnerRequestPayload(values),
      })

      setSubmitted(true)
      setValues(initialValues)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Request failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="ahr-root">
        <header className="ahr-topbar">
          <button className="ahr-brand" onClick={() => onNavigate('home')}>
            EventPlan
          </button>
          <button className="ahr-back-btn" onClick={() => onNavigate('home')}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M9 2L4 7l5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Home
          </button>
        </header>

        <div className="ahr-body">
          <div className="ahr-card">
            {submitted ? (
              <div className="ahr-success">
                <p className="ahr-success-title">Company registration submitted</p>
                <p className="ahr-success-sub">
                  Your company registration request was sent successfully. The admin can now review it from the dashboard.
                </p>
                <button
                  className="ahr-new-btn"
                  onClick={() => {
                    setSubmitted(false)
                    setSubmitError('')
                  }}
                >
                  Submit Another Registration
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <h1 className="ahr-card-title">Register Your Company</h1>
                <p className="ahr-card-sub">
                  Fill in your company details and the registration request will be sent to the admin dashboard for review.
                </p>

                <p className="ahr-section-label">Representative Information</p>
                <div className="ahr-grid-2">
                  <div className="ahr-field">
                    <label className="ahr-label">First Name</label>
                    <input
                      className="ahr-input"
                      name="firstName"
                      value={values.firstName}
                      onChange={handleChange}
                      aria-invalid={errors.firstName ? 'true' : 'false'}
                    />
                    {errors.firstName ? <p className="ahr-error">{errors.firstName}</p> : null}
                  </div>

                  <div className="ahr-field">
                    <label className="ahr-label">Last Name</label>
                    <input
                      className="ahr-input"
                      name="lastName"
                      value={values.lastName}
                      onChange={handleChange}
                      aria-invalid={errors.lastName ? 'true' : 'false'}
                    />
                    {errors.lastName ? <p className="ahr-error">{errors.lastName}</p> : null}
                  </div>

                  <div className="ahr-field">
                    <label className="ahr-label">Email</label>
                    <input
                      className="ahr-input"
                      name="email"
                      type="email"
                      value={values.email}
                      onChange={handleChange}
                      aria-invalid={errors.email ? 'true' : 'false'}
                    />
                    {errors.email ? <p className="ahr-error">{errors.email}</p> : null}
                  </div>

                  <div className="ahr-field">
                    <label className="ahr-label">Phone Number</label>
                    <input
                      className="ahr-input"
                      name="phoneNumber"
                      inputMode="numeric"
                      maxLength={10}
                      value={values.phoneNumber}
                      onChange={handleChange}
                      aria-invalid={errors.phoneNumber ? 'true' : 'false'}
                    />
                    {errors.phoneNumber ? <p className="ahr-error">{errors.phoneNumber}</p> : null}
                  </div>
                </div>

                <hr className="ahr-divider" />

                <p className="ahr-section-label">Business Information</p>
                <div className="ahr-grid-2">
                  <div className="ahr-field">
                    <label className="ahr-label">Company Name</label>
                    <input
                      className="ahr-input"
                      name="companyName"
                      value={values.companyName}
                      onChange={handleChange}
                      aria-invalid={errors.companyName ? 'true' : 'false'}
                    />
                    {errors.companyName ? <p className="ahr-error">{errors.companyName}</p> : null}
                  </div>

                  <div className="ahr-field">
                    <label className="ahr-label">Business Phone</label>
                    <input
                      className="ahr-input"
                      name="businessPhone"
                      inputMode="numeric"
                      maxLength={10}
                      value={values.businessPhone}
                      onChange={handleChange}
                      aria-invalid={errors.businessPhone ? 'true' : 'false'}
                    />
                    {errors.businessPhone ? <p className="ahr-error">{errors.businessPhone}</p> : null}
                  </div>
                </div>

                <div className="ahr-field">
                  <label className="ahr-label">Business Address</label>
                  <textarea
                    className="ahr-textarea"
                    name="businessAddress"
                    value={values.businessAddress}
                    onChange={handleChange}
                    aria-invalid={errors.businessAddress ? 'true' : 'false'}
                  />
                  {errors.businessAddress ? <p className="ahr-error">{errors.businessAddress}</p> : null}
                </div>

                <div className="ahr-field">
                  <label className="ahr-label">Initial Venue Name</label>
                  <input
                    className="ahr-input"
                    name="venueName"
                    value={values.venueName}
                    onChange={handleChange}
                  />
                </div>

                {submitError ? <p className="ahr-error">{submitError}</p> : null}

                <button className="ahr-submit" type="submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Company Registration'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default CompanyRegistration
