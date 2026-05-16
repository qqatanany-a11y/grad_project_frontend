import { useI18n } from '../../i18n/I18nProvider'

function AuthField({
  id,
  label,
  type = 'text',
  name,
  required,
  value,
  error,
  onChange,
  onBlur,
  autoComplete,
  inputMode,
  maxLength,
}) {
  const { f } = useI18n()

  return (
    <div className="ma-field">
      <label htmlFor={id} className="ma-label">{f(label)}</label>
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
      {error ? <p id={`${id}-error`} className="ma-error">{f(error)}</p> : null}
    </div>
  )
}

export default AuthField
