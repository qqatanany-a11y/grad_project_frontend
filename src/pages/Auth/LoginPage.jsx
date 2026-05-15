import { useState } from 'react'
import { apiRequest } from '../../lib/apiClient'
import { validateEmail } from '../../lib/validation'
import AuthField from './AuthField'
import AuthLayout from './AuthLayout'

const loginInitialValues = {
  email: '',
  password: '',
}

function LoginPage({ onSignIn, onBack, onSwitchToSignUp }) {
  const [values, setValues] = useState(loginInitialValues)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const getError = (name, value) => {
    if (name === 'email') {
      return validateEmail(value)
    }

    if (name === 'password') {
      return value.trim() ? '' : 'Password is required.'
    }

    return ''
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((currentValues) => ({ ...currentValues, [name]: value }))
    setErrors((currentErrors) => ({ ...currentErrors, [name]: getError(name, value) }))
  }

  const handleBlur = (event) => {
    const { name, value } = event.target
    setErrors((currentErrors) => ({ ...currentErrors, [name]: getError(name, value) }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const nextErrors = {}
    Object.entries(values).forEach(([name, value]) => {
      const error = getError(name, value)
      if (error) {
        nextErrors[name] = error
      }
    })
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setSubmitting(true)
    setSubmitError('')

    try {
      const authUser = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: {
          email: values.email.trim(),
          password: values.password,
        },
      })

      onSignIn?.(authUser)
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Authentication failed.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      heroTitle="Plan Your Perfect Event!"
      heroSubtitle="The platform for creating unforgettable moments, effortlessly."
      formTitle="Welcome back"
      formSubtitle="Enter your details to sign in."
      onBack={onBack}
      footerLabel="Don't have an account? Sign up"
      onFooterAction={onSwitchToSignUp}
    >
      <form className="ma-form" onSubmit={handleSubmit} noValidate>
        <AuthField
          id="email"
          label="Email Address"
          name="email"
          type="email"
          required
          value={values.email}
          error={errors.email}
          onChange={handleChange}
          onBlur={handleBlur}
          autoComplete="email"
          maxLength={254}
        />

        <AuthField
          id="password"
          label="Password"
          name="password"
          type="password"
          required
          value={values.password}
          error={errors.password}
          onChange={handleChange}
          onBlur={handleBlur}
          autoComplete="current-password"
          maxLength={64}
        />

        {submitError ? <p className="ma-error">{submitError}</p> : null}

        <button type="submit" className="ma-submit" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </AuthLayout>
  )
}

export default LoginPage
