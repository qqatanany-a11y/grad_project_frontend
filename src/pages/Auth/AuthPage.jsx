import { useState } from 'react'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^\d{10}$/
const namePattern = /^[A-Za-z\u0600-\u06FF'-]+$/
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

const validateName = (value, label) =>
  namePattern.test(value.trim()) ? '' : `${label} can only contain letters.`

const validatePhone = (value, label) =>
  phonePattern.test(value.trim()) ? '' : `${label} must be 10 digits only.`

const validateEmail = (value) =>
  emailPattern.test(value.trim()) ? '' : 'Enter a valid email address.'

const validatePassword = (value) =>
  passwordPattern.test(value)
    ? ''
    : 'Password must be at least 8 characters with uppercase, lowercase, and a number.'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap');

  .ma-page {
    display: flex;
    min-height: 100vh;
    width: 100%;
    background: #fff;
    font-family: 'Inter', 'Segoe UI', sans-serif;
    color: #1c1917;
  }

  /* Left image panel */
  .ma-image-panel {
    display: none;
    position: relative;
    width: 50%;
    flex-shrink: 0;
  }

  @media (min-width: 1024px) {
    .ma-image-panel {
      display: block;
    }
  }

  .ma-image-panel img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .ma-image-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.22);
    z-index: 1;
  }

  .ma-image-text {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 2;
    padding: 3rem;
    color: #fff;
  }

  .ma-image-text h1 {
    font-size: clamp(2rem, 3vw, 2.75rem);
    font-weight: 300;
    letter-spacing: -0.02em;
    margin: 0 0 0.75rem;
    line-height: 1.15;
    color: #fff;
  }

  .ma-image-text p {
    font-size: 1.05rem;
    font-weight: 300;
    color: rgba(255, 255, 255, 0.82);
    margin: 0;
    max-width: 360px;
    line-height: 1.6;
  }

  /* Right form panel */
  .ma-form-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 3rem 2rem;
  }

  @media (min-width: 1024px) {
    .ma-form-panel {
      padding: 3rem 5rem;
    }
  }

  .ma-form-inner {
    width: 100%;
    max-width: 448px;
    margin: 0 auto;
  }

  .ma-form-header {
    margin-bottom: 2.5rem;
  }

  .ma-form-header h2 {
    font-size: 1.875rem;
    font-weight: 300;
    letter-spacing: -0.02em;
    margin: 0 0 0.4rem;
    color: #1c1917;
  }

  .ma-form-header p {
    font-size: 0.9rem;
    color: #78716c;
    font-weight: 300;
    margin: 0;
  }

  /* Form layout */
  .ma-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .ma-grid-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .ma-grid-2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .ma-field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .ma-label {
    font-size: 0.68rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #78716c;
  }

  .ma-input {
    width: 100%;
    height: 3rem;
    padding: 0 0.875rem;
    border: 1px solid #e7e5e4;
    border-radius: 0;
    background: #fff;
    font-size: 0.9rem;
    color: #1c1917;
    font-family: inherit;
    font-weight: 300;
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
    box-sizing: border-box;
  }

  .ma-input:focus {
    border-color: #1c1917;
    box-shadow: 0 0 0 2px rgba(28, 25, 23, 0.08);
  }

  .ma-input[aria-invalid='true'] {
    border-color: #ef4444;
  }

  .ma-error {
    font-size: 0.72rem;
    color: #ef4444;
    margin: 0;
  }

  .ma-submit {
    width: 100%;
    height: 3rem;
    background: #1c1917;
    color: #fff;
    border: none;
    border-radius: 0;
    font-size: 0.85rem;
    font-weight: 400;
    letter-spacing: 0.04em;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.15s ease;
    margin-top: 0.25rem;
  }

  .ma-submit:hover {
    background: #292524;
  }

  .ma-submit:active {
    background: #1c1917;
  }

  .ma-submit:focus-visible {
    outline: 2px solid #1c1917;
    outline-offset: 3px;
  }

  /* Toggle link */
  .ma-toggle-wrap {
    margin-top: 2rem;
    text-align: center;
  }

  .ma-toggle-btn {
    background: none;
    border: none;
    font-family: inherit;
    font-size: 0.85rem;
    color: #78716c;
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 3px;
    padding: 0;
    transition: color 0.15s ease;
  }

  .ma-toggle-btn:hover {
    color: #1c1917;
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
  firstName: '', middleName: '', lastName: '',
  phoneNumber: '', additionalPhoneNumber: '',
  email: '', password: '',
}

