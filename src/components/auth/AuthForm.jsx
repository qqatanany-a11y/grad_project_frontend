import { useState } from 'react'

const buildInitialValues = (fields) =>
  Object.fromEntries(
    fields.map(({ name, defaultValue = '' }) => [name, defaultValue]),
  )

const getFieldError = (field, value = '') => {
  const isEmpty = typeof value === 'string' ? !value.trim() : !value

  if (field.required && isEmpty) {
    return `${field.label ?? field.placeholder} is required.`
  }

  return isEmpty || !field.validate ? '' : field.validate(value)
}

function AuthForm({ mode, title, fields, buttonLabel, onSubmit }) {
  const [values, setValues] = useState(() => buildInitialValues(fields))
  const [errors, setErrors] = useState({})

  const validateField = (name, value) => {
    const field = fields.find((item) => item.name === name)

    return field ? getFieldError(field, value) : ''
  }

  const handleChange = ({ target: { name, value } }) => {
    const field = fields.find((item) => item.name === name)
    const nextValue = field?.sanitize ? field.sanitize(value) : value
    const nextError = validateField(name, nextValue)

    setValues((previousValues) => ({
      ...previousValues,
      [name]: nextValue,
    }))
    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: nextError,
    }))
  }

  const handleBlur = ({ target: { name, value } }) =>
    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: validateField(name, value),
    }))

  const handleSubmit = (event) => {
    event.preventDefault()

    const nextErrors = Object.fromEntries(
      fields
        .map((field) => [field.name, getFieldError(field, values[field.name])])
        .filter(([, error]) => error),
    )

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    onSubmit?.(event, values)
  }

  return (
    <form className={`auth-form auth-form-${mode}`} noValidate onSubmit={handleSubmit}>
      <h1>{title}</h1>
      {fields.map((field) => {
        const error = errors[field.name]

        return (
          <div
            key={`${mode}-${field.name}`}
            className={`field-group${field.wrapperClassName ? ` ${field.wrapperClassName}` : ''}`}
          >
            <input
              type={field.type}
              name={field.name}
              placeholder={field.placeholder}
              aria-label={field.placeholder}
              aria-required={field.required ? 'true' : 'false'}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? `${mode}-${field.name}-error` : undefined}
              autoComplete={field.autoComplete}
              inputMode={field.inputMode}
              maxLength={field.maxLength}
              required={field.required}
              value={values[field.name]}
              onBlur={handleBlur}
              onChange={handleChange}
            />
            {error ? (
              <span id={`${mode}-${field.name}-error`} className="field-error">
                {error}
              </span>
            ) : null}
          </div>
        )
      })}
      <button type="submit">{buttonLabel}</button>
    </form>
  )
}

export default AuthForm
