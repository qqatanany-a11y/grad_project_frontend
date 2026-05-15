import { useState } from 'react'
import { apiRequest } from '../../lib/apiClient'
import {
  sanitizeNameInput,
  sanitizePhoneInput,
  validateEmail,
  validateName,
  validatePhone,
} from '../../lib/validation'
import AuthField from './AuthField'
import AuthLayout from './AuthLayout'
import { validatePassword } from './authValidation'

const signupInitialValues = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
  additionalPhoneNumber: '',
  email: '',
  password: '',
}

function SignupPage({ onSignIn, onBack, onSwitchToLogin }) {
  const [values, setValues] = useState(signupInitialValues)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const getError = (name, value) => {
    if (name === 'firstName') return validateName(value, 'First Name')
    if (name === 'lastName') return validateName(value, 'Last Name')
    if (name === 'phoneNumber') return validatePhone(value, 'Phone Number')
    if (name === 'additionalPhoneNumber') {
      return value.trim() ? validatePhone(value, 'Additional Phone') : ''
    }
    if (name === 'email') return validateEmail(value)
    if (name === 'password') return validatePassword(value)

    return ''
  }

  const sanitize = (name, value) => {
    if (name === 'firstName' || name === 'lastName') {
      return sanitizeNameInput(value)
    }

    if (name === 'phoneNumber' || name === 'additionalPhoneNumber') {
      return sanitizePhoneInput(value)
    }

    return value
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    const nextValue = sanitize(name, value)
    setValues((currentValues) => ({ ...currentValues, [name]: nextValue }))
    setErrors((currentErrors) => ({ ...currentErrors, [name]: getError(name, nextValue) }))
  }

  const handleBlur = (event) => {
    const { name, value } = event.target
    const nextValue = sanitize(name, value)
    setErrors((currentErrors) => ({ ...currentErrors, [name]: getError(name, nextValue) }))
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

    const requiredFields = ['firstName', 'lastName', 'phoneNumber', 'email', 'password']
    requiredFields.forEach((fieldName) => {
      if (!values[fieldName]?.trim()) {
        nextErrors[fieldName] = `${fieldName.replace(/([A-Z])/g, ' $1').trim()} is required.`
      }
    })

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setSubmitting(true)
    setSubmitError('')

    try {
      const authUser = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim(),
          phoneNumber: values.phoneNumber.trim(),
          secondaryPhoneNumber: values.additionalPhoneNumber.trim() || null,
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
      heroTitle="Create your account today"
      heroSubtitle="Create an account to save your details and start planning your event with ease."
      formTitle="Create your account"
      formSubtitle="Enter your details to create a new account and start managing your bookings."
      onBack={onBack}
      footerLabel="Already have an account? Sign in now"
      onFooterAction={onSwitchToLogin}
    >
      <form className="ma-form" onSubmit={handleSubmit} noValidate>
        <div className="ma-grid-2">
          <AuthField
            id="firstName"
            label="First Name"
            name="firstName"
            required
            value={values.firstName}
            error={errors.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="given-name"
            maxLength={40}
          />
          <AuthField
            id="lastName"
            label="Last Name"
            name="lastName"
            required
            value={values.lastName}
            error={errors.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="family-name"
            maxLength={40}
          />
        </div>

        <div className="ma-grid-2">
          <AuthField
            id="phoneNumber"
            label="Phone"
            name="phoneNumber"
            type="tel"
            required
            value={values.phoneNumber}
            error={errors.phoneNumber}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="tel"
            inputMode="numeric"
            maxLength={10}
          />
          <AuthField
            id="additionalPhoneNumber"
            label="Additional Phone"
            name="additionalPhoneNumber"
            type="tel"
            value={values.additionalPhoneNumber}
            error={errors.additionalPhoneNumber}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="tel-national"
            inputMode="numeric"
            maxLength={10}
          />
        </div>

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
          autoComplete="new-email"
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
          autoComplete="new-password"
          maxLength={64}
        />

        {submitError ? <p className="ma-error">{submitError}</p> : null}

        <button type="submit" className="ma-submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Account'}
        </button>
      </form>
    </AuthLayout>
  )
}

export default SignupPage
