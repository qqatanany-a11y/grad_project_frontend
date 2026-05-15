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
      {error ? <p id={`${id}-error`} className="ma-error">{error}</p> : null}
    </div>
  )
}

export default AuthField
