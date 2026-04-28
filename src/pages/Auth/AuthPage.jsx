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

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

const validatePassword = (value) =>
  passwordPattern.test(value)
    ? ''
    : 'Password must be at least 8 characters with uppercase, lowercase, and a number.'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  @keyframes maSlideLeft {
    from { opacity: 0; transform: translateX(-28px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes maSlideRight {
    from { opacity: 0; transform: translateX(28px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes maFadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .ma-page {
    display: flex;
    min-height: 100vh;
    width: 100%;
    background: #ffffff;
    font-family: 'Inter', sans-serif;
    color: #1e1b4b;
  }

  .ma-image-panel {
    display: none;
    position: relative;
    width: 50%;
    flex-shrink: 0;
    animation: maSlideLeft 0.6s cubic-bezier(0.22,1,0.36,1) both;
  }

  @media (min-width: 1024px) {
    .ma-image-panel { display: block; }
  }

  .ma-image-panel img {
    position: absolute; inset: 0;
    width: 100%; height: 100%; object-fit: cover;
  }

  .ma-image-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to bottom, rgba(79,70,229,0.3) 0%, rgba(30,27,75,0.75) 100%);
    z-index: 1;
  }

  .ma-image-text {
    position: absolute; bottom: 0; left: 0; right: 0;
    z-index: 2; padding: 3rem; color: #fff;
  }

  .ma-image-text h1 {
    font-size: clamp(2rem, 3vw, 2.75rem);
    font-weight: 900; letter-spacing: -0.03em;
    margin: 0 0 0.75rem; line-height: 1.1; color: #fff;
  }

  .ma-image-text p {
    font-size: 1rem; font-weight: 400;
    color: rgba(255,255,255,0.8); margin: 0;
    max-width: 380px; line-height: 1.7;
  }

  .ma-form-panel {
    flex: 1; display: flex; flex-direction: column;
    justify-content: center; padding: 3rem 2rem;
    background: #ffffff;
    animation: maSlideRight 0.6s cubic-bezier(0.22,1,0.36,1) both;
  }

  @media (min-width: 1024px) {
    .ma-form-panel { padding: 3rem 5rem; }
  }

  .ma-form-inner {
    width: 100%; max-width: 448px; margin: 0 auto;
  }

  .ma-form-header { margin-bottom: 2.5rem; }

  .ma-form-header h2 {
    font-size: 2.25rem; font-weight: 900;
    letter-spacing: -0.03em;
    margin: 0 0 0.5rem;
    color: #1e1b4b;
  }

  .ma-form-header p {
    font-size: 0.9rem; color: #64748b; font-weight: 400; margin: 0;
  }

  .ma-form { display: flex; flex-direction: column; gap: 1.25rem; }

  .ma-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
  .ma-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }

  .ma-field { display: flex; flex-direction: column; gap: 0.4rem; }

  .ma-label {
    font-size: 0.7rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.12em; color: #64748b;
  }

  .ma-input {
    width: 100%; height: 3rem; padding: 0 0.875rem;
    border: 2px solid #e2e8f0; border-radius: 10px;
    background: #fff; font-size: 0.9rem; color: #1e1b4b;
    font-family: inherit; font-weight: 500; outline: none;
    transition: border-color 0.18s, box-shadow 0.18s;
    box-sizing: border-box;
  }

  .ma-input:focus {
    border-color: #4f46e5;
    box-shadow: 0 0 0 4px rgba(79,70,229,0.12);
  }

  .ma-input[aria-invalid='true'] {
    border-color: #f43f5e;
    box-shadow: 0 0 0 4px rgba(244,63,94,0.1);
  }

  .ma-error {
    font-size: 0.75rem; color: #f43f5e; margin: 0; font-weight: 500;
  }

  .ma-submit {
    width: 100%; height: 3.25rem;
    background: linear-gradient(135deg, #4f46e5, #3730a3);
    color: #fff; border: none; border-radius: 12px;
    font-size: 0.95rem; font-weight: 700; letter-spacing: 0.01em;
    font-family: inherit; cursor: pointer;
    box-shadow: 0 6px 20px rgba(79,70,229,0.38);
    transition: transform 0.2s, box-shadow 0.2s;
    margin-top: 0.25rem;
  }

  .ma-submit:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(79,70,229,0.48); }
  .ma-submit:active { transform: translateY(0); }

  .ma-submit:focus-visible {
    outline: 2px solid #4f46e5; outline-offset: 3px;
  }

  .ma-submit:disabled { opacity: 0.55; cursor: wait; transform: none; }

  .ma-back-btn {
    display: inline-flex; align-items: center; gap: 0.4rem;
    font-size: 0.82rem; font-weight: 500; color: #64748b;
    background: none; border: none; cursor: pointer;
    font-family: inherit; padding: 0; margin-bottom: 2rem;
    transition: color 0.15s;
  }
  .ma-back-btn:hover { color: #4f46e5; }

  .ma-toggle-wrap { margin-top: 2rem; text-align: center; }

  .ma-toggle-btn {
    background: none; border: none; font-family: inherit;
    font-size: 0.875rem; font-weight: 500; color: #4f46e5;
    cursor: pointer; text-decoration: underline;
    text-underline-offset: 3px; padding: 0;
    transition: color 0.15s;
  }
  .ma-toggle-btn:hover { color: #3730a3; }

  .ma-lang {
    position: fixed;
    top: 1rem;
    right: auto;
    inset-inline-end: 1rem;
    z-index: 5;
  }
`

function Field({ id, label, type = 'text', name, required, value, error, onChange, onBlur, autoComplete, inputMode, maxLength }) {
  return (
    <div className="ma-field">
      <label htmlFor={id} className="ma-label">{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        className="ma-input"
        required={required}
        value={value}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={onChange}
        onBlur={onBlur}
      />
      {error && <p id={`${id}-error`} className="ma-error">{error}</p>}
    </div>
  )
}

const signInInitial = { email: '', password: '' }
const signUpInitial = {
  firstName: '', lastName: '',
  phoneNumber: '', additionalPhoneNumber: '',
  email: '', password: '',
}

function AuthPage({ onSignIn, onBack }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [signInValues, setSignInValues] = useState(signInInitial)
  const [signInErrors, setSignInErrors] = useState({})
  const [signUpValues, setSignUpValues] = useState(signUpInitial)
  const [signUpErrors, setSignUpErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const values = isSignUp ? signUpValues : signInValues
  const errors = isSignUp ? signUpErrors : signInErrors
  const setValues = isSignUp ? setSignUpValues : setSignInValues
  const setErrors = isSignUp ? setSignUpErrors : setSignInErrors

  const getError = (name, val) => {
    if (isSignUp) {
      if (name === 'firstName') return validateName(val, 'First Name')
      if (name === 'lastName') return validateName(val, 'Last Name')
      if (name === 'phoneNumber') return validatePhone(val, 'Phone Number')
      if (name === 'additionalPhoneNumber') return val.trim() ? validatePhone(val, 'Additional Phone') : ''
      if (name === 'email') return validateEmail(val)
      if (name === 'password') return validatePassword(val)
    } else {
      if (name === 'email') return validateEmail(val)
      if (name === 'password') return !val.trim() ? 'Password is required.' : ''
    }
    return ''
  }

  const sanitize = (name, val) => {
    if (['firstName', 'lastName'].includes(name)) return sanitizeNameInput(val)
    if (['phoneNumber', 'additionalPhoneNumber'].includes(name)) return sanitizePhoneInput(val)
    return val
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    const next = sanitize(name, value)
    setValues((prev) => ({ ...prev, [name]: next }))
    setErrors((prev) => ({ ...prev, [name]: getError(name, next) }))
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    const next = sanitize(name, value)
    setErrors((prev) => ({ ...prev, [name]: getError(name, next) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = {}
    Object.entries(values).forEach(([name, val]) => {
      const err = getError(name, val)
      if (err) nextErrors[name] = err
    })
    const requiredSignIn = ['email', 'password']
    const requiredSignUp = ['firstName', 'lastName', 'phoneNumber', 'email', 'password']
    const required = isSignUp ? requiredSignUp : requiredSignIn
    required.forEach((name) => {
      if (!values[name]?.trim()) nextErrors[name] = `${name.replace(/([A-Z])/g, ' $1').trim()} is required.`
    })
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setSubmitting(true)
    setSubmitError('')

    try {
      const payload = isSignUp
        ? {
            firstName: signUpValues.firstName.trim(),
            lastName: signUpValues.lastName.trim(),
            email: signUpValues.email.trim(),
            phoneNumber: signUpValues.phoneNumber.trim(),
            secondaryPhoneNumber:
              signUpValues.additionalPhoneNumber.trim() || null,
            password: signUpValues.password,
          }
        : {
            email: signInValues.email.trim(),
            password: signInValues.password,
          }

      const authUser = await apiRequest(
        isSignUp ? '/api/auth/register' : '/api/auth/login',
        {
          method: 'POST',
          body: payload,
        },
      )

      onSignIn?.(authUser)
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Authentication failed.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const switchMode = () => {
    setIsSignUp((v) => !v)
    setSignInErrors({})
    setSignUpErrors({})
    setSubmitError('')
  }

  return (
    <>
      <style>{styles}</style>
      <div className="ma-page">
        <LanguageToggle className="ma-lang" />

        {/* Left: image panel */}
        <div className="ma-image-panel">
          <img src="/event-hero.png" alt="Elegant event setup" />
          <div className="ma-image-overlay" />
          <div className="ma-image-text">
            <h1>Plan Your Perfect Event!</h1>
            <p>The platform for creating unforgettable moments, effortlessly.</p>
          </div>
        </div>

        {/* Right: form panel */}
        <div className="ma-form-panel">
          <div className="ma-form-inner">
            {onBack && (
              <button className="ma-back-btn" onClick={onBack}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M9 2L4 7l5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back to Home
              </button>
            )}
            <div className="ma-form-header">
              <h2>{isSignUp ? 'Create an account' : 'Welcome back'}</h2>
              <p>{isSignUp ? "Let's get started with your event planning." : 'Enter your details to sign in.'}</p>
            </div>

            <form className="ma-form" onSubmit={handleSubmit} noValidate>
              {isSignUp && (
                <>
                  <div className="ma-grid-2">
                    <Field id="firstName" label="First Name" name="firstName" required
                      value={signUpValues.firstName} error={signUpErrors.firstName}
                      onChange={handleChange} onBlur={handleBlur} autoComplete="given-name" maxLength={40} />
                    <Field id="lastName" label="Last Name" name="lastName" required
                      value={signUpValues.lastName} error={signUpErrors.lastName}
                      onChange={handleChange} onBlur={handleBlur} autoComplete="family-name" maxLength={40} />
                  </div>
                  <div className="ma-grid-2">
                    <Field id="phoneNumber" label="Phone" name="phoneNumber" type="tel" required
                      value={signUpValues.phoneNumber} error={signUpErrors.phoneNumber}
                      onChange={handleChange} onBlur={handleBlur} autoComplete="tel" inputMode="numeric" maxLength={10} />
                    <Field id="additionalPhoneNumber" label="Additional Phone" name="additionalPhoneNumber" type="tel"
                      value={signUpValues.additionalPhoneNumber} error={signUpErrors.additionalPhoneNumber}
                      onChange={handleChange} onBlur={handleBlur} autoComplete="tel-national" inputMode="numeric" maxLength={10} />
                  </div>
                </>
              )}

              <Field id="email" label="Email Address" name="email" type="email" required
                value={values.email} error={errors.email}
                onChange={handleChange} onBlur={handleBlur} autoComplete={isSignUp ? 'new-email' : 'email'} maxLength={254} />

              <Field id="password" label="Password" name="password" type="password" required
                value={values.password} error={errors.password}
                onChange={handleChange} onBlur={handleBlur} autoComplete={isSignUp ? 'new-password' : 'current-password'} maxLength={64} />

              {submitError ? <p className="ma-error">{submitError}</p> : null}

              <button type="submit" className="ma-submit" disabled={submitting}>
                {submitting
                  ? isSignUp
                    ? 'Creating...'
                    : 'Signing in...'
                  : isSignUp
                    ? 'Create Account'
                    : 'Sign In'}
              </button>
            </form>

            <div className="ma-toggle-wrap">
              <button type="button" className="ma-toggle-btn" onClick={switchMode}>
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}

export default AuthPage
