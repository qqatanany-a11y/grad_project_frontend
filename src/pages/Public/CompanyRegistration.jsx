import { useState } from 'react'
import { apiRequest } from '../../lib/apiClient'
import {
  sanitizeNameInput,
  sanitizePhoneInput,
  validateEmail,
  validateName,
  validatePhone,
} from '../../lib/validation'
import LanguageToggle from '../../i18n/LanguageToggle'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  .ahr-root {
    min-height: 100vh;
    background: #f8f7ff;
    font-family: 'Inter', sans-serif;
    color: #1e1b4b;
    display: flex;
    flex-direction: column;
  }

  .ahr-topbar {
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    padding: 0 2rem;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 2px 12px rgba(79,70,229,0.06);
  }

  .ahr-brand,
  .ahr-back-btn {
    border: none;
    background: none;
    font: inherit;
    cursor: pointer;
  }

  .ahr-brand {
    font-size: 1.35rem;
    font-weight: 900;
    letter-spacing: -0.03em;
    background: linear-gradient(135deg, #4f46e5, #f43f5e);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .ahr-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    color: #64748b;
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.4rem 0.875rem;
    border-radius: 8px;
    transition: color 0.15s, background 0.15s;
  }

  .ahr-back-btn:hover { color: #4f46e5; background: rgba(79,70,229,0.07); }

  .ahr-body {
    flex: 1;
    display: flex;
    justify-content: center;
    padding: 2.5rem 1rem;
  }

  .ahr-card {
    width: 100%;
    max-width: 720px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 24px;
    padding: 2.5rem;
    box-shadow: 0 8px 40px rgba(79,70,229,0.08);
  }

  .ahr-card-title {
    margin: 0 0 0.5rem;
    font-size: 2rem;
    font-weight: 900;
    letter-spacing: -0.03em;
    color: #1e1b4b;
  }

  .ahr-card-sub {
    margin: 0 0 2rem;
    font-size: 0.95rem;
    color: #64748b;
    line-height: 1.7;
  }

  .ahr-section-label {
    margin: 0 0 1rem;
    font-size: 0.68rem;
    font-weight: 700;
    color: #4f46e5;
    text-transform: uppercase;
    letter-spacing: 0.14em;
  }

  .ahr-grid-2 {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .ahr-field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-bottom: 1rem;
  }

  .ahr-label {
    font-size: 0.68rem;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }

  .ahr-input,
  .ahr-textarea {
    width: 100%;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    background: #fff;
    color: #1e1b4b;
    font: inherit;
    font-size: 0.9rem;
    font-weight: 500;
    box-sizing: border-box;
    transition: border-color 0.18s, box-shadow 0.18s;
    outline: none;
  }

  .ahr-input {
    height: 3rem;
    padding: 0 0.875rem;
  }

  .ahr-textarea {
    min-height: 5rem;
    padding: 0.8rem 0.875rem;
    resize: vertical;
  }

  .ahr-input:focus,
  .ahr-textarea:focus {
    border-color: #4f46e5;
    box-shadow: 0 0 0 4px rgba(79,70,229,0.1);
  }

  .ahr-input[aria-invalid="true"],
  .ahr-textarea[aria-invalid="true"] {
    border-color: #f43f5e;
    box-shadow: 0 0 0 4px rgba(244,63,94,0.1);
  }

  .ahr-error {
    margin: 0;
    font-size: 0.75rem;
    color: #f43f5e;
    font-weight: 500;
  }

  .ahr-divider {
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 1rem 0 1.5rem;
  }

  .ahr-submit {
    width: 100%;
    height: 3.25rem;
    margin-top: 0.5rem;
    border: none;
    border-radius: 14px;
    background: linear-gradient(135deg, #4f46e5, #3730a3);
    color: #fff;
    font: inherit;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 6px 20px rgba(79,70,229,0.38);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .ahr-submit:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(79,70,229,0.48); }

  .ahr-submit:disabled {
    cursor: wait;
    opacity: 0.5;
    transform: none;
  }

  .ahr-success {
    border: 1px solid rgba(22,163,74,0.25);
    border-radius: 16px;
    background: rgba(22,163,74,0.07);
    padding: 2rem;
  }

  .ahr-success-title {
    margin: 0 0 0.5rem;
    color: #16A34A;
    font-size: 1.2rem;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  .ahr-success-sub {
    margin: 0 0 1.25rem;
    color: #15803d;
    line-height: 1.7;
    font-size: 0.9rem;
  }

  .ahr-new-btn {
    height: 2.75rem;
    padding: 0 1.5rem;
    border: 2px solid rgba(22,163,74,0.3);
    border-radius: 10px;
    background: transparent;
    color: #16A34A;
    font: inherit;
    font-size: 0.875rem;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.15s;
  }

  .ahr-new-btn:hover { background: rgba(22,163,74,0.1); }

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
    if (name === 'companyName') return value.trim() ? '' : 'Business name is required.'
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
          <LanguageToggle />
        </header>

        <div className="ahr-body">
          <div className="ahr-card">
            {submitted ? (
              <div className="ahr-success">
                <p className="ahr-success-title">Business registration submitted</p>
                <p className="ahr-success-sub">
                  Your business registration request was sent successfully. The admin can now review it from the dashboard.
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
                <h1 className="ahr-card-title">Register Your Business</h1>
                <p className="ahr-card-sub">
                  Fill in your business details and the registration request will be sent to the admin dashboard for review.
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
                    <label className="ahr-label">Business Name</label>
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
                  {submitting ? 'Submitting...' : 'Submit Business Registration'}
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