function AuthPage({ onSignIn }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [signInValues, setSignInValues] = useState(signInInitial)
  const [signInErrors, setSignInErrors] = useState({})
  const [signUpValues, setSignUpValues] = useState(signUpInitial)
  const [signUpErrors, setSignUpErrors] = useState({})

  const values = isSignUp ? signUpValues : signInValues
  const errors = isSignUp ? signUpErrors : signInErrors
  const setValues = isSignUp ? setSignUpValues : setSignInValues
  const setErrors = isSignUp ? setSignUpErrors : setSignInErrors

  const getError = (name, val) => {
    if (isSignUp) {
      if (name === 'firstName') return validateName(val, 'First Name')
      if (name === 'middleName') return val.trim() ? validateName(val, 'Middle Name') : ''
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
    if (['firstName', 'middleName', 'lastName'].includes(name)) return val.replace(/\d/g, '')
    if (['phoneNumber', 'additionalPhoneNumber'].includes(name)) return val.replace(/\D/g, '').slice(0, 10)
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
    setErrors((prev) => ({ ...prev, [name]: getError(name, value) }))
  }

  const handleSubmit = (e) => {
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
    if (Object.keys(nextErrors).length === 0) {
      onSignIn?.(isSignUp ? {
        firstName: signUpValues.firstName,
        lastName: signUpValues.lastName,
        email: signUpValues.email,
      } : { firstName: 'User', lastName: '', email: values.email })
    }
  }

  const switchMode = () => {
    setIsSignUp((v) => !v)
    setSignInErrors({})
    setSignUpErrors({})
  }

  return (
    <>
      <style>{styles}</style>
      <div className="ma-page">

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
            <div className="ma-form-header">
              <h2>{isSignUp ? 'Create an account' : 'Welcome back'}</h2>
              <p>{isSignUp ? "Let's get started with your event planning." : 'Enter your details to sign in.'}</p>
            </div>

            <form className="ma-form" onSubmit={handleSubmit} noValidate>
              {isSignUp && (
                <>
                  <div className="ma-grid-3">
                    <Field id="firstName" label="First Name" name="firstName" required
                      value={signUpValues.firstName} error={signUpErrors.firstName}
                      onChange={handleChange} onBlur={handleBlur} autoComplete="given-name" maxLength={40} />
                    <Field id="middleName" label="Middle" name="middleName"
                      value={signUpValues.middleName} error={signUpErrors.middleName}
                      onChange={handleChange} onBlur={handleBlur} autoComplete="additional-name" maxLength={40} />
                    <Field id="lastName" label="Last Name" name="lastName" required
                      value={signUpValues.lastName} error={signUpErrors.lastName}
                      onChange={handleChange} onBlur={handleBlur} autoComplete="family-name" maxLength={40} />
                  </div>
                  <div className="ma-grid-2">
                    <Field id="phoneNumber" label="Phone" name="phoneNumber" type="tel" required
                      value={signUpValues.phoneNumber} error={signUpErrors.phoneNumber}
                      onChange={handleChange} onBlur={handleBlur} autoComplete="tel" inputMode="numeric" maxLength={10} />
                    <Field id="additionalPhoneNumber" label="Alt Phone (Opt)" name="additionalPhoneNumber" type="tel"
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

              <button type="submit" className="ma-submit">
                {isSignUp ? 'Create Account' : 'Sign In'}
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
